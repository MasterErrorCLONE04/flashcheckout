import { toast } from 'sonner'

export function buildTiendaAiSettings(state: {
  colors: any
  typography: string
  themePreset: string
  borderRadius: string
  shadowStyle: string
  headerStyle: string
  heroStyle: string
  heroBadge: string
  cardStyle: string
  cardAspectRatio: string
  badgeStyle: string
  catalogColumns: string
  sections: any
  bannerUrl: string
  bannerTitle: string
  bannerSubtitle: string
  announcement: any
  bannerButton: any
  benefits: any
  socialsShowInCatalog: boolean
  schedule: any
  whatsappTemplate: string
  socials: any
  policies: any
  address: string
  bentoHighlights: any
  accordionSpecs: any[]
  brandStory: any
  brandStoryPage: any
  visualCategories: any[]
  processTimeline: any
  lifestyleGallery: string[]
  newsletterWidget: any
  navbarLinks: any[]
  heroType: string
  heroVideoUrl: string
  ingredientsSection: any
  freeShipping: any
  paymentMethods: any
  testimonials: any
  faqs: any
  floatingWhatsApp: any
  customDomain?: string
  seo?: any
}) {
  return {
    colors: state.colors,
    typography: state.typography,
    themePreset: state.themePreset,
    borderRadius: state.borderRadius,
    shadowStyle: state.shadowStyle,
    headerStyle: state.headerStyle,
    heroStyle: state.heroStyle,
    heroBadge: state.heroBadge,
    cardStyle: state.cardStyle,
    cardAspectRatio: state.cardAspectRatio,
    badgeStyle: state.badgeStyle,
    catalogColumns: state.catalogColumns,
    sections: state.sections,
    bannerUrl: state.bannerUrl,
    bannerTitle: state.bannerTitle,
    bannerSubtitle: state.bannerSubtitle,
    announcement: state.announcement,
    bannerButton: state.bannerButton,
    benefits: state.benefits,
    socialsShowInCatalog: state.socialsShowInCatalog,
    schedule: state.schedule,
    whatsappTemplate: state.whatsappTemplate,
    socials: state.socials,
    policies: state.policies,
    ...(state.seo ? { seo: state.seo } : {}),
    ...(state.customDomain !== undefined ? { domains: { customDomain: state.customDomain } } : {}),
    info: { address: state.address },
    bentoHighlights: state.bentoHighlights,
    accordionSpecs: { tabs: state.accordionSpecs },
    brandStory: state.brandStory,
    brandStoryPage: state.brandStoryPage,
    visualCategories: state.visualCategories,
    processTimeline: state.processTimeline,
    lifestyleGallery: state.lifestyleGallery,
    newsletterWidget: state.newsletterWidget,
    navbarLinks: state.navbarLinks,
    heroType: state.heroType,
    heroVideoUrl: state.heroVideoUrl,
    ingredientsSection: state.ingredientsSection,
    freeShipping: state.freeShipping,
    paymentMethods: state.paymentMethods,
    testimonials: state.testimonials,
    faqs: state.faqs,
    floatingWhatsApp: state.floatingWhatsApp
  }
}

export async function uploadStoreImage(file: File, type: 'logo' | 'banner'): Promise<string> {
  const toastId = toast.loading(`Subiendo ${type === 'logo' ? 'logotipo' : 'banner'}...`)
  try {
    const formData = new FormData()
    formData.append('file', file)

    const res = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })

    if (!res.ok) {
      throw new Error('Error al subir la imagen')
    }

    const data = await res.json()
    toast.success(`${type === 'logo' ? 'Logotipo' : 'Banner'} subido correctamente`, { id: toastId })
    return data.url
  } catch (err: any) {
    console.error(err)
    toast.error('Error al subir la imagen', { id: toastId })
    throw err
  }
}

export async function persistStoreSettings(payload: {
  name: string
  whatsapp: string
  bio: string | null
  category: string | null
  logoUrl: string | null
  slug: string
  active: boolean
  aiSettings: any
}): Promise<void> {
  const res = await fetch('/api/stores', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  if (!res.ok) {
    const errorData = await res.json()
    throw new Error(errorData.error || 'Error al guardar los cambios')
  }

  toast.success('¡Cambios guardados con éxito!', {
    description: 'La configuración y diseño de tu tienda online han sido guardados.'
  })
}
