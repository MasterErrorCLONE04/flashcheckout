import type { Metadata } from "next";
import { Inter, Geist } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
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
  title: "FlashCheckout — Cierra ventas en 30 segundos",
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
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={cn("antialiased", geist.variable, inter.variable)}>
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
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
