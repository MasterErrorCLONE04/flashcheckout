'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import {
  Zap,
  Globe,
  MessageSquareText,
  ClipboardList,
  ShoppingBag,
  User,
  List,
  Check,
  ChevronDown,
} from 'lucide-react'
import type { ExploreTheme } from '@/components/ExploreTypes'
import ExploreMegaMenu from '@/components/explorar/ExploreMegaMenu'
import ExploreVerifiedStoresMenu from '@/components/explorar/ExploreVerifiedStoresMenu'
import ExploreOrderProtectionMenu from '@/components/explorar/ExploreOrderProtectionMenu'
import ExploreHelpCenterMenu from '@/components/explorar/ExploreHelpCenterMenu'
import ExploreAccioWorkMenu from '@/components/explorar/ExploreAccioWorkMenu'
import ExploreAboutMenu from '@/components/explorar/ExploreAboutMenu'

type ExploreHeaderBarProps = {
  userId: string | null
  theme: ExploreTheme
  onOpenCart?: () => void
  onOpenFavorites?: () => void
}

const COUNTRIES = [
  { code: 'CO', name: 'Colombia', flag: '🇨🇴', flagText: 'co', currency: 'COP' },
  { code: 'MX', name: 'México', flag: '🇲🇽', flagText: 'mx', currency: 'MXN' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱', flagText: 'cl', currency: 'CLP' },
  { code: 'PE', name: 'Perú', flag: '🇵🇪', flagText: 'pe', currency: 'PEN' },
]

export default function ExploreHeaderBar({
  userId,
  onOpenCart,
}: ExploreHeaderBarProps) {
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0])
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)
  const [showMegaMenu, setShowMegaMenu] = useState(false)
  const [showVerifiedStoresMenu, setShowVerifiedStoresMenu] = useState(false)
  const [showOrderProtectionMenu, setShowOrderProtectionMenu] = useState(false)
  const [showHelpCenterMenu, setShowHelpCenterMenu] = useState(false)
  const [showAccioWorkMenu, setShowAccioWorkMenu] = useState(false)
  const [showAboutMenu, setShowAboutMenu] = useState(false)

  const megaMenuTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const verifiedStoresTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const orderProtectionTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const helpCenterTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const accioWorkTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const aboutTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleMouseEnterCategories = () => {
    if (megaMenuTimeoutRef.current) clearTimeout(megaMenuTimeoutRef.current)
    setShowVerifiedStoresMenu(false)
    setShowOrderProtectionMenu(false)
    setShowHelpCenterMenu(false)
    setShowAccioWorkMenu(false)
    setShowAboutMenu(false)
    setShowMegaMenu(true)
  }

  const handleMouseLeaveCategories = () => {
    megaMenuTimeoutRef.current = setTimeout(() => {
      setShowMegaMenu(false)
    }, 150)
  }

  const handleMouseEnterVerifiedStores = () => {
    if (verifiedStoresTimeoutRef.current) clearTimeout(verifiedStoresTimeoutRef.current)
    setShowMegaMenu(false)
    setShowOrderProtectionMenu(false)
    setShowHelpCenterMenu(false)
    setShowAccioWorkMenu(false)
    setShowAboutMenu(false)
    setShowVerifiedStoresMenu(true)
  }

  const handleMouseLeaveVerifiedStores = () => {
    verifiedStoresTimeoutRef.current = setTimeout(() => {
      setShowVerifiedStoresMenu(false)
    }, 150)
  }

  const handleMouseEnterOrderProtection = () => {
    if (orderProtectionTimeoutRef.current) clearTimeout(orderProtectionTimeoutRef.current)
    setShowMegaMenu(false)
    setShowVerifiedStoresMenu(false)
    setShowHelpCenterMenu(false)
    setShowAccioWorkMenu(false)
    setShowAboutMenu(false)
    setShowOrderProtectionMenu(true)
  }

  const handleMouseLeaveOrderProtection = () => {
    orderProtectionTimeoutRef.current = setTimeout(() => {
      setShowOrderProtectionMenu(false)
    }, 150)
  }

  const handleMouseEnterHelpCenter = () => {
    if (helpCenterTimeoutRef.current) clearTimeout(helpCenterTimeoutRef.current)
    setShowMegaMenu(false)
    setShowVerifiedStoresMenu(false)
    setShowOrderProtectionMenu(false)
    setShowAccioWorkMenu(false)
    setShowAboutMenu(false)
    setShowHelpCenterMenu(true)
  }

  const handleMouseLeaveHelpCenter = () => {
    helpCenterTimeoutRef.current = setTimeout(() => {
      setShowHelpCenterMenu(false)
    }, 150)
  }

  const handleMouseEnterAccioWork = () => {
    if (accioWorkTimeoutRef.current) clearTimeout(accioWorkTimeoutRef.current)
    setShowMegaMenu(false)
    setShowVerifiedStoresMenu(false)
    setShowOrderProtectionMenu(false)
    setShowHelpCenterMenu(false)
    setShowAboutMenu(false)
    setShowAccioWorkMenu(true)
  }

  const handleMouseLeaveAccioWork = () => {
    accioWorkTimeoutRef.current = setTimeout(() => {
      setShowAccioWorkMenu(false)
    }, 150)
  }

  const handleMouseEnterAbout = () => {
    if (aboutTimeoutRef.current) clearTimeout(aboutTimeoutRef.current)
    setShowMegaMenu(false)
    setShowVerifiedStoresMenu(false)
    setShowOrderProtectionMenu(false)
    setShowHelpCenterMenu(false)
    setShowAccioWorkMenu(false)
    setShowAboutMenu(true)
  }

  const handleMouseLeaveAbout = () => {
    aboutTimeoutRef.current = setTimeout(() => {
      setShowAboutMenu(false)
    }, 150)
  }

  return (
    <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-zinc-200/60 dark:border-white/10 dark:bg-zinc-950/95 transition-all shadow-xs">
      <div className="mx-auto max-w-[1560px] px-4 sm:px-6 py-2.5 space-y-3">
        {/* ROW 1: Logo (Left) | Delivery, Currency, Utility Icons (Right) */}
        <div className="flex items-center justify-between gap-4">
          {/* Logo Brand */}
          <Link href="/" className="flex items-center gap-2.5">
            <div className="size-9 rounded-full bg-[#111827] dark:bg-white text-white dark:text-zinc-950 flex items-center justify-center font-black shadow-sm">
              <Zap className="size-5 fill-current text-white dark:text-zinc-950" />
            </div>
            <span className="text-xl font-bold tracking-tight text-[#111827] dark:text-white">
              Flashcheckouts.com
            </span>
          </Link>

          {/* Top Right Utilities */}
          <div className="flex items-center gap-5 text-xs sm:text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {/* Delivery Location Selector */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                className="bg-transparent flex items-center gap-1.5 hover:text-black dark:hover:text-white transition-colors"
              >
                <span className="text-xs text-zinc-500">Entregar en:</span>
                <span className="font-bold text-zinc-900 dark:text-white">
                  {selectedCountry.code}
                </span>
                <ChevronDown className="size-3 text-zinc-400" />
              </button>

              {showCountryDropdown && (
                <div className="absolute right-0 mt-2 w-44 rounded-2xl border border-zinc-200 bg-white p-2 shadow-2xl dark:border-white/10 dark:bg-zinc-900 z-50">
                  <span className="block px-3 py-1 text-[10px] font-bold uppercase text-zinc-400">País</span>
                  {COUNTRIES.map((c) => (
                    <button
                      key={c.code}
                      type="button"
                      onClick={() => {
                        setSelectedCountry(c)
                        setShowCountryDropdown(false)
                      }}
                      className="bg-transparent flex w-full items-center justify-between rounded-xl px-3 py-1.5 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-white/10"
                    >
                      <span className="flex items-center gap-2">
                        <span>{c.name} ({c.code})</span>
                      </span>
                      {selectedCountry.code === c.code && <Check className="size-3.5 text-black dark:text-white" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Language / Currency */}
            <div className="hidden md:flex items-center gap-1.5 hover:text-black dark:hover:text-white transition-colors">
              <Globe className="size-4 text-zinc-500" />
              <span className="font-semibold text-zinc-900 dark:text-white">Español-{selectedCountry.currency}</span>
            </div>

            {/* Right Action Icons */}
            <div className="flex items-center gap-4">
              <button type="button" className="bg-transparent text-zinc-700 hover:text-black dark:text-zinc-300 dark:hover:text-white transition-colors" title="Mensajes">
                <MessageSquareText className="size-5" />
              </button>
              <button type="button" className="bg-transparent text-zinc-700 hover:text-black dark:text-zinc-300 dark:hover:text-white transition-colors" title="Pedidos">
                <ClipboardList className="size-5" />
              </button>
              <button
                type="button"
                onClick={onOpenCart}
                className="bg-transparent relative text-zinc-700 hover:text-black dark:text-zinc-300 dark:hover:text-white transition-colors"
                title="Carrito"
              >
                <ShoppingBag className="size-5" />
                <span className="absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full bg-zinc-900 text-[10px] font-black text-white dark:bg-white dark:text-zinc-950">
                  2
                </span>
              </button>
              <Link
                href={userId ? "/dashboard" : "/sign-in"}
                className="text-zinc-700 hover:text-black dark:text-zinc-300 dark:hover:text-white transition-colors"
                title="Perfil"
              >
                <User className="size-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* ROW 2: Primary Navigation Links (Left) | Secondary Links (Right) */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-1 text-xs font-normal text-zinc-700 dark:text-zinc-300">
          {/* Left Category Links */}
          <nav className="flex items-center gap-6">
            <div
              onMouseEnter={handleMouseEnterCategories}
              onMouseLeave={handleMouseLeaveCategories}
              className="relative py-1"
            >
              <Link
                href="/explorar?category=Todos"
                className={`flex items-center gap-1.5 transition-colors ${
                  showMegaMenu ? 'text-black dark:text-white font-bold' : 'hover:text-black dark:hover:text-white'
                }`}
              >
                <List className="size-4 text-zinc-500" />
                <span>Todas las categorías</span>
              </Link>
            </div>
            <div
              onMouseEnter={handleMouseEnterVerifiedStores}
              onMouseLeave={handleMouseLeaveVerifiedStores}
              className="relative py-1"
            >
              <Link
                href="/explorar?category=Tiendas"
                className={`transition-colors ${
                  showVerifiedStoresMenu ? 'text-black dark:text-white font-bold' : 'hover:text-black dark:hover:text-white'
                }`}
              >
                Tiendas verificadas
              </Link>
            </div>
            <div
              onMouseEnter={handleMouseEnterOrderProtection}
              onMouseLeave={handleMouseLeaveOrderProtection}
              className="relative py-1"
            >
              <Link
                href="/explorar?action=protection"
                className={`transition-colors ${
                  showOrderProtectionMenu ? 'text-black dark:text-white font-bold' : 'hover:text-black dark:hover:text-white'
                }`}
              >
                Protecciones del pedido
              </Link>
            </div>
            <div
              onMouseEnter={handleMouseEnterAbout}
              onMouseLeave={handleMouseLeaveAbout}
              className="relative py-1"
            >
              <Link
                href="/about"
                className={`transition-colors ${
                  showAboutMenu ? 'text-black dark:text-white font-bold' : 'hover:text-black dark:hover:text-white'
                }`}
              >
                Acerca de Flashcheckouts.com
              </Link>
            </div>
          </nav>

          {/* Right Secondary Help / Info Links */}
          <div className="hidden md:flex items-center gap-6 text-xs font-normal text-zinc-700 dark:text-zinc-300">
            <div
              onMouseEnter={handleMouseEnterHelpCenter}
              onMouseLeave={handleMouseLeaveHelpCenter}
              className="relative py-1"
            >
              <Link
                href="/help"
                className={`transition-colors ${
                  showHelpCenterMenu ? 'text-black dark:text-white font-bold' : 'hover:text-black dark:hover:text-white'
                }`}
              >
                Centro de ayuda
              </Link>
            </div>
            <div
              onMouseEnter={handleMouseEnterAccioWork}
              onMouseLeave={handleMouseLeaveAccioWork}
              className="relative py-1"
            >
              <Link
                href="/accio"
                className={`transition-colors ${
                  showAccioWorkMenu ? 'text-black dark:text-white font-bold' : 'hover:text-black dark:hover:text-white'
                }`}
              >
                Accio Work
              </Link>
            </div>
            <Link href="/sell" className="hover:text-black dark:hover:text-white transition-colors">
              Vende en Flashcheckouts.com
            </Link>
          </div>
        </div>
      </div>

      {/* Mega Menu Dropdowns */}
      <ExploreMegaMenu
        isOpen={showMegaMenu}
        onMouseEnter={handleMouseEnterCategories}
        onMouseLeave={handleMouseLeaveCategories}
      />

      <ExploreVerifiedStoresMenu
        isOpen={showVerifiedStoresMenu}
        onMouseEnter={handleMouseEnterVerifiedStores}
        onMouseLeave={handleMouseLeaveVerifiedStores}
      />

      <ExploreOrderProtectionMenu
        isOpen={showOrderProtectionMenu}
        onMouseEnter={handleMouseEnterOrderProtection}
        onMouseLeave={handleMouseLeaveOrderProtection}
      />

      <ExploreHelpCenterMenu
        isOpen={showHelpCenterMenu}
        onMouseEnter={handleMouseEnterHelpCenter}
        onMouseLeave={handleMouseLeaveHelpCenter}
      />

      <ExploreAccioWorkMenu
        isOpen={showAccioWorkMenu}
        onMouseEnter={handleMouseEnterAccioWork}
        onMouseLeave={handleMouseLeaveAccioWork}
      />

      <ExploreAboutMenu
        isOpen={showAboutMenu}
        onMouseEnter={handleMouseEnterAbout}
        onMouseLeave={handleMouseLeaveAbout}
      />
    </header>
  )
}
