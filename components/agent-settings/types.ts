export type AgentSettings = {
  systemPrompt: string
  welcomeMessage: string
  active: boolean
  aiSettings?: any
}

export type ProductExtended = {
  id: string
  name: string
  price: number
  active: boolean
  aiRecommendation: boolean
  aiDescription: string
}

export type FaqItem = {
  id: string
  question: string
  answer: string
}

export type ActionButton = {
  text: string
  type: 'web' | 'flow'
  url?: string
}

export type AgentTabType = 
  | 'configuracion' 
  | 'modo-cierre' 
  | 'catalogo' 
  | 'respuestas' 
  | 'comportamiento' 
  | 'integraciones'

export type ChatMessage = {
  sender: 'user' | 'bot'
  text: string
  time: string
  options?: string[]
  actionButton?: ActionButton
}

export interface AgentSettingsManagerProps {
  initialSettings: AgentSettings
  storeName: string
  storeSlug: string
  storeId: string
  initialProducts: ProductExtended[]
  initialFaqs: FaqItem[]
}
