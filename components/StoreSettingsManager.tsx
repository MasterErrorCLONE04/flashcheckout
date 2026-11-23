'use client'

import React, { useEffect } from 'react'
import {
  Settings,
  Save,
  Loader2,
  Store,
  Globe,
  CreditCard,
  Sparkles,
  Bell,
  Shield,
  Users,
  KeyRound,
  Copy,
  RefreshCw,
  UserPlus,
} from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import {
  StoreSettingsData,
  useStoreSettingsState,
  TabGeneral,
  TabPagos,
  StoreSettingsSidebar,
  TABS,
  Toggle,
} from './store-settings'

interface StoreSettingsManagerProps {
  initialStore: StoreSettingsData
  isPro: boolean
}

export default function StoreSettingsManager({
  initialStore,
  isPro,
}: StoreSettingsManagerProps) {
  const {
    activeTab,
    setActiveTab,
    form,
    setForm,
    mpConnected,
    disconnectingMp,
    brebConfig,
    setBrebConfig,
    loadingBreb,
    savingBreb,
    logoPreview,
    loading,
    schedule,
    setSchedule,
    notifications,
    setNotifications,
    team,
    doubleFactor,
    setDoubleFactor,
    autologout,
    setAutologout,
    apiToken,
    activityLog,
    applyBrebPreset,
    handleConnectMercadoPago,
    handleDisconnectMercadoPago,
    handleSaveBrebConfig,
    handleLogoSelect,
    handleRemoveLogo,
    handleSubmit,
    handleInviteUser,
    handleToggleUser,
    handleRegenerateToken,
  } = useStoreSettingsState(initialStore)

  // Lock body scroll on desktop so /configuracion behaves as a Full-Screen Studio
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    if (!mq.matches) return
    const origBodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = origBodyOverflow
    }
  }, [])

  return (
    <div className="-mx-4 md:-mx-8 lg:-ml-12 lg:-mr-8 -mt-4 md:-mt-6 -mb-24 lg:-mb-12 lg:h-[calc(100vh-53px)] min-h-[680px] flex flex-col bg-[#FAFAFA] font-sans text-left select-none overflow-hidden">
      {/* ── 1. BARRA SUPERIOR DE ESTUDIO DE CONFIGURACIÓN ────────────────── */}
      <header className="h-13 shrink-0 bg-white border-b border-zinc-200 px-5 flex items-center justify-between gap-3 z-20">
        {/* Izquierda: Identidad limpia */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="w-7 h-7 rounded-lg bg-zinc-950 text-white flex items-center justify-center shrink-0">
            <Settings className="w-3.5 h-3.5" />
          </div>
          <h1 className="text-sm font-bold text-zinc-950 tracking-tight">
            Configuración
          </h1>
        </div>

        {/* Centro: Conmutador de 4 Secciones */}
        <div className="flex items-center bg-zinc-100 p-0.5 rounded-lg border border-zinc-200/80 overflow-x-auto no-scrollbar">
          {TABS.map(tab => {
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'h-7 px-3 rounded-md text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap border-0',
                  isActive
                    ? 'bg-white text-zinc-950 shadow-2xs'
                    : 'text-zinc-500 hover:text-zinc-900 bg-transparent'
                )}
              >
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Derecha: Guardar Cambios */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            disabled={loading}
            onClick={() => handleSubmit()}
            className="h-8 px-3.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 text-white text-[11px] font-bold flex items-center gap-1.5 cursor-pointer transition-all shadow-2xs active:scale-95 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5" />
            )}
            <span>{loading ? 'Guardando...' : 'Guardar Cambios'}</span>
          </button>
        </div>
      </header>

      {/* ── 2. CINTA ARQUITECTÓNICA DE RESUMEN DEL COMERCIO ──────────────── */}
      <section className="grid grid-cols-2 lg:grid-cols-4 bg-white border-b border-zinc-200 divide-x divide-y lg:divide-y-0 divide-zinc-200 shrink-0">
        <div className="px-5 py-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">
              Comercio Activo
            </span>
            <span className="text-xs font-black text-zinc-950 truncate block mt-0.5">
              {form.name} · {form.category}
            </span>
          </div>
          <Store className="w-4 h-4 text-zinc-700 shrink-0" />
        </div>

        <div className="px-5 py-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">
              Sede & Moneda
            </span>
            <span className="text-xs font-black text-zinc-950 truncate block mt-0.5">
              {form.city}, {form.country} ({form.currency})
            </span>
          </div>
          <Globe className="w-4 h-4 text-zinc-700 shrink-0" />
        </div>

        <div className="px-5 py-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">
              Recaudo Configurado
            </span>
            <span className="text-xs font-black text-zinc-950 truncate block mt-0.5">
              {brebConfig.enabled ? 'Bre-B QR Activo' : 'Bre-B Inactivo'} ·{' '}
              {mpConnected ? 'MP Conectado' : 'MP Sin vincular'}
            </span>
          </div>
          <CreditCard className="w-4 h-4 text-zinc-700 shrink-0" />
        </div>

        <div className="px-5 py-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 block">
              Nivel de Cuenta
            </span>
            <span className="text-xs font-black text-zinc-950 truncate block mt-0.5">
              {isPro ? 'Flashcheckout Pro' : 'Flashcheckout Starter'}
            </span>
          </div>
          <Sparkles className="w-4 h-4 text-zinc-700 shrink-0" />
        </div>
      </section>

      {/* ── 3. LIENZO DIVIDIDO: CONFIGURACIÓN PRINCIPAL + INSPECTOR DERECHO ─ */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
        {/* COLUMNA CENTRAL SCROLLABLE */}
        <main className="flex-1 min-w-0 h-full overflow-y-auto p-4 sm:p-5 space-y-4">
          {activeTab === 'general' && (
            <TabGeneral
              form={form}
              setForm={setForm}
              logoPreview={logoPreview}
              onLogoSelect={handleLogoSelect}
              onRemoveLogo={handleRemoveLogo}
              schedule={schedule}
              setSchedule={setSchedule}
            />
          )}

          {activeTab === 'pagos' && (
            <TabPagos
              mpConnected={mpConnected}
              disconnectingMp={disconnectingMp}
              onConnectMercadoPago={handleConnectMercadoPago}
              onDisconnectMercadoPago={handleDisconnectMercadoPago}
              brebConfig={brebConfig}
              setBrebConfig={setBrebConfig}
              loadingBreb={loadingBreb}
              savingBreb={savingBreb}
              onSaveBrebConfig={handleSaveBrebConfig}
              onApplyBrebPreset={applyBrebPreset}
              storeName={initialStore.name}
            />
          )}

          {activeTab === 'notificaciones' && (
            <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-2xs">
              <div className="px-5 py-3.5 border-b border-zinc-100 flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-zinc-950 text-white flex items-center justify-center shrink-0">
                  <Bell className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs font-black uppercase tracking-wider text-zinc-950">
                    Alertas & Notificaciones Operativas
                  </h3>
                  <p className="text-[10.5px] text-zinc-400 font-medium">
                    Elige qué eventos notificarte por WhatsApp o correo electrónico
                  </p>
                </div>
              </div>

              <div className="divide-y divide-zinc-100">
                {[
                  {
                    title: 'Nuevo pedido confirmado (WhatsApp)',
                    desc: 'Recibe una alerta inmediata en tu WhatsApp cuando entre una orden.',
                    key: 'orderWhatsapp' as const,
                  },
                  {
                    title: 'Nuevo pedido confirmado (Correo)',
                    desc: 'Envía copia del comprobante de pedido a tu correo de soporte.',
                    key: 'orderEmail' as const,
                  },
                  {
                    title: 'Alerta de stock crítico (WhatsApp)',
                    desc: 'Notificar cuando un producto activo llegue a 5 unidades o menos.',
                    key: 'stockWhatsapp' as const,
                  },
                  {
                    title: 'Cliente solicita asesor humano (WhatsApp)',
                    desc: 'Avísame cuando un comprador pida intervención humana en el chat.',
                    key: 'esperaWhatsapp' as const,
                  },
                  {
                    title: 'Resumen comercial diario (Correo)',
                    desc: 'Reporte consolidado con las ventas y conversaciones del día.',
                    key: 'resumenEmail' as const,
                  },
                ].map(item => (
                  <div
                    key={item.key}
                    className="px-5 py-3.5 flex items-center justify-between gap-4"
                  >
                    <div>
                      <p className="text-xs font-bold text-zinc-900">{item.title}</p>
                      <p className="text-[11px] text-zinc-500 mt-0.5">{item.desc}</p>
                    </div>
                    <Toggle
                      checked={notifications[item.key]}
                      onChange={val =>
                        setNotifications(prev => ({ ...prev, [item.key]: val }))
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'seguridad' && (
            <div className="space-y-4">
              {/* Miembros del Equipo */}
              <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-2xs">
                <div className="px-5 py-3.5 border-b border-zinc-100 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-zinc-950 text-white flex items-center justify-center shrink-0">
                      <Users className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h3 className="text-xs font-black uppercase tracking-wider text-zinc-950">
                        Equipo & Operadores CRM
                      </h3>
                      <p className="text-[10.5px] text-zinc-400 font-medium">
                        Personas autorizadas para atender chats y gestionar pedidos
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleInviteUser}
                    className="h-8 px-3 rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-[11px] font-bold inline-flex items-center gap-1.5 cursor-pointer"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Agregar miembro</span>
                  </button>
                </div>

                <div className="divide-y divide-zinc-100">
                  {team.map((member, idx) => (
                    <div
                      key={idx}
                      className="px-5 py-3 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-zinc-100 border border-zinc-200 font-black text-[11px] text-zinc-800 flex items-center justify-center shrink-0">
                          {member.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-zinc-950 truncate">
                              {member.name}
                            </span>
                            <span className="px-2 py-0.5 rounded bg-zinc-100 text-zinc-600 text-[10px] font-bold">
                              {member.role}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-400 truncate">{member.email}</p>
                        </div>
                      </div>

                      <Toggle
                        checked={member.active}
                        onChange={() => handleToggleUser(idx)}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Token de API & Seguridad */}
              <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-2xs">
                <div className="px-5 py-3.5 border-b border-zinc-100 flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-zinc-100 border border-zinc-200/80 text-zinc-800 flex items-center justify-center shrink-0">
                    <KeyRound className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-wider text-zinc-950">
                      Credenciales API & Seguridad
                    </h3>
                    <p className="text-[10.5px] text-zinc-400 font-medium">
                      Llave de integración para webhooks externos y políticas de sesión
                    </p>
                  </div>
                </div>

                <div className="p-5 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-zinc-600 block">
                      Token Privado de API
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={apiToken}
                        className="flex-1 h-9 bg-zinc-50 border border-zinc-200 rounded-xl px-3 font-mono text-xs font-bold text-zinc-800 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(apiToken)
                          toast.success('Token copiado al portapapeles')
                        }}
                        className="h-9 px-3 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleRegenerateToken}
                        className="h-9 px-3 rounded-xl border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>Rotar</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    <div className="p-3 rounded-xl border border-zinc-200 bg-zinc-50/40 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold text-zinc-900">Verificación 2FA</p>
                        <p className="text-[10.5px] text-zinc-500">
                          Protección extra en inicio de sesión
                        </p>
                      </div>
                      <Toggle checked={doubleFactor} onChange={setDoubleFactor} />
                    </div>

                    <div className="p-3 rounded-xl border border-zinc-200 bg-zinc-50/40 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-bold text-zinc-900">Cierre por inactividad</p>
                        <p className="text-[10.5px] text-zinc-500">
                          Cerrar sesión tras 12h sin uso
                        </p>
                      </div>
                      <Toggle checked={autologout} onChange={setAutologout} />
                    </div>
                  </div>

                  {/* Bitácora de actividad */}
                  <div className="pt-2 space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                      <Shield className="w-3 h-3" />
                      Bitácora de Actividad Reciente
                    </span>
                    <div className="rounded-xl border border-zinc-200 divide-y divide-zinc-100 text-xs">
                      {activityLog.slice(0, 4).map((log, i) => (
                        <div
                          key={i}
                          className="px-3.5 py-2.5 flex items-center justify-between gap-3"
                        >
                          <div>
                            <span className="font-bold text-zinc-900">{log.event}</span>
                            <span className="text-[11px] text-zinc-500 block">
                              {log.detail}
                            </span>
                          </div>
                          <span className="text-[10px] font-semibold text-zinc-400 shrink-0">
                            {log.time}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>

        {/* COLUMNA DERECHA FULL-HEIGHT: CONTROL OPERATIVO, REGIÓN Y PLAN */}
        <StoreSettingsSidebar
          form={form}
          setForm={setForm}
          loading={loading}
          onSubmit={() => handleSubmit()}
          onNavigateTab={setActiveTab}
          isPro={isPro}
        />
      </div>
    </div>
  )
}
