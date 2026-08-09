import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export const revalidate = 86400 // Revalidate sitemap once a day (24 hours)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.flashcheckouts.com'

  // Static routes
  const staticRoutes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/enterprise`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${baseUrl}/explorar`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/legal/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.3,
    },
    {
      url: `${baseUrl}/work/doc`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    },
  ]

  // Solution routes
  const solutions = [
    'customer-support',
    'sales-agent',
    'ecommerce-retail',
    'education-training',
    'fitness-wellness',
    'travel-hospitality',
  ]
  const solutionRoutes = solutions.map((slug) => ({
    url: `${baseUrl}/solutions/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  // Dynamic store routes (only active stores, excluding test/demo stores)
  const TEST_SLUGS = ['test-store', 'demo', 'test', 'demo-store', 'tienda-webs']
  let storeRoutes: MetadataRoute.Sitemap = []
  try {
    const stores = await prisma.store.findMany({
      where: { active: true },
      select: { slug: true, updatedAt: true },
    })
    storeRoutes = stores
      .filter((store) => !TEST_SLUGS.includes(store.slug))
      .map((store) => ({
        url: `${baseUrl}/tienda/${store.slug}`,
        lastModified: store.updatedAt,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }))
  } catch (error) {
    console.error('Error fetching stores for sitemap:', error)
  }

  return [...staticRoutes, ...solutionRoutes, ...storeRoutes]
}
