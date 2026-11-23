import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  allowedDevOrigins: ['*.trycloudflare.com', 'localhost:3000', '*.lhr.life', '*.localhost.run'],
  async headers() {
    return [
      {
        source: '/',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'all, index, follow, max-image-preview:large',
          },
        ],
      },
      {
        source: '/(pricing|enterprise|explorar)',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'all, index, follow, max-image-preview:large',
          },
        ],
      },
      {
        source: '/(solutions|tienda|legal)/:path+',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'all, index, follow, max-image-preview:large',
          },
        ],
      },
      {
        source: '/(dashboard|tienda|productos|pedidos|configuracion|automatizaciones|descuentos|agente|studio-ia|clientes|pagos|conversaciones|integraciones|analitica|verificaciones|affiliate|help|hablar-con-nova|historial-chats|envios|pay|api|sso-callback)',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow',
          },
        ],
      },
      {
        source: '/(dashboard|productos|pedidos|configuracion|automatizaciones|descuentos|agente|studio-ia|clientes|pagos|conversaciones|integraciones|analitica|verificaciones|affiliate|help|hablar-con-nova|historial-chats|envios|pay|api|sso-callback)/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'noindex, nofollow',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
