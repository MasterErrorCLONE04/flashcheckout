'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Sparkles,
  BarChart3,
  Globe,
  Box,
  GitCompare,
} from 'lucide-react'
import { EXPLORE_TABS } from './constants'

export function ExploreSection() {
  const [activeTab, setActiveTab] = useState(EXPLORE_TABS[0].id)
  const [activeMobileStep, setActiveMobileStep] = useState(0)

  return (
    <section id="features" className="w-full py-12 md:py-15 bg-black overflow-hidden relative">
      <div className="mx-auto max-w-7xl px-6">
        <div className="relative">
          <div className="flex w-full flex-col items-start gap-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center rounded-full px-4 py-1.5 font-medium text-sm border border-zinc-700 text-white"
            >
              <div className="mr-2 size-2 rounded-full bg-gradient-to-r from-[#FB923C] via-[#F472B6] to-[#E879F9]"></div>
              Explore
            </motion.div>

            <div className="flex w-full flex-col gap-4 md:flex-row md:items-end md:justify-between md:gap-10">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="pt-6 pb-4 font-medium text-4xl text-white tracking-tight md:pt-0 md:pb-0 lg:text-5xl"
              >
                Explora lo que Flashcheckouts hace por tu tienda
              </motion.h2>
            </div>

            {/* Desktop Tabs */}
            <div className="my-12 hidden w-full md:block">
              <div className="relative z-10 items-center justify-center inline-flex gap-2 rounded-full py-2 bg-zinc-950/80 border border-zinc-800/80 p-2 w-full">
                {EXPLORE_TABS.map((tab) => {
                  const isActive = activeTab === tab.id
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`relative rounded-full px-5 py-3 font-semibold text-sm transition-all duration-200 flex-1 flex items-center justify-center gap-2 cursor-pointer ${
                        isActive
                          ? 'bg-zinc-800 text-white font-bold border border-zinc-700 shadow-md'
                          : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'
                      }`}
                    >
                      {tab.id === 'playground' && <Sparkles className="h-4 w-4 text-zinc-400" />}
                      {tab.id === 'analytics' && <BarChart3 className="h-4 w-4 text-zinc-400" />}
                      {tab.id === 'activity' && <Globe className="h-4 w-4 text-zinc-400" />}
                      {tab.id === 'sources' && <Box className="h-4 w-4 text-zinc-400" />}
                      {tab.id === 'actions' && <GitCompare className="h-4 w-4 text-zinc-400" />}
                      <span>{tab.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Main Display Area */}
            <div className="relative mt-12 flex aspect-video w-full items-center justify-center rounded-2xl p-10 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 15, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -15, scale: 0.98 }}
                  transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className="relative z-20 h-full w-full flex items-center justify-center"
                >
                  <img
                    alt={`${activeTab} preview`}
                    loading="eager"
                    className="h-full w-auto rounded-2xl object-fill shadow-2xl"
                    src={EXPLORE_TABS.find(t => t.id === activeTab)?.image}
                  />
                </motion.div>
              </AnimatePresence>

              {/* Rich Background Effects */}
              <div className="absolute inset-0 z-0 overflow-hidden rounded-2xl">
                <div className="bg-gradient-to-br from-[#FB923C] via-[#F472B6] to-[#E879F9] absolute inset-0" />
                <div className="absolute inset-0 flex w-full gap-6 px-4">
                  {Array.from({ length: 20 }).map((_, i) => (
                    <div key={i} className="h-full w-24 lg:w-12 bg-gradient-to-r from-transparent via-black/20 to-transparent mix-blend-overlay"></div>
                  ))}
                </div>
                <div className="absolute inset-0 bg-[url('https://res.cloudinary.com/dphmq8cd7/image/upload/v1711204652/noise_p0xk5p.png')] opacity-50 mix-blend-color-dodge" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,transparent_100%)]" />
              </div>
            </div>

            {/* Mobile Carousel View */}
            <div className="w-full md:hidden my-8">
              <div className="relative h-[432px] w-full overflow-hidden rounded-3xl border border-zinc-800 bg-black text-zinc-200">
                <div className="relative w-full h-full flex flex-col">
                  {/* Mobile Preview Image */}
                  <div className="flex-1 relative flex items-center justify-center overflow-hidden">
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={activeMobileStep}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute top-8 z-20 w-[80%] rounded-2xl"
                        src={EXPLORE_TABS[activeMobileStep].mobileImage}
                      />
                    </AnimatePresence>

                    {/* Background for Mobile */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[#FB923C] via-[#F472B6] to-[#E879F9]" />
                    <div className="absolute inset-0 bg-[url('https://res.cloudinary.com/dphmq8cd7/image/upload/v1711204652/noise_p0xk5p.png')] opacity-50 mix-blend-color-dodge" />
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1)_0%,transparent_100%)]" />
                  </div>

                  {/* Floating Status Bar in Carousel */}
                  <div className="absolute bottom-0 left-0 right-0 z-30 bg-black backdrop-blur-sm">
                    <div className="z-30 flex items-center gap-2 px-6 py-4">
                      <motion.div
                        key={activeMobileStep}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center gap-2"
                      >
                        {activeMobileStep === 0 && <Sparkles className="h-5 w-5 text-white" />}
                        {activeMobileStep === 1 && <BarChart3 className="h-5 w-5 text-white" />}
                        {activeMobileStep === 2 && <Globe className="h-5 w-5 text-white" />}
                        {activeMobileStep === 3 && <Box className="h-5 w-5 text-white" />}
                        {activeMobileStep === 4 && <GitCompare className="h-5 w-5 text-white" />}
                        <span className="font-medium text-lg text-white">
                          {EXPLORE_TABS[activeMobileStep].label}
                        </span>
                      </motion.div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Progress Bar (Segmented) */}
              <div className="flex justify-center gap-2 p-7">
                {EXPLORE_TABS.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveMobileStep(i)}
                    type="button"
                    className="relative h-1 w-full overflow-hidden rounded-full bg-zinc-800 cursor-pointer"
                  >
                    <motion.div
                      initial={false}
                      animate={{ opacity: activeMobileStep === i ? 1 : 0 }}
                      className="absolute inset-0 bg-white"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
