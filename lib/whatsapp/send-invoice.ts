import { prisma } from '@/lib/prisma'
import { waClient } from '@/lib/whatsapp/cloud-api'

type WhatsAppDocumentClient = {
  sendDocument: (to: string, doc: string, filename: string) => Promise<unknown>
}

export async function sendInvoiceToWhatsApp(orderId: string) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { store: true }
    })

    if (!order) {
      console.error(`[sendInvoiceToWhatsApp] No order found with ID: ${orderId}`)
      return
    }

    if (!order.customerWhatsAppId) {
      console.log(`[sendInvoiceToWhatsApp] No customer WhatsApp number for Order: ${orderId}`)
      return
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || ''
    const invoiceUrl = `${appUrl}/api/orders/invoice/${orderId}`

    console.log(`[sendInvoiceToWhatsApp] Sending PDF invoice to ${order.customerWhatsAppId}`)
    console.log(`[sendInvoiceToWhatsApp] Invoice URL: ${invoiceUrl}`)

    // Resolve client to use
    let clientToUse: WhatsAppDocumentClient = waClient
    const store = order.store
    if (store && store.whatsappInstanceName && store.whatsappConnected) {
      const { evolutionClient } = await import('@/lib/whatsapp/evolution')
      clientToUse = {
        sendDocument: (to: string, doc: string, fn: string) => evolutionClient.sendDocument(store.whatsappInstanceName!, to, doc, fn)
      }
    }

    await clientToUse.sendDocument(
      order.customerWhatsAppId,
      invoiceUrl,
      `factura-${orderId.slice(-6).toUpperCase()}.pdf`
    )

    console.log(`[sendInvoiceToWhatsApp] PDF invoice sent successfully for Order: ${orderId}`)
  } catch (error) {
    console.error(`[sendInvoiceToWhatsApp] Error sending invoice for Order: ${orderId}`, error)
  }
}
