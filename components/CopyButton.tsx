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
      className="p-2 rounded-lg hover:bg-zinc-100 transition-all flex-shrink-0 active:scale-90"
      title="Copiar enlace"
    >
      {copied ? (
        <Check className="w-4 h-4 text-primary animate-in zoom-in" />
      ) : (
        <Copy className="w-4 h-4 text-zinc-400" />
      )}
    </button>
  )
}
