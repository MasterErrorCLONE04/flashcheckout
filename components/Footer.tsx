'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronDown,
  LucideIcon,
  Zap
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const Linkedin = ({ className }: { className?: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path fillRule="evenodd" clipRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" fill="currentColor" />
  </svg>
)

const Instagram = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line>
  </svg>
)

const Youtube = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" className={className}>
    <title>YouTube Icon</title>
    <path d="M23.498 6.186a2.966 2.966 0 00-2.084-2.084C19.654 3.333 12 3.333 12 3.333s-7.654 0-9.414.769A2.966 2.966 0 00.502 6.186C0 8.102 0 12 0 12s0 3.898.502 5.814a2.966 2.966 0 002.084 2.084c1.76.769 9.414.769 9.414.769s7.654 0 9.414-.769a2.966 2.966 0 002.084-2.084C24 15.898 24 12 24 12s0-3.898-.502-5.814zM9.545 15.568v-7.136L15.545 12l-6 3.568z"></path>
  </svg>
)

const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"></path>
  </svg>
)

const FooterHeading = ({ children }: { children: React.ReactNode }) => (
  <h6 className="font-semibold text-sm text-zinc-50 capitalize tracking-[0.2em] mb-4">
    {children}
  </h6>
)

const FooterLink = ({ href, children }: { href: string, children: React.ReactNode }) => (
  <Link
    href={href}
    className="font-medium text-sm text-zinc-400 transition-colors duration-200 ease-in-out hover:text-white"
  >
    {children}
  </Link>
)

const SocialButton = ({ icon: Icon, label, href }: { icon: any, label: string, href: string }) => (
  <Link href={href} target="_blank" className="contents">
    <button
      className="flex items-center justify-center rounded-md font-medium text-sm outline-none transition-all duration-200 border border-zinc-800 bg-transparent shadow-sm h-11 p-3 text-zinc-400 hover:bg-zinc-800/90 hover:text-white md:col-span-1"
      aria-label={label}
    >
      {typeof Icon === 'function' ? (
        <Icon className="w-5 h-5" />
      ) : (
        Icon
      )}
    </button>
  </Link>
)

