'use client'

import { useState, useMemo, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Zap } from 'lucide-react'
import {
  DOC_SECTIONS,
  pageTransition,
  DocSidebar,
  BackToDashboardButton,
  renderDocContent,
} from '@/components/work-doc'

export default function DocPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center bg-zinc-950 text-white">
          <Zap className="animate-pulse w-8 h-8 text-[#10B981]" />
        </div>
      }
    >
      <DocContent />
    </Suspense>
  )
}

function DocContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const activeSlug = searchParams.get('s') || 'inicio-rapido'
  const [searchTerm, setSearchTerm] = useState('')

  const filteredSections = useMemo(() => {
    if (!searchTerm) return DOC_SECTIONS
    return DOC_SECTIONS.map(group => ({
      ...group,
      items: group.items.filter(item =>
        item.label.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    })).filter(group => group.items.length > 0)
  }, [searchTerm])

  const setView = (id: string) => {
    router.push(`?s=${id}`, { scroll: false })
  }

  return (
    <div className="h-screen w-full bg-zinc-950 text-zinc-100 font-sans flex flex-col md:flex-row overflow-hidden antialiased">
      <DocSidebar
        activeSlug={activeSlug}
        filteredSections={filteredSections}
        searchTerm={searchTerm}
        onSearchTermChange={setSearchTerm}
        onViewChange={setView}
      />

      <main className="flex-grow relative z-10 px-8 md:px-16 py-12 md:py-16 bg-[#09090B] h-full overflow-y-auto scroll-smooth flex flex-col">
        <div className="max-w-4xl w-full flex-grow">
          <AnimatePresence mode="wait">
            <motion.div key={activeSlug} {...pageTransition} className="w-full">
              {renderDocContent(activeSlug)}
            </motion.div>
          </AnimatePresence>
        </div>
        <BackToDashboardButton />
      </main>
    </div>
  )
}
