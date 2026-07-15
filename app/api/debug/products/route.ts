import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const debugEnabled = process.env.DEBUG_ROUTES_ENABLED === 'true' || process.env.NODE_ENV !== 'production'
    if (!debugEnabled) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const stores = await prisma.store.findMany({
      include: {
        products: {
          select: {
            id: true,
            name: true,
            price: true,
            active: true,
            imageUrl: true,
            category: true,
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      stores: stores.map(s => ({
        id: s.id,
        name: s.name,
        active: s.active,
        productCount: s.products.length,
        products: s.products
      }))
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal Server Error'
    return NextResponse.json({
      success: false,
      error: message
    }, { status: 500 });
  }
}
