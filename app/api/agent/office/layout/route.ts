import { auth } from '@clerk/nextjs/server'
import { Prisma } from '@prisma/client'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getActiveStore } from '@/lib/store-context'
import { badRequest, getErrorMessage, internalServerError, notFound, unauthorized } from '@/lib/api/route-utils'

export const dynamic = 'force-dynamic'

type LayoutBody = {
  layoutItems?: unknown[]
}

type StoreSettings = {
  officeLayout?: unknown[]
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return unauthorized()

    const store = await getActiveStore(userId)
    if (!store) return notFound('Store not found')

    const body = (await req.json().catch(() => null)) as LayoutBody | null
    if (!Array.isArray(body?.layoutItems)) {
      return badRequest('Invalid layout items structure')
    }

    const settings = (store.settings as StoreSettings | null) || {}
    const updatedSettings = { ...settings, officeLayout: body.layoutItems }

    await prisma.store.update({
      where: { id: store.id },
      data: { settings: updatedSettings as Prisma.InputJsonValue },
    })

    return NextResponse.json({ success: true, layoutItems: body.layoutItems })
  } catch (error: unknown) {
    console.error('[Office Layout API Error]:', error)
    return internalServerError(getErrorMessage(error))
  }
}
