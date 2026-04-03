'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  Zap, 
} from 'lucide-react'

// Custom SVG Icons because the project's lucide-react version is older
const Linkedin = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect width="4" height="12" x="2" y="9" />
    <circle cx="4" cy="4" r="2" />
  </svg>
)

const Instagram = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
)

const Youtube = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 2-2 58.4 58.4 0 0 1 15 0 2 2 0 0 1 2 2 24.12 24.12 0 0 1 0 10 2 2 0 0 1-2 2 58.4 58.4 0 0 1-15 0 2 2 0 0 1-2-2z" />
    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
  </svg>
)

const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
  </svg>
)

const Footer = () => {
  const currentYear = new Date().getFullYear()

  const footerLinks = [
    {
      title: 'PRODUCTO',
      links: [
        { label: 'Servicio al Cliente', href: '#' },
        { label: 'Precios', href: '#' },
        { label: 'Seguridad', href: '#' },
        { label: 'Expertos Flash', href: '#' },
        { label: 'Contrata un Experto', href: '#' },
        { label: 'Afiliados', href: '#' },
      ],
    },
    {
      title: 'RECURSOS',
      links: [
        { label: 'Contáctanos', href: '#' },
        { label: 'API', href: '#' },
        { label: 'Guía', href: '#' },
        { label: 'Blog', href: '#' },
        { label: 'Registro de cambios', href: '#' },
      ],
    },
    {
      title: 'COMPAÑÍA',
      links: [
        { label: 'Carreras', href: '#' },
        { label: 'Política de privacidad', href: '#' },
        { label: 'Términos de servicio', href: '#' },
        { label: 'DPA', href: '#' },
        { label: 'Política de cookies', href: '#' },
        { label: 'Centro de confianza', href: '#' },
        { label: 'Preferencias de cookies', href: '#' },
      ],
    },
  ]

  return (
    <footer className="relative bg-black text-white/50 py-24 overflow-hidden min-h-[600px] flex flex-col justify-between border-t border-white/5">
      {/* Background Watermark Text */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-[25%] pointer-events-none select-none">
        <h2 className="text-[18vw] font-bold tracking-tight text-transparent leading-none" style={{ WebkitTextStroke: '1px rgba(255,255,255,0.15)' }}>
          FlashCheckout
        </h2>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-24">
          
          {/* Left Side: Brand & Socials */}
          <div className="md:col-span-4 space-y-10">
            <div className="space-y-4">
              <Link href="/" className="flex items-center gap-3 group translate-x-[-4px]">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center transition-transform group-hover:scale-110">
                  <Zap className="w-6 h-6 text-black fill-black" />
                </div>
                <span className="text-2xl font-bold tracking-tighter text-white">FlashCheckout</span>
              </Link>
              <p className="text-sm font-medium tracking-tight opacity-40">
                © {currentYear} FlashCheckout, Inc.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button className="h-12 px-10 bg-zinc-100 hover:bg-white text-black font-bold text-sm rounded-xl transition-all active:scale-95">
                Contacto
              </button>
              
              <div className="flex items-center gap-2">
                {[
                  { icon: Linkedin, href: '#' },
                  { icon: Instagram, href: '#' },
                  { icon: XIcon, href: '#' },
                  { icon: Youtube, href: '#' }
                ].map((social, i) => (
                  <Link 
                    key={i}
                    href={social.href} 
                    className="w-12 h-12 flex items-center justify-center border border-white/10 hover:border-white/20 hover:bg-white/5 rounded-xl transition-all group"
                  >
                    <social.icon className="w-5 h-5 text-white/60 group-hover:text-white" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Verification Badges */}
            <div className="flex items-center gap-6 pt-4">
              <div className="flex items-center gap-2 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer">
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-white/20 flex flex-col items-center justify-center text-[10px] font-bold text-center leading-none p-2">
                  <span className="mb-0.5">AICPA</span>
                  <span className="text-[12px]">SOC 2</span>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-pointer">
                <div className="relative w-16 h-16 flex items-center justify-center border-2 border-dashed border-white/20 rounded-full">
                  <span className="text-[11px] font-bold">GDPR</span>
                  <div className="absolute inset-0">
                    {[...Array(12)].map((_, i) => (
                      <div 
                        key={i} 
                        className="absolute w-1 h-1 bg-white/40 rounded-full"
                        style={{
                          top: '50%',
                          left: '50%',
                          transform: `rotate(${i * 30}deg) translateY(-28px)`
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Links Columns */}
          <div className="md:col-span-8">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
              {footerLinks.map((column, i) => (
                <div key={i} className="space-y-8">
                  <h3 className="text-[11px] font-black tracking-[0.3em] text-white">
                    {column.title}
                  </h3>
                  <ul className="space-y-4">
                    {column.links.map((link, j) => (
                      <li key={j}>
                        <Link 
                          href={link.href}
                          className="text-[15px] font-medium hover:text-white transition-colors tracking-tight opacity-70 hover:opacity-100"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Floating Chat Button */}
      {/* 
        The image shows a chat button. Not strictly part of footer but common in this layout.
        I'll wrap it in a client-side only check if needed, but it's okay for now.
      */}
      <div className="fixed bottom-10 right-10 z-50">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-16 h-16 bg-white text-black rounded-2xl flex items-center justify-center shadow-[0_20px_60px_rgba(0,0,0,0.3)] group transition-all"
        >
          <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 group-hover:scale-110 transition-transform" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
            <path d="M8 12h.01" className="text-black/20" />
            <path d="M12 12h.01" className="text-black/20" />
            <path d="M16 12h.01" className="text-black/20" />
          </svg>
        </motion.button>
      </div>
    </footer>
  )
}

export default Footer
