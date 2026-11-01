'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Agent, LayoutItem, BASE_AGENTS } from './types'

interface AgentHiringParams {
  customAgents: Agent[]
  setCustomAgents: React.Dispatch<React.SetStateAction<Agent[]>>
  setAgentsList: React.Dispatch<React.SetStateAction<Agent[]>>
  setLayoutItems: React.Dispatch<React.SetStateAction<LayoutItem[]>>
  setSelectedAgentId: (id: string | null) => void
  setTerminalLogs: React.Dispatch<React.SetStateAction<Record<string, string[]>>>
}

export function useAgentHiring({
  customAgents,
  setCustomAgents,
  setAgentsList,
  setLayoutItems,
  setSelectedAgentId,
  setTerminalLogs
}: AgentHiringParams) {
  const [hiringModalOpen, setHiringModalOpen] = useState(false)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState('')
  const [newRole, setNewRole] = useState('')
  const [newModel, setNewModel] = useState('meta-llama/llama-3.1-8b-instruct')
  const [newAvatarEmoji, setNewAvatarEmoji] = useState('🕵️')
  const [newDescription, setNewDescription] = useState('')
  const [newSystemPrompt, setNewSystemPrompt] = useState('')
  const [newTools, setNewTools] = useState<string[]>([])

  const handleCreateAgent = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newName || !newRole || !newSystemPrompt || creating) return

    setCreating(true)
    try {
      const res = await fetch('/api/agent/office/custom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newName,
          role: newRole,
          model: newModel,
          description: newDescription,
          systemPrompt: newSystemPrompt,
          avatarEmoji: newAvatarEmoji,
          tools: newTools
        })
      })

      const data = (await res.json()) as { customAgents?: Agent[]; error?: string }
      if (!res.ok) throw new Error(data.error || 'Failed creation')

      const updatedCustoms = (data.customAgents || []).map((a) => {
        let sittingDeskUrl = '/images/desk_l_vacant.png'
        let spriteUrl = '/images/sprite_sales.png'
        if (a.color === 'emerald') {
          sittingDeskUrl = '/images/deskt2/01-Photoroom.png'
          spriteUrl = '/images/sprite_nova.png'
        } else if (a.color === 'teal') {
          sittingDeskUrl = '/images/deskt/01-Photoroom.png'
          spriteUrl = '/images/sprite_sales.png'
        } else if (a.color === 'blue') {
          sittingDeskUrl = '/images/deskt3/01-Photoroom.png'
          spriteUrl = '/images/sprite_logistics.png'
        } else if (a.color === 'amber') {
          sittingDeskUrl = '/images/deskt4/01.png'
          spriteUrl = '/images/sprite_growth.png'
        }

        return {
          ...a,
          spriteUrl: a.spriteUrl || spriteUrl,
          sittingDeskUrl: a.sittingDeskUrl || sittingDeskUrl,
          deskPosition: { top: '50%', left: '50%' }
        }
      })

      setCustomAgents(updatedCustoms)
      setAgentsList([...BASE_AGENTS, ...updatedCustoms])
      
      const newestAgent = updatedCustoms[updatedCustoms.length - 1]

      setTerminalLogs(prev => ({
        ...prev,
        [newestAgent.id]: [
          `Agente personalizado ${newestAgent.name} inicializado.`,
          `Rol: ${newestAgent.role}`,
          `Herramientas: [${newestAgent.tools.join(', ')}]`,
          'Esperando instrucciones...'
        ]
      }))

      setLayoutItems(prev => {
        let assigned = false
        const nextLayout = prev.map(it => {
          if (it.type === 'desk' && !it.agentId && !assigned) {
            assigned = true
            return { ...it, agentId: newestAgent.id, name: `${newestAgent.name} Desk` }
          }
          return it
        })
        
        if (!assigned) {
          nextLayout.push({
            id: `item_desk_${Date.now()}`,
            name: `${newestAgent.name} Desk`,
            type: 'desk',
            col: 2,
            row: 8,
            w: 3,
            h: 3,
            rotation: 0,
            agentId: newestAgent.id
          })
        }
        
        fetch('/api/agent/office/layout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ layoutItems: nextLayout })
        }).catch(err => console.error('Auto-saving layout failed:', err))

        return nextLayout
      })

      toast.success(`¡Agente ${newName} contratado exitosamente!`)
      setHiringModalOpen(false)
      setNewName('')
      setNewRole('')
      setNewDescription('')
      setNewSystemPrompt('')
      setNewTools([])
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Fallo de conexión')
    } finally {
      setCreating(false)
    }
  }

  const handleDismissAgent = async (agentId: string) => {
    if (!confirm('¿Estás seguro de que deseas despedir a este agente de la oficina?')) return

    try {
      const res = await fetch(`/api/agent/office/custom?id=${agentId}`, {
        method: 'DELETE'
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed deletion')

      const updatedCustoms = (data.customAgents || []).map((a: Agent) => {
        let sittingDeskUrl = '/images/desk_l_vacant.png'
        let spriteUrl = '/images/sprite_sales.png'
        if (a.color === 'emerald') {
          sittingDeskUrl = '/images/deskt2/01-Photoroom.png'
          spriteUrl = '/images/sprite_nova.png'
        } else if (a.color === 'teal') {
          sittingDeskUrl = '/images/deskt/01-Photoroom.png'
          spriteUrl = '/images/sprite_sales.png'
        } else if (a.color === 'blue') {
          sittingDeskUrl = '/images/deskt3/01-Photoroom.png'
          spriteUrl = '/images/sprite_logistics.png'
        } else if (a.color === 'amber') {
          sittingDeskUrl = '/images/deskt4/01.png'
          spriteUrl = '/images/sprite_growth.png'
        }

        return {
          ...a,
          spriteUrl: a.spriteUrl || spriteUrl,
          sittingDeskUrl: a.sittingDeskUrl || sittingDeskUrl,
          deskPosition: { top: '50%', left: '50%' }
        }
      })

      setCustomAgents(updatedCustoms)
      setAgentsList([...BASE_AGENTS, ...updatedCustoms])
      setSelectedAgentId(null)

      setLayoutItems(prev => {
        const nextLayout = prev.map(it => {
          if (it.agentId === agentId) {
            return { ...it, agentId: undefined, name: 'Escritorio Vacante' }
          }
          return it
        })
        
        fetch('/api/agent/office/layout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ layoutItems: nextLayout })
        }).catch(err => console.error('Auto-saving layout failed:', err))

        return nextLayout
      })

      toast.success('Agente despedido con éxito.')
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Fallo de conexión')
    }
  }

  return {
    hiringModalOpen,
    setHiringModalOpen,
    creating,
    newName,
    setNewName,
    newRole,
    setNewRole,
    newModel,
    setNewModel,
    newAvatarEmoji,
    setNewAvatarEmoji,
    newDescription,
    setNewDescription,
    newSystemPrompt,
    setNewSystemPrompt,
    newTools,
    setNewTools,
    handleCreateAgent,
    handleDismissAgent
  }
}
