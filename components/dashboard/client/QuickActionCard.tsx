import React from 'react'
import Link from 'next/link'

export function QuickActionCard({
  icon: Icon,
  title,
  subtitle,
  href,
  onClick
}: {
  icon: React.ComponentType<{ className?: string }>
  title: string
  subtitle: string
  href?: string
  onClick?: () => void
}) {
  const cardContent = (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50/50 hover:border-zinc-300 transition-all duration-200 h-full w-full">
      <div className="w-8.5 h-8.5 rounded-lg bg-zinc-50 border border-zinc-200 flex items-center justify-center text-zinc-500 shrink-0">
        <Icon className="w-4.5 h-4.5" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-bold text-zinc-900 leading-tight">{title}</p>
        <p className="text-[9px] font-semibold text-zinc-400 truncate mt-0.5">{subtitle}</p>
      </div>
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="contents">
        {cardContent}
      </Link>
    )
  }

  return (
    <button onClick={onClick} className="contents text-left">
      {cardContent}
    </button>
  )
}
