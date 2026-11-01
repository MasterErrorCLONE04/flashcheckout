import React from 'react'
import {
  FileText,
  Flame,
  Check,
  Copy,
  Volume2,
  MessageCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { GeneratedData } from '../types'

interface VideoScriptTabsProps {
  contentTab: 'guion' | 'instagram' | 'whatsapp'
  onContentTabChange: (tab: 'guion' | 'instagram' | 'whatsapp') => void
  isGenerating: boolean
  productName?: string
  generatedData: GeneratedData | null
  copiedKey: string | null
  onCopyText: (text: string, key: string) => void
}

export function VideoScriptTabs({
  contentTab,
  onContentTabChange,
  isGenerating,
  productName,
  generatedData,
  copiedKey,
  onCopyText
}: VideoScriptTabsProps) {
  return (
    <div className="bg-white border border-zinc-200/80 rounded-lg p-5 shadow-none space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-zinc-50 text-zinc-600 border border-zinc-200 flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-zinc-900">
              Paso 4: Guion & Copys Generados
            </h2>
            <p className="text-[11px] text-zinc-500 font-medium">
              Listos para locución y descripción en redes sociales.
            </p>
          </div>
        </div>

        {/* Segmented Controls */}
        <div className="flex gap-1 bg-zinc-100 p-0.5 rounded-lg border border-zinc-200">
          {[
            { id: 'guion' as const, label: 'Guion Locución' },
            { id: 'instagram' as const, label: 'Instagram & TikTok' },
            { id: 'whatsapp' as const, label: 'WhatsApp Broadcast' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => onContentTabChange(t.id)}
              className={cn(
                "px-2.5 py-1 text-[11px] font-semibold rounded-md transition-all cursor-pointer",
                contentTab === t.id
                  ? "bg-white text-zinc-900 shadow-xs"
                  : "text-zinc-500 hover:text-zinc-800"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {isGenerating ? (
        <div className="py-10 text-center space-y-2">
          <div className="w-7 h-7 rounded-full border-2 border-zinc-400 border-t-zinc-900 animate-spin mx-auto" />
          <p className="text-xs text-zinc-500 font-semibold">
            Generando gancho de 3s y guión viral para {productName || 'el producto'}...
          </p>
        </div>
      ) : generatedData ? (
        <div className="space-y-3">
          
          {/* TAB 1: GUION LOCUCIÓN */}
          {contentTab === 'guion' && (
            <div className="space-y-3">
              <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-lg">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase text-zinc-600 tracking-wider flex items-center gap-1.5">
                    <Flame className="w-3.5 h-3.5 text-zinc-600" />
                    Gancho en Pantalla (0s a 3s)
                  </span>
                  <button
                    onClick={() => onCopyText(generatedData.hook, 'hook')}
                    className="text-[10px] text-zinc-600 font-semibold flex items-center gap-1 hover:text-zinc-900 cursor-pointer"
                  >
                    {copiedKey === 'hook' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>Copiar Gancho</span>
                  </button>
                </div>
                <p className="text-xs font-bold text-zinc-900 leading-relaxed">
                  "{generatedData.hook}"
                </p>
              </div>

              <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider flex items-center gap-1">
                    <Volume2 className="w-3.5 h-3.5 text-zinc-500" />
                    Texto para Locución / Voz en Off
                  </span>
                  <button
                    onClick={() => onCopyText(generatedData.script, 'script')}
                    className="text-[10px] text-zinc-600 font-semibold flex items-center gap-1 hover:text-zinc-900 cursor-pointer"
                  >
                    {copiedKey === 'script' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                    <span>Copiar Guion</span>
                  </button>
                </div>
                <p className="text-xs font-medium text-zinc-800 leading-relaxed whitespace-pre-line">
                  {generatedData.script}
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: INSTAGRAM & TIKTOK */}
          {contentTab === 'instagram' && (
            <div className="p-3.5 bg-zinc-50 border border-zinc-200 rounded-lg space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider">
                  Pie de Foto (Caption Comercial)
                </span>
                <button
                  onClick={() => onCopyText(`${generatedData.copyInstagram}\n\n${generatedData.hashtags.join(' ')}`, 'insta')}
                  className="text-[10px] text-zinc-600 font-semibold flex items-center gap-1 hover:text-zinc-900 cursor-pointer"
                >
                  {copiedKey === 'insta' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>Copiar Todo</span>
                </button>
              </div>
              <p className="text-xs font-medium text-zinc-800 leading-relaxed whitespace-pre-line">
                {generatedData.copyInstagram}
              </p>
              <div className="flex flex-wrap gap-1 pt-1 border-t border-zinc-200">
                {generatedData.hashtags.map((h, i) => (
                  <span key={i} className="text-[9px] font-semibold text-zinc-600 bg-white px-1.5 py-0.5 rounded border border-zinc-200">
                    {h}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: WHATSAPP BROADCAST */}
          {contentTab === 'whatsapp' && (
            <div className="p-3.5 bg-emerald-50/50 border border-emerald-200/80 rounded-lg space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase text-zinc-800 tracking-wider flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                  Mensaje Optimizado para WhatsApp
                </span>
                <button
                  onClick={() => onCopyText(generatedData.copyWhatsApp, 'wpp')}
                  className="text-[10px] text-zinc-700 font-semibold flex items-center gap-1 hover:text-zinc-900 cursor-pointer"
                >
                  {copiedKey === 'wpp' ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>Copiar Texto</span>
                </button>
              </div>
              <p className="text-xs font-medium text-zinc-800 leading-relaxed whitespace-pre-line font-mono bg-white p-3 rounded-lg border border-emerald-200">
                {generatedData.copyWhatsApp}
              </p>
            </div>
          )}

        </div>
      ) : null}
    </div>
  )
}
