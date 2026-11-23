import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getActiveStore } from '@/lib/store-context'
import { evolutionClient } from '@/lib/whatsapp/evolution'
import {
  badRequest,
  internalServerError,
  notFound,
  unauthorized,
} from '@/lib/api/route-utils'
import type { MetaSocialConfig } from '@/app/api/integrations/meta/route'

export const dynamic = 'force-dynamic'

type SocialChannel = 'INSTAGRAM' | 'FACEBOOK' | 'WHATSAPP_STATUS'

function parseStoreSettings(raw: unknown): Record<string, any> {
  if (!raw) return {}
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw)
    } catch {
      return {}
    }
  }
  if (typeof raw === 'object') return { ...(raw as Record<string, any>) }
  return {}
}

async function waitForInstagramContainer(
  containerId: string,
  accessToken: string,
  isVideo: boolean
) {
  const maxAttempts = isVideo ? 8 : 3
  const delayMs = isVideo ? 2500 : 1000

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const statusRes = await fetch(
      `https://graph.facebook.com/v21.0/${containerId}?fields=status_code,status&access_token=${encodeURIComponent(
        accessToken
      )}`
    )
    const statusJson = await statusRes.json().catch(() => null)
    const code = statusJson?.status_code
    if (code === 'FINISHED' || code === 'PUBLISHED') {
      return
    }
    if (code === 'ERROR' || code === 'EXPIRED') {
      throw new Error(
        statusJson?.status || 'Instagram rechazó el procesamiento del archivo multimedia.'
      )
    }
    await new Promise(resolve => setTimeout(resolve, delayMs))
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return unauthorized()

    const store = await getActiveStore(userId)
    if (!store) return notFound('Tienda no encontrada')

    const body = await req.json().catch(() => null)
    if (!body) return badRequest('Datos de publicación inválidos')

    const channels: SocialChannel[] = Array.isArray(body.channels)
      ? body.channels
      : []
    const caption = typeof body.caption === 'string' ? body.caption.trim() : ''
    const mediaUrl = typeof body.mediaUrl === 'string' ? body.mediaUrl.trim() : ''
    const mediaType: 'image' | 'video' =
      body.mediaType === 'video' ? 'video' : 'image'
    const productId = typeof body.productId === 'string' ? body.productId : null
    const title =
      typeof body.title === 'string' && body.title.trim()
        ? body.title.trim()
        : 'Publicación Multicanal Studio IA'

    if (channels.length === 0) {
      return badRequest(
        'Selecciona al menos una red social (Instagram, Facebook o WhatsApp).'
      )
    }

    if (!mediaUrl) {
      return badRequest(
        'Se requiere una imagen o video del producto para publicar en redes sociales.'
      )
    }

    const settings = parseStoreSettings(store.settings)
    const meta: MetaSocialConfig | undefined = settings.metaSocial

    const needsMeta =
      channels.includes('INSTAGRAM') || channels.includes('FACEBOOK')
    if (needsMeta && (!meta?.connected || !meta?.accessToken)) {
      return badRequest(
        'Primero vincula tu cuenta de Facebook e Instagram en Integraciones.'
      )
    }

    const results: Record<
      string,
      { ok: boolean; postId?: string; error?: string }
    > = {}
    const succeededChannels: string[] = []

    // 1. FACEBOOK PAGE PUBLISHING
    if (channels.includes('FACEBOOK')) {
      if (!meta?.facebookPageId) {
        results.FACEBOOK = {
          ok: false,
          error: 'No hay un ID de Página de Facebook configurado en Integraciones.',
        }
      } else {
        try {
          const endpoint =
            mediaType === 'video'
              ? `https://graph.facebook.com/v21.0/${meta.facebookPageId}/videos`
              : `https://graph.facebook.com/v21.0/${meta.facebookPageId}/photos`

          const fbPayload =
            mediaType === 'video'
              ? {
                  file_url: mediaUrl,
                  description: caption,
                  access_token: meta.accessToken,
                }
              : {
                  url: mediaUrl,
                  caption,
                  access_token: meta.accessToken,
                }

          const fbRes = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(fbPayload),
          })
          const fbJson = await fbRes.json().catch(() => null)

          if (!fbRes.ok || fbJson?.error) {
            throw new Error(
              fbJson?.error?.message || 'Error al publicar en la Página de Facebook'
            )
          }

          results.FACEBOOK = {
            ok: true,
            postId: String(fbJson.post_id || fbJson.id || ''),
          }
          succeededChannels.push('FACEBOOK_PAGE')
        } catch (fbErr: any) {
          results.FACEBOOK = {
            ok: false,
            error: fbErr?.message || 'Fallo al publicar en Facebook',
          }
        }
      }
    }

    // 2. INSTAGRAM BUSINESS PUBLISHING (FEED PHOTO OR REEL)
    if (channels.includes('INSTAGRAM')) {
      if (!meta?.instagramAccountId) {
        results.INSTAGRAM = {
          ok: false,
          error:
            'No hay un ID de cuenta de Instagram Profesional configurado en Integraciones.',
        }
      } else {
        try {
          const igContainerPayload: Record<string, any> = {
            caption,
            access_token: meta.accessToken,
          }

          if (mediaType === 'video') {
            igContainerPayload.media_type = 'REELS'
            igContainerPayload.video_url = mediaUrl
          } else {
            igContainerPayload.image_url = mediaUrl
          }

          const containerRes = await fetch(
            `https://graph.facebook.com/v21.0/${meta.instagramAccountId}/media`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(igContainerPayload),
            }
          )
          const containerJson = await containerRes.json().catch(() => null)

          if (!containerRes.ok || !containerJson?.id) {
            throw new Error(
              containerJson?.error?.message ||
                'No se pudo crear el contenedor multimedia en Instagram'
            )
          }

          const creationId = String(containerJson.id)
          await waitForInstagramContainer(
            creationId,
            meta.accessToken!,
            mediaType === 'video'
          )

          const publishRes = await fetch(
            `https://graph.facebook.com/v21.0/${meta.instagramAccountId}/media_publish`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                creation_id: creationId,
                access_token: meta.accessToken,
              }),
            }
          )
          const publishJson = await publishRes.json().catch(() => null)

          if (!publishRes.ok || !publishJson?.id) {
            throw new Error(
              publishJson?.error?.message ||
                'No se pudo finalizar la publicación en Instagram'
            )
          }

          results.INSTAGRAM = {
            ok: true,
            postId: String(publishJson.id),
          }
          succeededChannels.push(
            mediaType === 'video' ? 'INSTAGRAM_REEL' : 'INSTAGRAM_FEED'
          )
        } catch (igErr: any) {
          results.INSTAGRAM = {
            ok: false,
            error: igErr?.message || 'Fallo al publicar en Instagram',
          }
        }
      }
    }

    // 3. WHATSAPP STATUS PUBLISHING (IF ALSO SELECTED)
    if (channels.includes('WHATSAPP_STATUS')) {
      if (!store.whatsappConnected || !store.whatsappInstanceName) {
        results.WHATSAPP_STATUS = {
          ok: false,
          error: 'Tu WhatsApp no está vinculado por QR en este momento.',
        }
      } else {
        try {
          if (mediaType === 'video') {
            await evolutionClient.sendVideo(
              store.whatsappInstanceName,
              'status@broadcast',
              mediaUrl,
              caption
            )
          } else {
            await evolutionClient.sendImage(
              store.whatsappInstanceName,
              'status@broadcast',
              mediaUrl,
              caption
            )
          }
          results.WHATSAPP_STATUS = { ok: true }
          succeededChannels.push('WHATSAPP_STATUS')
        } catch (waErr: any) {
          results.WHATSAPP_STATUS = {
            ok: false,
            error: waErr?.message || 'Fallo al publicar en Estado de WhatsApp',
          }
        }
      }
    }

    // 4. Persist record in AiMediaContent
    let savedCreation = null
    if (succeededChannels.length > 0) {
      try {
        if ((prisma as any).aiMediaContent) {
          savedCreation = await (prisma as any).aiMediaContent.create({
            data: {
              storeId: store.id,
              productId,
              title,
              type: mediaType === 'video' ? 'DYNAMIC_REEL' : 'IMAGE_POST',
              copyCaption: caption,
              videoUrl: mediaType === 'video' ? mediaUrl : null,
              thumbnailUrl: mediaType === 'image' ? mediaUrl : null,
              status: 'READY',
              publishedChannels: succeededChannels,
              lastPublishedAt: new Date(),
            },
          })
        }
      } catch (dbErr) {
        console.warn('[Studio IA Social Publish DB Log skipped]:', dbErr)
      }
    }

    const failedEntries = Object.entries(results).filter(([, r]) => !r.ok)

    if (succeededChannels.length === 0) {
      const firstError =
        failedEntries[0]?.[1]?.error ||
        'No se pudo publicar en las redes seleccionadas.'
      return NextResponse.json(
        {
          success: false,
          error: firstError,
          results,
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message:
        failedEntries.length === 0
          ? `¡Contenido publicado en ${succeededChannels.join(' + ')}!`
          : `Publicado en ${succeededChannels.join(', ')}. (${failedEntries
              .map(([k, v]) => `${k}: ${v.error}`)
              .join(' | ')})`,
      results,
      publishedChannels: succeededChannels,
      creation: savedCreation,
    })
  } catch (error: any) {
    console.error('[Studio IA Social Publish Error]:', error)
    return internalServerError(
      error?.message || 'Error interno al publicar en redes sociales'
    )
  }
}
