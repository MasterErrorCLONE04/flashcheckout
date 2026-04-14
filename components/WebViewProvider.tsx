'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect } from 'react'

export default function WebViewProvider({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams()
  const isWebView = searchParams.get('webview') === 'true'

  useEffect(() => {
    if (isWebView) {
      document.documentElement.classList.add('is-webview')
    } else {
      document.documentElement.classList.remove('is-webview')
    }
  }, [isWebView])

  return (
    <div className={isWebView ? 'webview-mode' : ''}>
      {children}
    </div>
  )
}
