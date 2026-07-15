'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from './Navbar'
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
  TrendingUp,
  Sparkles,
  Box,
  GitCompare,
  Timer,
  Heart,
  Split,
  Eye
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
import LandingChatbot from './LandingChatbot'

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

const INTEGRATIONS_ROW_1 = [
  { name: 'Make', logo: 'https://backend.chatbase.co/storage/v1/object/public/chatbase/landing/features/integrations/make.png' },
  { name: 'Zendesk', logo: 'https://backend.chatbase.co/storage/v1/object/public/chatbase/landing/features/integrations/zendesk.png' },
  { name: 'Notion', logo: 'https://backend.chatbase.co/storage/v1/object/public/chatbase/landing/features/integrations/notion.png' },
  { name: 'Slack', logo: 'https://backend.chatbase.co/storage/v1/object/public/chatbase/landing/features/integrations/slack.png' },
  { name: 'Stripe', logo: 'https://backend.chatbase.co/storage/v1/object/public/chatbase/landing/features/integrations/stripe.png' },
  { name: 'Salesforce', logo: 'https://backend.chatbase.co/storage/v1/object/public/chatbase/landing/features/integrations/salesforce.png' },
  { name: 'Cloud', type: 'image', logo: 'https://backend.chatbase.co/storage/v1/object/public/chatbase/landing/features/integrations/yellow-cloud.png' },
]

const INTEGRATIONS_ROW_2 = [
  { name: 'Cloud', type: 'image', logo: 'https://backend.chatbase.co/storage/v1/object/public/chatbase/landing/features/integrations/green-cloud.png' },
  { name: 'Cal.com', logo: 'https://backend.chatbase.co/storage/v1/object/public/chatbase/landing/features/integrations/cal.png' },
  { name: 'Calendly', logo: 'https://backend.chatbase.co/storage/v1/object/public/chatbase/landing/features/integrations/calendly.png' },
  { name: 'WhatsApp', logo: 'https://backend.chatbase.co/storage/v1/object/public/chatbase/landing/features/integrations/whatsapp.png' },
  { name: 'Zapier', logo: 'https://backend.chatbase.co/storage/v1/object/public/chatbase/landing/features/integrations/zapier.png' },
  { name: 'Messenger', logo: 'https://backend.chatbase.co/storage/v1/object/public/chatbase/landing/features/integrations/messenger.png' },
]

