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
    { name: 'Dirección Creativa', role: 'Diseño de Producto', icon: '✦' },
    { name: 'Calidad & Origen', role: 'Selección de Materiales', icon: '◎' },
    { name: 'Operaciones', role: 'Logística Nacional', icon: '⚡' },
    { name: 'Experiencia Cliente', role: 'Atención Directa', icon: '💬' },
  ]

  const values = brandStoryPage.values || [
    {
      title: 'Diseño Consciente',
      desc: 'Creamos productos duraderos, funcionales y honestos que elevan tu rutina diaria sin excesos innecesarios.',
    },
    {
      title: 'Transparencia Total',
      desc: 'Precios claros, disponibilidad real e ingredientes o materiales verificados desde el origen hasta tu puerta.',
    },
    {
      title: 'Comunidad Primero',
      desc: 'Escuchamos cada reseña y acompañamos cada pedido directamente por WhatsApp antes y después de la entrega.',
    },
  ]

  return (
    <main className="max-w-[1280px] mx-auto w-full px-6 md:px-12 py-16 space-y-16 select-none text-left animate-in fade-in duration-500 flex-1">
      <div className="space-y-3 text-center max-w-2xl mx-auto">
        <span className="text-[11px] font-bold tracking-[0.2em] text-[#71717A] uppercase block">
          {brandStoryPage.headerTrayectoria || 'NUESTRA MISIÓN'}
        </span>
        <h2 className="text-3xl md:text-[40px] font-extrabold text-[#111111] tracking-[-0.03em] leading-[1.12]">
          {brandStoryPage.headerPerfil || 'Calidad pensada para acompañarte todos los días.'}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-5">
          <p className="text-base text-[#111111] leading-relaxed font-normal">
            {brandStoryPage.narrativeP1}
          </p>
          <p className="text-sm text-[#52525B] leading-relaxed font-normal">
            {brandStoryPage.narrativeP2}
          </p>
        </div>
        <div className="rounded-[4px] overflow-hidden bg-[#F6F6F4] h-[360px]">
          {brandStoryPage.imageHeritage && (
            <img
              src={brandStoryPage.imageHeritage}
              alt={brandStoryPage.headerPerfil || 'Nuestra Historia'}
              className="w-full h-full object-cover"
            />
          )}
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-[22px] font-extrabold text-[#111111] tracking-[-0.02em]">
          {brandStoryPage.pillarsTitle || 'Nuestros Pilares'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#F6F6F4] rounded-[4px] p-8 space-y-3">
            <div className="w-10 h-10 rounded-full bg-white text-[#111111] flex items-center justify-center font-bold text-base border border-[#E5E5E3]">
              {brandStoryPage.pillar1Icon || '✦'}
            </div>
            <h4 className="font-bold text-base text-[#111111]">{brandStoryPage.pillar1Title}</h4>
            <p className="text-[13px] text-[#52525B] leading-relaxed font-normal">
              {brandStoryPage.pillar1Desc}
            </p>
          </div>
          <div className="bg-[#F6F6F4] rounded-[4px] p-8 space-y-3">
            <div className="w-10 h-10 rounded-full bg-white text-[#111111] flex items-center justify-center font-bold text-base border border-[#E5E5E3]">
              {brandStoryPage.pillar2Icon || '⚡'}
            </div>
            <h4 className="font-bold text-base text-[#111111]">{brandStoryPage.pillar2Title}</h4>
            <p className="text-[13px] text-[#52525B] leading-relaxed font-normal">
              {brandStoryPage.pillar2Desc}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-[22px] font-extrabold text-[#111111] tracking-[-0.02em]">
          Áreas Clave
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {leadership.map((member, idx: number) => (
            <div
              key={idx}
              className="bg-white border border-[#EAEAE8] rounded-[4px] p-6 text-center space-y-2.5"
            >
              <div className="w-11 h-11 rounded-full bg-[#F6F6F4] flex items-center justify-center text-base mx-auto font-bold text-[#111111]">
                {member.icon}
              </div>
              <div>
                <span className="font-bold text-[13px] text-[#111111] block leading-tight">
                  {member.name}
                </span>
                <span className="text-[11px] font-normal text-[#71717A] block mt-1">
                  {member.role}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-6 pt-2">
        <h3 className="text-[22px] font-extrabold text-[#111111] tracking-[-0.02em]">
          Lo que defendemos
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {values.map((val, idx: number) => (
            <div
              key={idx}
              className="p-6 border border-[#EAEAE8] rounded-[4px] text-left bg-white space-y-2"
            >
              <h4 className="font-bold text-sm text-[#111111]">{val.title}</h4>
              <p className="text-[13px] font-normal text-[#52525B] leading-relaxed">{val.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
