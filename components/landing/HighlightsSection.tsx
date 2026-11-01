'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { HIGHLIGHT_CARDS } from './constants'

export function HighlightsSection() {
  return (
    <section className="flex flex-col gap-4 pt-24 pb-4">
      <div className="mx-auto max-w-7xl px-6 w-full">
        <div className="flex flex-col items-start gap-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center rounded-full px-4 py-1.5 font-medium text-sm border border-zinc-200 bg-white text-zinc-950 shadow-sm"
          >
            <div className="mr-2 size-2 rounded-full bg-linear-to-r from-[#FB923C] via-[#F472B6] to-[#E879F9]"></div>
            Highlights
          </motion.div>

          <div className="flex flex-col gap-6 md:flex-row md:items-end md:gap-20">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="font-medium text-4xl text-zinc-950 tracking-tight leading-tight lg:text-5xl"
            >
              Funcionalidades reales para vender, cobrar y operar
            </motion.h2>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 w-full">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="max-w-[600px] text-lg text-muted-foreground font-normal leading-relaxed"
              >
                Desde el primer mensaje hasta el despacho: Nova atiende, el catalogo organiza, el checkout cobra y el panel mantiene cada pedido bajo control.
              </motion.p>
            </div>
          </div>
        </div>
      </div>

      {/* Carousel Slider */}
      <div className="relative w-full overflow-hidden">
        <div className="flex w-max gap-6 pt-12 pb-6 px-6 animate-marquee pause-marquee">
          {[...HIGHLIGHT_CARDS, ...HIGHLIGHT_CARDS].map((card, idx) => (
            <div
              key={idx}
              className="relative flex flex-col shrink-0 w-[290px] sm:w-[380px] overflow-hidden rounded-3xl border border-zinc-200 bg-white transition-all duration-300 hover:border-zinc-300 hover:shadow-xl group"
            >
              <div className="aspect-[784/800] overflow-hidden">
                <img
                  alt={card.alt}
                  loading="lazy"
                  src={card.src}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="space-y-2 px-6 pb-6 pt-6 flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-xl text-zinc-950">{card.title}</h3>
                  <p className="text-base text-muted-foreground mt-2">{card.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
