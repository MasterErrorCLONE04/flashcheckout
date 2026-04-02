'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  CreditCard,
  Loader2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  X,
  Sparkles,
  Shield,
  Building2,
} from 'lucide-react'
import { loadConnectAndInitialize } from '@stripe/connect-js'
import {
  ConnectComponentsProvider,
  ConnectAccountOnboarding,
} from '@stripe/react-connect-js'
import type { StripeConnectInstance } from '@stripe/connect-js'

const PK = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

export default function StripeConnectSection() {
  const [loading, setLoading] = useState(true)
  const [connected, setConnected] = useState(false)
  const [chargesEnabled, setChargesEnabled] = useState(false)
  const [detailsSubmitted, setDetailsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [modalOpen, setModalOpen] = useState(false)
  const [connectInstance, setConnectInstance] =
    useState<StripeConnectInstance | null>(null)
  const [connectBootError, setConnectBootError] = useState<string | null>(null)
  const [bootingConnect, setBootingConnect] = useState(false)
  const [stepHint, setStepHint] = useState<string | null>(null)

  const prefetchedRef = useRef(false)

  const load = useCallback(async () => {
    setError(null)
    try {
      const res = await fetch('/api/stripe/connect')
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error al cargar')
      setConnected(!!data.connected)
      setChargesEnabled(!!data.chargesEnabled)
      setDetailsSubmitted(!!data.detailsSubmitted)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  /** Crea la cuenta en Stripe en segundo plano para abrir el modal más rápido. */
  useEffect(() => {
    if (loading || chargesEnabled || prefetchedRef.current) return
    prefetchedRef.current = true
    void fetch('/api/stripe/connect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ intent: 'ensure_account' }),
    }).catch(() => {})
  }, [loading, chargesEnabled])

  const fetchClientSecret = useCallback(async () => {
    try {
      const res = await fetch('/api/stripe/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ intent: 'account_session' }),
      })
      const data = await res.json()
      if (!res.ok) {
        const msg = data.error || 'No se pudo iniciar la sesión segura'
        setConnectBootError(msg)
        throw new Error(msg)
      }
      return data.clientSecret as string
    } catch (e) {
      if (e instanceof Error) {
        setConnectBootError(e.message)
      }
      throw e
    }
  }, [])

  const closeModal = useCallback(() => {
    setModalOpen(false)
    setConnectInstance(null)
    setConnectBootError(null)
    setStepHint(null)
    setBootingConnect(false)
  }, [])

  const handleOnboardingExit = useCallback(async () => {
    closeModal()
    setLoading(true)
    await load()
  }, [closeModal, load])

  const initConnectInstance = useCallback(async () => {
    if (!PK) {
      setError('Falta NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY en el entorno.')
      return
    }
    setConnectBootError(null)
    setBootingConnect(true)
    setStepHint(null)

    try {
      const instance = loadConnectAndInitialize({
        publishableKey: PK,
        fetchClientSecret,
        locale: 'es',
        appearance: {
          overlays: 'dialog',
          variables: {
            colorPrimary: '#059669',
            colorBackground: '#ffffff',
            colorText: '#0f172a',
            borderRadius: '12px',
            fontFamily: 'var(--font-outfit), ui-sans-serif, system-ui, sans-serif',
          },
        },
      })
      setConnectInstance(instance)
    } catch (e) {
      setConnectBootError(
        e instanceof Error ? e.message : 'No se pudo cargar Stripe Connect'
      )
    } finally {
      setBootingConnect(false)
    }
  }, [fetchClientSecret])

  const openEmbeddedOnboarding = useCallback(async () => {
    setModalOpen(true)
    await initConnectInstance()
  }, [initConnectInstance])

  const retrySessionInModal = useCallback(async () => {
    setConnectInstance(null)
    setConnectBootError(null)
    await initConnectInstance()
  }, [initConnectInstance])

  return (
    <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
      <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
        <CreditCard className="w-5 h-5 text-emerald-600" />
        Cobros con tarjeta (Stripe)
      </h2>
      <p className="text-sm text-muted-foreground mb-4 max-w-xl">
        Activa cobros con tarjeta sin salir de FlashCheckout: el formulario de Stripe va
        dentro de un panel propio, con el mínimo de pasos posible en cada momento.
      </p>

      <div className="rounded-xl border border-border/80 bg-muted/30 px-4 py-3 text-xs text-muted-foreground mb-6 space-y-1.5">
        <p className="font-medium text-foreground/80 flex items-center gap-2">
          <Shield className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
          Qué pedirá Stripe (regulación, no se puede omitir)
        </p>
        <ul className="list-disc pl-5 space-y-0.5">
          <li>Nombre e identificación del titular</li>
          <li>Cuenta bancaria para recibir transferencias</li>
        </ul>
        <p className="pt-1 text-[11px] leading-relaxed">
          Solo pedimos lo necesario en cada fase; el resto puede pedirse más adelante
          cuando tu volumen lo requiera. En algunos casos Stripe abre una ventana extra
          para verificar identidad.
        </p>
      </div>

      {/* Progreso global (fuera del modal) */}
      <div className="grid grid-cols-3 gap-2 mb-6 text-center text-[11px] sm:text-xs">
        <StepPill
          done={connected}
          label="Cuenta creada"
          icon={<Sparkles className="w-3.5 h-3.5" />}
        />
        <StepPill
          done={detailsSubmitted || chargesEnabled}
          label="Datos en Stripe"
          icon={<Building2 className="w-3.5 h-3.5" />}
        />
        <StepPill
          done={chargesEnabled}
          label="Cobros activos"
          icon={<CheckCircle2 className="w-3.5 h-3.5" />}
        />
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Loader2 className="w-4 h-4 animate-spin" />
          Comprobando estado…
        </div>
      ) : (
        <div className="space-y-4">
          {chargesEnabled ? (
            <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50/80 px-4 py-3 text-sm text-emerald-900">
              <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Cobros con tarjeta activos</p>
                <p className="text-emerald-800/90 mt-1">
                  Tus clientes pueden pagar con tarjeta en la tienda pública.
                </p>
              </div>
            </div>
          ) : connected ? (
            <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/90 px-4 py-3 text-sm text-amber-950">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Falta un paso</p>
                <p className="text-amber-900/90 mt-1">
                  Abre el panel embebido para completar o corregir datos.
                </p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Aún no has activado cobros con tarjeta para tu tienda.
            </p>
          )}

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <button
              type="button"
              onClick={openEmbeddedOnboarding}
              disabled={chargesEnabled || bootingConnect}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-5 py-3 disabled:opacity-50"
            >
              {bootingConnect ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CreditCard className="w-4 h-4" />
              )}
              {chargesEnabled
                ? 'Cobros activos'
                : connected
                  ? 'Continuar / corregir datos'
                  : 'Activar cobros con tarjeta'}
            </button>
            <a
              href="https://dashboard.stripe.com/connect"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border text-sm font-medium px-5 py-3 hover:bg-muted/60 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Panel Stripe
            </a>
          </div>
        </div>
      )}

      {modalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="stripe-onboarding-title"
        >
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
            aria-hidden
          />
          <div className="relative w-full max-w-lg max-h-[min(92vh,880px)] flex flex-col rounded-2xl border border-border bg-background shadow-2xl overflow-hidden">
            <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-border bg-gradient-to-r from-emerald-600/10 to-transparent">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-700/90">
                  FlashCheckout
                </p>
                <h3
                  id="stripe-onboarding-title"
                  className="text-lg font-bold text-foreground mt-0.5"
                >
                  Configuración de cobros
                </h3>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                  Formulario seguro de Stripe. Puedes cerrar cuando termines; guardamos el
                  avance automáticamente.
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="shrink-0 rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                aria-label="Cerrar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-5 py-2 border-b border-border/60 bg-muted/20 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1 rounded-full bg-white/80 px-2 py-0.5 border border-border/60">
                Paso Stripe
                {stepHint ? `: ${stepHint}` : ': en curso'}
              </span>
              <button
                type="button"
                onClick={() => void retrySessionInModal()}
                className="text-emerald-700 font-medium hover:underline ml-auto disabled:opacity-50"
                disabled={bootingConnect}
              >
                Reintentar sesión
              </button>
            </div>

            <div className="flex-1 min-h-[min(420px,50vh)] overflow-y-auto p-4 sm:p-5">
              {connectBootError && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2 mb-3">
                  {connectBootError}
                </p>
              )}
              {bootingConnect && !connectInstance && (
                <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                  <p className="text-sm">Preparando el panel seguro…</p>
                </div>
              )}
              {connectInstance && (
                <ConnectComponentsProvider connectInstance={connectInstance}>
                  <ConnectAccountOnboarding
                    onExit={handleOnboardingExit}
                    onStepChange={sc => setStepHint(sc.step)}
                    onLoadError={({ error: err }) => {
                      setConnectBootError(err.message ?? 'Error al cargar onboarding')
                    }}
                    collectionOptions={{
                      fields: 'currently_due',
                      futureRequirements: 'omit',
                    }}
                  />
                </ConnectComponentsProvider>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function StepPill({
  done,
  label,
  icon,
}: {
  done: boolean
  label: string
  icon: React.ReactNode
}) {
  return (
    <div
      className={`rounded-lg border px-2 py-2 flex flex-col items-center gap-1 transition-colors ${
        done
          ? 'border-emerald-300 bg-emerald-50/90 text-emerald-900'
          : 'border-border bg-muted/40 text-muted-foreground'
      }`}
    >
      <span className={done ? 'text-emerald-600' : 'opacity-50'}>{icon}</span>
      <span className="font-medium leading-tight">{label}</span>
    </div>
  )
}
