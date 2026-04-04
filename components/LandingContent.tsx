'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  Zap, 
  ArrowRight, 
  ShieldCheck, 
  BarChart3, 
  MessageCircle, 
  Globe, 
  Smartphone, 
  Star,
  CheckCircle2,
  Lock,
  ChevronRight,
  Play,
  CreditCard,
  Users,
  ShoppingBag,
  GraduationCap,
  Activity,
  Plane,
  HelpCircle,
  BookOpen,
  Newspaper,
  Layout,
  Rocket
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import Footer from './Footer'

interface LandingContentProps {
  userId: string | null
  stores: any[]
}

const ChatbaseLogo = () => (
  <Link href="/" className="flex items-center gap-2.5 group transition-all hover:opacity-80">
    <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center text-white font-black text-xl shadow-sm group-hover:scale-105 transition-transform">
      F
    </div>
    <span className="text-[20px] font-medium tracking-tight text-[#111827]">FlashCheckout</span>
  </Link>
)

const NAVIGATION_CONFIG = [
  {
    title: 'Solutions',
    sections: [
      {
        header: 'BY USE-CASE',
        items: [
          { icon: MessageCircle, title: 'Customer Support', description: 'Instant answers, lower volume, fewer escalations.', href: '#features' },
          { icon: Zap, title: 'Sales Agent', description: 'Qualify leads, answer questions, and book meetings.', href: '#features' },
        ]
      },
      {
        header: 'BY INDUSTRY',
        items: [
          { icon: ShoppingBag, title: 'Ecommerce & Retail', description: 'Product questions, shipping, and returns.', href: '#features' },
          { icon: GraduationCap, title: 'Education & Training', description: 'Admissions, enrolment, and student questions.', href: '#features' },
          { icon: Activity, title: 'Fitness & Wellness', description: 'Bookings, cancellations, and member support.', href: '#features' },
          { icon: Plane, title: 'Travel & Hospitality', description: 'Bookings, disruptions, and refunds.', href: '#features' },
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
          { icon: BookOpen, title: 'Documentation', description: 'Full API reference and integration guides.', href: '#docs' },
          { icon: HelpCircle, title: 'Help Center', description: 'Tutorials and community support.', href: '#faq' },
          { icon: Newspaper, title: 'Blog', description: 'Latest news and product updates.', href: '#' },
        ]
      }
    ]
  },
  { title: 'Enterprise', href: '#' },
  { title: 'Pricing', href: '#pricing' }
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
        {item.sections && <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}><ChevronRight className="w-3.5 h-3.5 rotate-90" /></motion.span>}
      </Link>

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
        {item.sections && (
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
        )}
      </motion.div>
    </div>
  )
}

