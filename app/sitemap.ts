import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export const revalidate = 3600 // Revalidate sitemap every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.flashcheckouts.com'

  // 1. Canonical indexable static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/explorar`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${baseUrl}/enterprise`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.75,
    },
    {
      url: `${baseUrl}/legal/terms`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.3,
    },
  ]

  // 2. Public solution landing pages
  const solutions = [
    'customer-support',
    'sales-agent',
    'ecommerce-retail',
    'education-training',
    'fitness-wellness',
    'travel-hospitality',
  ]
  const solutionRoutes: MetadataRoute.Sitemap = solutions.map(slug => ({
    url: `${baseUrl}/solutions/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.8,
  }))

  // 3. Active public merchant storefronts
  const TEST_SLUGS = ['test-store', 'demo', 'test', 'demo-store', 'tienda-webs']
  let storeRoutes: MetadataRoute.Sitemap = []
  try {
    const stores = await prisma.store.findMany({
      where: { active: true },
      select: { slug: true, updatedAt: true },
    })
    storeRoutes = stores
      .filter(store => store.slug && !TEST_SLUGS.includes(store.slug))
      .map(store => ({
        url: `${baseUrl}/tienda/${store.slug}`,
        lastModified: store.updatedAt,
        changeFrequency: 'daily' as const,
        priority: 0.8,
      }))
  } catch (error) {
    console.error('Error fetching stores for sitemap:', error)
  }

  return [...staticRoutes, ...solutionRoutes, ...storeRoutes]
}
