'use client'

import { useState, useEffect, useCallback } from 'react'
import { Agent, LayoutItem, BASE_AGENTS, OFFICE_ASSET_URLS } from './types'
import { removeWhiteBg } from './utils'
import { toast } from 'sonner'

interface AgentSimulationParams {
  customAgents: Agent[]
  agentsList: Agent[]
  setAgentsList: React.Dispatch<React.SetStateAction<Agent[]>>
  layoutItems: LayoutItem[]
  getAgentDeskPosition: (agentId: string, customAgents: Agent[]) => { top: string; left: string }
  getStationCoordinates: (type: 'whiteboard' | 'printer' | 'coffee' | 'water' | 'lounge' | 'meeting') => { top: string; left: string }
  setTerminalLogs: React.Dispatch<React.SetStateAction<Record<string, string[]>>>
  setConsolidatedLogs: React.Dispatch<React.SetStateAction<string[]>>
}

export function useAgentSimulation({
  customAgents,
  agentsList,
  setAgentsList,
  layoutItems,
  getAgentDeskPosition,
  getStationCoordinates,
  setTerminalLogs,
  setConsolidatedLogs
}: AgentSimulationParams) {
  const [agentPositions, setAgentPositions] = useState<Record<string, { top: string; left: string }>>(() => {
    const coords: Record<string, { top: string; left: string }> = {}
    BASE_AGENTS.forEach(a => {
      coords[a.id] = { ...a.deskPosition }
    })
    customAgents.forEach(a => {
      coords[a.id] = { ...a.deskPosition }
    })
    return coords
  })

  const [agentFacingLeft, setAgentFacingLeft] = useState<Record<string, boolean>>({})
  const [agentStatus, setAgentStatus] = useState<Record<string, 'idle' | 'walking' | 'working'>>({})

  // Speech bubbles state
  const [agentBubbles, setAgentBubbles] = useState<Record<string, string>>({
    Nova: 'Sincronizada con base de datos. Lista.',
    SalesBot: 'Monitoreando WhatsApp en tiempo real.',
    Logistics: 'Esperando pedidos listos para envío.',
    Growth: 'Ideando campañas de conversión...'
  })

  const [processedSprites, setProcessedSprites] = useState<Record<string, string>>({})
  const [processedAssets, setProcessedAssets] = useState<Record<string, string>>({})

  // Load and clean sprites and assets
  useEffect(() => {
    let isMounted = true
    const processSpritesAndAssets = async () => {
      const spriteMap: Record<string, string> = {}
      const assetMap: Record<string, string> = {}
      
      const allList = [...BASE_AGENTS, ...customAgents]
      for (const ag of allList) {
        try {
          const cleanUrl = await removeWhiteBg(ag.spriteUrl)
          spriteMap[ag.id] = cleanUrl
        } catch {
          spriteMap[ag.id] = ag.spriteUrl
        }
        
        if (ag.sittingDeskUrl) {
          try {
            const cleanDeskUrl = await removeWhiteBg(ag.sittingDeskUrl)
            spriteMap[`desk_${ag.id}`] = cleanDeskUrl
          } catch {
            spriteMap[`desk_${ag.id}`] = ag.sittingDeskUrl
          }
        }
      }

      for (const [key, url] of Object.entries(OFFICE_ASSET_URLS)) {
        try {
          const cleanUrl = await removeWhiteBg(url)
          assetMap[key] = cleanUrl
        } catch {
          assetMap[key] = url
        }
      }

      if (isMounted) {
        setProcessedSprites(spriteMap)
        setProcessedAssets(assetMap)
      }
    }
    processSpritesAndAssets()
    return () => { isMounted = false }
  }, [customAgents])

  // Synchronize idle agent positions to their desks dynamically
  useEffect(() => {
    setAgentPositions(prev => {
      let changed = false
      const nextPositions = { ...prev }
      agentsList.forEach(a => {
        if (!agentStatus[a.id] || agentStatus[a.id] === 'idle') {
          const pos = getAgentDeskPosition(a.id, customAgents)
          const curr = prev[a.id]
          if (!curr || curr.top !== pos.top || curr.left !== pos.left) {
            nextPositions[a.id] = pos
            changed = true
          }
        }
      })
      return changed ? nextPositions : prev
    })
  }, [layoutItems, agentsList, agentStatus, customAgents, getAgentDeskPosition])

  const walkAgent = useCallback((
    agentId: string,
    destination: { top: string; left: string },
    actionText: string,
    finalText: string,
    onArrival: () => void,
    onFinish: () => void
  ) => {
    setAgentStatus(prev => ({ ...prev, [agentId]: 'working' }))
    onArrival()

    setTimeout(() => {
      setAgentStatus(prev => ({ ...prev, [agentId]: 'idle' }))
      onFinish()
    }, 4000)
  }, [])

  // Simulation Loop for autonomous ambient activities
  useEffect(() => {
    const interval = setInterval(() => {
      const list = [...BASE_AGENTS, ...customAgents]
      if (list.length === 0) return

      const randomAgent = list[Math.floor(Math.random() * list.length)]
      if (agentStatus[randomAgent.id] && agentStatus[randomAgent.id] !== 'idle') return

      const destinations: Array<'printer' | 'water' | 'whiteboard' | 'coffee'> = ['printer', 'water', 'whiteboard', 'coffee']
      const destType = destinations[Math.floor(Math.random() * destinations.length)]
      const destination = getStationCoordinates(destType)

      const activities = {
        printer: { action: 'Imprimiendo documentos...', log: 'Imprimiendo reportes de operaciones...' },
        water: { action: 'Tomando agua...', log: 'Tomando un descanso en el dispensador de agua...' },
        whiteboard: { action: 'Revisando planes...', log: 'Analizando diagramas de flujo de trabajo...' },
        coffee: { action: 'Preparando café...', log: 'Tomando una taza de café en el break...' }
      }

      const activity = activities[destType]
      const timeStr = new Date().toLocaleTimeString()

      walkAgent(
        randomAgent.id,
        destination,
        activity.action,
        'De vuelta en el escritorio.',
        () => {
          setTerminalLogs(prev => ({
            ...prev,
            [randomAgent.id]: [...(prev[randomAgent.id] || []), `[${timeStr}] ${activity.log}`].slice(-100)
          }))
          setConsolidatedLogs(prev => [
            ...prev,
            `[${timeStr}] [${randomAgent.id}] ${activity.log}`
          ].slice(-150))
        },
        () => {
          setAgentsList(prev => prev.map(a => {
            if (a.id === randomAgent.id) {
              return { ...a, tokensUsed: a.tokensUsed + Math.floor(Math.random() * 90) + 30 }
            }
            return a
          }))
        }
      )

    }, 15000)

    return () => clearInterval(interval)
  }, [customAgents, agentStatus, layoutItems, getStationCoordinates, setTerminalLogs, setConsolidatedLogs, setAgentsList])

  const triggerWaterCoolerTalk = () => {
    const list = [...BASE_AGENTS, ...customAgents]
    if (list.length < 2) {
      toast.info('Se necesitan al menos 2 agentes en la oficina para conversar.')
      return
    }
    const idleAgents = list.filter(a => !agentStatus[a.id] || agentStatus[a.id] === 'idle')
    if (idleAgents.length < 2) {
      toast.warning('Los agentes están muy ocupados ahora. Inténtalo más tarde.')
      return
    }
    
    const agentA = idleAgents[Math.floor(Math.random() * idleAgents.length)]
    let agentB = idleAgents[Math.floor(Math.random() * idleAgents.length)]
    while (agentB.id === agentA.id) {
      agentB = idleAgents[Math.floor(Math.random() * idleAgents.length)]
    }

    const timeStr = new Date().toLocaleTimeString()

    setConsolidatedLogs(prev => [
      ...prev,
      `[${timeStr}] [System] Charla informal iniciada entre ${agentA.name} y ${agentB.name} junto al dispensador de agua.`
    ])

    const waterPos = getStationCoordinates('water')
    const leftVal = parseFloat(waterPos.left)
    const topVal = parseFloat(waterPos.top)

    walkAgent(
      agentA.id,
      { top: `${topVal}%`, left: `${leftVal + 2}%` },
      'Conversando... ☕',
      'De vuelta en mi puesto.',
      () => {},
      () => {}
    )

    walkAgent(
      agentB.id,
      { top: `${topVal}%`, left: `${leftVal + 6}%` },
      'Escuchando... 💬',
      'De vuelta en mi puesto.',
      () => {
        setTimeout(() => {
          setAgentBubbles(prev => ({ ...prev, [agentA.id]: '¡Hola! ¿Cómo va todo hoy?' }))
          setTimeout(() => {
            setAgentBubbles(prev => ({ ...prev, [agentB.id]: '¡Hola! Todo súper, procesando las ventas con éxito 🚀' }))
            setTimeout(() => {
              setAgentBubbles(prev => ({ ...prev, [agentA.id]: '¡Excelente! Sigamos trabajando en equipo. 👍' }))
            }, 2000)
          }, 2000)
        }, 1000)
      },
      () => {}
    )
  }

  return {
    agentPositions,
    setAgentPositions,
    agentFacingLeft,
    setAgentFacingLeft,
    agentStatus,
    setAgentStatus,
    agentBubbles,
    setAgentBubbles,
    processedSprites,
    processedAssets,
    walkAgent,
    triggerWaterCoolerTalk
  }
}
