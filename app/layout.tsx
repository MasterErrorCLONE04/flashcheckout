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
    "ventas",
    "instagram",
    "tiktok",
    "ecommerce",
    "colombia",
    "automatizacion de ventas",
    "enlaces de pago",
  ],
  alternates: {
    canonical: "https://www.flashcheckouts.com/",
  },
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

import { Suspense } from "react";
import WebViewProvider from "@/components/WebViewProvider";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={cn("antialiased", geist.variable, inter.variable, plusJakarta.variable)}>
      <head>
        <link rel="icon" href="/Flashcheckout logo.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/Flashcheckout logo.svg" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Flashcheckouts",
              "url": "https://www.flashcheckouts.com",
              "applicationCategory": "BusinessApplication",
              "browserRequirements": "Requires JavaScript and HTML5",
              "description": "Convierte tus DMs de Instagram y TikTok en ventas reales con un link de checkout que automatiza el cierre por WhatsApp.",
              "operatingSystem": "All",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              }
            })
          }}
        />
      </head>
      <body className="min-h-screen bg-secondary text-foreground font-sans">
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
          <Suspense fallback={null}>
            <WebViewProvider>
              {children}
            </WebViewProvider>
          </Suspense>
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
        </ClerkProvider>
      </body>
    </html>
  );
}
