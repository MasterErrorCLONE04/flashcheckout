import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  try {
    // 1. Validar Token de Autorización Cron
    const authHeader = req.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      console.warn('[Cron Cleanup] Intent de acceso no autorizado.')
      return new Response('No autorizado', { status: 401 })
    }

    console.log('[Cron Cleanup] Iniciando job de limpieza de almacenamiento...')

    // 2. Obtener órdenes RECHAZADAS que aún tienen enlace de comprobante
    const rejectedOrders = await prisma.order.findMany({
      where: {
        paymentStatus: 'REJECTED',
        proofImageUrl: { not: null }
      },
      select: {
        id: true,
        proofImageUrl: true
      }
    })

    if (rejectedOrders.length === 0) {
      console.log('[Cron Cleanup] No hay imágenes de comprobantes rechazados para limpiar.')
      return NextResponse.json({ success: true, message: 'No files to clean up' })
    }

    const bucketName = 'products-images'
    const deletedFiles: string[] = []
    const failedFiles: string[] = []

    for (const order of rejectedOrders) {
      if (!order.proofImageUrl) continue

      try {
        // Extraer la ruta relativa dentro del bucket (por ejemplo proofs/proof_xyz.png)
        // La URL pública tiene el formato: https://[ref].supabase.co/storage/v1/object/public/products-images/[path]
        const searchPattern = `/storage/v1/object/public/${bucketName}/`
        const urlParts = order.proofImageUrl.split(searchPattern)
        
        if (urlParts.length > 1) {
          const filePath = urlParts[1]
          
          console.log(`[Cron Cleanup] Eliminando archivo: ${filePath} del bucket ${bucketName}`)
          
          // Eliminar del almacenamiento de Supabase
          const { error } = await supabase.storage
            .from(bucketName)
            .remove([filePath])

          if (error) {
            console.error(`[Cron Cleanup] Error eliminando ${filePath} en storage:`, error)
            failedFiles.push(order.id)
            continue
          }

          // Limpiar campo de la base de datos
          await prisma.order.update({
            where: { id: order.id },
            data: { proofImageUrl: null }
          })

          deletedFiles.push(order.id)
        } else {
          console.warn(`[Cron Cleanup] No se pudo parsear la url: ${order.proofImageUrl}`)
        }
      } catch (err) {
        console.error(`[Cron Cleanup] Excepción procesando orden ${order.id}:`, err)
        failedFiles.push(order.id)
      }
    }

    console.log(`[Cron Cleanup] Job completado. Eliminados: ${deletedFiles.length}, Fallidos: ${failedFiles.length}`)

    return NextResponse.json({
      success: true,
      cleanedCount: deletedFiles.length,
      failedCount: failedFiles.length,
      deletedOrderIds: deletedFiles,
      failedOrderIds: failedFiles
    })

  } catch (error: any) {
    console.error('[Cron Cleanup] Error fatal en cron cleanup:', error)
    return NextResponse.json({ error: error.message || 'Error interno del servidor' }, { status: 500 })
  }
}
