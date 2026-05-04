import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/explorar', '/sign-in', '/sign-up'],
      disallow: [
        '/productos',
        '/pedidos',
        '/configuracion',
        '/_dashboard',
        '/_suscripcion',
        '/api/'
      ],
    },
    sitemap: 'https://flashcheckout.vercel.app/sitemap.xml',
  }
}
