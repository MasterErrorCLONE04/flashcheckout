import React from 'react'
import Link from 'next/link'
import { Zap } from 'lucide-react'

export interface FlashcheckoutsLogoProps {
  href?: string
  showText?: boolean
  textSuffix?: string
  textSize?: string
  textColor?: string
  boxSize?: string
  iconSize?: string
  className?: string
}

export function FlashcheckoutsLogoIcon({
  boxSize = 'w-8 h-8',
  iconSize = 'w-4.5 h-4.5',
  className = ''
}: {
  boxSize?: string
  iconSize?: string
  className?: string
}) {
  return (
    <div className={`bg-black dark:bg-white rounded-lg flex items-center justify-center shrink-0 shadow-sm transition-transform group-hover:scale-105 ${boxSize} ${className}`}>
      <Zap className={`fill-white stroke-white text-white dark:fill-zinc-950 dark:stroke-zinc-950 dark:text-zinc-950 ${iconSize}`} />
    </div>
  )
}

export default function FlashcheckoutsLogo({
  href = '/',
  showText = true,
  textSuffix = '',
  textSize = 'text-[20px]',
  textColor = 'text-zinc-950 dark:text-white',
  boxSize = 'w-8 h-8',
  iconSize = 'w-4.5 h-4.5',
  className = ''
}: FlashcheckoutsLogoProps) {
  const content = (
    <div className={`flex items-center gap-2.5 group transition-all hover:opacity-85 ${className}`}>
      <FlashcheckoutsLogoIcon boxSize={boxSize} iconSize={iconSize} />
      {showText && (
        <span className={`${textSize} font-bold tracking-tight ${textColor}`}>
          Flashcheckouts{textSuffix}
        </span>
      )}
    </div>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }

  return content
}
