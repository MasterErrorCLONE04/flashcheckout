'use client'

import React from 'react'
import {
  User,
  Zap,
  CheckCircle,
  MessageCircle,
  MoreVertical,
  Search,
  Wifi,
  Loader2
} from 'lucide-react'

interface WhatsAppConnectCardProps {
  loadingQr: boolean
  qrCodeBase64: string | null
  onRegenerateQr: () => Promise<void>
}

export function WhatsAppConnectCard({
  loadingQr,
  qrCodeBase64,
  onRegenerateQr
}: WhatsAppConnectCardProps) {
  return (
    <div className="space-y-6 pb-12 font-sans text-left">
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Conversaciones</h1>
          <div className="text-[12px] font-bold text-zinc-500 mt-1 flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            Esperando conexión de WhatsApp...
          </div>
        </div>
      </div>

      {/* CONNECTION MAIN CARD CONTAINER */}
      <div className="w-full bg-white border border-zinc-200 rounded-3xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.02)] mt-8 select-none p-8 xl:p-10">
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-center">
          
          {/* Left side: Features and Info */}
          <div className="xl:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold rounded-full select-none">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span>Conexión requerida</span>
            </div>
            <div className="space-y-3">
              <h2 className="text-3xl font-extrabold text-zinc-900 tracking-tight leading-tight">
                Conecta tu <span className="text-emerald-600">WhatsApp</span> <br /> para empezar a chatear
              </h2>
              <p className="text-xs text-zinc-500 font-bold leading-relaxed">
                Escanea el código QR con tu teléfono para vincular tu cuenta de WhatsApp y empezar a gestionar tus conversaciones desde Flashcheckouts.
              </p>
            </div>

            {/* 4 Feature Items List */}
            <div className="space-y-4 pt-2">
              {[
                {
                  icon: MessageCircle,
                  title: "Responde desde un solo lugar",
                  desc: "Gestiona todos los chats de tus clientes en un solo inbox."
                },
                {
                  icon: Zap,
                  title: "No te pierdas ningún mensaje",
                  desc: "Recibe y responde mensajes en tiempo real sin depender de tu celular."
                },
                {
                  icon: User,
                  title: "Automatiza y ahorra tiempo",
                  desc: "Usa inteligencia artificial y automatizaciones para responder más rápido."
                },
                {
                  icon: CheckCircle,
                  title: "Seguro y confiable",
                  desc: "Tus conversaciones están protegidas con encriptación de extremo a extremo."
                }
              ].map((feat, index) => {
                const IconComponent = feat.icon
                return (
                  <div key={index} className="flex gap-4 items-start">
                    <div className="w-9 h-9 rounded-full bg-emerald-50 border border-emerald-100/50 flex items-center justify-center text-emerald-600 shrink-0 shadow-xs">
                      <IconComponent className="w-4.5 h-4.5" />
                    </div>
                    <div className="space-y-0.5">
                      <h4 className="text-xs font-extrabold text-zinc-800 leading-snug">{feat.title}</h4>
                      <p className="text-[11px] font-bold text-zinc-500 leading-relaxed">{feat.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Middle: Mock Phone Representation */}
          <div className="xl:col-span-4 flex justify-center items-center relative py-4">
            <div className="relative">
              {/* Floating WhatsApp badge outside top-right */}
              <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white border border-zinc-200 shadow-md flex items-center justify-center z-30 animate-bounce">
                <svg className="w-5 h-5 text-[#25D366] fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.864.002-2.637-1.03-5.115-2.905-6.99C16.488 1.878 14.01 1.847 12.008 1.847c-5.437 0-9.863 4.421-9.867 9.865-.001 1.76.476 3.477 1.38 5.026l-.995 3.637 3.73-.979L6.648 19.16zM17.47 14.4c-.3-.149-1.772-.874-2.047-.975-.276-.101-.476-.149-.676.15-.2.3-.777.975-.951 1.174-.176.2-.351.224-.651.075-.3-.149-1.267-.467-2.414-1.492-.893-.797-1.496-1.78-1.672-2.079-.176-.3-.019-.462.13-.61.135-.133.3-.349.45-.523.15-.174.2-.299.3-.499.1-.2.05-.375-.025-.524-.075-.15-.676-1.624-.926-2.224-.244-.587-.491-.507-.676-.516-.175-.008-.375-.01-.575-.01-.2 0-.525.075-.8.374-.275.3-1.05 1.024-1.05 2.5 0 1.475 1.075 2.897 1.225 3.1 1.625 2.15 3.4 3.15 5.525 3.975 1.05.4 1.875.525 2.525.425.75-.125 2.275-.925 2.575-1.825.3-.9 3-1.825 3-1.825.3-.9.15-1.675-.075-1.825z"/>
                </svg>
              </div>

              {/* Mock Phone Body */}
              <div className="w-[260px] h-[450px] bg-white border-[6px] border-zinc-900 rounded-[38px] shadow-xl overflow-hidden flex flex-col relative">
                {/* Phone Status bar */}
                <div className="h-6 bg-[#075E54] text-white flex items-center justify-between px-6 pt-1 text-[9px] font-bold shrink-0 select-none z-10">
                  <span>11:30</span>
                  <div className="flex items-center gap-1">
                    <Wifi className="w-2.5 h-2.5" />
                    <div className="w-4 h-2.5 border border-white/60 rounded-sm p-0.5 flex items-center">
                      <div className="w-full h-full bg-white rounded-2xs" />
                    </div>
                  </div>
                </div>

                {/* Phone WhatsApp Header */}
                <div className="bg-[#075E54] text-white pt-1.5 pb-2.5 px-4.5 flex flex-col gap-2 shrink-0 select-none z-10">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-xs">WhatsApp</span>
                    <div className="flex gap-2">
                      <Search className="w-3.5 h-3.5 opacity-80" />
                      <MoreVertical className="w-3.5 h-3.5 opacity-80" />
                    </div>
                  </div>
                  {/* Tabs */}
                  <div className="flex justify-around text-[9px] font-extrabold uppercase text-white/70 tracking-wider mt-1 select-none">
                    <div className="text-white relative pb-1">
                      Chats
                      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white" />
                    </div>
                    <div className="hover:text-white pb-1">Estados</div>
                    <div className="hover:text-white pb-1">Llamadas</div>
                  </div>
                </div>

                {/* Chats stream inside phone mockup */}
                <div className="flex-1 bg-white overflow-hidden p-1.5 space-y-1">
                  {[
                    { name: "María González", time: "11:28", text: "¡Perfecto, muchas gracias!" },
                    { name: "Tienda Webs", time: "11:24", text: "¡Hola, ¿tienes disponible el..." },
                    { name: "Carlos Ramírez", time: "11:20", text: "Listo, muchas gracias 🙌" },
                    { name: "Ana López", time: "11:15", text: "Te envío el comprobante" },
                    { name: "Grupo Ventas", time: "11:10", text: "Juan: ¡Excelente!" },
                    { name: "Miguel Torres", time: "Ayer", text: "Dale, seguimos en contacto" }
                  ].map((chat, idx) => (
                    <div key={idx} className="flex gap-2.5 items-center p-1.5 border-b border-zinc-50 last:border-none">
                      <div className="w-7 h-7 rounded-full bg-zinc-100 flex items-center justify-center text-[10px] font-black text-zinc-500 shrink-0 uppercase">
                        {chat.name.slice(0, 2)}
                      </div>
                      <div className="min-w-0 flex-1 space-y-0.5 text-left">
                        <div className="flex justify-between items-baseline">
                          <h5 className="font-bold text-zinc-900 text-[10px] truncate leading-tight">{chat.name}</h5>
                          <span className="text-[8px] text-zinc-400 font-bold shrink-0">{chat.time}</span>
                        </div>
                        <p className="text-[9px] text-zinc-400 truncate leading-tight font-semibold">{chat.text}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Floating Action Button */}
                <div className="absolute bottom-4 right-4 w-9 h-9 rounded-full bg-[#075E54] hover:bg-[#128C7E] shadow-md flex items-center justify-center text-white cursor-pointer z-10">
                  <MessageCircle className="w-4.5 h-4.5 fill-current" />
                </div>
              </div>
            </div>
          </div>

          {/* Right side: Instructions and QR Container */}
          <div className="xl:col-span-3 space-y-5 flex flex-col items-center xl:items-start text-left">
            {/* How to Connect instructions card */}
            <div className="w-full bg-zinc-50/65 border border-zinc-200 rounded-2xl p-4.5 space-y-4">
              <h4 className="text-xs font-bold text-zinc-800 tracking-wider">Cómo conectar</h4>
              
              <div className="space-y-3.5">
                {[
                  { step: "1", text: "Abre WhatsApp en tu teléfono" },
                  { step: "2", text: "Ve a Dispositivos vinculados" },
                  { step: "3", text: "Escanea este código QR" }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-3.5 items-start">
                    <div className="w-6 h-6 rounded-full bg-zinc-100 flex items-center justify-center text-xs font-extrabold text-zinc-700 shrink-0 border border-zinc-200 shadow-2xs">
                      {item.step}
                    </div>
                    <p className="text-[11px] font-bold text-zinc-600 pt-0.5 leading-normal">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* QR Code Graphic Container with overlay center logo */}
            <div className="relative aspect-square w-48 bg-white border border-zinc-200/80 rounded-2xl flex items-center justify-center p-4 shadow-sm">
              {loadingQr && (
                <div className="flex flex-col items-center gap-2.5">
                  <Loader2 className="w-7 h-7 animate-spin text-emerald-500" />
                  <span className="text-[9px] text-zinc-400 font-extrabold uppercase tracking-wider">Generando QR...</span>
                </div>
              )}
              {!loadingQr && qrCodeBase64 && (
                <div className="relative w-full h-full flex items-center justify-center">
                  <img 
                    src={qrCodeBase64} 
                    alt="WhatsApp QR Code" 
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute w-9 h-9 bg-white rounded-lg p-1.5 shadow-md border border-zinc-100 flex items-center justify-center">
                    <div className="w-full h-full bg-[#25D366] rounded-md flex items-center justify-center text-white p-1">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.42 9.864-9.864.002-2.637-1.03-5.115-2.905-6.99C16.488 1.878 14.01 1.847 12.008 1.847c-5.437 0-9.863 4.421-9.867 9.865-.001 1.76.476 3.477 1.38 5.026l-.995 3.637 3.73-.979L6.648 19.16zM17.47 14.4c-.3-.149-1.772-.874-2.047-.975-.276-.101-.476-.149-.676.15-.2.3-.777.975-.951 1.174-.176.2-.351.224-.651.075-.3-.149-1.267-.467-2.414-1.492-.893-.797-1.496-1.78-1.672-2.079-.176-.3-.019-.462.13-.61.135-.133.3-.349.45-.523.15-.174.2-.299.3-.499.1-.2.05-.375-.025-.524-.075-.15-.676-1.624-.926-2.224-.244-.587-.491-.507-.676-.516-.175-.008-.375-.01-.575-.01-.2 0-.525.075-.8.374-.275.3-1.05 1.024-1.05 2.5 0 1.475 1.075 2.897 1.225 3.1 1.625 2.15 3.4 3.15 5.525 3.975 1.05.4 1.875.525 2.525.425.75-.125 2.275-.925 2.575-1.825.3-.9 3-1.825 3-1.825.3-.9.15-1.675-.075-1.825z"/>
                      </svg>
                    </div>
                  </div>
                </div>
              )}
              {!loadingQr && !qrCodeBase64 && (
                <div className="flex flex-col items-center gap-2.5">
                  <Wifi className="w-8 h-8 text-zinc-300 animate-pulse" />
                  <span className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wider leading-relaxed">Sin señal de QR</span>
                  <button 
                    onClick={onRegenerateQr} 
                    className="text-[9px] font-bold text-emerald-600 hover:underline mt-1 cursor-pointer"
                  >
                    Regenerar QR
                  </button>
                </div>
              )}
            </div>

            {/* Security Policy Badge */}
            <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400 select-none">
              <svg className="w-3.5 h-3.5 text-emerald-600 fill-none stroke-current stroke-2 shrink-0" viewBox="0 0 24 24">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <div className="flex flex-col leading-tight">
                <span className="text-zinc-800">Tu privacidad es importante</span>
                <span className="text-[9px] text-zinc-400 font-medium">Encriptación de extremo a extremo</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer Problems / Walkthrough links at bottom */}
        <div className="flex justify-center items-center gap-6 text-xs font-semibold text-zinc-500 pt-8 mt-4 border-t border-zinc-100 select-none">
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-emerald-600 fill-none stroke-current stroke-2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <span>¿Problemas para conectar?</span>
          </div>
          <a href="/help" className="text-emerald-600 font-bold hover:underline flex items-center gap-1 select-none cursor-pointer">
            <span>Ver guía paso a paso</span>
            <svg className="w-3.5 h-3.5 stroke-current stroke-2 fill-none" viewBox="0 0 24 24">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  )
}
