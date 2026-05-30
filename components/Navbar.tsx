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
  CreditCard
} from 'lucide-react'
import { Button } from '@/components/ui/button'

const FlashCheckoutLogo = () => (
  <Link href="/" className="flex items-center gap-2.5 group transition-all hover:opacity-80">
    <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-black text-xl shadow-sm group-hover:scale-105 transition-transform">
      F
    </div>
    <span className="text-[20px] font-medium tracking-tight text-[#111827]">FlashCheckout</span>
  </Link>
)

export const NAVIGATION_CONFIG = [
  {
    title: 'Solutions',
    sections: [
      {
        header: 'BY USE-CASE',
        items: [
          { icon: MessageCircle, title: 'Customer Support', description: 'Instant answers, lower volume, fewer escalations.', href: '/solutions/customer-support' },
          { icon: Zap, title: 'Sales Agent', description: 'Qualify leads, answer questions, and book meetings.', href: '/solutions/sales-agent' },
        ]
      },
      {
        header: 'BY INDUSTRY',
        items: [
          { icon: ShoppingBag, title: 'Ecommerce & Retail', description: 'Product questions, shipping, and returns.', href: '/solutions/ecommerce-retail' },
          { icon: GraduationCap, title: 'Education & Training', description: 'Admissions, enrolment, and student questions.', href: '/solutions/education-training' },
          { icon: Activity, title: 'Fitness & Wellness', description: 'Bookings, cancellations, and member support.', href: '/solutions/fitness-wellness' },
          { icon: Plane, title: 'Travel & Hospitality', description: 'Bookings, disruptions, and refunds.', href: '/solutions/travel-hospitality' },
        ]
      }
    ]
  },
  {
    title: 'Resources',
    sections: [
      {
        header: 'LEARN',
        items: [
          { icon: BookOpen, title: 'Documentation', description: 'Full API reference and integration guides.', href: '/work/doc' },
          { icon: HelpCircle, title: 'Help Center', description: 'Tutorials and community support.', href: '/help' },
          { icon: Newspaper, title: 'Blog', description: 'Latest news and product updates.', href: '#' },
        ]
      }
    ]
  },
  { title: 'Enterprise', href: '/enterprise' },
  { title: 'Pricing', href: '/pricing' }
]

function NavItem({ item }: { item: any }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div
      className="relative h-full flex items-center"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <Link
        href={item.href || '#'}
        className={`text-[14px] font-medium transition-colors flex items-center gap-1 h-full pt-1 ${isOpen ? 'text-black' : 'text-[#374151] hover:text-black'}`}
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
            pointerEvents: isOpen ? 'auto' : 'none'
          }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="absolute top-[calc(100%-8px)] left-1/2 -translate-x-1/2 pt-4 z-50 min-w-[560px]"
        >
          <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-[0_20px_50px_rgba(0,0,0,0.12)] p-6 overflow-hidden grid grid-cols-2 gap-8">
            {item.sections.map((section: any, idx: number) => (
              <div key={idx}>
                <h4 className="p-3 font-semibold text-zinc-400 text-[12px] uppercase tracking-[0.1em]">
                  {section.header}
                </h4>
                <div className="flex flex-col gap-1">
                  {section.items.map((subItem: any, subIdx: number) => (
                    <Link
                      key={subIdx}
                      href={subItem.href}
                      className="group flex flex-row items-center gap-4 rounded-2xl p-2 text-sm transition-all hover:bg-zinc-50 hover:text-zinc-900 focus:bg-zinc-50 outline-none w-full"
                    >
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg border border-zinc-100 bg-white group-hover:shadow-sm transition-all">
                        <subItem.icon className="w-5 h-5 text-zinc-400 group-hover:text-black transition-colors" />
                      </div>
                      <div className="flex flex-col gap-0.5">
                        <span className="font-medium text-sm tracking-tight text-zinc-950">{subItem.title}</span>
                        <span className="line-clamp-1 font-medium text-sm tracking-tight text-zinc-400">{subItem.description}</span>
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

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${isScrolled ? 'bg-white/80 backdrop-blur-md border-[#E5E7EB] py-3' : 'bg-white border-transparent py-5'}`}>
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <FlashCheckoutLogo />

        <nav className="hidden lg:flex items-center gap-8 h-10">
          {NAVIGATION_CONFIG.map((item, i) => (
            <NavItem key={i} item={item} />
          ))}
        </nav>

        <div className="flex items-center gap-4">
          {!userId ? (
            <>
              <Link href="/sign-in" className="text-[14px] font-medium text-[#111827] hover:underline underline-offset-4 hidden sm:block">
                Sign in
              </Link>
              <Button asChild className="bg-black hover:bg-[#1f1f1f] text-white font-medium rounded-lg px-5 h-10 transition-all text-[14px] shadow-sm">
                <Link href="/sign-up">Sign up</Link>
              </Button>
            </>
          ) : (
            <Button asChild className="bg-black hover:bg-[#1f1f1f] text-white font-medium rounded-lg px-5 h-10 transition-all text-[14px] shadow-sm">
              <Link href="/productos">Dashboard</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
