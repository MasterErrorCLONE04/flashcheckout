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
  Lock,
} from 'lucide-react'
import { loadConnectAndInitialize } from '@stripe/connect-js'
import {
  ConnectComponentsProvider,
  ConnectAccountOnboarding,
} from '@stripe/react-connect-js'
import type { StripeConnectInstance } from '@stripe/connect-js'
import { cn } from '@/lib/utils'

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
            colorPrimary: '#0066CC',
            colorBackground: '#ffffff',
            colorText: '#1D1D1F',
            borderRadius: '16px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
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
    <div className="bg-white border border-black/[0.03] rounded-[2.5rem] p-10 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/[0.02] rounded-full blur-[100px] -mr-32 -mt-32" />
      
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div>
          <p className="text-xs font-bold tracking-widest text-primary mb-2 uppercase">Pasarela de pagos</p>
          <h2 className="text-2xl font-bold text-black tracking-tight flex items-center gap-3 font-display">
            Pagos con tarjeta
          </h2>
        </div>
        <div className="w-12 h-12 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-300">
           <CreditCard className="w-6 h-6" />
        </div>
      </div>

      <p className="text-sm text-zinc-400 font-bold tracking-widest mb-10 max-w-xl leading-relaxed uppercase">
        Activa cobros globales sin salir de FlashCheckout. Integración nativa con Stripe para una experiencia de pago premium y segura.
      </p>

      <div className="rounded-2xl border border-black/[0.02] bg-zinc-50 p-6 text-xs font-bold text-zinc-400 tracking-widest mb-10 space-y-4 uppercase">
        <p className="text-black flex items-center gap-3 font-display">
          <Shield className="w-4 h-4 text-primary" />
          Requisitos de verificación (Stripe)
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-xl border border-black/[0.02] flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-primary" />
            Titular e Identificación
          </div>
          <div className="bg-white p-4 rounded-xl border border-black/[0.02] flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-primary" />
            Cuenta Bancaria para Depósitos
          </div>
        </div>
        <p className="text-[11px] opacity-60 leading-relaxed uppercase">
          Solo solicitamos información esencial. Cumplimos con los más altos estándares internacionales de seguridad financiera.
        </p>
      </div>

      {/* Progress indicators */}
      <div className="grid grid-cols-3 gap-4 mb-10">
        <StepPill
          done={connected}
          label="Cuenta Creada"
          icon={<Sparkles className="w-4 h-4" />}
        />
        <StepPill
          done={detailsSubmitted || chargesEnabled}
          label="Sincronizado"
          icon={<Building2 className="w-4 h-4" />}
        />
        <StepPill
          done={chargesEnabled}
          label="Activo"
          icon={<CheckCircle2 className="w-4 h-4" />}
        />
      </div>

      {loading ? (
        <div className="flex items-center gap-3 text-zinc-400 text-xs font-bold uppercase tracking-[0.2em]">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          Validando Estado...
        </div>
      ) : (
        <div className="space-y-6 relative z-10">
          {chargesEnabled ? (
            <div className="flex items-center gap-4 rounded-2xl border border-primary/10 bg-primary/[0.02] px-6 py-5 text-sm font-bold tracking-widest text-primary animate-in fade-in uppercase">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <p>Tu terminal está lista para procesar cobros electrónicos.</p>
            </div>
          ) : connected ? (
            <div className="flex items-center gap-4 rounded-2xl border border-amber-200 bg-amber-50 px-6 py-5 text-sm font-bold tracking-widest text-amber-700 animate-in zoom-in-95 uppercase">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p>Falta validación adicional para activar los cobros.</p>
            </div>
          ) : null}

          {error && (
            <p className="text-[10px] font-bold tracking-widest text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              {error}
            </p>
          )}

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <button
              type="button"
              onClick={openEmbeddedOnboarding}
              disabled={chargesEnabled || bootingConnect}
              className={cn(
                "h-16 inline-flex items-center justify-center gap-3 rounded-full text-sm font-bold tracking-widest px-8 transition-all active:scale-95 min-w-[240px] uppercase",
                chargesEnabled ? "bg-zinc-100 text-zinc-400 cursor-default" : "bg-primary text-white hover:bg-primary-hover"
              )}
            >
              {bootingConnect ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CreditCard className="w-4 h-4" />
              )}
              {chargesEnabled
                ? 'Panel activo'
                : connected
                  ? 'Continuar configuración'
                  : 'Configurar pagos'}
            </button>
            <a
              href="https://dashboard.stripe.com/connect"
              target="_blank"
              rel="noopener noreferrer"
              className="h-16 inline-flex items-center justify-center gap-3 rounded-full border border-black/[0.05] bg-white text-zinc-400 hover:text-black hover:bg-zinc-50 text-sm font-bold tracking-widest px-8 transition-all active:scale-95 uppercase"
            >
              <ExternalLink className="w-4 h-4" />
              External dashboard
            </a>
          </div>
        </div>
      )}

      {modalOpen && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center p-6 sm:p-10 animate-in fade-in duration-300"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="absolute inset-0 bg-white/60 backdrop-blur-xl"
            aria-hidden
          />
          <div className="relative w-full max-w-xl max-h-[min(92vh,880px)] flex flex-col rounded-[3rem] border border-black/[0.05] bg-white overflow-hidden animate-in zoom-in-95 duration-500">
            <div className="flex items-start justify-between gap-6 px-10 py-10 border-b border-black/[0.02] bg-gradient-to-r from-primary/[0.03] to-transparent">
              <div>
                <p className="text-xs font-bold tracking-widest text-primary mb-3 uppercase">
                  FlashCheckout × Stripe
                </p>
                <h3 className="text-2xl font-bold text-black tracking-tight font-display">
                  Configuración segura
                </h3>
                <p className="text-xs text-zinc-400 font-bold tracking-widest mt-3 leading-relaxed max-w-sm uppercase">
                  Proceso de validación internacional. Los datos están protegidos por el cifrado de Stripe.
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="w-12 h-12 rounded-full text-zinc-300 hover:bg-zinc-50 hover:text-black flex items-center justify-center transition-all active:scale-90"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="px-10 py-4 border-b border-black/[0.02] bg-zinc-50/50 flex flex-wrap items-center gap-4 text-[11px] font-bold text-zinc-400 tracking-widest uppercase">
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 border border-black/[0.02]">
                <Lock className="w-3 h-3 text-primary" />
                Estado seguro
                {stepHint ? `: ${stepHint}` : ': Iniciando'}
              </span>
              <button
                type="button"
                onClick={() => void retrySessionInModal()}
                className="text-primary hover:text-zinc-600 ml-auto transition-colors"
                disabled={bootingConnect}
              >
                Reintentar Sesión
              </button>
            </div>

            <div className="flex-1 min-h-[min(420px,50vh)] overflow-y-auto p-10 bg-white">
              {connectBootError && (
                <p className="text-xs font-bold uppercase tracking-widest text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-6">
                  {connectBootError}
                </p>
              )}
              {bootingConnect && !connectInstance && (
                <div className="flex flex-col items-center justify-center gap-6 py-20 text-zinc-400">
                  <Loader2 className="w-10 h-10 animate-spin text-primary" />
                  <p className="text-xs font-bold tracking-widest uppercase">Sincronizando con Stripe...</p>
                </div>
              )}
              {connectInstance && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
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
                </div>
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
      className={cn(
        "rounded-2xl border px-4 py-5 flex flex-col items-center gap-3 transition-all flex-1 group",
        done
          ? "border-primary/10 bg-primary/[0.02] text-primary"
          : "border-black/[0.02] bg-zinc-50 text-zinc-300"
      )}
    >
      <span className={cn("transition-transform group-hover:scale-110", done ? "text-primary" : "opacity-30")}>
        {icon}
      </span>
      <span className="text-[11px] font-bold tracking-widest leading-none text-center uppercase">
        {label}
      </span>
    </div>
  )
}
