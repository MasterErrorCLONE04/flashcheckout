'use client'

import React from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Zap, ChevronRight } from 'lucide-react'
import { Card } from '@/components/ui/card'

export const FlashcheckoutsLogo = () => (
  <Link href="/" className="flex items-center gap-2.5 group transition-all hover:opacity-80">
    <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
      <Zap className="w-4.5 h-4.5 fill-white stroke-white" />
    </div>
    <span className="text-[20px] font-bold tracking-tight text-[#111827]">Flashcheckouts</span>
  </Link>
)

export const IntegrationPill = ({
  name,
  logo,
  type = 'pill'
}: {
  name: string
  logo: string
  type?: 'pill' | 'image'
}) => {
  if (type === 'image') {
    return (
      <div className="w-[100px] shrink-0">
        <img loading="lazy" alt="" className="h-10 w-[100px] rounded-full object-cover" src={logo} />
      </div>
    )
  }
  return (
    <div className="inline-flex h-10 shrink-0 items-center gap-2 rounded-full bg-muted p-1">
      <div className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 bg-background transition-colors hover:border-zinc-300">
        <img loading="lazy" alt={name} className="h-8 w-8" src={logo} />
      </div>
      <div className="pr-2 font-medium text-sm text-zinc-800">{name}</div>
    </div>
  )
}

export const IntegrationMarquee = ({
  items,
  reverse = false,
  speed = 30
}: {
  items: any[]
  reverse?: boolean
  speed?: number
}) => (
  <div className="flex w-full overflow-hidden">
    <motion.div
      initial={{ x: reverse ? "-50%" : "0%" }}
      animate={{ x: reverse ? "0%" : "-50%" }}
      transition={{ duration: speed, ease: "linear", repeat: Infinity }}
      className="flex gap-3 pr-3"
    >
      {[...items, ...items, ...items, ...items].map((item, i) => (
        <IntegrationPill key={i} name={item.name} logo={item.logo} type={item.type} />
      ))}
    </motion.div>
  </div>
)

export function LogoItem({ src, alt }: { src: string; alt: string }) {
  return (
    <img
      alt={alt}
      loading="lazy"
      width="120"
      height="48"
      decoding="async"
      className="h-8 w-auto lg:h-10 shrink-0"
      src={src}
      style={{ color: 'transparent' }}
    />
  )
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  color,
  iconColor
}: {
  icon: any
  title: string
  description: string
  color: string
  iconColor: string
}) {
  return (
    <Card className="border-[#E5E7EB] bg-white rounded-2xl shadow-sm hover:shadow-md transition-all p-8 flex flex-col group h-full">
      <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
        <Icon className={`w-6 h-6 ${iconColor}`} />
      </div>
      <h3 className="text-xl font-bold text-[#111827] mb-3">{title}</h3>
      <p className="text-[16px] text-zinc-500 leading-relaxed font-normal">{description}</p>
      <div className="mt-8 pt-6 border-t border-[#F9FAFB] flex items-center text-[14px] font-bold text-zinc-300 group-hover:text-black transition-colors">
        Learn more <ChevronRight className="w-4 h-4 ml-1" />
      </div>
    </Card>
  )
}
