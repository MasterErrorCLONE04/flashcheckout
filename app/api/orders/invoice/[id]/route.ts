import { prisma } from '@/lib/prisma'
import { jsPDF } from 'jspdf'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const order = await prisma.order.findUnique({
      where: { id },
      include: { store: true }
    })

    if (!order) {
      return new Response('Order not found', { status: 404 })
    }

    const doc = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4'
    })

    // Custom aesthetic styling using jsPDF
    doc.setFont('helvetica', 'normal')

    // Header
    doc.setFontSize(22)
    doc.setTextColor(33, 33, 33)
    doc.text(order.store?.name || 'Comercio', 14, 20)

    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(`NIT / ID: ${order.store?.id || 'N/A'}`, 14, 26)
    doc.text(`Fecha: ${new Date(order.createdAt).toLocaleDateString()}`, 14, 31)

    doc.setFontSize(14)
    doc.setTextColor(33, 33, 33)
    doc.text(`FACTURA ELECTRÓNICA DE VENTA`, 110, 20)
    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(`No: ${order.id.toUpperCase()}`, 110, 26)

    // Divider
    doc.setDrawColor(220, 220, 220)
    doc.line(14, 38, 196, 38)

    // Client Info
    doc.setFontSize(11)
    doc.setTextColor(33, 33, 33)
    doc.text('DATOS DEL CLIENTE', 14, 46)
    doc.setFontSize(10)
    doc.setTextColor(80, 80, 80)
    doc.text(`Nombre: ${order.customerName}`, 14, 52)
    doc.text(`Teléfono: ${order.customerPhone || 'N/A'}`, 14, 57)
    doc.text(`Dirección: ${order.address}, ${order.city}`, 14, 62)

    // Items table
    doc.line(14, 68, 196, 68)
    doc.setFontSize(10)
    doc.setTextColor(33, 33, 33)
    doc.text('Producto', 14, 74)
    doc.text('Cant.', 115, 74)
    doc.text('Precio Unit.', 140, 74)
    doc.text('Subtotal', 170, 74)
    doc.line(14, 78, 196, 78)

    let y = 84
    const items = order.items as any[]

    if (Array.isArray(items)) {
      items.forEach((item: any) => {
        doc.setTextColor(80, 80, 80)
        doc.text(item.name || item.productName || 'Producto', 14, y)
        doc.text(String(item.qty || 1), 115, y)
        doc.text(`$${(item.price || 0).toLocaleString()}`, 140, y)
        doc.text(`$${((item.price || 0) * (item.qty || 1)).toLocaleString()}`, 170, y)
        y += 7
      })
    }

    // Totals
    doc.line(14, y + 2, 196, y + 2)
    doc.setFontSize(11)
    doc.setTextColor(33, 33, 33)
    doc.text('TOTAL A PAGAR:', 125, y + 10)
    doc.text(`$${(order.total || 0).toLocaleString()}`, 170, y + 10)

    // Convert PDF to Uint8Array/ArrayBuffer
    const pdfOutput = doc.output('arraybuffer')

    return new Response(pdfOutput, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="factura-${order.id}.pdf"`
      }
    })
  } catch (error) {
    console.error('[Invoice API Error]', error)
    return new Response('Internal Server Error', { status: 500 })
  }
}
