'use client'

import { useState } from 'react'
import { HelpCircle, ChevronDown, MessageCircle, Mail, BookOpen, ArrowUpRight, ShieldQuestion } from 'lucide-react'
import { cn } from '@/lib/utils'

const FAQS = [
  {
    question: 'Ã‚Â¿CÃƒÂ³mo funciona la asignaciÃƒÂ³n automÃƒÂ¡tica de repartidores?',
    answer: 'Cuando recibes un pedido pagado y seleccionas "SÃƒÂ" al domicilio, el sistema envÃƒÂ­a una oferta de entrega a todos los repartidores activos. El primero en aceptar el servicio se queda con ÃƒÂ©l y el sistema actualiza automÃƒÂ¡ticamente la orden.'
  },
  {
    question: 'Ã‚Â¿CÃƒÂ³mo conecto mi cuenta de Mercado Pago o Stripe Connect?',
    answer: 'Ve a "Ajustes de Tienda" desde el panel lateral y haz clic en el botÃƒÂ³n de conexiÃƒÂ³n de pasarela correspondiente. El sistema te guiarÃƒÂ¡ de forma segura por el onboarding oficial.'
  },
  {
    question: 'Ã‚Â¿QuÃƒÂ© costo tiene el servicio de domicilio por plataforma?',
    answer: 'El servicio de repartidores oficiales de la plataforma tiene una tarifa estÃƒÂ¡ndar de $5.000 COP por trayecto, los cuales se descuentan automÃƒÂ¡ticamente del balance de cobro del pedido.'
  },
  {
    question: 'Ã‚Â¿CÃƒÂ³mo edito la informaciÃƒÂ³n de mi tienda o el enlace pÃƒÂºblico?',
    answer: 'Puedes editar el nombre de tu tienda, biografÃƒÂ­a, logotipo, nÃƒÂºmero de WhatsApp y slug del enlace de catÃƒÂ¡logo directamente desde "Ajustes de Tienda" en la secciÃƒÂ³n de configuraciÃƒÂ³n.'
  },
  {
    question: 'Ã‚Â¿Los clientes necesitan descargar alguna aplicaciÃƒÂ³n para comprar?',
    answer: 'No. El cliente final accede a tu catÃƒÂ¡logo mediante un navegador web optimizado para mÃƒÂ³viles o recibe listas de botones interactivos directas en su chat de WhatsApp, sin instalar nada.'
  }
]

export default function HelpPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="max-w-5xl mx-auto pb-20 animate-in">
      <div className="flex flex-col gap-4 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Centro de Ayuda y Soporte</h1>
            <div className="text-[12px] font-medium text-zinc-500 mt-1 flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Encuentra respuestas rÃƒÂ¡pidas o contacta directamente a nuestro equipo operativo.</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* FAQs Accordion */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center gap-2.5 mb-6 px-1">
            <ShieldQuestion className="w-5 h-5 text-zinc-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Preguntas Frecuentes</h2>
          </div>

          <div className="space-y-3">
            {FAQS.map((faq, index) => {
              const isOpen = openIndex === index
              return (
                <div
                  key={index}
                  className={cn(
                    "bg-white border rounded-2xl overflow-hidden transition-all duration-300 shadow-sm",
                    isOpen ? "border-zinc-300 ring-1 ring-zinc-300" : "border-zinc-200/80 hover:border-zinc-300"
                  )}
                >
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : index)}
                    className="w-full flex items-center justify-between p-5 text-left font-bold text-sm text-zinc-900 focus:outline-none"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown
                      className={cn(
                        "w-4 h-4 text-zinc-400 transition-transform duration-300 shrink-0 ml-4",
                        isOpen && "transform rotate-180 text-zinc-900"
                      )}
                    />
                  </button>
                  <div
                    className={cn(
                      "grid transition-all duration-300 ease-in-out",
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    )}
                  >
                    <div className="overflow-hidden">
                      <p className="p-5 pt-0 text-xs font-medium leading-relaxed text-zinc-500 border-t border-zinc-100/60 bg-zinc-50/20">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Contact channels */}
        <div className="lg:col-span-5 space-y-6">
          <div className="flex items-center gap-2.5 mb-6 px-1">
            <HelpCircle className="w-5 h-5 text-zinc-400" />
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Canales de Soporte</h2>
          </div>

          <div className="premium-card p-8 bg-white border border-zinc-200 space-y-6">
            <div className="space-y-2">
              <h3 className="font-semibold text-zinc-900 text-base">Soporte Prioritario</h3>
              <p className="text-zinc-500 text-xs leading-relaxed font-medium">
                Atendemos tus inquietudes tÃƒÂ©cnicas o comerciales de lunes a domingo.
              </p>
            </div>

            <div className="space-y-3">
              <a
                href="https://wa.me/573001234567?text=Hola!%20Necesito%20soporte%20con%20mi%20tienda%20en%20Flashcheckouts"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-4 bg-emerald-50/50 hover:bg-emerald-50 border border-emerald-100 hover:border-emerald-200 rounded-xl transition-all group active:scale-95 cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500 text-white flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-emerald-950">Chatear por WhatsApp</p>
                    <p className="text-[10px] font-medium text-emerald-600/80 mt-0.5">Respuesta inmediata</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-emerald-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>

              <a
                href="mailto:soporte@flashcheckout.co"
                className="flex items-center justify-between p-4 bg-zinc-50/50 hover:bg-zinc-50 border border-zinc-200/80 hover:border-zinc-300 rounded-xl transition-all group active:scale-95 cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-zinc-900 text-white flex items-center justify-center">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-900">Enviar un Correo</p>
                    <p className="text-[10px] font-medium text-zinc-400 mt-0.5">Respuesta en menos de 2h</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>

              <a
                href="/work/doc"
                className="flex items-center justify-between p-4 bg-zinc-50/50 hover:bg-zinc-50 border border-zinc-200/80 hover:border-zinc-300 rounded-xl transition-all group active:scale-95 cursor-pointer"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-lg bg-zinc-900 text-white flex items-center justify-center">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-900">DocumentaciÃƒÂ³n de Uso</p>
                    <p className="text-[10px] font-medium text-zinc-400 mt-0.5">Aprende a usar la plataforma</p>
                  </div>
                </div>
                <ArrowUpRight className="w-4 h-4 text-zinc-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