const IntegrationPill = ({ name, logo, type = 'pill' }: { name: string; logo: string; type?: 'pill' | 'image' }) => {
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

const IntegrationMarquee = ({ items, reverse = false, speed = 30 }: { items: any[]; reverse?: boolean; speed?: number }) => (
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

const EXPLORE_TABS = [
  { id: 'playground', label: 'Playground', icon: Sparkles, image: 'https://backend.chatbase.co/storage/v1/object/public/chatbase/landing/explore/desktop/playground.png', mobileImage: 'https://backend.chatbase.co/storage/v1/object/public/chatbase/landing/explore/mobile/playground-mobile.png' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, image: 'https://backend.chatbase.co/storage/v1/object/public/chatbase/landing/explore/desktop/analytics.png', mobileImage: 'https://backend.chatbase.co/storage/v1/object/public/chatbase/landing/explore/mobile/analytics-mobile.png' },
  { id: 'activity', label: 'Activity', icon: Globe, image: 'https://backend.chatbase.co/storage/v1/object/public/chatbase/landing/explore/desktop/activity.png', mobileImage: 'https://backend.chatbase.co/storage/v1/object/public/chatbase/landing/explore/mobile/activity-mobile.png' },
  { id: 'sources', label: 'Sources', icon: Box, image: 'https://backend.chatbase.co/storage/v1/object/public/chatbase/landing/explore/desktop/sources.png', mobileImage: 'https://backend.chatbase.co/storage/v1/object/public/chatbase/landing/explore/mobile/sources-mobile.png' },
  { id: 'actions', label: 'Actions', icon: GitCompare, image: 'https://backend.chatbase.co/storage/v1/object/public/chatbase/landing/explore/desktop/actions.png', mobileImage: 'https://backend.chatbase.co/storage/v1/object/public/chatbase/landing/explore/mobile/actions-mobile.png' }
]

const BENEFITS_DATA = [
  {
    id: 'personalized',
    title: 'Personalized customer experience',
    description: 'Deliver tailored interactions based on customer history and preferences.',
    icon: Users,
    video: 'https://backend.chatbase.co/storage/v1/object/public/chatbase/landing/benefits/personalization.webm',
    poster: 'https://backend.chatbase.co/storage/v1/object/public/chatbase/landing/video-thumbnail.png'
  },
  {
    id: 'instant',
    title: 'Instant actions and workflow automation',
    description: 'Automate complex checkout flows and support tasks in real-time.',
    icon: Timer,
    video: 'https://backend.chatbase.co/storage/v1/object/public/chatbase/landing/benefits/automation.webm',
    poster: 'https://backend.chatbase.co/storage/v1/object/public/chatbase/landing/video-thumbnail.png'
  },
  {
    id: 'empathetic',
    title: 'Empathetic & on-brand',
    description: 'AI that speaks your brand voice and understands customer sentiment.',
    icon: Heart,
    video: 'https://backend.chatbase.co/storage/v1/object/public/chatbase/landing/benefits/empathy.webm',
    poster: 'https://backend.chatbase.co/storage/v1/object/public/chatbase/landing/video-thumbnail.png'
  },
  {
    id: 'escalations',
    title: 'Smart escalations',
    description: 'Seamlessly hand off complex issues to human agents when needed.',
    icon: Split,
    video: 'https://backend.chatbase.co/storage/v1/object/public/chatbase/landing/benefits/escalation.webm',
    poster: 'https://backend.chatbase.co/storage/v1/object/public/chatbase/landing/video-thumbnail.png'
  },
  {
    id: 'observability',
    title: 'Observability',
    description: 'See how your AI agent makes decisions and takes actions with full visibility into each step of the process.',
    icon: Eye,
    video: 'https://backend.chatbase.co/storage/v1/object/public/chatbase/landing/benefits/observability.webm',
    poster: 'https://backend.chatbase.co/storage/v1/object/public/chatbase/landing/video-thumbnail.png'
  }
]

export default function LandingContent({ userId, stores }: { userId?: string, stores?: any[] }) {
  const [activeTab, setActiveTab] = useState(EXPLORE_TABS[0].id)
  const [activeMobileStep, setActiveMobileStep] = useState(0)
  const [activeBenefitId, setActiveBenefitId] = useState('observability')
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

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111827] font-sans selection:bg-black selection:text-white antialiased">

      {/* Navigation (Chatbase Style) */}
      <Navbar userId={userId ?? undefined} />

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
          </div>
        </div>
      </section>

      {/* Explore Section (High-Fidelity Platform Tour) */}
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
                  Discover the FlashCheckout platform
                </motion.h2>
              </div>

              {/* Desktop Tabs */}
              <div className="my-12 hidden w-full md:block">
                <div className="relative z-10 items-center justify-center group inline-flex space-x-1 rounded-full py-2 bg-transparent w-full overflow-x-auto overflow-y-hidden px-12 pb-0.5">
                  {EXPLORE_TABS.map((tab) => {
                    const isActive = activeTab === tab.id
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`relative rounded-full px-3 py-1.5 font-medium text-sm transition-colors duration-300 flex-1 pt-0 ${isActive ? 'text-white' : 'text-zinc-400 hover:text-zinc-200'}`}
                      >
                        <span className="relative z-30">
                          <span className="flex items-center justify-center gap-2 py-2">
                            {tab.id === 'playground' && (
                              <svg width="24" height="24" viewBox="0 0 16 17" fill="none" className="h-4 w-4">
                                <path d="M5.71691 5.34506C6.02337 4.7497 6.1766 4.45202 6.38245 4.35556C6.56167 4.27159 6.76894 4.27159 6.94816 4.35556C7.15401 4.45202 7.30724 4.7497 7.6137 5.34506L8.40816 6.88845C8.46125 6.9916 8.4878 7.04317 8.52214 7.08872C8.55262 7.12915 8.58762 7.16597 8.62644 7.19848C8.67017 7.2351 8.72032 7.26424 8.82063 7.32253L10.4115 8.24701C10.9328 8.54992 11.1935 8.70138 11.2811 8.8988C11.3575 9.07101 11.3575 9.26753 11.2811 9.43974C11.1935 9.63716 10.9328 9.78862 10.4115 10.0915L8.82063 11.016C8.72032 11.0743 8.67017 11.1034 8.62644 11.1401C8.58762 11.1726 8.55262 11.2094 8.52214 11.2498C8.4878 11.2954 8.46125 11.3469 8.40816 11.4501L7.6137 12.9935C7.30724 13.5888 7.15401 13.8865 6.94816 13.983C6.76894 14.067 6.56167 14.067 6.38245 13.983C6.1766 13.8865 6.02337 13.5888 5.71691 12.9935L4.92245 11.4501C4.86935 11.3469 4.84281 11.2954 4.80847 11.2498C4.77798 11.2094 4.74299 11.1726 4.70417 11.1401C4.66044 11.1034 4.61028 11.0743 4.50998 11.016L2.91906 10.0915C2.39779 9.78862 2.13715 9.63716 2.04952 9.43974C1.97308 9.26753 1.97308 9.07101 2.04952 8.8988C2.13715 8.70138 2.39779 8.54992 2.91906 8.24701L4.50998 7.32253C4.61028 7.26424 4.66044 7.2351 4.70417 7.19848C4.74299 7.16597 4.77798 7.12915 4.80847 7.08872C4.84281 7.04317 4.86935 6.9916 4.92245 6.88845L5.71691 5.34506Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                <path d="M11.6383 5.10671C11.4692 4.89526 11.3846 4.78953 11.3529 4.66761C11.325 4.56036 11.325 4.44484 11.3529 4.3376C11.3846 4.21568 11.4692 4.10995 11.6383 3.8985L12.182 3.21887C12.3512 3.00741 12.4358 2.90169 12.5333 2.86207C12.6191 2.82723 12.7115 2.82723 12.7973 2.86207C12.8948 2.90169 12.9794 3.00741 13.1486 3.21887L13.6923 3.8985C13.8615 4.10995 13.946 4.21568 13.9777 4.3376C14.0056 4.44484 14.0056 4.56036 13.9777 4.66761C13.946 4.78953 13.8615 4.89526 13.6923 5.10671L13.1486 5.78634C12.9794 5.99779 12.8948 6.10352 12.7973 6.14314C12.7115 6.17798 12.6191 6.17798 12.5333 6.14314C12.4358 6.10352 12.3512 5.99779 12.182 5.78634L11.6383 5.10671Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                            {tab.id === 'analytics' && (
                              <svg width="24" height="24" viewBox="0 0 16 17" fill="none" className="h-4 w-4">
                                <path d="M6 14.5V10.5C6 9.87874 6 9.56812 5.89851 9.32309C5.76318 8.99639 5.50362 8.73682 5.17691 8.60149C4.93188 8.5 4.62126 8.5 4 8.5C3.37874 8.5 3.06812 8.5 2.82309 8.60149C2.49638 8.73682 2.23682 8.99639 2.10149 9.32309C2 9.56812 2 9.87874 2 10.5V12.3667C2 13.1134 2 13.4868 2.14532 13.772C2.27316 14.0229 2.47713 14.2268 2.72801 14.3547C3.01323 14.5 3.3866 14.5 4.13333 14.5H6ZM6 14.5H10M6 14.5V4.5C6 3.87874 6 3.56812 6.10149 3.32309C6.23682 2.99638 6.49638 2.73682 6.82309 2.60149C7.06812 2.5 7.37874 2.5 8 2.5C8.62126 2.5 8.93188 2.5 9.17691 2.60149C9.50362 2.73682 9.76318 2.99638 9.89851 3.32309C10 3.56812 10 3.87874 10 4.5V14.5M10 14.5H11.8667C12.6134 14.5 12.9868 14.5 13.272 14.3547C13.5229 14.2268 13.7268 14.0229 13.8547 13.772C14 13.4868 14 13.1134 14 12.3667V7.83333C14 7.21208 14 6.90145 13.8985 6.65642C13.7632 6.32972 13.5036 6.07015 13.1769 5.93483C12.9319 5.83333 12.6213 5.83333 12 5.83333C11.3787 5.83333 11.0681 5.83333 10.8231 5.93483C10.4964 6.07015 10.2368 6.32972 10.1015 6.65642C10 6.90145 10 7.21208 10 7.83333V14.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                            {tab.id === 'activity' && <Globe className="h-4 w-4" />}
                            {tab.id === 'sources' && <Box className="h-4 w-4" />}
                            {tab.id === 'actions' && (
                              <svg width="24" height="24" viewBox="0 0 16 17" fill="none" className="h-4 w-4">
                                <path d="M12 10.5C13.1046 10.5 14 11.3954 14 12.5C14 13.6046 13.1046 14.5 12 14.5C10.8954 14.5 10 13.6046 10 12.5C10 11.3954 10.8954 10.5 12 10.5ZM12 10.5V7.83333C12 5.99238 10.5076 4.5 8.66667 4.5M4 6.5C2.89543 6.5 2 5.60457 2 4.5C2 3.39543 2.89543 2.5 4 2.5C5.10457 2.5 6 3.39543 6 4.5C6 5.60457 5.10457 6.5 4 6.5ZM4 6.5V9.16667C4 11.0076 5.49238 12.5 7.33333 12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                            {tab.label}
                          </span>
                        </span>
                        {isActive && (
                          <motion.div
                            layoutId="activeTabUnderline"
                            className="absolute bottom-[-3px] left-0 right-0 h-1 bg-white rounded-full z-20"
                            transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                          />
                        )}
                      </button>
                    )
                  })}
                </div>

                {/* Main Display Area */}
                <div className="relative mt-12 flex aspect-video w-full items-center justify-center rounded-2xl p-10 overflow-hidden">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeTab}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 1.05 }}
                      transition={{ duration: 0.4, ease: "easeInOut" }}
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
                          {activeMobileStep === 0 && <svg width="24" height="24" viewBox="0 0 16 17" fill="none" className="h-5 w-5 text-white"><path d="M5.71691 5.34506C6.02337 4.7497 6.1766 4.45202 6.38245 4.35556C6.56167 4.27159 6.76894 4.27159 6.94816 4.35556C7.15401 4.45202 7.30724 4.7497 7.6137 5.34506L8.40816 6.88845C8.46125 6.9916 8.4878 7.04317 8.52214 7.08872C8.55262 7.12915 8.58762 7.16597 8.62644 7.19848C8.67017 7.2351 8.72032 7.26424 8.82063 7.32253L10.4115 8.24701C10.9328 8.54992 11.1935 8.70138 11.2811 8.8988C11.3575 9.07101 11.3575 9.26753 11.2811 9.43974C11.1935 9.63716 10.9328 9.78862 10.4115 10.0915L8.82063 11.016C8.72032 11.0743 8.67017 11.1034 8.62644 11.1401C8.58762 11.1726 8.55262 11.2094 8.52214 11.2498C8.4878 11.2954 8.46125 11.3469 8.40816 11.4501L7.6137 12.9935C7.30724 13.5888 7.15401 13.8865 6.94816 13.983C6.76894 14.067 6.56167 14.067 6.38245 13.983C6.1766 13.8865 6.02337 13.5888 5.71691 12.9935L4.92245 11.4501C4.86935 11.3469 4.84281 11.2954 4.80847 11.2498C4.77798 11.2094 4.74299 11.1726 4.70417 11.1401C4.66044 11.1034 4.61028 11.0743 4.50998 11.016L2.91906 10.0915C2.39779 9.78862 2.13715 9.63716 2.04952 9.43974C1.97308 9.26753 1.97308 9.07101 2.04952 8.8988C2.13715 8.70138 2.39779 8.54992 2.91906 8.24701L4.50998 7.32253C4.61028 7.26424 4.66044 7.2351 4.70417 7.19848C4.74299 7.16597 4.77798 7.12915 4.80847 7.08872C4.84281 7.04317 4.86935 6.9916 4.92245 6.88845L5.71691 5.34506Z" stroke="currentColor" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                          {activeMobileStep === 1 && <svg width="24" height="24" viewBox="0 0 16 17" fill="none" className="h-5 w-5 text-white"><path d="M6 14.5V10.5C6 9.87874 6 9.56812 5.89851 9.32309C5.76318 8.99639 5.50362 8.73682 5.17691 8.60149C4.93188 8.5 4.62126 8.5 4 8.5C3.37874 8.5 3.06812 8.5 2.82309 8.60149C2.49638 8.73682 2.23682 8.99639 2.10149 9.32309C2 9.56812 2 9.87874 2 10.5V12.3667C2 13.1134 2 13.4868 2.14532 13.772C2.27316 14.0229 2.47713 14.2268 2.72801 14.3547C3.01323 14.5 3.3866 14.5 4.13333 14.5H6ZM6 14.5H10M6 14.5V4.5C6 3.87874 6 3.56812 6.10149 3.32309C6.23682 2.99638 6.49638 2.73682 6.82309 2.60149C7.06812 2.5 7.37874 2.5 8 2.5C8.62126 2.5 8.93188 2.5 9.17691 2.60149C9.50362 2.73682 9.76318 2.99638 9.89851 3.32309C10 3.56812 10 3.87874 10 4.5V14.5M10 14.5H11.8667C12.6134 14.5 12.9868 14.5 13.272 14.3547C13.5229 14.2268 13.7268 14.0229 13.8547 13.772C14 13.4868 14 13.1134 14 12.3667V7.83333C14 7.21208 14 6.90145 13.8985 6.65642C13.7632 6.32972 13.5036 6.07015 13.1769 5.93483C12.9319 5.83333 12.6213 5.83333 12 5.83333C11.3787 5.83333 11.0681 5.83333 10.8231 5.93483C10.4964 6.07015 10.2368 6.32972 10.1015 6.65642C10 6.90145 10 7.21208 10 7.83333V14.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
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
                      className="relative h-1 w-full overflow-hidden rounded-full bg-zinc-800"
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

      {/* Highlights Section (High Fidelity) */}
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
                Build the perfect customer-facing AI agent
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
              className="relative flex flex-col overflow-hidden rounded-3xl border border-zinc-200 bg-white transition-all duration-300 hover:border-zinc-300 hover:shadow-xl group"
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
                <h3 className="font-semibold text-xl text-zinc-950">Security by Design</h3>
                <p className="text-base text-muted-foreground">Encryption and strict compliance standards ensure every transaction is protected and enterprise-ready.</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Benefits Section (High Fidelity) */}
      <section className="w-full py-24 #FAFAFA overflow-hidden">
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
                  AI support agents that work like your best employees
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
                      className={`group w-full rounded-2xl p-6 text-left transition-all duration-500 border-2 ${isActive
                        ? 'border-zinc-200 bg-background shadow-lg scale-[1.02] z-10'
                        : 'border-transparent bg-transparent opacity-60 hover:opacity-80 hover:bg-zinc-50/50'
                        }`}
                    >
                      <div className="flex items-start gap-5">
                        <div className={`p-2.5 rounded-xl transition-colors duration-300 ${isActive ? 'bg-pink-50 text-pink-500' : 'bg-zinc-100 text-zinc-400'}`}>
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
                    className={`w-full rounded-2xl p-4 text-left transition-all border-2 ${activeBenefitId === benefit.id ? 'border-zinc-200 bg-background shadow-md' : 'border-transparent bg-zinc-50 opacity-80'
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

      {/* New Ultimate Features Section (Bento Multi-Grid) */}
      <section id="features" className="w-full py-24">
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

      {/* CTA Section (FlashCheckout Style) */}
      <div className="w-full px-0 md:px-8 md:bg-[linear-gradient(to_bottom,transparent_60%,black_40%)] lg:bg-[linear-gradient(to_bottom,transparent_50%,black_50%)]">
        <div className="relative flex w-full flex-col items-center justify-center gap-6 overflow-hidden border-zinc-200 border-t bg-[length:100%_auto] bg-bottom bg-white bg-no-repeat px-6 py-12 pb-30 md:gap-8 md:rounded-3xl md:border md:p-15 lg:p-25">
          <div className="flex flex-col gap-4 md:max-w-[850px] md:gap-6 relative z-10">
            <h2 className="text-center font-medium text-4xl text-foreground leading-tight tracking-tighter md:text-balance md:text-5xl lg:text-[54px]">
              Haz de tus cierres tu ventaja competitiva
            </h2>
            <p className="text-center font-normal text-base text-zinc-600 tracking-[-0.4px] md:text-balance md:text-xl">
              Usa FlashCheckout para automatizar tus ventas por WhatsApp y superar a la competencia con un cierre impecable.
            </p>
          </div>

          <div className="flex w-full flex-col items-center justify-center gap-6 md:gap-4 relative z-10">
            <div className="relative z-0 h-14 w-full md:w-fit group">
              <div className="absolute -inset-1 rounded-lg bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 opacity-75 blur transition duration-1000 group-hover:opacity-100 group-hover:duration-200"></div>
              <Button asChild size="lg" className="relative h-full w-full bg-black text-white hover:bg-zinc-900 rounded-lg px-8">
                <Link href="/sign-up">Crea tu checkout gratis</Link>
              </Button>
            </div>

            <div className="flex flex-row items-center gap-2 text-muted-foreground text-sm">
              <svg width="24" height="24" viewBox="0 0 16 17" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <path d="M14.6615 6.50521H14.6577M14.6577 6.50521H1.33185M14.6577 6.50521C14.6615 6.78028 14.6615 7.08895 14.6615 7.43854V9.50521M14.6577 6.50521C14.6455 5.60514 14.5934 5.06481 14.3708 4.6279C14.1151 4.12613 13.7072 3.71819 13.2054 3.46252C12.635 3.17188 11.8883 3.17188 10.3948 3.17188H5.59479C4.10132 3.17188 3.35458 3.17188 2.78415 3.46252C2.28238 3.71819 1.87444 4.12613 1.61877 4.6279C1.39616 5.06481 1.34405 5.60514 1.33185 6.50521M1.33185 6.50521H1.32812M1.33185 6.50521C1.32812 6.78028 1.32812 7.08895 1.32812 7.43854V9.57188C1.32812 11.0653 1.32812 11.8121 1.61877 12.3825C1.87444 12.8843 2.28238 13.2922 2.78415 13.5479C3.35458 13.8385 4.10132 13.8385 5.59479 13.8385H8.10677M5.99479 9.17188H3.99479"></path>
                <path d="M11.2498 14.5786L12.6641 13.1644M12.6641 13.1644L14.0783 11.7502M12.6641 13.1644L11.2498 11.7502M12.6641 13.1644L14.0783 14.5786"></path>
              </svg>
              <p>Sin tarjeta de crédito</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
      <LandingChatbot />
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