const Footer = () => {
  const [openAccordion, setOpenAccordion] = useState<string | null>(null)

  const toggleAccordion = (id: string) => {
    setOpenAccordion(openAccordion === id ? null : id)
  }

  const footerLinks = {
    PRODUCT: [
      { label: 'Servicio al Cliente', href: '#' },
      { label: 'Precios', href: '/pricing' },
      { label: 'Seguridad', href: '#' },
      { label: 'Expertos Flash', href: '#' },
      { label: 'Contrata un Experto', href: '#' },
      { label: 'Afiliados', href: '#' },
    ],
    RESOURCES: [
      { label: 'Contáctanos', href: '#' },
      { label: 'API', href: '#' },
      { label: 'Guía', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Changelog', href: '#' },
    ],
    COMPANY: [
      { label: 'Carreras', href: '#' },
      { label: 'Politica de privacidad', href: '#' },
      { label: 'Terminos de servicio', href: '#' },
      { label: 'DPA', href: '#' },
      { label: 'Política de cookies', href: '#' },
      { label: 'Trust Center', href: '#' },
    ]
  }

  return (
    <footer className="relative overflow-hidden bg-[#09090B] pt-24 pb-0 text-white">
      <section className="mx-auto w-full max-w-7xl px-6 grid items-center gap-10 md:grid-cols-2 md:items-start relative z-20">

        {/* Brand & Socials Section */}
        <div className="flex flex-col items-center gap-8 md:items-start">
          <div className="flex flex-col items-center gap-4 md:items-start">
            <Link href="/" className="pointer-events-auto flex items-center gap-3 group hover:opacity-85 transition-all">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-zinc-950 shadow-sm group-hover:scale-105 transition-transform">
                <Zap className="w-4.5 h-4.5 fill-zinc-950 stroke-zinc-950" />
              </div>
              <span className="text-[22px] font-bold tracking-tight text-white">Flashcheckouts</span>
            </Link>
            <p className="text-center font-medium text-zinc-400 leading-5">&copy; 2026 Flashcheckouts, Inc. </p>
          </div>

          <div className="grid w-full grid-cols-4 gap-4 md:w-auto md:grid-cols-6">
            <Link href="/help" className="contents" target="_blank">
              <button
                data-slot="button"
                className="isolate md:[isolation:auto] flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium outline-hidden transition-all duration-200 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 bg-secondary text-secondary-foreground shadow-xs hover:bg-secondary/80 px-5 py-3 col-span-4 h-11 text-base md:col-span-2"
                aria-label="Help"
              >
                Contact
              </button>
            </Link>

            <Link href="https://www.linkedin.com/company/flashcheckout/" target="_blank" className="contents">
              <button
                data-slot="button"
                className="isolate md:[isolation:auto] flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium text-sm outline-hidden transition-all duration-200 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 border bg-transparent shadow-inner-sm dark:border-input dark:bg-input/30 dark:hover:bg-input/50 h-11 border-zinc-800 p-3 text-primary-foreground hover:bg-zinc-800/90 hover:text-white md:col-span-1"
                aria-label="Linkedin"
              >
                <Linkedin className="size-5" />
              </button>
            </Link>

            <Link href="https://www.instagram.com/flashcheckout/" target="_blank" className="contents">
              <button
                data-slot="button"
                className="isolate md:[isolation:auto] flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium text-sm outline-hidden transition-all duration-200 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 border bg-transparent shadow-inner-sm dark:border-input dark:bg-input/30 dark:hover:bg-input/50 h-11 border-zinc-800 p-3 text-primary-foreground hover:bg-zinc-800/90 hover:text-white md:col-span-1"
                aria-label="Instagram"
              >
                <Instagram className="size-5" />
              </button>
            </Link>

            <Link href="https://x.com/flashcheckout" target="_blank" className="contents">
              <button
                data-slot="button"
                className="isolate md:[isolation:auto] flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium text-sm outline-hidden transition-all duration-200 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 border bg-transparent shadow-inner-sm dark:border-input dark:bg-input/30 dark:hover:bg-input/50 h-11 border-zinc-800 p-3 text-primary-foreground hover:bg-zinc-800/90 hover:text-white md:col-span-1"
                aria-label="Twitter"
              >
                <XIcon className="size-5" />
              </button>
            </Link>

            <Link href="https://www.youtube.com/@flashcheckout" target="_blank" className="contents">
              <button
                data-slot="button"
                className="isolate md:[isolation:auto] flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium text-sm outline-hidden transition-all duration-200 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 border bg-transparent shadow-inner-sm dark:border-input dark:bg-input/30 dark:hover:bg-input/50 h-11 border-zinc-800 p-3 text-primary-foreground hover:bg-zinc-800/90 hover:text-white md:col-span-1"
                aria-label="Youtube"
              >
                <Youtube className="size-5" />
              </button>
            </Link>
          </div>
        </div>

        {/* Link Columns Section (Desktop) */}
        <div className="hidden md:flex md:gap-10 lg:gap-24 xl:gap-32">
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="flex flex-col gap-4">
              <FooterHeading>{title}</FooterHeading>
              {links.map((link) => (
                <FooterLink key={link.label} href={link.href}>{link.label}</FooterLink>
              ))}
            </div>
          ))}
        </div>

        {/* Accordions Section (Mobile) */}
        <div className="flex w-full flex-col gap-4 md:hidden">
          {Object.entries(footerLinks).map(([title, links]) => (
            <div key={title} className="border-b border-zinc-500/30">
              <button
                onClick={() => toggleAccordion(title)}
                className="flex w-full items-center justify-between py-4 font-bold text-white transition-all text-base uppercase tracking-widest outline-none"
              >
                {title}
                <ChevronDown className={`h-5 w-5 transition-transform duration-200 ${openAccordion === title ? 'rotate-180' : ''}`} />
              </button>
              <AnimatePresence>
                {openAccordion === title && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-col gap-3 pb-6">
                      {links.map((link) => (
                        <FooterLink key={link.label} href={link.href}>{link.label}</FooterLink>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </section>

      {/* Monumental Stealth Watermark */}
      <section className="mx-auto flex w-full max-w-7xl px-6 xl:-mt-14 lg:-mt-10 md:-mt-4 sm:-mt-10 overflow-hidden pb-1 md:pb-3 lg:pb-0 relative z-10 pointer-events-none select-none">
        <svg
          viewBox="0 0 4300 700"
          width="100%"
          height="auto"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="h-auto w-full translate-y-[25%] opacity-50 transition-all duration-700 hover:opacity-65"
        >
          <title>Flashcheckouts Logo</title>
          <g stroke="#3F3F46" strokeWidth="8" fill="#09090B" textRendering="geometricPrecision">
            {/* Centered Outlined Flashcheckouts Text (Surgical Refined) */}
            <text
              x="50%"
              y="560"
              textAnchor="middle"
              strokeLinejoin="round"
              strokeLinecap="round"
              paintOrder="stroke fill"
              className="text-[540px] font-medium tracking-normal"
              style={{ fontFamily: 'var(--font-inter), Arial, sans-serif' }}
            >
              Flashcheckouts
            </text>
          </g>
        </svg>
      </section>
    </footer>
  )
}

export default Footer
