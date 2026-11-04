'use client'

import React from 'react'
import {
  Image as ImageIcon,
  ShoppingBag,
  Layers,
  Sparkles,
  HelpCircle,
  ShieldCheck,
  BookOpen,
  PanelBottom,
} from 'lucide-react'
import { TiendaFormState } from './useTiendaForm'
import { SectionDetailHeader } from './SectionDetailHeader'
import { SectionId } from './SectionsOverview'
import { EncabezadoTab } from './tabs/EncabezadoTab'
import { ProductosTab } from './tabs/ProductosTab'
import { VisualCategoriesTimelineGallery } from './tabs/secciones/VisualCategoriesTimelineGallery'
import { WaterdropCommunityModules } from './tabs/secciones/WaterdropCommunityModules'
import { IngredientsTrustFaqs } from './tabs/secciones/IngredientsTrustFaqs'
import { BeneficiosBentoSpecs } from './tabs/secciones/BeneficiosBentoSpecs'
import { BrandStorySection } from './tabs/secciones/BrandStorySection'

interface SectionEditorRouterProps {
  sectionId: SectionId
  form: TiendaFormState
  onBack: () => void
}

export function SectionEditorRouter({
  sectionId,
  form,
  onBack,
}: SectionEditorRouterProps) {
  const { sections, handleSectionToggle } = form

  const sectionMetadata: Record<
    SectionId,
    {
      title: string
      subtitle: string
      icon: React.ElementType
      sectionKey: keyof typeof sections
      alwaysOn?: boolean
    }
  > = {
    hero: {
      title: 'Portada & Hero Collage',
      subtitle: 'Configura las fotos, títulos y botón principal',
      icon: ImageIcon,
      sectionKey: 'banner',
    },
    bestsellers: {
      title: 'Colección Bestsellers & Tarjetas',
      subtitle: 'Estilo de tarjetas, pestañas y productos',
      icon: ShoppingBag,
      sectionKey: 'destacados',
    },
    ritual: {
      title: 'Ritual Editorial (3 Pasos)',
      subtitle: 'Fotografías de proceso y valor de marca',
      icon: Layers,
      sectionKey: 'processTimeline',
    },
    ugc: {
      title: 'Mural Social UGC & Reseñas',
      subtitle: 'Fotos de clientes, estrellas y testimonios',
      icon: Sparkles,
      sectionKey: 'ugcGallery',
    },
    faqs: {
      title: 'Preguntas Frecuentes & Confianza',
      subtitle: 'Preguntas habituales y políticas de envío',
      icon: HelpCircle,
      sectionKey: 'faqs',
    },
    garantias: {
      title: 'Garantías Pre-Footer & Bento',
      subtitle: 'Tira de 3 beneficios de confianza del comprador',
      icon: ShieldCheck,
      sectionKey: 'beneficios',
    },
    story: {
      title: 'Historia de Marca & Manifiesto',
      subtitle: 'Cuenta la visión y esencia de tu marca',
      icon: BookOpen,
      sectionKey: 'brandStory',
    },
    footer: {
      title: 'Pie de Página & Newsletter',
      subtitle: 'Caja de suscripción, enlaces y avisos legales',
      icon: PanelBottom,
      sectionKey: 'newsletterWidget',
      alwaysOn: true,
    },
  }

  const meta = sectionMetadata[sectionId]
  const isEnabled = meta.alwaysOn ? true : Boolean(sections[meta.sectionKey])

  return (
    <div className="space-y-4">
      {/* Detail Header with Back button and Status Switch */}
      <SectionDetailHeader
        title={meta.title}
        subtitle={meta.subtitle}
        icon={meta.icon}
        onBack={onBack}
        isEnabled={isEnabled}
        onToggleEnabled={() => handleSectionToggle(meta.sectionKey)}
        isAlwaysOn={meta.alwaysOn}
      />

      {/* Render the specialized editor for this section */}
      <div className="space-y-6">
        {sectionId === 'hero' && <EncabezadoTab form={form} />}
        {sectionId === 'bestsellers' && <ProductosTab form={form} />}
        {sectionId === 'ritual' && <VisualCategoriesTimelineGallery form={form} />}
        {sectionId === 'ugc' && <WaterdropCommunityModules form={form} />}
        {sectionId === 'faqs' && <IngredientsTrustFaqs form={form} />}
        {sectionId === 'garantias' && <BeneficiosBentoSpecs form={form} />}
        {sectionId === 'story' && <BrandStorySection form={form} />}
        {sectionId === 'footer' && <VisualCategoriesTimelineGallery form={form} />}
      </div>
    </div>
  )
}

