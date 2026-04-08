"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Package, ShoppingCart, Settings, CreditCard } from 'lucide-react'

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/productos", icon: Package, label: "Mis productos" },
  { href: "/pedidos", icon: ShoppingCart, label: "Ventas & pedidos" },
  { href: "/configuracion", icon: Settings, label: "Configuración" },
  { href: "/suscripcion", icon: CreditCard, label: "Suscripción pro", isPro: true }
]

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 -ml-5">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (pathname?.startsWith(`${item.href}/`) && item.href !== "/dashboard");

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "group flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all duration-200 border",
              isActive
                ? "bg-white border-zinc-200/80 shadow-sm text-zinc-950 font-semibold"
                : "border-transparent text-zinc-500 hover:text-zinc-900 font-medium",
              item.isPro && !isActive ? "text-primary hover:text-primary" : ""
            )}
          >
            <div className="flex items-center gap-3">
              <Icon 
                className={cn(
                  "w-[18px] h-[18px] transition-colors",
                  isActive ? "text-zinc-950 stroke-[2.5px]" : "text-zinc-400 stroke-[2px] group-hover:text-zinc-600",
                  item.isPro && !isActive ? "text-primary" : ""
                )} 
              />
              {item.label}
            </div>
            
            {item.isPro && (
              <span className="text-[10px] uppercase tracking-wider font-bold bg-primary text-primary-foreground px-1.5 py-0.5 rounded-md">Pro</span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}
