import { prisma } from '@/lib/prisma'

export type ConversationState = 'SEARCHING' | 'COMPARING' | 'CHECKOUT' | 'SUPPORT' | 'IDLE' | 'AWAITING_NAME' | 'AWAITING_ADDRESS' | 'AWAITING_CONFIRMATION' | 'AWAITING_STORE_SELECTION'

export interface RetrievedProduct {
  id: string
  name: string
}

export interface ConversationMemory {
  messages: Array<{ role: string; content: string; timestamp?: string }>
  activeFilters: {
    city?: string
    category?: string
    minPrice?: number
    maxPrice?: number
  }
  lastRetrievedIds: string[]
  /** Caché de nombre+id de los últimos productos buscados. Permite matching sin LLM en add_to_cart. */
  lastRetrievedProducts: RetrievedProduct[]
}

export interface SessionContext {
  state: ConversationState
  memory: ConversationMemory
}

export class SessionManager {
  /**
   * Obtiene la sesión conversacional (WhatsApp o Web Dashboard)
   */
  public static async getSession(
    channel: 'WHATSAPP' | 'WEB',
    sessionKey: string, // phoneNumber o sessionId
    storeId: string = 'global'
  ): Promise<SessionContext> {
    if (channel === 'WHATSAPP') {
      const session = await prisma.whatsAppSession.findUnique({
        where: {
          phoneNumber_storeId: {
            phoneNumber: sessionKey,
            storeId
          }
        }
      })

      if (!session) {
        return this.createDefaultSession()
      }

      // Parsear la información de estado guardada en la base de datos
      const state = (session.step as ConversationState) || 'IDLE'
      const rawMemory = session.notes ? JSON.parse(JSON.stringify(session.notes)) : null
      
      const memory: ConversationMemory = {
        messages: session.messages ? (session.messages as any) : [],
        activeFilters: rawMemory?.activeFilters || {},
        lastRetrievedIds: rawMemory?.lastRetrievedIds || [],
        lastRetrievedProducts: rawMemory?.lastRetrievedProducts || []
      }

      return { state, memory }
    } else {
      // Canal: WEB (NovaChatSession)
      const session = await prisma.novaChatSession.findUnique({
        where: { id: sessionKey }
      })

      if (!session) {
        return this.createDefaultSession()
      }

      // NovaChatSession guarda un arreglo de mensajes en 'messages'
      // Guardamos la memoria extendida y estado en los metadatos dentro de la misma estructura
      const rawHistory = session.messages ? JSON.parse(JSON.stringify(session.messages)) : {}
      
      return {
        state: rawHistory.state || 'IDLE',
        memory: {
          messages: rawHistory.messages || [],
          activeFilters: rawHistory.activeFilters || {},
          lastRetrievedIds: rawHistory.lastRetrievedIds || [],
          lastRetrievedProducts: rawHistory.lastRetrievedProducts || []
        }
      }
    }
  }

  /**
   * Guarda o actualiza la sesión conversacional en la base de datos
   */
  public static async saveSession(
    channel: 'WHATSAPP' | 'WEB',
    sessionKey: string,
    context: SessionContext,
    storeId: string = 'global'
  ): Promise<void> {
    if (channel === 'WHATSAPP') {
      await prisma.whatsAppSession.upsert({
        where: {
          phoneNumber_storeId: {
            phoneNumber: sessionKey,
            storeId
          }
        },
        create: {
          phoneNumber: sessionKey,
          storeId,
          step: context.state,
          messages: context.memory.messages as any,
          notes: {
            activeFilters: context.memory.activeFilters,
            lastRetrievedIds: context.memory.lastRetrievedIds,
            lastRetrievedProducts: context.memory.lastRetrievedProducts
          } as any
        },
        update: {
          // IMPORTANTE: Nunca sobreescribir estados nativos de captura (ej. AWAITING_ADDRESS) con estados de la IA (ej. IDLE)
          ...(
            !['AWAITING_NAME', 'AWAITING_ADDRESS', 'AWAITING_CONFIRMATION', 'AWAITING_STORE_SELECTION'].includes(context.state)
              ? { step: context.state }
              : {}
          ),
          messages: context.memory.messages as any,
          notes: {
            activeFilters: context.memory.activeFilters,
            lastRetrievedIds: context.memory.lastRetrievedIds,
            lastRetrievedProducts: context.memory.lastRetrievedProducts
          } as any,
          lastInteraction: new Date()
        }
      })
    } else {
      // Canal: WEB
      await prisma.novaChatSession.upsert({
        where: { id: sessionKey },
        create: {
          id: sessionKey,
          storeId,
          messages: {
            state: context.state,
            messages: context.memory.messages,
            activeFilters: context.memory.activeFilters,
            lastRetrievedIds: context.memory.lastRetrievedIds,
            lastRetrievedProducts: context.memory.lastRetrievedProducts
          } as any
        },
        update: {
          messages: {
            state: context.state,
            messages: context.memory.messages,
            activeFilters: context.memory.activeFilters,
            lastRetrievedIds: context.memory.lastRetrievedIds,
            lastRetrievedProducts: context.memory.lastRetrievedProducts
          } as any
        }
      })
    }
  }

  private static createDefaultSession(): SessionContext {
    return {
      state: 'IDLE',
      memory: {
        messages: [],
        activeFilters: {},
        lastRetrievedIds: [],
        lastRetrievedProducts: []
      }
    }
  }
}
