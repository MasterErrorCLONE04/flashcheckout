import { prisma } from '@/lib/prisma';

export interface ProductMatch {
  id: string;
  name: string;
  price: number;
  storeId: string;
  storeName: string;
}

export async function searchGlobalProducts(query: string): Promise<ProductMatch[]> {
  const products = await prisma.product.findMany({
    where: {
      active: true,
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { category: { contains: query, mode: 'insensitive' } },
      ],
      store: {
        active: true,
      },
    },
    include: {
      store: true,
    },
    take: 5, // Limit results to showing in WhatsApp List
  });

  return products.map(p => ({
    id: p.id,
    name: p.name,
    price: p.price,
    storeId: p.storeId,
    storeName: p.store.name,
  }));
}
