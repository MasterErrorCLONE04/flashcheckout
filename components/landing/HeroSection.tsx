'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { CreditCard, Play } from 'lucide-react'
import { heroItemVariants } from './constants'
import { LogoItem } from './LandingHelpers'

export function HeroSection() {
  return (
    <section className="w-full py-24 lg:py-40">
      <div className="mx-auto max-w-7xl px-6">
        <div className="relative flex w-full flex-col gap-12 overflow-hidden">
          <div className="container relative mx-auto grid items-center gap-12 lg:grid-cols-2">
            {/* Left Column: Heading & CTA */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={{
                hidden: {},
                visible: {
                  transition: {
                    staggerChildren: 0.12
                  }
                }
              }}
              className="flex flex-col gap-8"
            >
              <motion.h1
                variants={heroItemVariants}
                className="font-medium text-[42px] text-zinc-950 leading-[2.9rem] tracking-tight lg:text-[4.4rem] lg:leading-[5rem]"
              >
                Convierte chats de WhatsApp en pedidos pagados
              </motion.h1>
              <motion.p
                variants={heroItemVariants}
                className="text-[18px] text-zinc-500 lg:w-[90%] font-normal leading-relaxed"
              >
                Flashcheckouts une agente IA, catalogo, checkout con QR Bre-B, pedidos, clientes y pagos para que tu tienda cierre ventas sin perseguir conversaciones.
              </motion.p>
              <motion.div
                variants={heroItemVariants}
                className="flex flex-col gap-6 sm:flex-row sm:items-center"
              >
                <Link href="/sign-up" className="contents">
                  <button
                    data-slot="button"
                    className="isolate md:[isolation:auto] flex items-center justify-center gap-2 whitespace-nowrap font-medium outline-hidden transition-all duration-200 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 shadow-inner-sm rounded-md py-2 relative h-14 w-full sm:w-[320px] px-6 text-base bg-primary text-white hover:bg-primary/90"
                  >
                    Crear mi tienda gratis
                  </button>
                </Link>
                <div className="flex items-center gap-2 font-medium text-zinc-400 text-sm">
                  <CreditCard className="w-4 h-4 text-zinc-300" />
                  Sin tarjeta de credito
                </div>
              </motion.div>
            </motion.div>

            {/* Right Column: Hero Mockup */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="w-full"
            >
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="group relative aspect-[0.939] w-full overflow-hidden rounded-3xl border border-black/[0.03] shadow-2xl bg-zinc-50 flex items-center justify-center p-0"
              >
                <img
                  src="/analytics_dashboard_card.png"
                  alt="Flashcheckouts Dashboard Mockup"
                  className="w-full h-full object-cover rounded-3xl transition-transform duration-700 group-hover:scale-105"
                  loading="eager"
                />

                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 pointer-events-none" />
                <div className="absolute bottom-6 left-6 rounded-full bg-black/40 backdrop-blur-md p-3 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                  <Play className="w-5 h-5 fill-white text-white relative ml-0.5" />
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Social Proof Section (Logos) */}
          <div className="flex w-full flex-col items-center gap-12 mt-32">
            <p className="font-medium text-base text-zinc-500 uppercase tracking-widest text-center">
              Pensado para tiendas que venden por WhatsApp, catalogo y links de pago
            </p>
            <div className="w-full">
              {/* Desktop Grid (Hidden on Mobile) */}
              <div className="hidden items-center justify-center gap-16 lg:flex opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
                <LogoItem alt="Catalogo" src="https://www.vectorlogo.zone/logos/shopify/shopify-ar21.svg" />
                <LogoItem alt="Bre-B" src="https://www.vectorlogo.zone/logos/stripe/stripe-ar21.svg" />
                <LogoItem alt="WhatsApp" src="https://www.vectorlogo.zone/logos/vercel/vercel-ar21.svg" />
                <LogoItem alt="Clientes" src="https://www.vectorlogo.zone/logos/google/google-ar21.svg" />
                <LogoItem alt="Pedidos" src="https://www.vectorlogo.zone/logos/airbnb/airbnb-ar21.svg" />
                <LogoItem alt="Nova IA" src="https://www.vectorlogo.zone/logos/facebook/facebook-ar21.svg" />
              </div>

              {/* Mobile Marquee (Hidden on Desktop) */}
              <div className="relative overflow-hidden lg:hidden h-20">
                <motion.div
                  initial={{ x: 0 }}
                  animate={{ x: "-50%" }}
                  transition={{ ease: "linear", duration: 20, repeat: Infinity }}
                  className="flex items-center gap-12 whitespace-nowrap"
                >
                  {[...Array(2)].map((_, i) => (
                    <div key={i} className="flex items-center gap-12 pr-12">
                      <LogoItem alt="Catalogo" src="https://www.vectorlogo.zone/logos/shopify/shopify-ar21.svg" />
                      <LogoItem alt="Bre-B" src="https://www.vectorlogo.zone/logos/stripe/stripe-ar21.svg" />
                      <LogoItem alt="WhatsApp" src="https://www.vectorlogo.zone/logos/vercel/vercel-ar21.svg" />
                      <LogoItem alt="Clientes" src="https://www.vectorlogo.zone/logos/google/google-ar21.svg" />
                      <LogoItem alt="Pedidos" src="https://www.vectorlogo.zone/logos/airbnb/airbnb-ar21.svg" />
                    </div>
                  ))}
                </motion.div>
                <div className="absolute top-0 bottom-0 left-0 w-24 bg-gradient-to-r from-white to-transparent z-10" />
                <div className="absolute top-0 bottom-0 right-0 w-24 bg-gradient-to-l from-white to-transparent z-10" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
