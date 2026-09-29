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
        source: '/(pricing|enterprise|explorar|work|legal|solutions|tienda)',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'all, index, follow, max-image-preview:large',
          },
        ],
      },
      {
        source: '/(solutions|tienda|work|legal)/:path*',
        headers: [
          {
            key: 'X-Robots-Tag',
            value: 'all, index, follow, max-image-preview:large',
          },
        ],
      },
      {
        source: '/(dashboard|productos|pedidos|configuracion|automatizaciones|descuentos|agente|studio-ia|clientes|pagos|conversaciones|api|sso-callback)/:path*',
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
