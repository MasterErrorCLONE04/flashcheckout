import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  resolveProofStorageLocation,
  supabaseAdmin,
} from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET?.trim()

    if (!cronSecret) {
      console.error('[Cron Cleanup] CRON_SECRET no configurado.')
      return new NextResponse('Config error', { status: 500 })
    }

    if (authHeader !== `Bearer ${cronSecret}`) {
      console.warn('[Cron Cleanup] Intent de acceso no autorizado.')
      return new Response('No autorizado', { status: 401 })
    }

    console.log('[Cron Cleanup] Iniciando job de limpieza de almacenamiento...')

    const rejectedOrders = await prisma.order.findMany({
      where: {
        paymentStatus: 'REJECTED',
        proofImageUrl: { not: null },
      },
      select: {
        id: true,
        proofImageUrl: true,
      },
    })

    if (rejectedOrders.length === 0) {
      console.log('[Cron Cleanup] No hay imágenes de comprobantes rechazados para limpiar.')
      return NextResponse.json({ success: true, message: 'No files to clean up' })
    }

    const deletedFiles: string[] = []
    const failedFiles: string[] = []

    for (const order of rejectedOrders) {
      const storageLocation = resolveProofStorageLocation(order.proofImageUrl)
      if (!storageLocation) {
        console.warn(`[Cron Cleanup] No se pudo parsear la url: ${order.proofImageUrl}`)
        failedFiles.push(order.id)
        continue
      }

      try {
        console.log(
          `[Cron Cleanup] Eliminando archivo: ${storageLocation.path} del bucket ${storageLocation.bucket}`
        )

        const { error } = await supabaseAdmin.storage
          .from(storageLocation.bucket)
          .remove([storageLocation.path])

        if (error) {
          console.error(
            `[Cron Cleanup] Error eliminando ${storageLocation.path} en storage:`,
            error
          )
          failedFiles.push(order.id)
          continue
        }

        await prisma.order.update({
          where: { id: order.id },
          data: { proofImageUrl: null },
        })

        deletedFiles.push(order.id)
      } catch (err) {
        console.error(`[Cron Cleanup] Excepcion procesando orden ${order.id}:`, err)
        failedFiles.push(order.id)
      }
    }

    console.log(`[Cron Cleanup] Job completado. Eliminados: ${deletedFiles.length}, Fallidos: ${failedFiles.length}`)

    return NextResponse.json({
      success: true,
      cleanedCount: deletedFiles.length,
      failedCount: failedFiles.length,
      deletedOrderIds: deletedFiles,
      failedOrderIds: failedFiles,
    })
  } catch (error) {
    console.error('[Cron Cleanup] Error fatal en cron cleanup:', error)
    const message = error instanceof Error ? error.message : 'Error interno del servidor'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
