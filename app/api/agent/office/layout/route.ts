import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'
import { getActiveStore } from '@/lib/store-context'

export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const store = await getActiveStore(userId)
    if (!store) return NextResponse.json({ error: 'Store not found' }, { status: 404 })

    const body = await req.json()
    const { layoutItems } = body

    if (!Array.isArray(layoutItems)) {
      return NextResponse.json({ error: 'Invalid layout items structure' }, { status: 400 })
    }

    const settings = (store.settings as any) || {}
    const updatedSettings = { ...settings, officeLayout: layoutItems }

    await prisma.store.update({
      where: { id: store.id },
      data: { settings: updatedSettings }
    })

    return NextResponse.json({ success: true, layoutItems })

  } catch (error: any) {
    console.error('[Office Layout API Error]:', error)
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
  }
}
