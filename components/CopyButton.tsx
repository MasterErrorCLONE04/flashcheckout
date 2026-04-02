'use client'

import { Copy, Check } from 'lucide-react'
import { useState } from 'react'

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="p-1.5 rounded-lg hover:bg-white/20 transition-colors flex-shrink-0"
      title="Copiar link"
    >
      {copied ? (
        <Check className="w-4 h-4 text-emerald-200" />
      ) : (
        <Copy className="w-4 h-4" />
      )}
    </button>
  )
}
