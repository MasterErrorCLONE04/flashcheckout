'use client'

import React, { useEffect, useId, useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

const MODAL_SIZES = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
} as const

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  size?: keyof typeof MODAL_SIZES
  hideHeader?: boolean
  className?: string
  bodyClassName?: string
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  hideHeader = false,
  className,
  bodyClassName,
}: ModalProps) {
  const [mounted, setMounted] = useState(false)
  const titleId = useId()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!mounted || !isOpen) return null

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={hideHeader ? undefined : titleId}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-zinc-950/35 backdrop-blur-xs transition-opacity duration-200 animate-in fade-in"
        onClick={onClose}
      />

      {/* Content Container */}
      <div
        className={cn(
          'relative bg-white border border-zinc-200 rounded-2xl shadow-2xl w-full p-6 overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-200 z-10',
          MODAL_SIZES[size],
          className
        )}
      >
        {!hideHeader ? (
          <div className="flex items-start justify-between gap-3 border-b border-zinc-200/80 pb-3.5 mb-4 shrink-0 select-none">
            <div className="min-w-0">
              <h3 id={titleId} className="text-sm font-semibold text-zinc-900 tracking-tight">
                {title || 'Detalles'}
              </h3>
              {description && (
                <p className="text-xs text-zinc-500 mt-0.5 leading-relaxed">{description}</p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 rounded-lg transition-colors cursor-pointer shrink-0"
              aria-label="Cerrar modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 bg-zinc-50 hover:bg-zinc-100 text-zinc-400 hover:text-zinc-700 rounded-lg transition-colors cursor-pointer z-20"
            aria-label="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Scrollable Body */}
        <div className={cn('flex-1 overflow-y-auto pr-1', bodyClassName)}>
          {children}
        </div>

        {footer && (
          <div className="border-t border-zinc-200/80 pt-4 mt-4 shrink-0 flex items-center justify-end gap-2.5">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  )
}

export default Modal
