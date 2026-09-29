import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getActiveStore } from '@/lib/store-context'
import { evolutionClient } from '@/lib/whatsapp/evolution'
import { badRequest, notFound, unauthorized, internalServerError } from '@/lib/api/route-utils'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return unauthorized()

    const store = await getActiveStore(userId)
    if (!store) return notFound('Store not found')

    if (!store.whatsappConnected || !store.whatsappInstanceName) {
      return badRequest('WhatsApp no está conectado en tu tienda. Ve a Integraciones para escanear el QR.')
    }

    const body = await req.json()
    const { 
      type = 'STATUS', // 'STATUS' | 'BROADCAST' | 'TEST'
      caption, 
      mediaUrl, 
      mediaType = 'image', // 'image' | 'video'
      targetPhone,
      productId,
      title
    } = body

    if (!caption && !mediaUrl) {
      return badRequest('Caption o mediaUrl es requerido.')
    }

    let sendResult = null

    // 1. Enviar a Estados de WhatsApp (Status Story)
    if (type === 'STATUS') {
      try {
        if (mediaUrl) {
          if (mediaType === 'video') {
            sendResult = await evolutionClient.sendVideo(store.whatsappInstanceName, 'status@broadcast', mediaUrl, caption || '')
          } else {
            sendResult = await evolutionClient.sendImage(store.whatsappInstanceName, 'status@broadcast', mediaUrl, caption || '')
          }
        } else {
          sendResult = await evolutionClient.sendText(store.whatsappInstanceName, 'status@broadcast', caption)
        }
      } catch (err: any) {
        console.warn('[Studio IA WhatsApp Status Warn]:', err)
        // Algunos proveedores requieren formato estándar o fallback
        throw new Error('No se pudo publicar en el Estado de WhatsApp: ' + (err.message || 'Error de conexión'))
      }
    } 
    // 2. Enviar mensaje de prueba al teléfono del comerciante
    else if (type === 'TEST') {
      const recipient = targetPhone || store.whatsapp
      if (!recipient) {
        return badRequest('No hay un número de teléfono de destino.')
      }

      if (mediaUrl) {
        if (mediaType === 'video') {
          sendResult = await evolutionClient.sendVideo(store.whatsappInstanceName, recipient, mediaUrl, caption || '')
        } else {
          sendResult = await evolutionClient.sendImage(store.whatsappInstanceName, recipient, mediaUrl, caption || '')
        }
      } else {
        sendResult = await evolutionClient.sendText(store.whatsappInstanceName, recipient, caption)
      }
    }
    // 3. Difusión a clientes registrados
    else if (type === 'BROADCAST') {
      const customers = await prisma.customer.findMany({
        where: { storeId: store.id, phone: { not: null } },
        select: { phone: true, name: true },
        take: 50 // Límite de seguridad
      })

      if (customers.length === 0) {
        return badRequest('No tienes clientes registrados con teléfono para difusión.')
      }

      let sentCount = 0
      for (const cust of customers) {
        if (!cust.phone) continue
        try {
          const personalizedText = caption.replace('{nombre}', cust.name || 'Cliente')
          if (mediaUrl) {
            if (mediaType === 'video') {
              await evolutionClient.sendVideo(store.whatsappInstanceName, cust.phone, mediaUrl, personalizedText)
            } else {
              await evolutionClient.sendImage(store.whatsappInstanceName, cust.phone, mediaUrl, personalizedText)
            }
          } else {
            await evolutionClient.sendText(store.whatsappInstanceName, cust.phone, personalizedText)
          }
          sentCount++
        } catch (e) {
          console.warn(`[Studio IA Broadcast error for ${cust.phone}]:`, e)
        }
      }
      sendResult = { sentCount, total: customers.length }
    }

    // 4. Guardar registro en DB si es posible
    try {
      if ((prisma as any).aiMediaContent) {
        await (prisma as any).aiMediaContent.create({
          data: {
            storeId: store.id,
            productId: productId || null,
            title: title || 'Publicación WhatsApp',
            type: mediaType === 'video' ? 'DYNAMIC_REEL' : 'IMAGE_POST',
            copyCaption: caption,
            videoUrl: mediaType === 'video' ? mediaUrl : null,
            thumbnailUrl: mediaType === 'image' ? mediaUrl : null,
            status: 'READY',
            publishedChannels: [type === 'STATUS' ? 'WHATSAPP_STATUS' : 'WHATSAPP_CHAT'],
            lastPublishedAt: new Date()
          }
        })
      }
    } catch (dbErr) {
      console.warn('[Studio IA DB Log skipped]:', dbErr)
    }

    return NextResponse.json({
      success: true,
      message: type === 'STATUS' ? '¡Publicado con éxito en los Estados de WhatsApp!' : 'Mensaje enviado correctamente',
      data: sendResult
    })
  } catch (error: any) {
    console.error('[Studio IA WhatsApp Publish Error]:', error)
    return internalServerError(error.message || 'Error al publicar en WhatsApp')
  }
}
