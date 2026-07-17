'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { useUser } from '@clerk/nextjs'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Button } from '@/components/ui/button'
import {
  Building,
  ShieldCheck,
  Zap,
  Globe,
  Database,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Layers,
  Clock,
  PhoneCall,
  Loader2
} from 'lucide-react'

export default function EnterprisePage() {
  const { user } = useUser()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    integration: 'Shopify',
    details: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.email || !formData.phone || !formData.company) {
      alert('Por favor completa todos los campos requeridos.')
      return
    }
    
    setIsSubmitting(true)
    
    // Simulate API request to sales/lead CRM
    setTimeout(() => {
      setIsSubmitting(false)
      setIsSuccess(true)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111827] font-sans antialiased">
      {/* Shared Header Navbar */}
      <Navbar userId={user?.id ?? undefined} />

      {/* Enterprise Hero Section */}
      <section className="w-full pt-32 pb-16 md:pt-40 md:pb-24 relative overflow-hidden">
        {/* Glow effect backgrounds */}
        <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-zinc-200/40 blur-[130px] pointer-events-none rounded-full" />
        <div className="absolute top-1/4 left-0 w-[400px] h-[400px] bg-zinc-200/30 blur-[110px] pointer-events-none rounded-full" />

        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Copy & Core Value Props */}
            <div className="lg:col-span-7 flex flex-col gap-6 items-start text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-zinc-200 bg-white text-zinc-800 text-xs font-semibold shadow-sm">
                <Building className="w-3.5 h-3.5 text-zinc-950" />
                <span className="uppercase tracking-wider text-[10px] font-bold text-zinc-500">Corporativo</span>
                <span className="text-zinc-300">|</span>
                <span className="text-zinc-800">Flashcheckouts Enterprise</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight text-zinc-950 font-display leading-[1.1]">
                Checkout y agentes IA diseÃƒÂ±ados para escala empresarial
              </h1>
              
              <p className="text-lg text-zinc-500 leading-relaxed max-w-2xl font-normal">
                Automatiza transacciones complejas, sincroniza tu inventario en tiempo real con tu ERP y despliega agentes inteligentes de WhatsApp con soporte de SLA empresarial y seguridad garantizada.
              </p>

              {/* Pillars list */}
              <div className="grid sm:grid-cols-2 gap-6 w-full pt-6 border-t border-zinc-200/60 mt-4">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0 border border-zinc-200/50">
                    <Database className="w-5 h-5 text-zinc-900" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-zinc-950 mb-1">IntegraciÃƒÂ³n ERP / CRM</h4>
                    <p className="text-xs text-zinc-500 leading-relaxed font-normal">
                      SincronizaciÃƒÂ³n nativa con SAP, Oracle, Zoho CRM, Salesforce y bases de datos SQL corporativas.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0 border border-zinc-200/50">
                    <ShieldCheck className="w-5 h-5 text-zinc-900" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-zinc-950 mb-1">Seguridad de Nivel Bancario</h4>
                    <p className="text-xs text-zinc-500 leading-relaxed font-normal">
                      EncriptaciÃƒÂ³n de datos AES-256 en trÃƒÂ¡nsito y en reposo. Cumplimiento estricto de privacidad.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0 border border-zinc-200/50">
                    <Layers className="w-5 h-5 text-zinc-900" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-zinc-950 mb-1">MÃƒÂºltiples Canales</h4>
                    <p className="text-xs text-zinc-500 leading-relaxed font-normal">
                      Despliega agentes IA concurrentes en WhatsApp Business API, Instagram Direct y Facebook Messenger.
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0 border border-zinc-200/50">
                    <Clock className="w-5 h-5 text-zinc-900" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-zinc-950 mb-1">SLA y Soporte Dedicado</h4>
                    <p className="text-xs text-zinc-500 leading-relaxed font-normal">
                      Canal de Slack dedicado, soporte 24/7 y tiempo de respuesta garantizado por contrato inferior a 30 min.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Lead Capture Form */}
            <div className="lg:col-span-5 w-full">
              <div className="bg-white border border-zinc-200 p-8 rounded-3xl shadow-xl relative overflow-hidden">
                
                <AnimatePresence mode="wait">
                  {!isSuccess ? (
                    <motion.div
                      key="form-container"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-6"
                    >
                      <div className="text-left">
                        <h3 className="text-xl font-bold text-zinc-950 mb-1.5">Agenda una DemostraciÃƒÂ³n</h3>
                        <p className="text-xs text-zinc-500 font-normal leading-relaxed">
                          Completa el formulario y un especialista en integraciones empresariales se pondrÃƒÂ¡ en contacto contigo en las prÃƒÂ³ximas 2 horas hÃƒÂ¡biles.
                        </p>
                      </div>

                      <form onSubmit={handleSubmit} className="space-y-4 text-left">
                        <div>
                          <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Nombre Completo *</label>
                          <input
                            type="text"
                            required
                            placeholder="Ej. Juan PÃƒÂ©rez"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full h-11 border border-zinc-200 rounded-lg px-4 text-sm font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-950 transition-all placeholder:text-zinc-400"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Email Corporativo *</label>
                            <input
                              type="email"
                              required
                              placeholder="juan@empresa.com"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              className="w-full h-11 border border-zinc-200 rounded-lg px-4 text-sm font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-950 transition-all placeholder:text-zinc-400"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">WhatsApp / Celular *</label>
                            <input
                              type="tel"
                              required
                              placeholder="+57 300 123 4567"
                              value={formData.phone}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                              className="w-full h-11 border border-zinc-200 rounded-lg px-4 text-sm font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-950 transition-all placeholder:text-zinc-400"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Nombre de la Empresa *</label>
                          <input
                            type="text"
                            required
                            placeholder="Mi Empresa S.A.S"
                            value={formData.company}
                            onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                            className="w-full h-11 border border-zinc-200 rounded-lg px-4 text-sm font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-950 transition-all placeholder:text-zinc-400"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Sistema a Integrar</label>
                          <select
                            value={formData.integration}
                            onChange={(e) => setFormData({ ...formData, integration: e.target.value })}
                            className="w-full h-11 border border-zinc-200 rounded-lg px-4 text-sm font-semibold text-zinc-900 bg-white focus:outline-none focus:ring-2 focus:ring-zinc-950 transition-all"
                          >
                            <option value="Shopify">Shopify Plus</option>
                            <option value="Salesforce">Salesforce Commerce Cloud</option>
                            <option value="SAP">SAP / Oracle ERP</option>
                            <option value="Zoho">Zoho / HubSpot CRM</option>
                            <option value="Custom">Base de datos / API personalizada</option>
                            <option value="Otro">Otro sistema</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">Detalles de tu Requerimiento</label>
                          <textarea
                            placeholder="Describe brevemente tus necesidades de canales, volumen de ÃƒÂ³rdenes mensuales o integraciones especÃƒÂ­ficas."
                            rows={3}
                            value={formData.details}
                            onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                            className="w-full border border-zinc-200 rounded-lg p-4 text-sm font-medium text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-950 transition-all placeholder:text-zinc-400 resize-none"
                          />
                        </div>

                        <Button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full h-12 bg-zinc-950 hover:bg-zinc-900 text-white font-semibold rounded-lg flex items-center justify-center gap-2 mt-2 transition-all active:scale-[0.98]"
                        >
                          {isSubmitting ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin text-white" />
                              Procesando solicitud...
                            </>
                          ) : (
                            <>
                              Enviar Solicitud
                              <ArrowRight className="w-4 h-4 text-white" />
                            </>
                          )}
                        </Button>
                      </form>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="success-container"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="py-12 flex flex-col items-center justify-center text-center gap-4"
                    >
                      <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-500 shadow-sm">
                        <CheckCircle2 className="w-8 h-8" />
                      </div>
                      <h3 className="text-2xl font-bold text-zinc-950 tracking-tight">Ã‚Â¡Solicitud Recibida!</h3>
                      <p className="text-sm text-zinc-500 font-normal leading-relaxed max-w-sm">
                        Gracias <strong>{formData.name}</strong>. Hemos registrado el interÃƒÂ©s de <strong>{formData.company}</strong> por integrar sus flujos de pago con {formData.integration}.
                      </p>
                      <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider mt-4">
                        Un asesor se contactarÃƒÂ¡ al {formData.phone}
                      </p>
                      <button
                        onClick={() => {
                          setIsSuccess(false)
                          setFormData({ name: '', email: '', phone: '', company: '', integration: 'Shopify', details: '' })
                        }}
                        className="mt-6 text-xs font-bold text-zinc-600 hover:text-black underline underline-offset-4"
                      >
                        Enviar otra solicitud
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Corporate Proof Section */}
      <section className="w-full py-16 bg-white border-y border-zinc-200/60">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="font-semibold text-xs text-zinc-400 uppercase tracking-[0.2em] mb-8">
            Infraestructura confiable para empresas lÃƒÂ­deres
          </p>
          <div className="flex flex-wrap items-center justify-center gap-12 lg:gap-20 opacity-40 grayscale">
            <span className="text-xl font-bold text-zinc-950 font-sans tracking-tight">Shopify Plus</span>
            <span className="text-xl font-bold text-zinc-950 font-sans tracking-tight">Salesforce</span>
            <span className="text-xl font-bold text-zinc-950 font-sans tracking-tight">Stripe Connect</span>
            <span className="text-xl font-bold text-zinc-950 font-sans tracking-tight">MercadoPago</span>
            <span className="text-xl font-bold text-zinc-950 font-sans tracking-tight">SAP Cloud</span>
          </div>
        </div>
      </section>

      {/* Enterprise Specs Section */}
      <section className="w-full py-20 bg-white">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16 flex flex-col items-center gap-4">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-zinc-950">
              Arquitectura diseÃƒÂ±ada para rendir
            </h2>
            <p className="text-base text-zinc-500 max-w-2xl font-normal leading-relaxed">
              Cumplimos con las especificaciones y demandas mÃƒÂ¡s exigentes en fiabilidad de sistemas de cobro y automatizaciÃƒÂ³n.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-zinc-50 border border-zinc-200/50 rounded-2xl flex flex-col gap-3">
              <span className="text-2xl font-black text-zinc-950 block">99.99%</span>
              <h4 className="font-bold text-sm text-zinc-950">SLA de Disponibilidad</h4>
              <p className="text-xs text-zinc-500 leading-relaxed font-normal">
                Nuestra infraestructura estÃƒÂ¡ desplegada de forma redundante en mÃƒÂºltiples zonas para garantizar la continuidad del negocio y evitar la pÃƒÂ©rdida de ventas.
              </p>
            </div>

            <div className="p-6 bg-zinc-50 border border-zinc-200/50 rounded-2xl flex flex-col gap-3">
              <span className="text-2xl font-black text-zinc-950 block">&lt; 100ms</span>
              <h4 className="font-bold text-sm text-zinc-950">Latencia en Respuestas</h4>
              <p className="text-xs text-zinc-500 leading-relaxed font-normal">
                OptimizaciÃƒÂ³n y cacheo a nivel perimetral de bases de datos para garantizar que las pÃƒÂ¡ginas de checkout y consultas de inventario carguen de manera inmediata.
              </p>
            </div>

            <div className="p-6 bg-zinc-50 border border-zinc-200/50 rounded-2xl flex flex-col gap-3">
              <span className="text-2xl font-black text-zinc-950 block">SOC 2 Ready</span>
              <h4 className="font-bold text-sm text-zinc-950">Seguridad & Privacidad</h4>
              <p className="text-xs text-zinc-500 leading-relaxed font-normal">
                Arquitectura alineada con las directrices de seguridad SOC 2 para asegurar la protecciÃƒÂ³n, segregaciÃƒÂ³n y control de acceso a los datos transaccionales de tu negocio.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Shared Footer */}
      <Footer />
    </div>
  )
}
