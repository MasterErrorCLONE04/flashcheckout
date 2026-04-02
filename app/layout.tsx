import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
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
    <html lang="es" className={`${outfit.variable} antialiased`}>
      <body className="min-h-screen bg-background text-foreground font-sans">
        <ClerkProvider>{children}</ClerkProvider>
      </body>
    </html>
  );
}
