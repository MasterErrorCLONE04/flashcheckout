'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
  CodeXml,
  TextCursorInput,
  TrendingUp,
} from 'lucide-react'
import {
  FEATURE_CARDS,
  INTEGRATIONS_ROW_1,
  INTEGRATIONS_ROW_2,
  bentoContainerVariants,
  bentoCardVariants,
} from './constants'
import { IntegrationPill } from './LandingHelpers'

export function FeaturesBentoSection() {
  return (
    <section id="features" className="w-full py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col gap-12">
          <div className="flex flex-col items-start gap-4">
            <div className="inline-flex items-center rounded-full px-4 py-1.5 font-medium text-sm border border-zinc-200 bg-background text-zinc-950">
              <div className="mr-2 size-2 rounded-full bg-linear-to-r from-[#FB923C] via-[#F472B6] to-[#E879F9]"></div>
              Features
            </div>
            <h2 className="font-medium text-4xl text-zinc-950 tracking-tight lg:text-[42px] max-w-[700px] leading-tight">
              Todo lo que necesita una tienda que vende por chat
            </h2>
            <p className="max-w-[800px] text-lg text-zinc-500 leading-relaxed font-normal">
              Configura productos, activa Nova, recibe pedidos por WhatsApp, cobra por QR Bre-B o link de pago y gestiona clientes desde un solo panel.
            </p>
          </div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={bentoContainerVariants}
            className="grid gap-8 pt-8"
          >
            {/* Grid 1: Large Cards */}
            <div className="grid gap-8 md:grid-cols-2">
              {FEATURE_CARDS.filter(c => c.size === 'large').map((card, i) => (
                <motion.div
                  key={i}
                  variants={bentoCardVariants}
                  className="group flex flex-col overflow-hidden rounded-3xl border border-zinc-200 transition-all duration-300 bg-background hover:border-zinc-300 hover:shadow-xl hover:-translate-y-1"
                >
                  <div className="w-full aspect-[1216/696] bg-zinc-50 overflow-hidden p-4">
                    <div className="w-full h-full rounded-2xl overflow-hidden border border-zinc-100 shadow-sm">
                      <img src={card.image} alt={card.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 p-8 pt-6">
                    <h3 className="font-medium text-xl text-zinc-950 tracking-tight">{card.title}</h3>
                    <p className="text-base text-zinc-500 leading-relaxed font-normal">{card.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Grid 2: Small Cards */}
            <div className="grid gap-8 md:grid-cols-3">
              {FEATURE_CARDS.filter(c => c.size === 'small').map((card, i) => (
                <motion.div
                  key={i}
                  variants={bentoCardVariants}
                  className="group flex flex-col overflow-hidden rounded-3xl border border-zinc-200 transition-all duration-300 bg-background hover:border-zinc-300 hover:shadow-lg hover:-translate-y-1"
                >
                  <div className="w-full aspect-[794/696] bg-zinc-50 overflow-hidden p-4">
                    <div className="w-full h-full rounded-2xl overflow-hidden border border-zinc-100 shadow-sm">
                      <img src={card.image} alt={card.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 p-8 pt-6">
                    <h3 className="font-medium text-lg text-zinc-950 tracking-tight">{card.title}</h3>
                    <p className="text-sm text-zinc-500 leading-relaxed font-normal">{card.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Integrations Marquee Section */}
            <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-background">
              <div className="hidden md:flex md:items-center md:justify-between p-10 pr-0">
                <div className="flex flex-col gap-2">
                  <h3 className="font-medium text-xl text-zinc-950 tracking-tight">Conecta con tu operacion diaria</h3>
                  <p className="max-w-[400px] text-base text-zinc-500 leading-relaxed font-normal">WhatsApp, catalogo, pedidos, pagos, clientes y automatizaciones trabajando en el mismo flujo.</p>
                </div>
                <div className="relative flex max-h-[180px] max-w-[60%] flex-col gap-3 overflow-x-auto lg:overflow-hidden" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                  <div className="flex gap-3">
                    {INTEGRATIONS_ROW_1.map((item, i) => (
                      <IntegrationPill key={i} name={item.name} logo={item.logo} type={item.type as any} />
                    ))}
                  </div>
                  <div className="ml-8 flex gap-3">
                    {INTEGRATIONS_ROW_2.map((item, i) => (
                      <IntegrationPill key={i} name={item.name} logo={item.logo} type={item.type as any} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Feature Row */}
            <div className="hidden md:block pt-8">
              <div className="grid grid-cols-3 gap-16">
                <div className="flex items-start gap-4">
                  <CodeXml className="h-6 w-6 text-zinc-400 shrink-0" />
                  <div className="flex flex-col gap-1">
                    <h4 className="font-medium text-base text-zinc-950">Checkout y pagos</h4>
                    <p className="text-sm text-zinc-500 leading-relaxed font-normal">Genera enlaces de pago, QR Bre-B y referencias para cada orden.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <TextCursorInput className="h-6 w-6 text-zinc-400 shrink-0" />
                  <div className="flex flex-col gap-1">
                    <h4 className="font-medium text-base text-zinc-950">Marca y tienda</h4>
                    <p className="text-sm text-zinc-500 leading-relaxed font-normal">Publica tu catalogo, datos de negocio y experiencia de compra con identidad propia.</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <TrendingUp className="h-6 w-6 text-zinc-400 shrink-0" />
                  <div className="flex flex-col gap-1">
                    <h4 className="font-medium text-base text-zinc-950">CRM y seguimiento</h4>
                    <p className="text-sm text-zinc-500 leading-relaxed font-normal">Historial de clientes, compras e interacciones para vender mejor cada vez.</p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
