import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/pricing',
          '/enterprise',
          '/explorar',
          '/solutions/',
          '/tienda/',
          '/legal/',
        ],
        disallow: [
          '/dashboard',
          '/dashboard/',
          '/agente',
          '/conversaciones',
          '/pedidos',
          '/productos',
          '/studio-ia',
          '/clientes',
          '/pagos',
          '/descuentos',
          '/integraciones',
          '/configuracion',
          '/analitica',
          '/verificaciones',
          '/affiliate',
          '/help',
          '/hablar-con-nova',
          '/automatizaciones',
          '/historial-chats',
          '/envios',
          '/pay/',
          '/pay',
          '/tienda/*/exito',
          '/api/',
          '/sign-in',
          '/sign-up',
          '/sso-callback',
        ],
      },
      {
        userAgent: [
          'Amazonbot',
          'Applebot-Extended',
          'Bytespider',
          'CCBot',
          'ClaudeBot',
          'Google-Extended',
          'GPTBot',
          'meta-externalagent',
        ],
        disallow: ['/'],
      },
    ],
    sitemap: 'https://www.flashcheckouts.com/sitemap.xml',
    host: 'https://www.flashcheckouts.com',
  }
}
