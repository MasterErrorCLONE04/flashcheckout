'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
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
  Rocket,
  MessageSquare,
  Phone,
  LifeBuoy,
  CodeXml,
  TextCursorInput,
  TrendingUp
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

const FlashCheckoutLogo = () => (
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

const HOW_IT_WORKS_STEPS = [
  {
    number: "01",
    title: "Connect & Configure",
    description: "Train our agent on your business data, configure custom actions, and deploy it for your customers in minutes.",
    image: "/C:/Users/USUARIO/.gemini/antigravity/brain/b424facb-09d0-49f3-b798-fa736f712c4b/flashcheckout_step1_setup_1775308512101.png"
  },
  {
    number: "02",
    title: "AI Optimizes Checkout",
    description: "The agent handles real-time transaction flows, resolves payment issues, and maximizes your conversion rates automatically.",
    image: "/C:/Users/USUARIO/.gemini/antigravity/brain/b424facb-09d0-49f3-b798-fa736f712c4b/flashcheckout_step2_solve_1775308528867.png"
  },
  {
    number: "03",
    title: "Refine & Analyze",
    description: "Continuously improve your store performance with automated A/B testing and deep behavioral analytics.",
    image: "/C:/Users/USUARIO/.gemini/antigravity/brain/b424facb-09d0-49f3-b798-fa736f712c4b/flashcheckout_step3_optimize_1775308541766.png"
  },
  {
    number: "04",
    title: "Smart Sales Handoff",
    description: "Escalate high-intent customers or complex payment queries to your human sales team seamlessly.",
    image: "/C:/Users/USUARIO/.gemini/antigravity/brain/b424facb-09d0-49f3-b798-fa736f712c4b/flashcheckout_step4_human_handoff_1775308565649.png"
  },
  {
    number: '05',
    title: 'Revenue & ROI intelligence',
    description: 'Track the performance of your agents with detailed analytics on conversion rates, revenue recovered, and automated resolutions.',
    image: 'file:///C:/Users/USUARIO/.gemini/antigravity/brain/b424facb-09d0-49f3-b798-fa736f712c4b/flashcheckout_step5_analytics_1775308580970.png'
  }
]

const FEATURE_CARDS = [
  {
    title: 'Sync with real-time data',
    description: 'Connect your agent to systems like order management tools, CRMs, helpdesk platforms, and more to seamlessly access data ranging from order details to active subscriptions and beyond.',
    image: 'file:///C:/Users/USUARIO/.gemini/antigravity/brain/b424facb-09d0-49f3-b798-fa736f712c4b/flashcheckout_feature_sync_data_1775309099872.png',
    size: 'large'
  },
  {
    title: 'Take actions and automate workflows',
    description: 'Configure actions and omnichannel automation that your agent can perform within your systems, like updating a customer\'s subscription or changing their shipping address.',
    image: 'file:///C:/Users/USUARIO/.gemini/antigravity/brain/b424facb-09d0-49f3-b798-fa736f712c4b/flashcheckout_feature_automate_actions_1775309117411.png',
    size: 'large'
  },
  {
    title: 'Compare AI models',
    description: 'Experiment with various models and configurations to make sure you have the best setup for your specific payment use case.',
    image: 'file:///C:/Users/USUARIO/.gemini/antigravity/brain/b424facb-09d0-49f3-b798-fa736f712c4b/flashcheckout_feature_compare_models_1775309130449.png',
    size: 'small'
  },
  {
    title: 'Smart escalation',
    description: 'Give your agent instructions in natural language on when to escalate queries to human agents via live chat or helpdesk tickets.',
    image: 'file:///C:/Users/USUARIO/.gemini/antigravity/brain/b424facb-09d0-49f3-b798-fa736f712c4b/flashcheckout_feature_smart_escalation_1775309143082.png',
    size: 'small'
  },
  {
    title: 'Advanced reporting',
    description: 'Gain insights and optimize agent performance with detailed analytics that correlate AI actions with actual revenue growth.',
    image: 'file:///C:/Users/USUARIO/.gemini/antigravity/brain/b424facb-09d0-49f3-b798-fa736f712c4b/flashcheckout_feature_advanced_reporting_1775309157593.png',
    size: 'small'
  }
]

const INTEGRATIONS = [
  { name: 'Stripe', icon: CreditCard },
  { name: 'Shopify', icon: Layout },
  { name: 'Slack', icon: MessageSquare },
  { name: 'Notion', icon: BookOpen },
  { name: 'Salesforce', icon: ShieldCheck },
  { name: 'WhatsApp', icon: Phone },
  { name: 'Zendesk', icon: LifeBuoy },
  { name: 'Zapier', icon: Zap },
  { name: 'Make', icon: Activity },
  { name: 'Messenger', icon: MessageCircle }
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
  const [activeStep, setActiveStep] = useState(0)
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
    <div className="min-h-screen bg-[#FAFAFA] text-[#111827] font-sans selection:bg-black selection:text-white antialiased">
      
      {/* Navigation (Chatbase Style) */}
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

              {/* Right Column: Hero Mockup */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="group relative aspect-[0.939] w-full overflow-hidden rounded-3xl border border-black/[0.03] shadow-2xl bg-zinc-50 flex items-center justify-center p-0"
              >
                <img 
                  src="file:///C:/Users/USUARIO/.gemini/antigravity/brain/b424facb-09d0-49f3-b798-fa736f712c4b/flashcheckout_hero_ui_1775284071856.png" 
                  alt="FlashCheckout Dashboard Mockup"
                  className="w-full h-full object-cover rounded-3xl transition-transform duration-700 group-hover:scale-105"
                  loading="eager"
                />
                
                {/* Decorative Play Overlay (Optional, but kept for UI polish) */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 pointer-events-none" />
                <div className="absolute bottom-6 left-6 rounded-full bg-black/40 backdrop-blur-md p-3 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                  <Play className="w-5 h-5 fill-white text-white relative ml-0.5" />
                </div>
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
                  <LogoItem alt="Shopify" src="https://www.vectorlogo.zone/logos/shopify/shopify-ar21.svg" />
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
                        <LogoItem alt="Shopify" src="https://www.vectorlogo.zone/logos/shopify/shopify-ar21.svg" />
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

            {/* Highlights Section (High Fidelity) */}
            <section className="flex flex-col gap-4 pt-24 pb-4">
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
                    The complete platform for AI checkout agents
                  </motion.h2>
                  <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                    className="max-w-[600px] text-lg text-muted-foreground font-normal leading-relaxed pb-2"
                  >
                    FlashCheckout is designed for building AI payment agents that optimize conversions and automate your sales workflow with surgical precision.
                  </motion.p>
                </div>
              </div>

              <div className="grid gap-8 pt-12 md:grid-cols-2 lg:grid-cols-3">
                {/* Highlight Card 1 */}
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className="relative flex flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white transition-all duration-300 hover:border-zinc-300 hover:shadow-xl group"
                >
                  <div className="aspect-[784/800] overflow-hidden">
                    <img 
                      alt="Purpose-built for Payments" 
                      loading="lazy" 
                      src="file:///C:/Users/USUARIO/.gemini/antigravity/brain/b424facb-09d0-49f3-b798-fa736f712c4b/flashcheckout_ai_conversion_1775284300959.png" 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="space-y-2 px-6 pb-6 pt-6">
                    <h3 className="font-semibold text-xl text-zinc-950">Purpose-built for Payments</h3>
                    <p className="text-base text-muted-foreground">Advanced models with reasoning capabilities designed for friction-less transaction flows and real-time payment optimization.</p>
                  </div>
                </motion.div>

                {/* Highlight Card 2 */}
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.1 }}
                  className="relative flex flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white transition-all duration-300 hover:border-zinc-300 hover:shadow-xl group"
                >
                  <div className="aspect-[784/800] overflow-hidden">
                    <img 
                      alt="One-Click Excellence" 
                      loading="lazy" 
                      src="file:///C:/Users/USUARIO/.gemini/antigravity/brain/b424facb-09d0-49f3-b798-fa736f712c4b/flashcheckout_simplicity_ui_1775284311911.png" 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="space-y-2 px-6 pb-6 pt-6">
                    <h3 className="font-semibold text-xl text-zinc-950">Designed for One-Click</h3>
                    <p className="text-base text-muted-foreground">Automate complex checkout flows in minutes. Simple for you, magical for your customers.</p>
                  </div>
                </motion.div>

                {/* Highlight Card 3 */}
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="relative flex flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white transition-all duration-300 hover:border-zinc-300 hover:shadow-xl group lg:col-span-1 md:col-span-2"
                >
                  <div className="aspect-[784/800] overflow-hidden">
                    <img 
                      alt="Bank-Grade Infrastructure" 
                      loading="lazy" 
                      src="file:///C:/Users/USUARIO/.gemini/antigravity/brain/b424facb-09d0-49f3-b798-fa736f712c4b/flashcheckout_secure_infra_1775284323707.png" 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="space-y-2 px-6 pb-6 pt-6">
                    <h3 className="font-semibold text-xl text-zinc-950">Bank-Grade Infrastructure</h3>
                    <p className="text-base text-muted-foreground">Encryption and strict compliance standards ensure every transaction is protected and enterprise-ready.</p>
                  </div>
                </motion.div>
              </div>
            </section>
          </div>
        </div>
      </section>
      
      {/* How it Works Section (Interactive) */}
      <section className="w-full pt-4 pb-24 lg:pt-6 lg:pb-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-col gap-12">
            <div className="flex flex-col items-start gap-4">
              <div className="inline-flex items-center rounded-full px-4 py-1.5 font-medium text-sm border border-zinc-200 bg-white text-zinc-950">
                <div className="mr-2 size-2 rounded-full bg-linear-to-r from-[#FB923C] via-[#F472B6] to-[#E879F9]"></div>
                How it works
              </div>
              <div className="flex flex-col gap-6 md:flex-row md:items-end md:gap-12">
                <h2 className="font-medium text-4xl text-zinc-950 tracking-tight lg:text-[42px] max-w-[600px] leading-tight">
                  Intelligent automation for modern checkout
                </h2>
                <p className="max-w-[550px] text-lg text-zinc-500 leading-relaxed font-normal">
                  With FlashCheckout, your business can effortlessly optimize transaction flows, resolve issues, and take meaningful actions through seamless AI-driven agents.
                </p>
              </div>
            </div>

            <div className="grid gap-12 lg:grid-cols-2 lg:items-center pt-8">
              {/* Desktop Interactive Steps */}
              <div className="hidden lg:block">
                <div className="flex flex-col gap-3 max-w-[530px]">
                  {HOW_IT_WORKS_STEPS.map((step, index) => (
                    <button
                      key={index}
                      onClick={() => setActiveStep(index)}
                      className={`w-full rounded-2xl p-6 text-left transition-all duration-300 border ${
                        activeStep === index 
                          ? 'border-zinc-200 bg-background shadow-xl opacity-100' 
                          : 'border-transparent bg-transparent opacity-60 hover:opacity-80'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <span className={`font-medium text-lg transition-colors duration-300 ${
                          activeStep === index 
                            ? 'bg-linear-to-r from-[#FB923C] to-[#F472B6] bg-clip-text text-transparent' 
                            : 'text-zinc-400'
                        }`}>
                          {step.number}.
                        </span>
                        <div className="flex-1">
                          <h3 className={`font-medium text-lg transition-colors duration-300 ${
                            activeStep === index ? 'text-zinc-950' : 'text-zinc-400'
                          }`}>
                            {step.title}
                          </h3>
                          {activeStep === index && (
                            <motion.p 
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              transition={{ duration: 0.3 }}
                              className="text-muted-foreground mt-2 leading-relaxed text-base font-normal"
                            >
                              {step.description}
                            </motion.p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Desktop Image Preview */}
              <div className="hidden lg:block relative aspect-[784/800] w-full max-w-[640px] ml-auto">
                <div className="absolute inset-0 bg-white rounded-[32px] border border-zinc-200 p-4 shadow-2xl">
                  <div className="relative w-full h-full overflow-hidden rounded-[24px] bg-zinc-50">
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={activeStep}
                        src={HOW_IT_WORKS_STEPS[activeStep].image}
                        alt={HOW_IT_WORKS_STEPS[activeStep].title}
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 1.05, y: -10 }}
                        transition={{ duration: 0.5 }}
                        className="w-full h-full object-cover"
                      />
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Mobile View: Vertical Cards */}
              <div className="lg:hidden flex flex-col gap-6">
                {HOW_IT_WORKS_STEPS.map((step, index) => (
                  <div key={index} className="w-full rounded-3xl border border-zinc-200 bg-white overflow-hidden flex flex-col">
                    <div className="aspect-[784/800] w-full bg-zinc-50">
                      <img 
                        src={step.image} 
                        alt={step.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-6 flex flex-col gap-2">
                       <div className="flex items-center gap-3">
                        <span className="font-semibold text-[#FB923C]">{step.number}.</span>
                        <h3 className="font-semibold text-lg text-zinc-950">{step.title}</h3>
                       </div>
                       <p className="text-zinc-500 text-sm leading-relaxed font-normal">
                        {step.description}
                       </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* New Ultimate Features Section (Bento Multi-Grid) */}
      <section id="features" className="w-full py-24 border-t border-zinc-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col gap-12">
            <div className="flex flex-col items-start gap-4">
              <div className="inline-flex items-center rounded-full px-4 py-1.5 font-medium text-sm border border-zinc-200 bg-background text-zinc-950">
                <div className="mr-2 size-2 rounded-full bg-linear-to-r from-[#FB923C] via-[#F472B6] to-[#E879F9]"></div>
                Features
              </div>
              <h2 className="font-medium text-4xl text-zinc-950 tracking-tight lg:text-[42px] max-w-[700px] leading-tight">
                Build the perfect payment-focused AI agent
              </h2>
              <p className="max-w-[800px] text-lg text-zinc-500 leading-relaxed font-normal">
                FlashCheckout gives you all the tools you need to train your perfect AI agent and connect it deeply to your sales and logistics systems.
              </p>
            </div>

            <div className="grid gap-8 pt-8">
              {/* Grid 1: Large Cards */}
              <div className="grid gap-8 md:grid-cols-2">
                {FEATURE_CARDS.filter(c => c.size === 'large').map((card, i) => (
                  <div key={i} className="group flex flex-col overflow-hidden rounded-3xl border border-zinc-200 transition-all duration-300 bg-background hover:border-zinc-300 hover:shadow-xl">
                    <div className="w-full aspect-[1216/696] bg-zinc-50 overflow-hidden p-4">
                      <div className="w-full h-full rounded-2xl overflow-hidden border border-zinc-100 shadow-sm">
                        <img src={card.image} alt={card.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 p-8 pt-6">
                      <h3 className="font-medium text-xl text-zinc-950 tracking-tight">{card.title}</h3>
                      <p className="text-base text-zinc-500 leading-relaxed font-normal">{card.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Grid 2: Small Cards */}
              <div className="grid gap-8 md:grid-cols-3">
                {FEATURE_CARDS.filter(c => c.size === 'small').map((card, i) => (
                  <div key={i} className="group flex flex-col overflow-hidden rounded-3xl border border-zinc-200 transition-all duration-300 bg-background hover:border-zinc-300 hover:shadow-lg">
                    <div className="w-full aspect-[794/696] bg-zinc-50 overflow-hidden p-4">
                      <div className="w-full h-full rounded-2xl overflow-hidden border border-zinc-100 shadow-sm">
                        <img src={card.image} alt={card.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 p-8 pt-6">
                      <h3 className="font-medium text-lg text-zinc-950 tracking-tight">{card.title}</h3>
                      <p className="text-sm text-zinc-500 leading-relaxed font-normal">{card.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Integrations Marquee Section */}
              <div className="overflow-hidden rounded-3xl border border-zinc-200 bg-background">
                <div className="hidden md:flex md:items-center md:justify-between p-10 pr-0">
                  <div className="flex flex-col gap-2">
                    <h3 className="font-medium text-xl text-zinc-950 tracking-tight">Works with your tools</h3>
                    <p className="max-w-[400px] text-base text-zinc-500 leading-relaxed font-normal">Integrate diverse data sources to enrich your agent's knowledge and capabilities.</p>
                  </div>
                  <div className="relative flex flex-col gap-4 overflow-hidden pointer-events-none">
                    <div className="flex gap-4">
                      {INTEGRATIONS.concat(INTEGRATIONS).map((item, i) => (
                        <div key={i} className="inline-flex h-12 shrink-0 items-center gap-3 rounded-full bg-zinc-50 p-1.5 border border-zinc-100">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white">
                            <item.icon className="h-5 w-5 text-zinc-500" />
                          </div>
                          <span className="pr-3 font-medium text-sm text-zinc-800">{item.name}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-4 ml-12">
                      {INTEGRATIONS.slice().reverse().concat(INTEGRATIONS.slice().reverse()).map((item, i) => (
                        <div key={i} className="inline-flex h-12 shrink-0 items-center gap-3 rounded-full bg-zinc-50 p-1.5 border border-zinc-100">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 bg-white">
                            <item.icon className="h-5 w-5 text-zinc-500" />
                          </div>
                          <span className="pr-3 font-medium text-sm text-zinc-800">{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Mobile Marquee (Static stack for mobile for now or simple scroll) */}
                <div className="md:hidden flex flex-col gap-6 p-8">
                  <h3 className="font-medium text-xl text-zinc-950 tracking-tight">Works with your tools</h3>
                  <div className="flex flex-wrap gap-3">
                    {INTEGRATIONS.map((item, i) => (
                      <div key={i} className="inline-flex h-10 items-center gap-2 rounded-full bg-zinc-50 p-1 border border-zinc-100">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 bg-white">
                          <item.icon className="h-4 w-4 text-zinc-500" />
                        </div>
                        <span className="pr-2 font-medium text-xs text-zinc-800">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Feature Row */}
              <div className="hidden md:block pt-8 border-t border-zinc-100 mt-4">
                <div className="grid grid-cols-3 gap-16">
                  <div className="flex items-start gap-4">
                    <CodeXml className="h-6 w-6 text-zinc-400 shrink-0" />
                    <div className="flex flex-col gap-1">
                      <h4 className="font-medium text-base text-zinc-950">Advanced API</h4>
                      <p className="text-sm text-zinc-500 leading-relaxed font-normal">Deeply integrate support into your product with our comprehensive SDKs.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <TextCursorInput className="h-6 w-6 text-zinc-400 shrink-0" />
                    <div className="flex flex-col gap-1">
                      <h4 className="font-medium text-base text-zinc-950">Whitelabel</h4>
                      <p className="text-sm text-zinc-500 leading-relaxed font-normal">Remove any FlashCheckout branding from the chat widget and user interface.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <TrendingUp className="h-6 w-6 text-zinc-400 shrink-0" />
                    <div className="flex flex-col gap-1">
                      <h4 className="font-medium text-base text-zinc-950">Always improving</h4>
                      <p className="text-sm text-zinc-500 leading-relaxed font-normal">Syncs with your systems and learns from previous interactions to increase ROI.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section (Chatbase Style) */}
      <section className="py-24 lg:py-40 border-y border-[#E5E7EB]">
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
      <section className="py-24 lg:py-40">
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