export default function LandingContent({ userId, stores }: LandingContentProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isPlaying, setIsPlaying] = useState(true)
  const [progress, setProgress] = useState(0)
  const videoRef = React.useRef<HTMLVideoElement>(null)

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    const handleTimeUpdate = () => {
      const p = (video.currentTime / video.duration) * 100
      setProgress(p)
    }

    video.addEventListener('timeupdate', handleTimeUpdate)
    return () => video.removeEventListener('timeupdate', handleTimeUpdate)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-white text-[#111827] font-sans selection:bg-black selection:text-white antialiased">
      
      {/* Navigation (Chatbase Style) */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b ${isScrolled ? 'bg-white/80 backdrop-blur-md border-[#E5E7EB] py-3' : 'bg-transparent border-transparent py-5'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <ChatbaseLogo />
          
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
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section (New High-Fidelity Layout) */}
      <section className="w-full py-24 lg:py-40">
        <div className="mx-auto max-w-7xl px-6">
          <div className="relative flex w-full flex-col gap-12 overflow-hidden">
            <div className="container relative mx-auto grid items-center gap-12 lg:grid-cols-2">
              {/* Left Column: Heading & CTA */}
              <div className="flex flex-col gap-8">
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6 }}
                  className="font-medium text-[42px] text-zinc-950 leading-[2.9rem] tracking-tight lg:text-[4.4rem] lg:leading-[5rem]"
                >
                  Flash Automation for magical payment experiences
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="text-[18px] text-zinc-500 lg:w-[90%] font-normal leading-relaxed"
                >
                  FlashCheckout is the complete platform for building & deploying AI payment agents for your business.
                </motion.p>
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="flex flex-col gap-6 sm:flex-row sm:items-center"
                >
                  <Link href="/sign-up" className="contents">
                    <button 
                      data-slot="button" 
                      className="isolate md:[isolation:auto] flex items-center justify-center gap-2 whitespace-nowrap font-medium outline-hidden transition-all duration-200 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 shadow-inner-sm rounded-md py-2 relative h-14 w-full sm:w-[320px] px-6 text-base bg-primary text-white hover:bg-primary/90"
                    >
                      Build your agent for free
                    </button>
                  </Link>
                  <div className="flex items-center gap-2 font-medium text-zinc-400 text-sm">
                    <CreditCard className="w-4 h-4 text-zinc-300" />
                    No credit card required
                  </div>
                </motion.div>
              </div>

              {/* Right Column: Video Player */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="group relative aspect-[0.939] w-full overflow-hidden rounded-3xl border border-black/[0.03] shadow-2xl bg-zinc-50"
              >
                <video 
                  ref={videoRef}
                  className="aspect-[0.939] w-full rounded-3xl" 
                  preload="metadata" 
                  poster="https://backend.chatbase.co/storage/v1/object/public/chatbase/landing/hero/hero-thumbnail.png"
                  playsInline
                  loop 
                  autoPlay
                  muted 
                  style={{ objectFit: 'contain', display: 'block', width: '100%', cursor: 'pointer' }}
                  src="https://backend.chatbase.co/storage/v1/object/public/chatbase/landing/hero/hero.webm"
                  onClick={togglePlay}
                >
                  Your browser does not support the video tag.
                </video>
                
                <button 
                  type="button" 
                  onClick={togglePlay}
                  className="absolute bottom-6 left-6 rounded-full bg-black/40 backdrop-blur-md p-3 opacity-90 transition-opacity group-hover:opacity-100 z-20"
                  aria-label={isPlaying ? "Pause video" : "Play video"}
                >
                  <svg className="-rotate-90 absolute top-0 left-0 h-full w-full" viewBox="0 0 32 32">
                    <circle 
                      cx="16" 
                      cy="16" 
                      r="14.8" 
                      fill="none" 
                      stroke="white" 
                      strokeWidth="2.3" 
                      strokeDasharray="94.2" 
                      strokeDashoffset={94.2 - (94.2 * progress) / 100}
                      className="opacity-90 transition-all duration-200"
                    />
                  </svg>
                  {isPlaying ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white" className="relative h-5 w-5"><rect x="14" y="4" width="4" height="16" rx="1"></rect><rect x="6" y="4" width="4" height="16" rx="1"></rect></svg>
                  ) : (
                    <Play className="w-5 h-5 fill-white text-white relative ml-0.5" />
                  )}
                </button>
              </motion.div>
            </div>

            {/* Social Proof Section (Logos) */}
            <div className="flex w-full flex-col items-center gap-12 mt-32">
              <p className="font-medium text-base text-zinc-500 uppercase tracking-widest">
                Trusted by <span className="mx-1 font-bold text-black font-sans">10,000+</span> businesses worldwide
              </p>
              <div className="w-full">
                {/* Desktop Grid (Hidden on Mobile) */}
                <div className="hidden items-center justify-center gap-16 lg:flex opacity-30 grayscale hover:grayscale-0 transition-all duration-700">
                  <LogoItem alt="Sage" src="https://www.vectorlogo.zone/logos/sage/sage-ar21.svg" />
                  <LogoItem alt="Stripe" src="https://www.vectorlogo.zone/logos/stripe/stripe-ar21.svg" />
                  <LogoItem alt="Vercel" src="https://www.vectorlogo.zone/logos/vercel/vercel-ar21.svg" />
                  <LogoItem alt="Google" src="https://www.vectorlogo.zone/logos/google/google-ar21.svg" />
                  <LogoItem alt="Airbnb" src="https://www.vectorlogo.zone/logos/airbnb/airbnb-ar21.svg" />
                  <LogoItem alt="Meta" src="https://www.vectorlogo.zone/logos/facebook/facebook-ar21.svg" />
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
                        <LogoItem alt="Sage" src="https://www.vectorlogo.zone/logos/sage/sage-ar21.svg" />
                        <LogoItem alt="Stripe" src="https://www.vectorlogo.zone/logos/stripe/stripe-ar21.svg" />
                        <LogoItem alt="Vercel" src="https://www.vectorlogo.zone/logos/vercel/vercel-ar21.svg" />
                        <LogoItem alt="Google" src="https://www.vectorlogo.zone/logos/google/google-ar21.svg" />
                        <LogoItem alt="Airbnb" src="https://www.vectorlogo.zone/logos/airbnb/airbnb-ar21.svg" />
                      </div>
                    ))}
                  </motion.div>
                  {/* Faders */}
                  <div className="absolute top-0 bottom-0 left-0 w-24 bg-gradient-to-r from-white to-transparent z-10" />
                  <div className="absolute top-0 bottom-0 right-0 w-24 bg-gradient-to-l from-white to-transparent z-10" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features (Bento Grid Style) */}
      <section id="features" className="py-24 lg:py-40 bg-zinc-50/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
            <h2 className="text-[32px] sm:text-[48px] font-bold tracking-tight text-[#111827]">Everything you need to sell.</h2>
            <p className="text-[16px] text-zinc-500 font-normal">FlashCheckout is designed for high-performance sales teams who value speed and conversion.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <FeatureCard 
              icon={Zap}
              title="Flash Checkout"
              description="A payment experience optimized for mobile users that lets them pay in under 30 seconds."
              color="bg-amber-50"
              iconColor="text-amber-500"
            />
            <FeatureCard 
              icon={Globe}
              title="Global Scaling"
              description="Deploy checkouts in multiple currencies and languages to reach a worldwide audience."
              color="bg-blue-50"
              iconColor="text-blue-500"
            />
            <FeatureCard 
              icon={ShieldCheck}
              title="Secure Processing"
              description="Bank-grade security and fraud protection built into every transaction."
              color="bg-green-50"
              iconColor="text-green-500"
            />
            <FeatureCard 
              icon={BarChart3}
              title="Deep Analytics"
              description="Understand your customers with detailed insights into conversion rates and revenue."
              color="bg-purple-50"
              iconColor="text-purple-500"
            />
            <FeatureCard 
              icon={MessageCircle}
              title="WhatsApp Sync"
              description="Receive every order structured and ready to ship on your WhatsApp."
              color="bg-emerald-50"
              iconColor="text-emerald-500"
            />
            <FeatureCard 
              icon={Smartphone}
              title="Mobile First"
              description="A checkout interface that looks and feel native on every mobile device."
              color="bg-rose-50"
              iconColor="text-rose-500"
            />
          </div>
        </div>
      </section>

      {/* CTA Section (Chatbase Style) */}
      <section className="py-24 lg:py-40 bg-white border-y border-[#E5E7EB]">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-10">
          <h2 className="text-[32px] sm:text-[48px] font-bold tracking-tight text-[#111827]">Scale your sales today.</h2>
          <p className="text-[16px] text-zinc-500 font-normal max-w-2xl mx-auto">Join thousands of merchants who are already growing their businesses with FlashCheckout.</p>
          <div className="pt-6">
            <Button asChild size="lg">
              <Link href="/sign-up">Get started for free</Link>
            </Button>
          </div>
          <p className="text-[14px] text-zinc-400 font-medium">Ready to deploy in less than 5 minutes.</p>
        </div>
      </section>

      {/* FAQ Section (Accordion) */}
      <section className="py-24 lg:py-40 bg-white">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-[32px] sm:text-[48px] font-bold text-center mb-16">Frequently Asked Questions</h2>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1" className="border-b-[#E5E7EB] py-2">
              <AccordionTrigger className="text-[16px] font-bold hover:no-underline text-left">How fast is FlashCheckout?</AccordionTrigger>
              <AccordionContent className="text-zinc-500 text-[16px] leading-relaxed">
                FlashCheckout is optimized for high conversion. Most customers complete their purchase in under 30 seconds, significantly faster than traditional e-commerce flows.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2" className="border-b-[#E5E7EB] py-2">
              <AccordionTrigger className="text-[16px] font-bold hover:no-underline text-left">Do I need a Stripe account?</AccordionTrigger>
              <AccordionContent className="text-zinc-500 text-[16px] leading-relaxed">
                Yes, FlashCheckout integrates directly with Stripe to process payments securely and deposit funds into your bank account.
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3" className="border-b-[#E5E7EB] py-2">
              <AccordionTrigger className="text-[16px] font-bold hover:no-underline text-left">Is there a transaction fee?</AccordionTrigger>
              <AccordionContent className="text-zinc-500 text-[16px] leading-relaxed">
                We offer competitive pricing. Depending on your plan, fees range from a small percentage per transaction to fixed monthly pricing for enterprise clients.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      <Footer />
    </div>
  )
}

function FeatureCard({ 
  icon: Icon, 
  title, 
  description, 
  color, 
  iconColor 
}: { 
  icon: any, 
  title: string, 
  description: string, 
  color: string, 
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

function LogoItem({ src, alt }: { src: string, alt: string }) {
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
