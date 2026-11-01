import { prisma } from '@/lib/prisma'
import { uploadProofImage } from '@/lib/supabase'
import { createDownloadableClient } from './bot-types'

export async function handleWhatsAppImage(
  from: string,
  mediaIdOrKey: string | Record<string, unknown>,
  mimeType: string,
  storeId: string = 'global',
  instanceName?: string,
  messagePayload?: Record<string, unknown>
) {
  const waClient = createDownloadableClient(instanceName, messagePayload)

  // 1. Obtener sesión del bot usando compound key
  const session = await prisma.whatsAppSession.findUnique({
    where: {
      phoneNumber_storeId: {
        phoneNumber: from,
        storeId: storeId
      }
    },
  })

  if (!session || session.step !== 'AWAITING_CONFIRMATION') {
    console.log(`[Bot Filter] Ignorando imagen no relacionada con comprobante de pago de (${from})`)
    return
  }

  // 2. Buscar la orden PENDING más reciente para este cliente
  const order = await prisma.order.findFirst({
    where: {
      OR: [
        { customerPhone: from },
        { customerWhatsAppId: from },
      ],
      paymentStatus: 'PENDING',
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  if (!order) {
    await waClient.sendText(from, 'No encontré ningún pedido pendiente de pago para tu número.')
    return
  }

  try {
    await waClient.sendText(from, 'Procesando tu comprobante de pago... ⏳')

    // 3. Descargar comprobante de WhatsApp
    const { buffer } = await waClient.downloadMedia(mediaIdOrKey)

    // 4. Subir a Supabase Storage
    const ext = mimeType.split('/')[1] || 'png'
    const filename = `proof_${order.id}.${ext}`
    const proofImageUrl = await uploadProofImage(buffer, filename)

    // 5. Actualizar la orden
    await prisma.order.update({
      where: { id: order.id },
      data: {
        paymentStatus: 'UPLOADED',
        proofImageUrl,
      },
    })

    // 6. Cambiar estado de la sesión a IDLE
    await prisma.whatsAppSession.update({
      where: { id: session.id },
      data: { step: 'IDLE' },
    })

    await waClient.sendText(
      from,
      `¡Comprobante recibido correctamente! 📄\n\nEl vendedor validará tu transferencia en breve. Te notificaremos por este medio una vez sea confirmada. ¡Muchas gracias!`
    )

  } catch (error) {
    console.error('[handleWhatsAppImage error]', error)
    await waClient.sendText(
      from,
      'Hubo un problema al procesar tu comprobante de pago. Por favor, asegúrate de que sea una imagen válida e intenta nuevamente.'
    )
  }
}
