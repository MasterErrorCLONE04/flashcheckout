'use client'

import React, { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  HelpCircle,
  ChevronDown,
  Search,
  QrCode,
  Bot,
  Store,
  ShoppingCart,
  Sparkles,
  ArrowUpRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type HelpCategory = 'Todas' | 'Pagos & Bre-B' | 'WhatsApp IA' | 'Tienda & Catálogo' | 'Pedidos & Guías'

const FAQS: Array<{
  category: Exclude<HelpCategory, 'Todas'>
  question: string
  answer: string
  href?: string
  linkLabel?: string
}> = [
  {
    category: 'Pagos & Bre-B',
    question: '¿Cómo configuro mi llave Bre-B (Nequi, Bancolombia, Davivienda o Nu) para recibir pagos?',
    answer:
      'Entra a Integraciones → selecciona "Bre-B Colombia (QR & Llaves)", elige tu entidad financiera con los botones rápidos (Nequi 1507, Bancolombia 0007, Davivienda 0051 o Nu 3201), ingresa tu llave (celular, NIT, cédula o alfanumérica) y activa el interruptor. El sistema generará automáticamente el QR EMVCo en cada pedido.',
    href: '/integraciones',
    linkLabel: 'Ir a Integraciones Bre-B',
  },
  {
    category: 'Pagos & Bre-B',
    question: '¿Cómo valido un comprobante de transferencia subido por el cliente?',
    answer:
      'Cuando un comprador sube la captura de su pago en /pay/[orderId], el pedido pasa a estado "En validación (UPLOADED)". Puedes ver la foto del soporte y aprobarlo en 1 clic directamente desde Pedidos, Pagos o Verificaciones. Al aprobarlo, el cliente recibe confirmación por WhatsApp y ya puedes despachar.',
    href: '/pagos',
    linkLabel: 'Ir a Tesorería & Pagos',
  },
  {
    category: 'WhatsApp IA',
    question: '¿Cómo vinculo el WhatsApp de mi tienda y entreno al Agente Vendedor IA?',
    answer:
      'En Integraciones (o desde Conversaciones) genera el código QR y escanéalo desde WhatsApp → Dispositivos vinculados. Luego, en Agente IA puedes personalizar el tono de voz, instrucciones de cierre, preguntas frecuentes y probar respuestas reales en el simulador en vivo.',
    href: '/agente',
    linkLabel: 'Configurar Agente IA',
  },
  {
    category: 'WhatsApp IA',
    question: '¿Cómo hago que el Agente IA destaque argumentos específicos de un producto?',
    answer:
      'En Productos, selecciona cualquier artículo y en el panel derecho completa el campo "Argumento de cierre para Agente IA". Esa información se indexa automáticamente en los embeddings del producto para que el bot la use al conversar.',
    href: '/productos',
    linkLabel: 'Editar Productos',
  },
  {
    category: 'Tienda & Catálogo',
    question: '¿Cómo edito textos, fotos o agrego componentes en mi tienda pública?',
    answer:
      'En Tienda activa el modo "Editor" y haz clic sobre cualquier título, imagen, tarjeta o producto en el lienzo interactivo para abrir la barra de Edición Directa. También puedes usar "+ Añadir componente" o el Copiloto IA para rediseñar secciones completas.',
    href: '/tienda',
    linkLabel: 'Abrir Constructor de Tienda',
  },
  {
    category: 'Tienda & Catálogo',
    question: '¿Cómo mejoro las fotos de mis productos o creo Reels con IA?',
    answer:
      'Desde Studio IA selecciona un producto de tu catálogo para reiluminar su fotografía comercial preservando el producto original (IC-Light), generar guiones persuasivos, locución en español y exportar videos verticales 9:16.',
    href: '/studio-ia',
    linkLabel: 'Abrir Studio IA',
  },
  {
    category: 'Pedidos & Guías',
    question: '¿Cómo envío el número de guía y transportadora al WhatsApp del cliente?',
    answer:
      'En Pedidos selecciona la orden pagada, haz clic en "Despachar con Guía", elige la transportadora (Servientrega, Interrapidísimo, Coordinadora, Envía, TCC o Mensajero Propio) e ingresa el número de guía. El sistema actualiza la orden a "En Tránsito" y notifica al cliente por WhatsApp.',
    href: '/pedidos',
    linkLabel: 'Ir a Pedidos',
  },
  {
    category: 'Pedidos & Guías',
    question: '¿Por qué en Clientes aparecen algunos registros como "Intención"?',
    answer:
      'El CRM de Clientes no permite crear clientes falsos manualmente: clasifica automáticamente como "Pagado / ★ Frecuente" a quienes ya completaron y pagaron una compra, y como "Intención de Compra" a quienes iniciaron un pedido en el checkout o carrito de WhatsApp sin haber pagado aún, para que puedas recuperarlos.',
    href: '/clientes',
    linkLabel: 'Abrir CRM de Clientes',
  },
]

const CATEGORIES: HelpCategory[] = [
  'Todas',
  'Pagos & Bre-B',
  'WhatsApp IA',
  'Tienda & Catálogo',
  'Pedidos & Guías',
]

export default function HelpPageContent() {
  const [activeCategory, setActiveCategory] = useState<HelpCategory>('Todas')
  const [searchQuery, setSearchQuery] = useState('')
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    if (!mq.matches) return
    const orig = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = orig
    }
  }, [])

  const filteredFaqs = useMemo(() => {
    return FAQS.filter(item => {
      if (activeCategory !== 'Todas' && item.category !== activeCategory) return false
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        return (
          item.question.toLowerCase().includes(q) ||
          item.answer.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [activeCategory, searchQuery])

  return (
    <div className="-mx-4 md:-mx-8 lg:-ml-12 lg:-mr-8 -mt-4 md:-mt-6 -mb-24 lg:-mb-12 lg:h-[calc(100vh-53px)] min-h-[680px] flex flex-col bg-[#FAFAFA] font-sans text-left select-none overflow-hidden">
      {/* 1. Top Studio Header Bar (h-13 / 53px) */}
      <header className="h-13 shrink-0 bg-white border-b border-zinc-200 px-5 flex items-center justify-between gap-3 z-20">
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-zinc-950 text-white flex items-center justify-center shrink-0">
            <HelpCircle className="w-3.5 h-3.5" />
          </div>
          <h1 className="text-sm font-bold text-zinc-950 tracking-tight">
            Centro de Ayuda
          </h1>
        </div>

        {/* Center: Category Filter */}
        <div className="hidden md:flex items-center bg-zinc-100 p-0.5 rounded-lg border border-zinc-200/80 overflow-x-auto no-scrollbar">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={cn(
                'h-7 px-2.5 rounded-md text-xs font-semibold transition-all cursor-pointer whitespace-nowrap',
                activeCategory === cat
                  ? 'bg-white text-zinc-950 shadow-2xs'
                  : 'text-zinc-500 hover:text-zinc-900'
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Right: Quick Search */}
        <div className="relative w-48 sm:w-64 shrink-0">
          <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar guía o respuesta..."
            className="w-full h-8 pl-8 pr-3 rounded-lg bg-zinc-50 border border-zinc-200 text-xs text-zinc-950 placeholder:text-zinc-400 focus:outline-none focus:border-zinc-950 focus:bg-white"
          />
        </div>
      </header>

      {/* 2. Main Scrollable Workspace */}
      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: Interactive FAQ Accordion (8 cols) */}
          <div className="lg:col-span-8 space-y-3">
            {filteredFaqs.map((faq, idx) => {
              const isOpen = openIndex === idx
              return (
                <div
                  key={faq.question}
                  className={cn(
                    'bg-white border rounded-xl overflow-hidden transition-all',
                    isOpen
                      ? 'border-zinc-950 shadow-xs'
                      : 'border-zinc-200 hover:border-zinc-300'
                  )}
                >
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    className="w-full px-5 py-4 flex items-center justify-between gap-4 text-left cursor-pointer"
                  >
                    <div className="space-y-1">
                      <span className="inline-block px-2 py-0.5 rounded bg-zinc-100 border border-zinc-200 text-[10px] font-bold uppercase tracking-wider text-zinc-600">
                        {faq.category}
                      </span>
                      <h3 className="text-xs sm:text-sm font-bold text-zinc-950">
                        {faq.question}
                      </h3>
                    </div>
                    <ChevronDown
                      className={cn(
                        'w-4 h-4 text-zinc-400 transition-transform shrink-0',
                        isOpen && 'rotate-180 text-zinc-950'
                      )}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-4 pt-1 border-t border-zinc-100 bg-zinc-50/40 space-y-3">
                      <p className="text-xs text-zinc-600 leading-relaxed">
                        {faq.answer}
                      </p>
                      {faq.href && (
                        <Link
                          href={faq.href}
                          className="inline-flex items-center gap-1 text-xs font-bold text-zinc-950 hover:underline"
                        >
                          <span>{faq.linkLabel || 'Ir al módulo'}</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Right Column: Quick Studio Modules Guide (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            <div className="bg-white border border-zinc-200 rounded-xl p-5 space-y-3.5">
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-zinc-950">
                Accesos Rápidos de Configuración
              </h2>

              <div className="space-y-2">
                {[
                  {
                    href: '/integraciones',
                    icon: QrCode,
                    title: 'Configurar Llave Bre-B & QR',
                    desc: 'Nequi, Bancolombia, Davivienda y Nu',
                  },
                  {
                    href: '/agente',
                    icon: Bot,
                    title: 'Entrenar Agente WhatsApp IA',
                    desc: 'Prompt, reglas de venta y simulador',
                  },
                  {
                    href: '/tienda',
                    icon: Store,
                    title: 'Personalizar Tienda Pública',
                    desc: 'Edición directa en vivo y bloques',
                  },
                  {
                    href: '/studio-ia',
                    icon: Sparkles,
                    title: 'Studio Creativo IA',
                    desc: 'Fotografía comercial y Reels 9:16',
                  },
                  {
                    href: '/pedidos',
                    icon: ShoppingCart,
                    title: 'Alistamiento & Guías de Envío',
                    desc: 'Despachos y notificación WhatsApp',
                  },
                ].map(item => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="p-3 rounded-lg border border-zinc-200 hover:border-zinc-950 bg-zinc-50/50 hover:bg-white flex items-center justify-between gap-3 transition-all group"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-white border border-zinc-200 group-hover:bg-zinc-950 group-hover:text-white flex items-center justify-center shrink-0 transition-colors">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-zinc-950 truncate">
                            {item.title}
                          </p>
                          <p className="text-[11px] text-zinc-500 truncate">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                      <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-950 shrink-0" />
                    </Link>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
