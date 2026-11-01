'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { BENEFITS_DATA } from './constants'

export function BenefitsSection() {
  const [activeBenefitId, setActiveBenefitId] = useState('observability')

  return (
    <section className="w-full py-24 bg-[#FAFAFA] overflow-hidden">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col gap-16">
          <div className="flex flex-col items-start gap-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center rounded-full px-4 py-1.5 font-medium text-sm border border-zinc-200 bg-background text-foreground"
            >
              <div className="mr-2 size-2 rounded-full bg-linear-to-r from-[#FB923C] via-[#F472B6] to-[#E879F9]"></div>
              Benefits
            </motion.div>
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-10">
              <h2 className="font-medium text-4xl text-foreground tracking-tight md:max-w-[20ch] lg:text-5xl leading-tight">
                Un flujo comercial que trabaja aunque no estes conectado
              </h2>
            </div>
          </div>

          <div className="grid gap-12 md:grid-cols-2">
            {/* Desktop Media Showcase */}
            <div className="hidden md:block">
              <div className="relative aspect-[0.939] w-full bg-zinc-50 rounded-3xl overflow-hidden border border-zinc-100 shadow-sm">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeBenefitId}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 1.02 }}
                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="absolute inset-0 flex items-center justify-center p-8"
                  >
                    <div className="relative group w-full h-full">
                      <video
                        key={BENEFITS_DATA.find(b => b.id === activeBenefitId)?.video}
                        className="w-full h-full object-contain rounded-2xl shadow-xl"
                        poster={BENEFITS_DATA.find(b => b.id === activeBenefitId)?.poster}
                        playsInline
                        loop
                        autoPlay
                        muted
                      >
                        <source src={BENEFITS_DATA.find(b => b.id === activeBenefitId)?.video} type="video/webm" />
                        Your browser does not support the video tag.
                      </video>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Interaction List */}
            <div className="flex flex-col justify-center gap-2">
              {BENEFITS_DATA.map((benefit) => {
                const isActive = activeBenefitId === benefit.id
                return (
                  <button
                    key={benefit.id}
                    onClick={() => setActiveBenefitId(benefit.id)}
                    className={`group w-full rounded-2xl p-6 text-left transition-all duration-500 relative outline-none select-none border-2 border-transparent cursor-pointer ${
                      isActive ? 'scale-[1.02] z-10' : 'opacity-60 hover:opacity-85'
                    }`}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeBenefitBg"
                        className="absolute inset-0 bg-white border border-zinc-200 shadow-lg rounded-2xl z-0"
                        transition={{ type: "spring", stiffness: 110, damping: 16 }}
                      />
                    )}

                    <div className="flex items-start gap-5 relative z-10">
                      <div className={`p-2.5 rounded-xl transition-all duration-300 ${isActive ? 'bg-pink-50 text-pink-500 shadow-xs' : 'bg-zinc-100 text-zinc-400'}`}>
                        <benefit.icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <h3 className={`font-semibold text-lg transition-colors duration-300 ${isActive ? 'text-zinc-950' : 'text-zinc-500'}`}>
                          {benefit.title}
                        </h3>
                        {isActive && (
                          <motion.p
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="text-muted-foreground leading-relaxed text-[15px]"
                          >
                            {benefit.description}
                          </motion.p>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Mobile View with Individual Video Previews */}
          <div className="md:hidden space-y-6">
            {BENEFITS_DATA.map((benefit) => (
              <div key={benefit.id} className="flex flex-col gap-4">
                <button
                  onClick={() => setActiveBenefitId(benefit.id === activeBenefitId ? '' : benefit.id)}
                  className={`w-full rounded-2xl p-4 text-left transition-all border-2 cursor-pointer ${
                    activeBenefitId === benefit.id ? 'border-zinc-200 bg-background shadow-md' : 'border-transparent bg-zinc-50 opacity-80'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <benefit.icon className={`h-5 w-5 ${activeBenefitId === benefit.id ? 'text-pink-500' : 'text-zinc-400'}`} />
                    <span className={`font-medium ${activeBenefitId === benefit.id ? 'text-zinc-950' : 'text-zinc-500'}`}>
                      {benefit.title}
                    </span>
                  </div>
                </button>
                {activeBenefitId === benefit.id && (
                  <div className="relative aspect-[0.939] w-full rounded-2xl overflow-hidden bg-zinc-100 border border-zinc-200">
                    <video
                      className="w-full h-full object-contain"
                      poster={benefit.poster}
                      playsInline
                      loop
                      autoPlay
                      muted
                      src={benefit.video}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
