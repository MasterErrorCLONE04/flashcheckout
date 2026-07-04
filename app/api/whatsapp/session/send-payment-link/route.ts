import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { MercadoPagoConfig, Preference } from 'mercadopago'
import { waClient } from '@/lib/whatsapp/cloud-api'

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { sessionId } = body

    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 })
    }

    const store = await prisma.store.findFirst({
      where: { userId }
    })

    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    if (sessionId === 'demo-session') {
      return NextResponse.json({ success: true, paymentLink: '#' })
    }

    const session = await (prisma as any).whatsAppSession.findUnique({
      where: { id: sessionId }
    })

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Parse cart items
    let items: any[] = []
    if (session.cart) {
      try {
        const cartObj = typeof session.cart === 'string' ? JSON.parse(session.cart) : session.cart
        if (cartObj && cartObj.items) {
          items = Object.values(cartObj.items)
        }
      } catch (e) {
        console.error('Error parsing cart:', e)
      }
    }

    if (items.length === 0) {
      return NextResponse.json({ error: 'El carrito está vacío' }, { status: 400 })
    }

    const total = items.reduce((acc, item) => acc + (item.price * item.qty), 0)

    // Create a real order in the database
    const order = await prisma.order.create({
      data: {
        storeId: store.id,
        customerName: session.customerName || 'Cliente WhatsApp',
        customerPhone: session.phoneNumber,
        customerWhatsAppId: session.phoneNumber,
        address: session.address || 'Pedido por Chat',
        city: 'Colombia',
        items: items as any,
        total,
        paymentStatus: 'PENDING',
        source: 'WHATSAPP'
      }
    })

    const base = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') || 'http://localhost:3000'
    let paymentLink = `${base}/tienda/${store.slug}/exito?orderId=${order.id}`

    // Try to generate Mercado Pago Preference if configured
    const tokenToUse = store.mpAccessToken || process.env.MERCADOPAGO_ACCESS_TOKEN
    if (tokenToUse) {
      try {
        const preferenceData: any = {
          body: {
            items: items.map(line => ({
              id: line.id || line.productId,
              title: `${line.name} (x${line.qty})`,
              quantity: line.qty,
              unit_price: line.price,
              currency_id: 'COP',
            })),
            external_reference: order.id,
            back_urls: {
              success: `${base}/tienda/${store.slug}/exito`,
              failure: `${base}/tienda/${store.slug}`,
              pending: `${base}/tienda/${store.slug}`,
            },
            metadata: {
              orderId: order.id,
              storeId: store.id,
            },
          },
        }

        if (base.startsWith('https')) {
          preferenceData.body.notification_url = `${base}/api/webhook/mp`
          preferenceData.body.auto_return = 'approved'
        }

        const dynamicMpClient = new MercadoPagoConfig({
          accessToken: tokenToUse,
          options: { timeout: 10000 },
        })
        const dynamicMpPreference = new Preference(dynamicMpClient)
        const preference = await dynamicMpPreference.create(preferenceData)

        if (preference.init_point) {
          paymentLink = preference.init_point
        }
      } catch (mpErr) {
        console.error('Mercado Pago preference generation error:', mpErr)
      }
    }

    // Send the payment link to the customer via WhatsApp
    try {
      const messageText = `🛒 *Tu pedido está listo* 📝\n\nHemos preparado tu link de pago por un total de *$${total.toLocaleString('es-CO')} COP*.\n\nPuedes pagar de forma segura haciendo clic aquí:\n🔗 ${paymentLink}`
      
      // If store is connected to Evolution, send via evolutionClient or cloud-api dynamically
      let sent = false
      if (store.whatsappConnected && store.whatsappInstanceName) {
        try {
          const { evolutionClient } = await import('@/lib/whatsapp/evolution')
          await evolutionClient.sendText(store.whatsappInstanceName, session.phoneNumber, messageText)
          sent = true
        } catch (e) {
          console.error('Failed to send link via Evolution API:', e)
        }
      }

      if (!sent) {
        await waClient.sendText(session.phoneNumber, messageText)
      }
      
      // Add system message to the chat history
      const timeString = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      const messages = Array.isArray(session.messages) ? (session.messages as any[]) : []
      messages.push({
        sender: 'bot',
        text: `[Link de Pago Enviado]: $${total.toLocaleString('es-CO')} COP\n${paymentLink}`,
        time: timeString,
        timestamp: Date.now()
      })

      await (prisma as any).whatsAppSession.update({
        where: { id: session.id },
        data: { 
          messages,
          step: 'AWAITING_CONFIRMATION',
          cart: null // clear cart upon payment link generation
        }
      })
    } catch (waErr: any) {
      console.error('WhatsApp send link error:', waErr.message)
    }

    return NextResponse.json({ success: true, paymentLink })
  } catch (error: any) {
    console.error('Error sending payment link:', error)
    return NextResponse.json({ error: error.message || 'Error interno' }, { status: 500 })
  }
}
