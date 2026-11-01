'use client'

import { useState, useRef } from 'react'
import { toast } from 'sonner'
import { LayoutItem, Agent, DEFAULT_LAYOUT_ITEMS } from './types'

export function useOfficeLayout(initialLayout?: LayoutItem[]) {
  const [layoutItems, setLayoutItems] = useState<LayoutItem[]>(() => {
    const rawItems: LayoutItem[] = initialLayout || DEFAULT_LAYOUT_ITEMS
    return rawItems.map((it) => {
      const row = it.row < 3 ? 3 : it.row
      const isDesk = it.type === 'desk'
      const w = isDesk ? 3 : it.w
      const h = isDesk ? 3 : it.h
      return { ...it, row, w, h }
    })
  })

  const [isEditingLayout, setIsEditingLayout] = useState(false)
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [editMode, setEditMode] = useState<'select' | 'move' | 'rotate' | 'delete'>('select')
  const [showGrid, setShowGrid] = useState(true)
  const [gridSize, setGridSize] = useState<number>(32)

  // Drag and drop tracking states
  const [isDragging, setIsDragging] = useState(false)
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const gridRef = useRef<HTMLDivElement>(null)

  const getAgentDeskPosition = (agentId: string, customAgents: Agent[] = []) => {
    const desk = layoutItems?.find(it => it.type === 'desk' && it.agentId === agentId)
    if (desk) {
      const left = desk.col * 4.166 + (desk.w / 2) * 4.166
      const top = desk.row * 8.333 + (desk.h / 2) * 8.333
      return { top: `${top}%`, left: `${left}%` }
    }

    if (agentId === 'Nova') return { top: '56%', left: '52%' }
    if (agentId === 'SalesBot') return { top: '38%', left: '32%' }
    if (agentId === 'Logistics') return { top: '38%', left: '68%' }
    if (agentId === 'Growth') return { top: '78%', left: '76%' }
    
    const customIdx = customAgents.findIndex(a => a.id === agentId)
    if (customIdx !== -1) {
      const slots = [
        { top: '78%', left: '26%' },
        { top: '56%', left: '24%' },
        { top: '56%', left: '78%' },
        { top: '78%', left: '50%' }
      ]
      return slots[customIdx % slots.length]
    }
    return { top: '50%', left: '50%' }
  }

  const getStationCoordinates = (type: 'whiteboard' | 'printer' | 'coffee' | 'water' | 'lounge' | 'meeting') => {
    const station = layoutItems?.find(it => it.type === type)
    if (station) {
      const left = station.col * 4.166 + (station.w / 2) * 4.166
      const top = station.row * 8.333 + (station.h / 2) * 8.333
      return { top: `${top}%`, left: `${left}%` }
    }

    if (type === 'whiteboard') return { top: '18%', left: '52%' }
    if (type === 'printer') return { top: '20%', left: '32%' }
    if (type === 'coffee') return { top: '20%', left: '80%' }
    if (type === 'water') return { top: '55%', left: '12%' }
    return { top: '50%', left: '50%' }
  }

  const handleItemMouseDown = (e: React.MouseEvent, itemId: string) => {
    if (!isEditingLayout || editMode !== 'move') return
    e.preventDefault()
    
    const item = layoutItems.find(it => it.id === itemId)
    if (!item) return

    setSelectedItemId(itemId)
    
    if (gridRef.current) {
      const rect = gridRef.current.getBoundingClientRect()
      const itemRect = e.currentTarget.getBoundingClientRect()
      
      const cellWidth = rect.width / 24
      const cellHeight = rect.height / 12
      
      const offsetXCells = Math.floor((e.clientX - itemRect.left) / cellWidth)
      const offsetYCells = Math.floor((e.clientY - itemRect.top) / cellHeight)
      
      setDraggedItemId(itemId)
      setIsDragging(true)
      setDragOffset({ x: offsetXCells, y: offsetYCells })
    }
  }

  const handleGridMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !draggedItemId || !gridRef.current) return
    
    const rect = gridRef.current.getBoundingClientRect()
    const cellWidth = rect.width / 24
    const cellHeight = rect.height / 12
    
    const relX = e.clientX - rect.left
    const relY = e.clientY - rect.top
    
    let targetCol = Math.round(relX / cellWidth) - dragOffset.x
    let targetRow = Math.round(relY / cellHeight) - dragOffset.y
    
    const item = layoutItems.find(it => it.id === draggedItemId)
    if (!item) return
    
    targetCol = Math.max(0, Math.min(24 - item.w, targetCol))
    targetRow = Math.max(3, Math.min(12 - item.h, targetRow))
    
    setLayoutItems(prev => prev.map(it => {
      if (it.id === draggedItemId) {
        return { ...it, col: targetCol, row: targetRow }
      }
      return it
    }))
  }

  const handleGridMouseUp = () => {
    if (isDragging) {
      const item = layoutItems.find(it => it.id === draggedItemId)
      if (item) {
        const isOverlap = layoutItems.some(it => 
          it.id !== item.id && 
          item.col < it.col + it.w &&
          item.col + item.w > it.col &&
          item.row < it.row + it.h &&
          item.row + item.h > it.row
        )
        if (isOverlap) {
          toast.warning("Hay superposición con otro objeto, intenta ubicarlo en una zona libre.")
        }
      }
      setIsDragging(false)
      setDraggedItemId(null)
    }
  }

  const handleRotateItem = (itemId: string) => {
    setLayoutItems(prev => prev.map(it => {
      if (it.id === itemId) {
        const nextRotation = ((it.rotation || 0) + 90) % 360
        return { ...it, rotation: nextRotation }
      }
      return it
    }))
    toast.success('Elemento rotado 90°')
  }

  const handleDeleteItem = (itemId: string) => {
    const item = layoutItems.find(it => it.id === itemId)
    if (!item) return
    
    if (item.agentId) {
      toast.error(`No puedes eliminar este escritorio porque está asignado a ${item.agentId}. Despide o desvincula al agente primero.`)
      return
    }
    
    if (confirm(`¿Estás seguro de que deseas eliminar "${item.name}"?`)) {
      setLayoutItems(prev => prev.filter(it => it.id !== itemId))
      setSelectedItemId(null)
      toast.success(`${item.name} eliminado de la oficina.`)
    }
  }

  const handleAddItem = (type: LayoutItem['type']) => {
    let w = 2
    let h = 2
    let name = 'Mobiliario'
    
    if (type === 'desk') {
      w = 3; h = 3; name = 'Escritorio'
    } else if (type === 'meeting') {
      w = 3; h = 2; name = 'Reuniones'
    } else if (type === 'lounge') {
      w = 4; h = 2; name = 'Lounge'
    } else if (type === 'plant') {
      w = 1; h = 1; name = 'Planta'
    } else if (type === 'shelf') {
      w = 2; h = 2; name = 'Estantería'
    }
    
    const newItem: LayoutItem = {
      id: `item_${Date.now()}`,
      name,
      type,
      col: 2,
      row: 3,
      w,
      h,
      rotation: 0
    }
    
    setLayoutItems(prev => [...prev, newItem])
    setSelectedItemId(newItem.id)
    setEditMode('move')
    toast.success(`¡${name} agregado! Arrástralo por la cuadrícula para ubicarlo.`)
  }

  const handleSaveLayout = async () => {
    try {
      const res = await fetch('/api/agent/office/layout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ layoutItems })
      })
      if (!res.ok) throw new Error('Error al guardar diseño')
      toast.success('¡Diseño de la oficina guardado exitosamente!')
      setIsEditingLayout(false)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Error de conexion')
    }
  }

  return {
    layoutItems,
    setLayoutItems,
    isEditingLayout,
    setIsEditingLayout,
    selectedItemId,
    setSelectedItemId,
    editMode,
    setEditMode,
    showGrid,
    setShowGrid,
    gridSize,
    setGridSize,
    isDragging,
    draggedItemId,
    dragOffset,
    gridRef,
    getAgentDeskPosition,
    getStationCoordinates,
    handleItemMouseDown,
    handleGridMouseMove,
    handleGridMouseUp,
    handleRotateItem,
    handleDeleteItem,
    handleAddItem,
    handleSaveLayout
  }
}
