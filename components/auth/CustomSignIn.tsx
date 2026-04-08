'use client'

import React, { useState, useEffect } from 'react'
import { useSignIn } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Eye, EyeOff, Loader2, Lock } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'

const GoogleIcon = () => (
  <svg className="w-4 h-4 mr-3" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l3.66-2.84z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
)

const CustomSignIn = () => {
  const [isClient, setIsClient] = useState(false)
  const signInSignal: any = useSignIn()
  
  // Robustly extract actual values from Clerk signals
  const getVal = (x: any) => (x && typeof x === 'object' && 'value' in x) ? x.value : x
  
  const rootValue = getVal(signInSignal)
  const isLoaded = getVal(rootValue?.isLoaded)
  const signIn = getVal(rootValue?.signIn)
  const setActive = getVal(rootValue?.setActive)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  useEffect(() => {
    setIsClient(true)
  }, [])

  const handleOAuthSignIn = async (strategy: 'oauth_google') => {
    try {
      setLoading(true)
      setError('')
      const clerk = (window as any).Clerk;
      if (!clerk) throw new Error("Clerk SDK not loaded in window.");
      await clerk.client.signIn.authenticateWithRedirect({
        strategy,
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/productos',
      })
    } catch (err: any) {
      const errorMessage = err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || err.message || 'Error al conectar con Google.'
      setError(errorMessage)
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoaded === false || !signIn) return
    try {
      setLoading(true)
      setError('')
      
      const clerk = (window as any).Clerk
      const si = clerk.client.signIn
      const result = await si.create({ 
        strategy: 'password',
        identifier: email, 
        password 
      })
      
      if (result.status === 'complete') {
        await clerk.setActive({ session: result.createdSessionId })
        window.location.href = '/productos'
      } else {
        console.log('SignIn status no completado. Estado:', result.status);
        setError(`El inicio de sesión requiere pasos adicionales (${result.status}).`)
      }
    } catch (err: any) {
      const errorMessage = err?.errors?.[0]?.longMessage || err?.errors?.[0]?.message || err.message || 'Email o contraseña incorrectos.'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  if (!isClient) {
    return (
      <div className="w-full flex-1 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-6 h-6 animate-spin text-zinc-200" />
      </div>
    )
  }

  return (
    <div className="flex h-full w-full flex-1 flex-col items-center justify-center gap-4 px-2 lg:px-8">
      <div className="mx-auto grid w-full max-w-7xl flex-1 flex-col items-center justify-center justify-items-center overflow-hidden rounded-3xl border bg-background lg:max-h-[900px] lg:grid-cols-2 shadow-sm shrink-0">
        <section className="flex h-full w-full flex-col justify-center gap-8 p-6 lg:p-20 lg:border-r animate-in">
          <div className="flex flex-col items-center justify-center gap-2 lg:items-start lg:justify-start">
            <h1 className="text-pretty text-center font-semibold text-[28px] leading-[130%] tracking-[-1.12px] lg:text-left">Welcome back</h1>
            <p className="text-center text-heading-description text-sm leading-[140%] tracking-[-0.28px] lg:text-left">Log in to access your FlashCheckout account.</p>
          </div>

          <div className="flex flex-col gap-3">
            <button 
              data-slot="button" 
              className="isolate md:[isolation:auto] flex items-center justify-center gap-2 whitespace-nowrap font-medium text-sm outline-hidden transition-all duration-200 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&amp;_svg]:pointer-events-none [&amp;_svg]:shrink-0 border bg-transparent shadow-inner-sm hover:bg-accent hover:text-accent-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50 h-10 rounded-md px-4 py-2"
              onClick={() => handleOAuthSignIn('oauth_google')}
              disabled={loading}
            >
              {loading && !email ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" viewBox="0 0 48 48" className="mr-2 h-5 w-5">
                  <defs>
                    <path id="gs-signin-a" d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6.4-6.4C34.6 4.1 29.6 2 24 2 11.8 2 2 11.8 2 24s9.8 22 22 22c11 0 21-8 21-22 0-1.3-.2-2.7-.5-4z"></path>
                  </defs>
                  <clipPath id="gs-signin-b"><use xlinkHref="#gs-signin-a" overflow="visible"></use></clipPath>
                  <path clipPath="url(#gs-signin-b)" fill="#FBBC05" d="M0 37V11l17 13z"></path>
                  <path clipPath="url(#gs-signin-b)" fill="#EA4335" d="M0 11l17 13 7-6.1L48 14V0H0z"></path>
                  <path clipPath="url(#gs-signin-b)" fill="#34A853" d="M0 37l30-23 7.9 1L48 0v48H0z"></path>
                  <path clipPath="url(#gs-signin-b)" fill="#4285F4" d="M48 48L17 24l-4-3 35-10z"></path>
                </svg>
              )}
              Login with Google
            </button>
            
            <Link 
              href="/auth/sso" 
              className="isolate md:[isolation:auto] flex items-center justify-center gap-2 whitespace-nowrap font-medium text-sm outline-hidden transition-all duration-200 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&amp;_svg]:pointer-events-none [&amp;_svg]:shrink-0 border bg-transparent shadow-inner-sm hover:bg-accent hover:text-accent-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50 h-10 rounded-md px-4 py-2"
            >
              <Lock className="w-4 h-4 mr-2" />
              Sign in with SSO
            </Link>
          </div>

          <div className="relative">
            <div data-orientation="horizontal" role="none" data-slot="separator" className="shrink-0 bg-border data-[orientation=horizontal]:h-px data-[orientation=horizontal]:w-full data-[orientation=vertical]:w-px"></div>
            <div className="-translate-x-1/2 -translate-y-1/2 absolute left-1/2 bg-background px-2 font-medium text-heading-description text-xs uppercase">OR</div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-2 w-full text-left">
              <Label htmlFor="email" className="flex select-none items-center gap-2 font-medium text-sm leading-none text-paragraph-3">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="work@domain.com"
                className="-outline-offset-1 flex w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base transition-color selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground focus-visible:outline focus-visible:outline-primary h-10 md:text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

              <div className="flex flex-col gap-2 text-left">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="flex select-none items-center gap-2 font-medium text-sm leading-none text-paragraph-3">Password</Label>
                  <Link href="#" className="isolate md:[isolation:auto] flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium text-sm outline-hidden transition-all duration-200 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&amp;_svg]:pointer-events-none [&amp;_svg]:shrink-0 underline-offset-4 h-3.5 p-0 text-paragraph-3 underline hover:text-primary">Forgot password?</Link>
                </div>
                <div className="relative flex items-center">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••"
                    className="-outline-offset-1 flex w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base transition-color selection:bg-primary selection:text-primary-foreground placeholder:text-muted-foreground focus-visible:outline focus-visible:outline-primary h-10 md:text-sm pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="justify-center gap-2 outline-hidden transition-[color,box-shadow] whitespace-nowrap text-muted-foreground hover:text-foreground px-2 min-w-9 absolute right-1 flex h-[90%] items-center rounded-md bg-background font-medium text-base hover:bg-background"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <Eye className="!h-5 !w-5" aria-hidden="true" />
                    ) : (
                      <EyeOff className="!h-5 !w-5" aria-hidden="true" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <div className="text-[13px] font-medium text-red-600 bg-red-50/50 p-4 rounded-md border border-red-100/50 flex items-center gap-2">
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                disabled={loading} 
                className="isolate md:[isolation:auto] flex items-center justify-center gap-2 whitespace-nowrap font-medium text-sm transition-all duration-200 bg-primary text-primary-foreground shadow-inner-sm hover:bg-primary/90 h-10 rounded-md px-4 py-2"
              >
                {loading && email ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Continue'}
              </Button>
            </form>

          <p className="w-[80%] self-center text-pretty text-center text-paragraph-3 text-sm lg:w-full">
            By continuing, you agree to our{' '}
            <Link href="#" className="underline underline-offset-4 hover:text-primary">Terms of Service</Link>
            {' '}and{' '}
            <Link href="#" className="underline underline-offset-4 hover:text-primary">Privacy Policy</Link>.
          </p>

          <div className="inline-flex items-center justify-center gap-1.5 text-sm leading-tight tracking-tight">
            <p className="text-paragraph-3">Don't have an account?</p>
            <Link 
              href="/sign-up" 
              className="isolate md:[isolation:auto] flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium text-sm outline-hidden transition-all duration-200 focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&amp;_svg]:pointer-events-none [&amp;_svg]:shrink-0 underline-offset-4 h-3.5 p-0 text-paragraph-3 underline hover:text-primary"
            >
              Sign up
            </Link>
          </div>
        </section>
        
        <div className="hidden h-full w-full items-center justify-center bg-dot-black-20 bg-surface lg:flex">
          <div className="h-full w-[80%] flex items-center justify-center relative">
            <div className="absolute inset-0 bg-black/5 rounded-full blur-[100px] animate-pulse" />
            <div className="absolute inset-12 bg-black/10 rounded-full blur-[60px] animate-pulse delay-150" />
            <div className="absolute inset-0 border border-black/[0.03] rounded-full" />
            <div className="absolute inset-10 border border-black/[0.05] rounded-full" />
            {/* Lock Icon for SignIn decoration */}
            <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center text-white shadow-2xl animate-float">
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CustomSignIn
