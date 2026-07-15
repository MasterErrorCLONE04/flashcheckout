import { jsPDF } from 'jspdf'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  getErrorMessage,
  internalServerError,
  notFound,
} from '@/lib/api/route-utils'

type InvoiceItem = {
  name?: string
  productName?: string
  qty?: number
  price?: number
}

type InvoiceOrder = {
  id: string
  createdAt: Date
  customerName: string
  customerPhone: string | null
  address: string
  city: string
  total: number
  items: unknown
  store: {
    id: string
    name: string | null
  } | null
}

function normalizeInvoiceItems(items: unknown): InvoiceItem[] {
  if (!Array.isArray(items)) return []
  return items.flatMap(item => {
    if (!item || typeof item !== 'object') return []
    const record = item as Record<string, unknown>
    return [
      {
        name: typeof record.name === 'string' ? record.name : undefined,
        productName:
          typeof record.productName === 'string' ? record.productName : undefined,
        qty: Number(record.qty) || 1,
        price: Number(record.price) || 0,
      },
    ]
  })
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const order = (await prisma.order.findUnique({
      where: { id },
      include: { store: true },
    })) as InvoiceOrder | null

    if (!order) {
      return notFound('Order not found')
    }

    const doc = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4',
    })

    doc.setFont('helvetica', 'normal')

    doc.setFontSize(22)
    doc.setTextColor(33, 33, 33)
    doc.text(order.store?.name || 'Comercio', 14, 20)

    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(`NIT / ID: ${order.store?.id || 'N/A'}`, 14, 26)
    doc.text(`Fecha: ${new Date(order.createdAt).toLocaleDateString()}`, 14, 31)

    doc.setFontSize(14)
    doc.setTextColor(33, 33, 33)
    doc.text('FACTURA ELECTRONICA DE VENTA', 110, 20)
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(`No: ${order.id.toUpperCase()}`, 110, 26)

    doc.setDrawColor(220, 220, 220)
    doc.line(14, 38, 196, 38)

    doc.setFontSize(11)
    doc.setTextColor(33, 33, 33)
    doc.text('DATOS DEL CLIENTE', 14, 46)
    doc.setFontSize(10)
    doc.setTextColor(80, 80, 80)
    doc.text(`Nombre: ${order.customerName}`, 14, 52)
    doc.text(`Telefono: ${order.customerPhone || 'N/A'}`, 14, 57)
    doc.text(`Direccion: ${order.address}, ${order.city}`, 14, 62)

    doc.line(14, 68, 196, 68)
    doc.setFontSize(10)
    doc.setTextColor(33, 33, 33)
    doc.text('Producto', 14, 74)
    doc.text('Cant.', 115, 74)
    doc.text('Precio Unit.', 140, 74)
    doc.text('Subtotal', 170, 74)
    doc.line(14, 78, 196, 78)

    let y = 84
    const items = normalizeInvoiceItems(order.items)

    for (const item of items) {
      const name = item.name || item.productName || 'Producto'
      const qty = Math.max(1, Math.floor(Number(item.qty) || 1))
      const price = Math.max(0, Number(item.price) || 0)

      doc.setTextColor(80, 80, 80)
      doc.text(name, 14, y)
      doc.text(String(qty), 115, y)
      doc.text(`$${price.toLocaleString()}`, 140, y)
      doc.text(`$${(price * qty).toLocaleString()}`, 170, y)
      y += 7
    }

    doc.line(14, y + 2, 196, y + 2)
    doc.setFontSize(11)
    doc.setTextColor(33, 33, 33)
    doc.text('TOTAL A PAGAR:', 125, y + 10)
    doc.text(`$${(order.total || 0).toLocaleString()}`, 170, y + 10)

    const pdfOutput = doc.output('arraybuffer')

    return new Response(pdfOutput, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="factura-${order.id}.pdf"`,
      },
    })
  } catch (error: unknown) {
    console.error('[Invoice API Error]', error)
    return internalServerError(getErrorMessage(error))
  }
}
