'use client'

import React from 'react'
import Navbar from './Navbar'
import Footer from './Footer'
import LandingChatbot from './LandingChatbot'
import {
  HeroSection,
  ExploreSection,
  HighlightsSection,
  BenefitsSection,
  FeaturesBentoSection,
  CtaSection,
  FeatureCard,
  LogoItem,
  FlashcheckoutsLogo,
} from './landing'

export { FeatureCard, LogoItem, FlashcheckoutsLogo }

export interface LandingContentProps {
  userId?: string | null
  stores?: any[]
}

export default function LandingContent({ userId }: LandingContentProps) {
  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111827] font-sans selection:bg-black selection:text-white antialiased">
      {/* Navigation */}
      <Navbar userId={userId ?? undefined} />

      {/* Hero Section */}
      <HeroSection />

      {/* Explore Section */}
      <ExploreSection />

      {/* Highlights Section */}
      <HighlightsSection />

      {/* Benefits Section */}
      <BenefitsSection />

      {/* Features Bento Section */}
      <FeaturesBentoSection />

      {/* CTA Section */}
      <CtaSection />

      {/* Footer & Floating Chatbot */}
      <Footer />
      <LandingChatbot />
    </div>
  )
}
