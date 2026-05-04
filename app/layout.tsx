import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
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

export const metadata: Metadata = {
  metadataBase: new URL("https://flashcheckout.vercel.app"),
  title: "FlashCheckout — Cierra ventas en 30 segundos",
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
    "automatización de ventas",
    "enlaces de pago",
  ],
  alternates: {
    canonical: "https://flashcheckout.vercel.app",
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
    url: "https://flashcheckout.vercel.app",
    title: "FlashCheckout — Cierra ventas en 30 segundos",
    description: "Convierte tus DMs de Instagram y TikTok en ventas reales con un link de checkout que automatiza el cierre por WhatsApp.",
    siteName: "FlashCheckout",
    images: [
      {
        url: "https://flashcheckout.vercel.app/og-image.png",
        width: 1200,
        height: 630,
        alt: "FlashCheckout - Cierra ventas en 30 segundos",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "FlashCheckout — Cierra ventas en 30 segundos",
    description: "Convierte tus DMs de Instagram y TikTok en ventas reales con un link de checkout que automatiza el cierre por WhatsApp.",
    images: ["https://flashcheckout.vercel.app/og-image.png"],
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
    <html lang="es" className={cn("antialiased", geist.variable, inter.variable)}>
      <head>
        <link rel="icon" href="/Flashcheckout logo.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/Flashcheckout logo.svg" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "FlashCheckout",
              "url": "https://flashcheckout.vercel.app",
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
      <body className="min-h-screen bg-secondary text-foreground font-geist">
        <ClerkProvider
          appearance={{
            variables: {
              colorPrimary: "#0066cc",
              colorBackground: "#ffffff",
              colorInputBackground: "#f5f5f7",
              colorInputText: "#1d1d1f",
              borderRadius: "0.75rem",
              fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
            },
            elements: {
              card: "border border-black/5 premium-card",
              navbar: "hidden",
              headerTitle: "font-semibold tracking-tight text-2xl text-black",
              formButtonPrimary: "bg-[#0066cc] text-white hover:bg-[#0077ed] transition-all duration-300 font-semibold rounded-full py-4",
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
              className: "premium-card border-zinc-200/60 font-geist text-sm",
            }}
          />
        </ClerkProvider>
      </body>
    </html>
  );
}
