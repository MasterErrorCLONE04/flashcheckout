import { TiendaFormState } from '../useTiendaForm'
import { BeneficiosBentoSpecs } from './secciones/BeneficiosBentoSpecs'
import { BrandStorySection } from './secciones/BrandStorySection'
import { VisualCategoriesTimelineGallery } from './secciones/VisualCategoriesTimelineGallery'
import { WaterdropCommunityModules } from './secciones/WaterdropCommunityModules'
import { IngredientsTrustFaqs } from './secciones/IngredientsTrustFaqs'

interface SeccionesTabProps {
  form: TiendaFormState
}

export function SeccionesTab({ form }: SeccionesTabProps) {
  return (
    <div className="space-y-6">
      <WaterdropCommunityModules form={form} />
      <VisualCategoriesTimelineGallery form={form} />
      <IngredientsTrustFaqs form={form} />
      <BeneficiosBentoSpecs form={form} />
      <BrandStorySection form={form} />
    </div>
  )
}
