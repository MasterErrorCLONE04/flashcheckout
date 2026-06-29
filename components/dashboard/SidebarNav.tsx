"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Package, ShoppingCart, Settings, Bot, Truck, Users, BarChart3, History, ShieldCheck } from 'lucide-react'

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Panel de control" },
  { href: "/productos", icon: Package, label: "Productos" },
  { href: "/pedidos", icon: ShoppingCart, label: "Ventas registradas" },
  { href: "/verificaciones", icon: ShieldCheck, label: "Verificar pagos" },
  { href: "/agente", icon: Bot, label: "Agente de WhatsApp" },
  { href: "/envios", icon: Truck, label: "Envíos y logística" },
  { href: "/clientes", icon: Users, label: "Directorio de clientes" },
  { href: "/analitica", icon: BarChart3, label: "Métricas y analítica" },
  { href: "/historial-chats", icon: History, label: "Historial de chats" },
  { href: "/configuracion", icon: Settings, label: "Ajustes de tienda" },
]

export default function SidebarNav() {
  const pathname = usePathname();

  return (
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
            
            {/* Label Text */}
            <span className="pl-12 whitespace-nowrap transition-opacity duration-300 opacity-0 group-hover:opacity-100">
              {item.label}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}
