"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Package, ShoppingCart, Settings, CreditCard } from 'lucide-react'

const navItems = [
  { href: "/productos", icon: Package, label: "Enlaces de Pago" },
  { href: "/pedidos", icon: ShoppingCart, label: "Ventas Registradas" },
  { href: "/configuracion", icon: Settings, label: "Ajustes de Tienda" },
]

export default function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1 px-2 w-full">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "group/item flex items-center px-3 py-2 rounded-xl text-sm transition-all duration-200 border w-full overflow-hidden",
              isActive
                ? "bg-white border-zinc-200/80 shadow-sm text-zinc-950 font-semibold"
                : "border-transparent text-zinc-500 hover:text-zinc-900 font-medium"
            )}
            title={item.label}
          >
            <div className="flex items-center gap-3">
              <Icon 
                className={cn(
                  "flex-shrink-0 w-[18px] h-[18px] transition-colors",
                  isActive ? "text-zinc-950 stroke-[2.5px]" : "text-zinc-400 stroke-[2px] group-hover/item:text-zinc-600"
                )} 
              />
              <span className="whitespace-nowrap transition-opacity duration-200 opacity-0 group-hover:opacity-100">
                {item.label}
              </span>
            </div>
            
          </Link>
        )
      })}
    </nav>
  )
}
