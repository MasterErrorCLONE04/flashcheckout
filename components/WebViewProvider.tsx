'use client'

import { useEffect, useState } from 'react'

export default function WebViewProvider({ children }: { children: React.ReactNode }) {
  const [isWebView, setIsWebView] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const webview = params.get('webview') === 'true'
    setIsWebView(webview)
    if (webview) {
      document.documentElement.classList.add('is-webview')
    } else {
      document.documentElement.classList.remove('is-webview')
    }
  }, [])

  return (
    <div className={isWebView ? 'webview-mode' : ''}>
      {children}
    </div>
  )
}
