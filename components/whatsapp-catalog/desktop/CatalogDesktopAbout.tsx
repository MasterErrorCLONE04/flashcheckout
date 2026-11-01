'use client'

import React from 'react'

export interface CatalogDesktopAboutProps {
  brandStoryPage: {
    headerTrayectoria?: string
    headerPerfil?: string
    narrativeP1?: string
    narrativeP2?: string
    imageHeritage?: string
    pillarsTitle?: string
    pillar1Icon?: string
    pillar1Title?: string
    pillar1Desc?: string
    pillar2Icon?: string
    pillar2Title?: string
    pillar2Desc?: string
    leadership?: Array<{ name: string; role: string; icon: string }>
    values?: Array<{ title: string; desc: string }>
  }
}

export function CatalogDesktopAbout({ brandStoryPage }: CatalogDesktopAboutProps) {
  const leadership = brandStoryPage.leadership || [
    { name: 'Fawaz Al-Masri', role: 'Fundador & CEO', icon: '👨‍💼' },
    { name: 'Razan Al-Masri', role: 'Directora de Desarrollo (CBDO)', icon: '👩‍💼' },
    { name: 'Omar Al-Masri', role: 'Director de Operaciones (COO)', icon: '👨‍💻' },
    { name: 'Hazem Al-Masri', role: 'Gerente General', icon: '👨‍🔧' }
  ]

  const values = brandStoryPage.values || [
    { title: 'Razón & Pasión', desc: 'Equilibramos la toma de decisiones basada en datos científicos con la pasión por la repostería fina.' },
    { title: 'Tradición & Modernidad', desc: 'Respetamos el legado histórico del dátil del desierto mientras aplicamos tecnología de punta en empaque y producción.' },
    { title: 'Familia & Comunidad', desc: 'Operamos como una empresa familiar que apoya a los agricultores locales y cuida de sus empleados.' }
  ]

  return (
    <main className="max-w-[1200px] mx-auto w-full px-6 py-12 space-y-16 select-none text-left animate-in fade-in duration-500 flex-1">
      {/* Page Header */}
      <div className="space-y-4 text-center max-w-2xl mx-auto">
        <span className="text-[10px] font-bold tracking-widest text-[#C5A880] uppercase block">{brandStoryPage.headerTrayectoria}</span>
        <h2 className="text-3xl font-black text-zinc-900 tracking-tight leading-none">{brandStoryPage.headerPerfil}</h2>
        <div className="w-12 h-1 bg-[#C5A880] mx-auto rounded-full mt-2" />
      </div>

      {/* Narrative Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <p className="text-base text-zinc-650 leading-relaxed font-medium">
            {brandStoryPage.narrativeP1}
          </p>
          <p className="text-sm text-zinc-600 leading-relaxed font-semibold">
            {brandStoryPage.narrativeP2}
          </p>
        </div>
        <div className="rounded-3xl overflow-hidden shadow-lg border border-zinc-150 h-[300px]">
          {brandStoryPage.imageHeritage && (
            <img 
              src={brandStoryPage.imageHeritage} 
              alt="Heritage Factory" 
              className="w-full h-full object-cover" 
            />
          )}
        </div>
      </div>

      {/* Two Pillars Section */}
      <div className="space-y-8">
        <h3 className="text-lg font-black text-zinc-900 tracking-tight text-center">{brandStoryPage.pillarsTitle}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Pillar 1 */}
          <div className="bg-white border border-zinc-150 rounded-2xl p-6 space-y-4 hover:border-zinc-350 transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#4A2E1B]/5 text-[#4A2E1B] flex items-center justify-center font-bold text-xl">{brandStoryPage.pillar1Icon}</div>
            <h4 className="font-extrabold text-base text-[#4A2E1B]">{brandStoryPage.pillar1Title}</h4>
            <p className="text-xs text-zinc-500 leading-relaxed font-semibold">
              {brandStoryPage.pillar1Desc}
            </p>
          </div>
          {/* Pillar 2 */}
          <div className="bg-white border border-zinc-150 rounded-2xl p-6 space-y-4 hover:border-zinc-350 transition-all">
            <div className="w-12 h-12 rounded-xl bg-[#C5A880]/5 text-[#C5A880] flex items-center justify-center font-bold text-xl">{brandStoryPage.pillar2Icon}</div>
            <h4 className="font-extrabold text-base text-[#C5A880]">{brandStoryPage.pillar2Title}</h4>
            <p className="text-xs text-zinc-500 leading-relaxed font-semibold">
              {brandStoryPage.pillar2Desc}
            </p>
          </div>
        </div>
      </div>

      {/* Leadership Section */}
      <div className="space-y-8">
        <h3 className="text-lg font-black text-zinc-900 tracking-tight text-center font-bold">Equipo de Liderazgo</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {leadership.map((member, idx: number) => (
            <div key={idx} className="bg-zinc-50 border border-zinc-200/60 rounded-xl p-5 text-center space-y-2.5">
              <div className="w-16 h-16 rounded-full bg-white border border-zinc-200/50 flex items-center justify-center text-2xl mx-auto shadow-sm">{member.icon}</div>
              <div>
                <span className="font-extrabold text-xs text-zinc-900 block leading-tight">{member.name}</span>
                <span className="text-[9px] font-bold text-zinc-400 block mt-1 uppercase tracking-wide">{member.role}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Corporate Values */}
      <div className="space-y-8 pt-4">
        <h3 className="text-lg font-black text-zinc-900 tracking-tight text-center font-bold">Nuestros Valores</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {values.map((val, idx: number) => (
            <div key={idx} className="p-5 border border-zinc-150 rounded-xl text-left bg-white space-y-2">
              <h4 className="font-extrabold text-xs text-[#4A2E1B]">{val.title}</h4>
              <p className="text-[11px] font-semibold text-zinc-500 leading-relaxed">{val.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
