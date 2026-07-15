import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  badRequest,
  forbidden,
  getErrorMessage,
  internalServerError,
  notFound,
  unauthorized,
} from '@/lib/api/route-utils'

type FaqBody = {
  question?: string
  answer?: string
  id?: string
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return unauthorized()

    const body = (await req.json().catch(() => null)) as FaqBody | null
    if (!body?.question || !body.answer) {
      return badRequest('Missing question or answer')
    }

    const store = await prisma.store.findFirst({
      where: { userId },
    })
    if (!store) return notFound('Store not found')

    const faq = await prisma.faq.create({
      data: {
        question: body.question,
        answer: body.answer,
        storeId: store.id,
      },
    })

    return NextResponse.json({ success: true, faq })
  } catch (err: unknown) {
    console.error('[API FAQ Post Error]', err)
    return internalServerError(getErrorMessage(err))
  }
}

export async function DELETE(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) return unauthorized()

    const body = (await req.json().catch(() => null)) as FaqBody | null
    if (!body?.id) return badRequest('Missing id')

    const store = await prisma.store.findFirst({
      where: { userId },
    })
    if (!store) return notFound('Store not found')

    const faq = await prisma.faq.findUnique({
      where: { id: body.id },
    })
    if (!faq || faq.storeId !== store.id) return forbidden()

    await prisma.faq.delete({
      where: { id: body.id },
    })

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    console.error('[API FAQ Delete Error]', err)
    return internalServerError(getErrorMessage(err))
  }
}
