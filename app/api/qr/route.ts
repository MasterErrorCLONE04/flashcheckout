import { NextRequest, NextResponse } from 'next/server'
import QRCode from 'qrcode'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const text = searchParams.get('text') || searchParams.get('data')

  if (!text) {
    return NextResponse.json({ error: 'Parámetro "text" o "data" es requerido' }, { status: 400 })
  }

  try {
    const qrBuffer = await QRCode.toBuffer(text, {
      type: 'png',
      width: 400,
      margin: 2,
      color: {
        dark: '#050505',
        light: '#FFFFFF'
      }
    })

    return new Response(qrBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400',
      },
    })
  } catch (error) {
    console.error('[QR Generation Error]', error)
    return NextResponse.json({ error: 'Error al generar el código QR' }, { status: 500 })
  }
}
