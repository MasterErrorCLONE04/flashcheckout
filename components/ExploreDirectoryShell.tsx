'use client'

import { useState } from 'react'
import ExploreHeaderBar from '@/components/explorar/ExploreHeaderBar'
import ExploreSearchHero from '@/components/explorar/ExploreSearchHero'
import ExploreQuickServicesBar from '@/components/explorar/ExploreQuickServicesBar'
import ExploreCategoryNav from '@/components/explorar/ExploreCategoryNav'
import ExploreLiveAndTrendsWidget from '@/components/explorar/ExploreLiveAndTrendsWidget'
import ExploreTopRankedWidget from '@/components/explorar/ExploreTopRankedWidget'
import ExploreUserProfileCard from '@/components/explorar/ExploreUserProfileCard'
import ExploreCategoryFilterStrip from '@/components/explorar/ExploreCategoryFilterStrip'
import ExploreResultsGrid from '@/components/explorar/ExploreResultsGrid'
import {
  ImageSearchModal,
  QuoteRequestModal,
  LiveStreamsModal,
  FlashProtectModal,
} from '@/components/explorar/ExploreModals'
import ExploreStoreB2BConfigModal from '@/components/explorar/ExploreStoreB2BConfigModal'
import type { ExploreStore, ExploreTheme } from '@/components/ExploreTypes'

type ExploreDirectoryShellProps = {
  stores: ExploreStore[]
  totalStores: number
  query: string
  selectedCategory: string
  minPrice: number
  maxPrice: number
  sort: string
  theme: ExploreTheme
  userId: string | null
}

export default function ExploreDirectoryShell({
  stores,
  totalStores,
  query,
  selectedCategory,
  sort,
  theme,
  userId,
}: ExploreDirectoryShellProps) {
  const [isImageSearchOpen, setIsImageSearchOpen] = useState(false)
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false)
  const [isLiveModalOpen, setIsLiveModalOpen] = useState(false)
  const [isProtectModalOpen, setIsProtectModalOpen] = useState(false)
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false)
  const [activeToast, setActiveToast] = useState<string | null>(null)

  const showToast = (msg: string) => {
    setActiveToast(msg)
    setTimeout(() => setActiveToast(null), 3000)
  }

  // Find user's own store if present in stores list
  const userStore = stores[0]

  return (
    <div className={theme === 'dark' ? 'dark' : ''}>
      <div className="min-h-screen bg-[#f4f5f7] text-[#111827] dark:bg-zinc-950 dark:text-white transition-colors relative font-sans">
        {/* Toast Notification */}
        {activeToast && (
          <div className="fixed bottom-6 right-6 z-50 rounded-2xl bg-zinc-900 px-5 py-3 text-xs font-bold text-white shadow-2xl dark:bg-white dark:text-zinc-950 animate-in fade-in slide-in-from-bottom-3">
            {activeToast}
          </div>
        )}

        {/* Header Bar */}
        <ExploreHeaderBar
          userId={userId}
          theme={theme}
          onOpenCart={() => showToast('🛒 Carrito: 2 productos guardados.')}
          onOpenFavorites={() => showToast('❤️ Favoritos: 13 productos guardados.')}
        />

        {/* Hero Search Section */}
        <ExploreSearchHero
          initialQuery={query}
          onOpenImageSearch={() => setIsImageSearchOpen(true)}
        />

        {/* Quick Services Bar */}
        <ExploreQuickServicesBar
          userName={userId ? 'David' : 'David'}
          onOpenQuoteModal={() => setIsQuoteModalOpen(true)}
          onOpenLiveModal={() => setIsLiveModalOpen(true)}
          onOpenProtectModal={() => setIsProtectModalOpen(true)}
        />

        <div className="mx-auto max-w-[1560px] px-4 sm:px-6 py-4 space-y-6">
          {/* Main 4-Column Showcase Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch">
            <ExploreCategoryNav selectedCategory={selectedCategory} />
            <ExploreLiveAndTrendsWidget onOpenLiveModal={() => setIsLiveModalOpen(true)} />
            <ExploreTopRankedWidget />
            <ExploreUserProfileCard
              userName={userId ? 'David Velasquez' : 'David Velasquez'}
              onOpenQuoteModal={() => setIsQuoteModalOpen(true)}
              onOpenFavorites={() => showToast('❤️ 13 Productos favoritos')}
              onOpenConfigModal={() => setIsConfigModalOpen(true)}
            />
          </div>

          {/* Bottom Category Tabs & Tag Pills Strip */}
          <ExploreCategoryFilterStrip
            selectedCategory={selectedCategory}
            currentSort={sort}
          />

          {/* Main Results Grid */}
          <main>
            <ExploreResultsGrid
              stores={stores}
              totalStores={totalStores}
              query={query}
              selectedCategory={selectedCategory}
            />
          </main>
        </div>

        {/* Modals */}
        <ImageSearchModal
          isOpen={isImageSearchOpen}
          onClose={() => setIsImageSearchOpen(false)}
        />
        <QuoteRequestModal
          isOpen={isQuoteModalOpen}
          onClose={() => setIsQuoteModalOpen(false)}
        />
        <LiveStreamsModal
          isOpen={isLiveModalOpen}
          onClose={() => setIsLiveModalOpen(false)}
        />
        <FlashProtectModal
          isOpen={isProtectModalOpen}
          onClose={() => setIsProtectModalOpen(false)}
        />
        <ExploreStoreB2BConfigModal
          isOpen={isConfigModalOpen}
          onClose={() => setIsConfigModalOpen(false)}
          store={userStore}
        />
      </div>
    </div>
  )
}
