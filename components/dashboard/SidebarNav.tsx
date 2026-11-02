"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Settings,
  MessageSquare,
  Users,
  CreditCard,
  Bot,
  Tag,
  Store,
  Link2,
  Building,
  Sparkles,
  Zap,
} from "lucide-react"

export const getDashboardNavItems = (conversationsCount: number, ordersCount: number) => [
  { href: "/dashboard", icon: LayoutDashboard, label: "Inicio" },
  { href: "/agente", icon: Bot, label: "Agente IA", badgeText: "FLOWS" },
  { href: "/conversaciones", icon: MessageSquare, label: "Conversaciones", badge: conversationsCount },
  { href: "/pedidos", icon: ShoppingCart, label: "Pedidos", badge: ordersCount },
  { href: "/productos", icon: Package, label: "Productos" },
  { href: "/studio-ia", icon: Sparkles, label: "Studio IA", badgeText: "NUEVO" },
  { href: "/clientes", icon: Users, label: "Clientes" },
  { href: "/pagos", icon: CreditCard, label: "Pagos" },
  { href: "/automatizaciones", icon: Zap, label: "Automatizaciones" },
  { href: "/descuentos", icon: Tag, label: "Descuentos" },
  { href: "/tienda", icon: Store, label: "Tienda" },
  { href: "/dashboard/the-office", icon: Building, label: "The Office" },
  { href: "/integraciones", icon: Link2, label: "Integraciones" },
  { href: "/configuracion", icon: Settings, label: "Configuración" },
]

interface SidebarNavProps {
  conversationsCount?: number
  ordersCount?: number
  expanded?: boolean
  onNavigate?: () => void
}

export default function SidebarNav({
  conversationsCount = 0,
  ordersCount = 0,
  expanded = false,
  onNavigate,
}: SidebarNavProps) {
  const pathname = usePathname()
  const navItems = getDashboardNavItems(conversationsCount, ordersCount)

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Navigation Items */}
      <nav className="flex flex-col gap-1 px-3 w-full" aria-label="Navegación del panel">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive =
            pathname === item.href ||
            (pathname?.startsWith(`${item.href}/`) && item.href !== "/dashboard")

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group/item flex items-center h-10 rounded-lg text-sm transition-all duration-200 border w-full overflow-hidden relative",
                isActive
                  ? "bg-white border-zinc-200 text-zinc-950 font-semibold shadow-2xs"
                  : "border-transparent text-zinc-500 hover:text-zinc-950 font-medium hover:bg-zinc-100/70"
              )}
              title={item.label}
            >
              {/* Centered Icon Wrapper */}
              <div className="absolute left-0 w-12 h-10 flex items-center justify-center shrink-0">
                <Icon
                  className={cn(
                    "w-[18px] h-[18px] transition-colors",
                    isActive
                      ? "text-zinc-950 stroke-[2.25px]"
                      : "text-zinc-400 stroke-[2px] group-hover/item:text-zinc-700"
                  )}
                />
              </div>

              <div
                className={cn(
                  "pl-12 pr-3 flex items-center justify-between w-full transition-opacity duration-200",
                  expanded ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                )}
              >
                <span className="whitespace-nowrap text-[13px]">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={cn(
                      "px-1.5 py-0.5 rounded text-[10px] font-bold tabular-nums tracking-tight shrink-0 select-none leading-none",
                      isActive ? "bg-zinc-100 text-zinc-900" : "bg-zinc-100 text-zinc-500"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
                {item.badgeText && (
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold tracking-tight shrink-0 select-none bg-purple-50 text-purple-700 border border-purple-200/80 leading-none">
                    {item.badgeText}
                  </span>
                )}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Nova Card */}
      <div
        className={cn(
          "mx-2 rounded-xl transition-all duration-200",
          expanded
            ? "p-3.5 bg-zinc-50 border border-zinc-200/80"
            : "p-1.5 group-hover:p-3.5 bg-transparent group-hover:bg-zinc-50 border border-transparent group-hover:border-zinc-200/80"
        )}
      >
        {!expanded && (
          <div className="flex justify-center group-hover:hidden">
            <Link href="/hablar-con-nova" onClick={onNavigate} className="relative block shrink-0">
              <div className="w-9 h-9 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-500">
                <Bot className="w-5 h-5" />
              </div>
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-zinc-50 animate-pulse" />
            </Link>
          </div>
        )}

        <div
          className={cn(
            "space-y-3 animate-in fade-in duration-200",
            expanded ? "block" : "hidden group-hover:block"
          )}
        >
          <div className="flex items-center gap-2.5">
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-600">
                <Bot className="w-5 h-5" />
              </div>
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-zinc-50 animate-pulse" />
            </div>
            <div className="min-w-0 text-left">
              <span className="text-xs font-semibold text-zinc-900 truncate block">Nova</span>
              <span className="text-[11px] font-medium text-zinc-500 truncate block">
                Copiloto de la plataforma
              </span>
            </div>
          </div>

          <Link
            href="/hablar-con-nova"
            onClick={onNavigate}
            className="w-full bg-zinc-950 hover:bg-zinc-800 text-white font-semibold text-xs rounded-lg h-9 flex items-center justify-center gap-1.5 active:scale-[0.98] transition-all text-center select-none cursor-pointer"
          >
            Hablar con Nova
          </Link>
        </div>
      </div>
    </div>
  )
}
