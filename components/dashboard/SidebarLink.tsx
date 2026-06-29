"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

export default function SidebarLink({
  href,
  icon: Icon,
  label,
  isPro = false,
}: {
  href: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  isPro?: boolean
}) {
  const pathname = usePathname();
  // Ensure precise active matching: if href is /dashboard, only match /dashboard or /dashboard/...
  const isActive = pathname === href || (pathname?.startsWith(`${href}/`) && href !== "/dashboard");

  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all duration-200 border",
        isActive
          ? "bg-white border-zinc-200/80 shadow-sm text-zinc-950 font-semibold"
          : "border-transparent text-zinc-500 hover:text-zinc-900 font-medium",
        isPro && !isActive ? "text-primary hover:text-primary" : ""
      )}
    >
      <div className="flex items-center gap-3">
        <Icon 
          className={cn(
            "w-[18px] h-[18px] transition-colors",
            isActive ? "text-zinc-950 stroke-[2.5px]" : "text-zinc-400 stroke-[2px] group-hover:text-zinc-600",
            isPro && !isActive ? "text-primary" : ""
          )} 
        />
        {label}
      </div>
      
      {isPro && (
        <span className="text-[10px] uppercase tracking-wider font-bold bg-primary text-primary-foreground px-1.5 py-0.5 rounded-md">Pro</span>
      )}
    </Link>
  )
}
