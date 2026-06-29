import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { question, answer } = await req.json()
    if (!question || !answer) {
      return NextResponse.json({ error: 'Missing question or answer' }, { status: 400 })
    }

    const store = await prisma.store.findFirst({
      where: { userId }
    })
    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    const faq = await prisma.faq.create({
      data: {
        question,
        answer,
        storeId: store.id
      }
    })

    return NextResponse.json({ success: true, faq })
  } catch (err: any) {
    console.error('[API FAQ Post Error]', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await req.json()
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    }

    const store = await prisma.store.findFirst({
      where: { userId }
    })
    if (!store) {
      return NextResponse.json({ error: 'Store not found' }, { status: 404 })
    }

    // Verify ownership
    const faq = await prisma.faq.findUnique({
      where: { id }
    })
    if (!faq || faq.storeId !== store.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.faq.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('[API FAQ Delete Error]', err)
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 })
  }
}
