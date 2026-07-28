import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/pricing', '/enterprise', '/explorar', '/solutions/', '/work/doc', '/tienda/'],
      disallow: [
        '/productos',
        '/pedidos',
        '/configuracion',
        '/dashboard',
        '/dashboard/',
        '/agente',
        '/analitica',
        '/automatizaciones',
        '/clientes',
        '/conversaciones',
        '/descuentos',
        '/envios',
        '/hablar-con-nova',
        '/help',
        '/historial-chats',
        '/integraciones',
        '/verificaciones',
        '/affiliate',
        '/changelog',
        '/pay/',
        '/pay',
        '/tienda/*/exito',
        '/api/',
        '/sso-callback'
      ],
    },
    sitemap: 'https://flashcheckout.vercel.app/sitemap.xml',
  }
}
