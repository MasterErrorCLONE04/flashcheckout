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
  Grid,
  Award,
  Users,
  MapPin,
  HeartHandshake,
  LayoutGrid,
} from 'lucide-react'
import { TiendaFormState } from './useTiendaForm'
import { SectionDetailHeader } from './SectionDetailHeader'
import { SectionId } from './types'
import { EncabezadoTab } from './tabs/EncabezadoTab'
import { ProductosTab } from './tabs/ProductosTab'
import {
  VisualCategoriesEditor,
  ProcessTimelineEditor,
  LifestyleGalleryEditor,
  NewsletterFooterEditor,
} from './tabs/secciones/VisualCategoriesTimelineGallery'
import {
  UgcGalleryEditor,
  PressLogosEditor,
  AmbassadorsEditor,
  RetailersEditor,
} from './tabs/secciones/WaterdropCommunityModules'
import {
  IngredientsEditor,
  FaqsEditor,
} from './tabs/secciones/IngredientsTrustFaqs'
import {
  BenefitsEditor,
  BentoHighlightsEditor,
} from './tabs/secciones/BeneficiosBentoSpecs'
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
    visualCategories: {
      title: 'Categorías Visuales (PDP Grid)',
      subtitle: 'Navegación circular con fotos de cada colección',
      icon: LayoutGrid,
      sectionKey: 'visualCategories',
    },
    bentoHighlights: {
      title: 'Bento Grid de Destacados',
      subtitle: 'Tarjetas visuales con emojis y pilares de marca',
      icon: Grid,
      sectionKey: 'bentoHighlights',
    },
    ritual: {
      title: 'Ritual Editorial (3 Pasos)',
      subtitle: 'Fotografías de proceso y valor de marca',
      icon: Layers,
      sectionKey: 'processTimeline',
    },
    lifestyleGallery: {
      title: 'Galería de Estilo de Vida',
      subtitle: 'Fotografías reales intercaladas en el catálogo',
      icon: ImageIcon,
      sectionKey: 'lifestyleGallery',
    },
    ingredientsSection: {
      title: 'Ficha de Ingredientes y Pureza',
      subtitle: 'Layout simétrico explicativo de 3 columnas',
      icon: HeartHandshake,
      sectionKey: 'ingredientsSection',
    },
    ugc: {
      title: 'Mural Social UGC & Reseñas',
      subtitle: 'Fotos de clientes, estrellas y testimonios',
      icon: Sparkles,
      sectionKey: 'ugcGallery',
    },
    pressLogos: {
      title: 'Mural de Prensa & Sellos Oficiales',
      subtitle: 'Franja monocromática con menciones y premios',
      icon: Award,
      sectionKey: 'pressLogos',
    },
    ambassadors: {
      title: 'Embajadores & Creadores',
      subtitle: 'Retratos editoriales de atletas y voceros',
      icon: Users,
      sectionKey: 'ambassadors',
    },
    retailers: {
      title: 'Puntos de Entrega & Cobertura',
      subtitle: 'Canales oficiales y tiempos express de entrega',
      icon: MapPin,
      sectionKey: 'retailers',
    },
    faqs: {
      title: 'Preguntas Frecuentes & Confianza',
      subtitle: 'Preguntas habituales y políticas de envío',
      icon: HelpCircle,
      sectionKey: 'faqs',
    },
    garantias: {
      title: 'Garantías Pre-Footer',
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

  const meta = sectionMetadata[sectionId] || sectionMetadata.hero
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
        {sectionId === 'visualCategories' && <VisualCategoriesEditor form={form} />}
        {sectionId === 'bentoHighlights' && <BentoHighlightsEditor form={form} />}
        {sectionId === 'ritual' && <ProcessTimelineEditor form={form} />}
        {sectionId === 'lifestyleGallery' && <LifestyleGalleryEditor form={form} />}
        {sectionId === 'ingredientsSection' && <IngredientsEditor form={form} />}
        {sectionId === 'ugc' && <UgcGalleryEditor form={form} />}
        {sectionId === 'pressLogos' && <PressLogosEditor form={form} />}
        {sectionId === 'ambassadors' && <AmbassadorsEditor form={form} />}
        {sectionId === 'retailers' && <RetailersEditor form={form} />}
        {sectionId === 'faqs' && <FaqsEditor form={form} />}
        {sectionId === 'garantias' && <BenefitsEditor form={form} />}
        {sectionId === 'story' && <BrandStorySection form={form} />}
        {sectionId === 'footer' && <NewsletterFooterEditor form={form} />}
      </div>
    </div>
  )
}
