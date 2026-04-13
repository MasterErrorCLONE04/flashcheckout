import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
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
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}
