import type { Metadata } from "next";
import { Inter, Geist, Plus_Jakarta_Sans } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from 'sonner'
import "./globals.css";
import { cn } from "@/lib/utils";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
});

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.flashcheckouts.com"),
  title: {
    default: "Flashcheckouts - Cierra ventas en 30 segundos",
    template: "%s | Flashcheckouts",
  },
  icons: {
    icon: "/Flashcheckout logo.svg",
    apple: "/Flashcheckout logo.svg",
  },
  description:
    "Convierte tus DMs de Instagram y TikTok en ventas reales con un link de checkout que automatiza el cierre por WhatsApp.",
  keywords: [
    "checkout",
    "whatsapp",
    "ventas por whatsapp",
    "agente ia whatsapp",
    "bre-b colombia",
    "tienda online colombia",
    "instagram shopping",
    "tiktok commerce",
    "ecommerce colombia",
    "automatizacion de ventas",
    "enlaces de pago",
  ],
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "0gUBbD8ueg1N-FtRghTJihhAbakB4hLARVcf84VSVZo",
  },
  openGraph: {
    type: "website",
    locale: "es_ES",
    url: "https://www.flashcheckouts.com",
    title: "Flashcheckouts - Cierra ventas en 30 segundos",
    description: "Convierte tus DMs de Instagram y TikTok en ventas reales con un link de checkout que automatiza el cierre por WhatsApp.",
    siteName: "Flashcheckouts",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Flashcheckouts - Cierra ventas en 30 segundos",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Flashcheckouts - Cierra ventas en 30 segundos",
    description: "Convierte tus DMs de Instagram y TikTok en ventas reales con un link de checkout que automatiza el cierre por WhatsApp.",
    images: ["/og-image.png"],
  },
};

import WebViewProvider from "@/components/WebViewProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#09090b",
          colorBackground: "#ffffff",
          colorInput: "#f4f4f5",
          colorInputForeground: "#09090b",
          borderRadius: "0.5rem",
          fontFamily: "var(--font-sans)",
        },
        elements: {
          card: "border border-zinc-200 premium-card shadow-sm",
          navbar: "hidden",
          headerTitle: "font-semibold tracking-tight text-2xl text-zinc-950",
          formButtonPrimary: "bg-zinc-950 text-white hover:bg-zinc-800 transition-all duration-200 font-semibold rounded-lg py-3",
        }
      }}
    >
      <html lang="es" className={cn("antialiased", geist.variable, inter.variable, plusJakarta.variable)}>
        <head>
          <link rel="icon" href="/Flashcheckout logo.svg" type="image/svg+xml" />
          <link rel="apple-touch-icon" href="/Flashcheckout logo.svg" />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify([
                {
                  "@context": "https://schema.org",
                  "@type": "Organization",
                  "name": "Flashcheckouts",
                  "url": "https://www.flashcheckouts.com",
                  "logo": "https://www.flashcheckouts.com/Flashcheckout%20logo.png",
                  "description":
                    "Plataforma de comercio conversacional, catálogo online con cobros Bre-B y Agente Vendedor IA en WhatsApp.",
                },
                {
                  "@context": "https://schema.org",
                  "@type": "WebSite",
                  "name": "Flashcheckouts",
                  "url": "https://www.flashcheckouts.com",
                  "potentialAction": {
                    "@type": "SearchAction",
                    "target":
                      "https://www.flashcheckouts.com/explorar?q={search_term_string}",
                    "query-input": "required name=search_term_string",
                  },
                },
                {
                  "@context": "https://schema.org",
                  "@type": "SoftwareApplication",
                  "name": "Flashcheckouts",
                  "url": "https://www.flashcheckouts.com",
                  "applicationCategory": "BusinessApplication",
                  "operatingSystem": "Web",
                  "description":
                    "Convierte tus DMs de Instagram, Facebook y TikTok en ventas reales con tienda online, pagos Bre-B y Agente Vendedor IA en WhatsApp.",
                  "offers": {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "COP",
                  },
                },
              ]),
            }}
          />
        </head>
        <body className="min-h-screen bg-secondary text-foreground font-sans">
          <WebViewProvider>
            {children}
          </WebViewProvider>
          <Toaster 
            position="top-right" 
            expand={false} 
            richColors 
            closeButton
            theme="light"
            toastOptions={{
              className: "premium-card border-zinc-200 font-sans text-sm",
            }}
          />
        </body>
      </html>
    </ClerkProvider>
  );
}
