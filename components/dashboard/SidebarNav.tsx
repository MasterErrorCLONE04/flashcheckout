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
  Link2 
} from 'lucide-react'

const getNavItems = (conversationsCount: number, ordersCount: number) => [
  { href: "/dashboard", icon: LayoutDashboard, label: "Inicio" },
  { href: "/conversaciones", icon: MessageSquare, label: "Conversaciones", badge: conversationsCount },
  { href: "/pedidos", icon: ShoppingCart, label: "Pedidos", badge: ordersCount },
  { href: "/productos", icon: Package, label: "Productos" },
  { href: "/clientes", icon: Users, label: "Clientes" },
  { href: "/pagos", icon: CreditCard, label: "Pagos" },
  { href: "/automatizaciones", icon: Bot, label: "Automatizaciones" },
  { href: "/descuentos", icon: Tag, label: "Descuentos" },
  { href: "/tienda", icon: Store, label: "Tienda" },
  { href: "/integraciones", icon: Link2, label: "Integraciones" },
  { href: "/configuracion", icon: Settings, label: "Configuración" },
]

interface SidebarNavProps {
  conversationsCount?: number
  ordersCount?: number
}

export default function SidebarNav({ conversationsCount = 0, ordersCount = 0 }: SidebarNavProps) {
  const pathname = usePathname();
  const navItems = getNavItems(conversationsCount, ordersCount);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Navigation Items */}
      <nav className="flex flex-col gap-1.5 px-3 w-full">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || (pathname?.startsWith(`${item.href}/`) && item.href !== "/dashboard");
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group/item flex items-center h-10 rounded-lg text-sm transition-all duration-300 border w-full overflow-hidden relative",
                isActive
                  ? "bg-white border-zinc-200/80 text-zinc-955 font-semibold"
                  : "border-transparent text-zinc-500 hover:text-zinc-955 font-medium hover:bg-zinc-100/50"
              )}
              title={item.label}
            >
              {/* Centered Icon Wrapper */}
              <div className="absolute left-0 w-12 h-10 flex items-center justify-center shrink-0">
                <Icon 
                  className={cn(
                    "w-[18px] h-[18px] transition-colors",
                    isActive ? "text-zinc-950 stroke-[2.5px]" : "text-zinc-400 stroke-[2px] group-hover/item:text-zinc-600"
                  )} 
                />
              </div>
              
              <div className="pl-12 pr-3 flex items-center justify-between w-full transition-opacity duration-300 opacity-0 group-hover:opacity-100">
                <span className="whitespace-nowrap">{item.label}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className={cn(
                    "px-1.5 py-0.5 rounded text-[10px] font-extrabold tracking-tight shrink-0 select-none",
                    isActive ? "bg-zinc-150 text-zinc-900" : "bg-zinc-100/80 text-zinc-500"
                  )}>
                    {item.badge}
                  </span>
                )}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Nova Card: Collapsible */}
      <div className="mx-2 p-1.5 group-hover:p-3.5 bg-transparent group-hover:bg-zinc-50 border border-transparent group-hover:border-zinc-200/60 rounded-xl transition-all duration-300">
        {/* Collapsed state: just circular robot avatar with pulsing dot */}
        <div className="flex justify-center group-hover:hidden">
          <Link href="/hablar-con-nova" className="relative block shrink-0">
            <div className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-650">
              <Bot className="w-5 h-5" />
            </div>
            <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-zinc-50 animate-pulse" />
          </Link>
        </div>

        {/* Expanded state: full detailed card layout */}
        <div className="hidden group-hover:block space-y-3.5 animate-in fade-in duration-300">
          <div className="flex items-center gap-2.5">
            <div className="relative shrink-0">
              <div className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-650">
                <Bot className="w-5 h-5" />
              </div>
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-zinc-50 animate-pulse" />
            </div>
            <div className="min-w-0 text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-xs xl:text-sm font-extrabold text-zinc-900 truncate">Nova</span>
                <span className="text-[9px] xl:text-[10px] font-bold text-emerald-650 uppercase tracking-wider shrink-0">• En línea</span>
              </div>
              <div className="text-[10px] xl:text-xs font-semibold text-zinc-400 truncate">Copiloto de la plataforma</div>
            </div>
          </div>

          <Link 
            href="/hablar-con-nova"
            className="w-full bg-[#10B981] hover:bg-emerald-650 text-white font-extrabold text-xs rounded-lg py-2.5 flex items-center justify-center gap-1.5 shadow-sm shadow-emerald-100 hover:shadow-md hover:shadow-emerald-200/50 active:scale-[0.98] transition-all text-center select-none cursor-pointer"
          >
            Hablar con Nova
          </Link>

          <div className="space-y-2 border-t border-zinc-200/50 pt-3 text-left">
            <span className="text-[9px] xl:text-[10px] font-bold text-zinc-400 tracking-wider uppercase block">Actividad reciente</span>
            <div className="space-y-2">
              {[
                { text: "Guio en configuración", time: "Hace 2 min" },
                { text: "Ayudó con pasarela MP", time: "Hace 5 min" },
                { text: "Explicó reporte de ventas", time: "Hace 12 min" }
              ].map((act, i) => (
                <div key={i} className="flex items-center justify-between text-[10px] xl:text-xs text-zinc-655 font-semibold">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full shrink-0" />
                    <span className="truncate">{act.text}</span>
                  </div>
                  <span className="text-[9px] text-zinc-400 shrink-0 select-none ml-2">{act.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
