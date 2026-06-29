'use client'

import { useState } from 'react'
import { Shield, ShieldAlert, ShieldCheck, Smartphone, Check, Loader2, Upload, AlertTriangle, Info } from 'lucide-react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

type StoreProps = {
  id: string
  name: string
  whatsapp: string
  active: boolean
  verificationLevel: number
  whatsappVerified: boolean
  pausedReason: string | null
  idProofUrl: string | null
  strikes: number
}

export default function StoreVerificationManager({
  store: initialStore,
  currentVolume,
  currentCount
}: {
  store: StoreProps
  currentVolume: number
  currentCount: number
}) {
  const router = useRouter()
  const [store, setStore] = useState<StoreProps>(initialStore)
  const [otpCode, setOtpCode] = useState('')
  const [verifyingOtp, setVerifyingOtp] = useState(false)
  const [resendingOtp, setResendingOtp] = useState(false)
  const [uploadingDoc, setUploadingDoc] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const maxVolume = 500000
  const maxCount = 10
  const volPct = Math.min((currentVolume / maxVolume) * 100, 100)
  const countPct = Math.min((currentCount / maxCount) * 100, 100)

  async function handleVerifyOtp() {
    if (!otpCode.trim()) {
      toast.error('Ingresa el código OTP')
      return
    }
    setVerifyingOtp(true)
    try {
      const res = await fetch('/api/stores/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otpCode: otpCode.trim() })
      })
      const data = await res.json()
      if (res.ok && data.success) {
        setStore(prev => ({ ...prev, whatsappVerified: true }))
        toast.success('¡Número de WhatsApp verificado con éxito!')
        router.refresh()
      } else {
        toast.error(data.error || 'Código incorrecto')
      }
    } catch {
      toast.error('Error de red al verificar')
    } finally {
      setVerifyingOtp(false)
    }
  }

  async function handleResendOtp() {
    setResendingOtp(true)
    try {
      const res = await fetch('/api/stores/resend-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      const data = await res.json()
      if (res.ok && data.success) {
        toast.success('Código reenviado a tu WhatsApp')
      } else {
        toast.error(data.error || 'Error al reenviar código')
      }
    } catch {
      toast.error('Error de conexión')
    } finally {
      setResendingOtp(false)
    }
  }

  async function handleUploadAndVerify(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedFile) {
      toast.error('Por favor selecciona una foto de tu documento')
      return
    }

    setUploadingDoc(true)
    try {
      // 1. Subir a Supabase usando el endpoint general
      const formData = new FormData()
      formData.append('file', selectedFile)

      const uploadRes = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      const uploadData = await uploadRes.json()

      if (!uploadRes.ok || !uploadData.success) {
        toast.error(uploadData.error || 'Error al subir la imagen')
        setUploadingDoc(false)
        return
      }

      const idProofUrl = uploadData.url

      // 2. Verificar identidad y actualizar nivel
      const verifyRes = await fetch('/api/stores/verify-identity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idProofUrl })
      })
      const verifyData = await verifyRes.json()

      if (verifyRes.ok && verifyData.success) {
        setStore(prev => ({
          ...prev,
          verificationLevel: 1,
          active: true,
          pausedReason: null,
          idProofUrl
        }))
        toast.success('¡Identidad verificada e ingreso a Nivel 1 completado!')
        setSelectedFile(null)
        router.refresh()
      } else {
        toast.error(verifyData.error || 'Fallo la verificación de identidad')
      }
    } catch {
      toast.error('Error de red durante la verificación')
    } finally {
      setUploadingDoc(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Banner de Tienda Pausada por Disputa */}
      {(!store.active || store.pausedReason === 'dispute') && (
        <div className="p-5 bg-red-50 border border-red-200 rounded-lg flex items-start gap-4 animate-in fade-in duration-300">
          <ShieldAlert className="w-6 h-6 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h3 className="font-bold text-red-900 text-sm">Tienda temporalmente pausada</h3>
            <p className="text-xs text-red-700 leading-relaxed font-medium">
              Hemos desactivado tu catálogo visual y tu chatbot de ventas debido a disputas o reportes de fraude recibidos de compradores. Para reactivar tu servicio inmediatamente y restablecer tus ventas, necesitas verificar tu identidad subiendo una foto de tu documento (Cédula) abajo.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Panel Izquierdo: Nivel y Validación WhatsApp */}
        <div className="bg-white border border-zinc-200/80 rounded-lg p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${
                store.verificationLevel === 1 
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-600'
                  : 'bg-zinc-50 border-zinc-200 text-zinc-600'
              }`}>
                {store.verificationLevel === 1 ? <ShieldCheck className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-900 tracking-tight">
                  Nivel de seguridad: {store.verificationLevel === 1 ? 'Nivel 1 (Verificado)' : 'Nivel 0 (Básico)'}
                </h4>
                <p className="text-[11px] font-bold text-zinc-400 tracking-widest mt-0.5">
                  {store.verificationLevel === 1 ? 'Sin límites de ventas manuales' : 'Límites activos para transferencias'}
                </p>
              </div>
            </div>
          </div>

          <div className="h-px bg-zinc-100 w-full" />

          {/* Validación OTP de WhatsApp */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Smartphone className={`w-4 h-4 ${store.whatsappVerified ? 'text-emerald-600' : 'text-zinc-400'}`} />
              <span className="text-xs font-bold text-zinc-700">Verificación del WhatsApp Administrador</span>
            </div>

            {store.whatsappVerified ? (
              <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50/50 border border-emerald-100 rounded-lg text-emerald-700 text-xs font-semibold select-none w-fit">
                <Check className="w-4 h-4 stroke-[3px]" />
                <span>Número +{store.whatsapp} Verificado</span>
              </div>
            ) : (
              <div className="space-y-3 p-4 bg-zinc-50 rounded-lg border border-zinc-100">
                <p className="text-xs text-zinc-500 font-medium">
                  Te hemos enviado un código OTP a tu WhatsApp *+{store.whatsapp}* para verificar que eres el propietario.
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="Código de 6 dígitos"
                    value={otpCode}
                    onChange={e => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    className="bg-white border border-zinc-200 rounded-lg px-4 py-2 text-xs font-semibold tracking-widest placeholder:tracking-normal w-36 outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-100 transition-all text-center"
                  />
                  <button
                    onClick={handleVerifyOtp}
                    disabled={verifyingOtp}
                    className="bg-zinc-955 hover:bg-zinc-900 text-white font-bold text-xs rounded-lg px-4 py-2 active:scale-95 transition-transform flex items-center gap-1 cursor-pointer"
                  >
                    {verifyingOtp ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Verificar'}
                  </button>
                  <button
                    onClick={handleResendOtp}
                    disabled={resendingOtp}
                    className="border border-zinc-200 hover:bg-zinc-100 text-zinc-600 font-bold text-xs rounded-lg px-3 py-2 active:scale-95 transition-transform cursor-pointer"
                  >
                    {resendingOtp ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Reenviar'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Panel Derecho: Límites Activos o Verificación de Identidad */}
        <div className="bg-white border border-zinc-200/80 rounded-lg p-6 flex flex-col justify-between">
          {store.verificationLevel === 1 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center space-y-4 flex-1">
              <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100 animate-pulse">
                <ShieldCheck className="w-8 h-8 text-emerald-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-zinc-900">Verificación Completa</h3>
                <p className="text-xs text-zinc-500 max-w-xs mx-auto mt-2 leading-relaxed font-medium">
                  Tu negocio está verificado en **Nivel 1**. Has desbloqueado el límite de volumen de ventas por transferencia manual y tu catálogo está 100% activo.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6 flex-1 flex flex-col justify-between">
              {/* Progreso de Límites de Venta */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-zinc-700 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-zinc-400" />
                    Límites Mensuales (Nivel 0)
                  </h4>
                </div>

                {/* Límite de Volumen */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-bold text-zinc-500">
                    <span>Volumen de Ventas</span>
                    <span className="tabular-nums">${currentVolume.toLocaleString()} / $${maxVolume.toLocaleString()} COP</span>
                  </div>
                  <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        volPct >= 100 ? 'bg-red-500' : volPct >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${volPct}%` }}
                    />
                  </div>
                </div>

                {/* Límite de Conteo */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[11px] font-bold text-zinc-500">
                    <span>Transacciones</span>
                    <span className="tabular-nums">{currentCount} / {maxCount} aprobadas</span>
                  </div>
                  <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        countPct >= 100 ? 'bg-red-500' : countPct >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${countPct}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Subir Documento para Nivel 1 */}
              <form onSubmit={handleUploadAndVerify} className="space-y-4 pt-4 border-t border-zinc-100">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-zinc-400 tracking-wider">
                    Subir cédula para desbloquear límites o reactivar
                  </label>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center justify-center gap-2 border-2 border-dashed border-zinc-200 hover:border-zinc-300 rounded-lg px-4 py-3 cursor-pointer text-xs font-semibold text-zinc-600 bg-zinc-50 hover:bg-zinc-100/50 transition-all flex-1">
                      <Upload className="w-4 h-4 text-zinc-400" />
                      <span>{selectedFile ? selectedFile.name : 'Seleccionar Documento'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={e => setSelectedFile(e.target.files?.[0] || null)}
                        className="hidden"
                        required
                      />
                    </label>
                    <button
                      type="submit"
                      disabled={uploadingDoc || !selectedFile}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg h-11 px-5 flex items-center justify-center gap-1 active:scale-95 transition-transform disabled:opacity-40 cursor-pointer"
                    >
                      {uploadingDoc ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Subiendo...
                        </>
                      ) : (
                        'Verificar e Ir a Nivel 1'
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
