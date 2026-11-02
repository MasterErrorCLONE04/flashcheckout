'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import {
  MessageCircle,
  Zap,
  ShoppingBag,
  GraduationCap,
  Activity,
  Plane,
  BookOpen,
  HelpCircle,
  Newspaper,
  ChevronRight,
  Menu,
  X,
  Store,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const FlashcheckoutsLogo = () => (
  <Link href="/" className="flex items-center gap-2.5 group transition-all hover:opacity-85">
    <div className="w-8 h-8 bg-zinc-950 rounded-lg flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
      <Zap className="w-4 h-4 fill-white stroke-white" />
    </div>
    <span className="text-lg font-bold tracking-tight text-zinc-950">Flashcheckouts</span>
  </Link>
)

type NavSubItem = {
  icon: React.ComponentType<{ className?: string }>
  title: string
  description: string
  href: string
}

type NavSection = {
  header: string
  items: NavSubItem[]
}

type NavConfigItem = {
  title: string
  href?: string
  sections?: NavSection[]
}

export const NAVIGATION_CONFIG: NavConfigItem[] = [
  {
    title: 'Soluciones',
    sections: [
      {
        header: 'POR CASO DE USO',
        items: [
          {
            icon: MessageCircle,
            title: 'Atención al cliente',
            description: 'Respuestas al instante, menos carga operativa y soporte 24/7.',
            href: '/solutions/customer-support',
          },
          {
            icon: Zap,
            title: 'Agente de ventas',
            description: 'Califica prospectos, arma carritos y cierra ventas en WhatsApp.',
            href: '/solutions/sales-agent',
          },
        ],
      },
      {
        header: 'POR INDUSTRIA',
        items: [
          {
            icon: ShoppingBag,
            title: 'Ecommerce y Retail',
            description: 'Catálogo conversacional, stock en vivo, envíos y pagos.',
            href: '/solutions/ecommerce-retail',
          },
          {
            icon: GraduationCap,
            title: 'Educación y Formación',
            description: 'Admisiones, inscripciones y resolución de dudas.',
            href: '/solutions/education-training',
          },
          {
            icon: Activity,
            title: 'Salud y Bienestar',
            description: 'Reservas, recordatorios y atención a miembros.',
            href: '/solutions/fitness-wellness',
          },
          {
            icon: Plane,
            title: 'Viajes y Hospitalidad',
            description: 'Cotizaciones, reservas y asistencia inmediata.',
            href: '/solutions/travel-hospitality',
          },
        ],
      },
    ],
  },
  {
    title: 'Recursos',
    sections: [
      {
        header: 'APRENDE Y EXPLORA',
        items: [
          {
            icon: Store,
            title: 'Explorar tiendas',
            description: 'Directorio de comercios verificados en Flashcheckouts.',
            href: '/explorar',
          },
          {
            icon: BookOpen,
            title: 'Documentación',
            description: 'Guías de integración, arquitectura y referencia de API.',
            href: '/work/doc',
          },
          {
            icon: HelpCircle,
            title: 'Centro de ayuda',
            description: 'Tutoriales paso a paso y soporte técnico.',
            href: '/help',
          },
          {
            icon: Newspaper,
            title: 'Novedades',
            description: 'Últimas actualizaciones y mejoras del producto.',
            href: '/changelog',
          },
        ],
      },
    ],
  },
  { title: 'Empresas', href: '/enterprise' },
  { title: 'Precios', href: '/pricing' },
]

function NavItem({ item }: { item: NavConfigItem }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div
      className="relative h-full flex items-center"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <Link
        href={item.href || '#'}
        className={`text-sm font-medium transition-colors flex items-center gap-1 h-full pt-0.5 ${
          isOpen ? 'text-zinc-950' : 'text-zinc-600 hover:text-zinc-950'
        }`}
      >
        {item.title}
        {item.sections && (
          <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronRight className="w-3.5 h-3.5 rotate-90" />
          </motion.span>
        )}
      </Link>

      {item.sections && (
        <motion.div
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{
            opacity: isOpen ? 1 : 0,
            y: isOpen ? 0 : 10,
            scale: isOpen ? 1 : 0.98,
            pointerEvents: isOpen ? 'auto' : 'none',
          }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="absolute top-[calc(100%-8px)] left-1/2 -translate-x-1/2 pt-4 z-50 min-w-[560px]"
        >
          <div
            className={`bg-white rounded-2xl border border-zinc-200 shadow-[0_20px_50px_rgba(0,0,0,0.10)] p-6 overflow-hidden grid gap-8 ${
              item.sections.length > 1 ? 'grid-cols-2' : 'grid-cols-1 min-w-[340px]'
            }`}
          >
            {item.sections.map((section, idx) => (
              <div key={idx}>
                <h4 className="px-3 pb-2 font-semibold text-zinc-400 text-[11px] uppercase tracking-wider">
                  {section.header}
                </h4>
                <div className="flex flex-col gap-1">
                  {section.items.map((subItem, subIdx) => (
                    <Link
                      key={subIdx}
                      href={subItem.href}
                      className="group flex flex-row items-center gap-3.5 rounded-xl p-2.5 text-sm transition-all hover:bg-zinc-50 hover:text-zinc-950 focus:bg-zinc-50 outline-none w-full"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-zinc-200/80 bg-white group-hover:border-zinc-300 transition-all">
                        <subItem.icon className="w-4 h-4 text-zinc-500 group-hover:text-zinc-950 transition-colors" />
                      </div>
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="font-semibold text-sm tracking-tight text-zinc-950">
                          {subItem.title}
                        </span>
                        <span className="line-clamp-1 text-xs text-zinc-500">
                          {subItem.description}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}

export default function Navbar({ userId }: { userId?: string }) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled || mobileMenuOpen
          ? 'bg-white/85 backdrop-blur-md border-b border-zinc-200/80 py-3 shadow-[0_2px_20px_0_rgba(0,0,0,0.03)]'
          : 'bg-transparent border-b border-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <FlashcheckoutsLogo />

        <nav className="hidden lg:flex items-center gap-8 h-10" aria-label="Navegación principal">
          {NAVIGATION_CONFIG.map((item, i) => (
            <NavItem key={i} item={item} />
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {!userId ? (
            <>
              <Link
                href="/sign-in"
                className="text-sm font-medium text-zinc-700 hover:text-zinc-950 transition-colors hidden sm:block"
              >
                Iniciar sesión
              </Link>
              <Button asChild size="md" className="hidden sm:inline-flex">
                <Link href="/sign-up">Crear cuenta</Link>
              </Button>
            </>
          ) : (
            <Button asChild size="md" className="hidden sm:inline-flex">
              <Link href="/dashboard">Ir al panel</Link>
            </Button>
          )}

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 transition-colors cursor-pointer"
            aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
          >
            {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-zinc-200/80 bg-white px-6 py-5 space-y-5 shadow-xl max-h-[80vh] overflow-y-auto">
          <div className="space-y-4">
            {NAVIGATION_CONFIG.map((item, idx) =>
              item.sections ? (
                <div key={idx} className="space-y-2">
                  <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    {item.title}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                    {item.sections
                      .flatMap((s) => s.items)
                      .map((sub, sIdx) => (
                        <Link
                          key={sIdx}
                          href={sub.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-50 hover:text-zinc-950"
                        >
                          <sub.icon className="w-4 h-4 text-zinc-400 shrink-0" />
                          <span>{sub.title}</span>
                        </Link>
                      ))}
                  </div>
                </div>
              ) : (
                <Link
                  key={idx}
                  href={item.href || '#'}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-1.5 text-sm font-semibold text-zinc-800 hover:text-zinc-950"
                >
                  {item.title}
                </Link>
              )
            )}
          </div>

          <div className="pt-3 border-t border-zinc-200 flex flex-col sm:flex-row gap-2.5">
            {!userId ? (
              <>
                <Button variant="outline" size="md" className="w-full" asChild>
                  <Link href="/sign-in" onClick={() => setMobileMenuOpen(false)}>
                    Iniciar sesión
                  </Link>
                </Button>
                <Button size="md" className="w-full" asChild>
                  <Link href="/sign-up" onClick={() => setMobileMenuOpen(false)}>
                    Crear cuenta
                  </Link>
                </Button>
              </>
            ) : (
              <Button size="md" className="w-full" asChild>
                <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                  Ir al panel
                </Link>
              </Button>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
