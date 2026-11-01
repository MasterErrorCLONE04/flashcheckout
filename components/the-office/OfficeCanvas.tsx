import { Activity, Save } from 'lucide-react'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'
import { OfficeState } from './useOfficeState'
import { BASE_AGENTS, OFFICE_ASSET_URLS } from './types'

interface OfficeCanvasProps {
  office: OfficeState
  productsCount: number
  pendingOrdersCount?: number
  outOfStockCount?: number
}

export function OfficeCanvas({
  office,
  productsCount,
  pendingOrdersCount = 0,
  outOfStockCount = 0
}: OfficeCanvasProps) {
  const {
    layoutItems,
    isEditingLayout,
    selectedItemId,
    setSelectedItemId,
    editMode,
    setEditMode,
    showGrid,
    setShowGrid,
    gridSize,
    setGridSize,
    draggedItemId,
    agentPositions,
    agentFacingLeft,
    agentStatus,
    agentBubbles,
    processedSprites,
    processedAssets,
    selectedAgentId,
    setSelectedAgentId,
    customAgents,
    gridRef,
    handleItemMouseDown,
    handleGridMouseMove,
    handleGridMouseUp,
    handleRotateItem,
    handleDeleteItem,
    handleSaveLayout,
    triggerWaterCoolerTalk,
    setPrintedTicketsModalOpen,
    setCoffeeModalOpen,
    setConsolidatedLogs,
    setActiveTab,
    setInstruction
  } = office

  return (
    <div className="flex-1 w-full relative">
      <div 
        ref={gridRef}
        onMouseMove={handleGridMouseMove}
        onMouseUp={handleGridMouseUp}
        onMouseLeave={handleGridMouseUp}
        className="relative w-full aspect-[2/1] min-h-[380px] md:min-h-[480px] border border-zinc-300 rounded-none overflow-hidden shadow-2xl select-none"
        style={{
          backgroundImage: "url('/images/pixel_wall.png'), url('/images/pixel_floor.png')",
          backgroundSize: "100% 25%, 4.166% 8.333%",
          backgroundPosition: "top left, top left",
          backgroundRepeat: "no-repeat, repeat",
          imageRendering: 'pixelated'
        }}
      >
        {/* GRID LAYOUT OVERLAY */}
        {isEditingLayout && showGrid && (
          <div 
            className="absolute inset-0 pointer-events-none z-10"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(24, 1fr)',
              gridTemplateRows: 'repeat(12, 1fr)',
            }}
          >
            {Array.from({ length: 12 }).map((_, r) =>
              Array.from({ length: 24 }).map((_, c) => {
                const isWindowArea = r < 3
                const draggedItem = draggedItemId ? layoutItems.find(it => it.id === draggedItemId) : null
                
                const isOccupiedByDragged = draggedItem &&
                  c >= draggedItem.col && c < draggedItem.col + draggedItem.w &&
                  r >= draggedItem.row && r < draggedItem.row + draggedItem.h

                const isOccupiedByOther = layoutItems.some(it =>
                  it.id !== draggedItemId &&
                  c >= it.col && c < it.col + it.w &&
                  r >= it.row && r < it.row + it.h
                )

                let borderClass = 'border-white/5'
                let bgClass = 'bg-transparent'

                if (isWindowArea) {
                  bgClass = 'bg-red-500/5'
                  borderClass = 'border-red-500/10'
                } else if (isOccupiedByDragged) {
                  const isInvalid = draggedItem.row < 3 || isOccupiedByOther
                  bgClass = isInvalid ? 'bg-red-500/25' : 'bg-emerald-500/25'
                  borderClass = isInvalid ? 'border-red-500/40' : 'border-emerald-500/40'
                } else {
                  borderClass = 'border-zinc-300/15'
                }

                return (
                  <div
                    key={`${r}-${c}`}
                    className={cn(
                      "border-r border-b transition-all duration-100",
                      borderClass,
                      bgClass
                    )}
                  />
                )
              })
            )}
          </div>
        )}

        {/* STATIC & INTERACTIVE DYNAMIC FURNITURE */}
        {layoutItems.map(item => {
          const agent = item.type === 'desk' && item.agentId
            ? [...BASE_AGENTS, ...customAgents].find(a => a.id === item.agentId)
            : null

          const isAgentIdle = agent && (agentStatus[agent.id] === 'idle' || agentStatus[agent.id] === 'working' || !agentStatus[agent.id])

          let imgUrl = ''
          if (item.type === 'desk') {
            imgUrl = (agent && isAgentIdle) 
              ? (processedSprites[`desk_${agent.id}`] || agent.sittingDeskUrl) 
              : (processedAssets.Desk || OFFICE_ASSET_URLS.Desk)
          } else if (item.type === 'whiteboard') {
            imgUrl = processedAssets.Board || OFFICE_ASSET_URLS.Board
          } else if (item.type === 'printer') {
            imgUrl = processedAssets.Printer || OFFICE_ASSET_URLS.Printer
          } else if (item.type === 'coffee') {
            imgUrl = processedAssets.Coffee || OFFICE_ASSET_URLS.Coffee
          } else if (item.type === 'water') {
            imgUrl = processedAssets.Water || OFFICE_ASSET_URLS.Water
          } else if (item.type === 'plant') {
            imgUrl = processedAssets.Plant || OFFICE_ASSET_URLS.Plant
          } else if (item.type === 'lounge') {
            imgUrl = processedAssets.Lounge || '/images/furniture_sofa_corner.png'
          } else if (item.type === 'shelf') {
            imgUrl = processedAssets.Shelf || '/images/office_bookshelf_tall.png'
          } else if (item.type === 'meeting') {
            imgUrl = processedAssets.Meeting || '/images/desk_l_marketing.png'
          }

          const isSelected = selectedItemId === item.id && isEditingLayout

          const handleItemClick = (e: React.MouseEvent) => {
            e.stopPropagation()
            if (isEditingLayout) {
              setSelectedItemId(item.id)
              if (editMode === 'rotate') {
                handleRotateItem(item.id)
              } else if (editMode === 'delete') {
                handleDeleteItem(item.id)
              }
            } else {
              if (item.type === 'desk' && agent) {
                setSelectedAgentId(agent.id)
              } else if (item.type === 'printer') {
                setPrintedTicketsModalOpen(true)
              } else if (item.type === 'coffee') {
                setCoffeeModalOpen(true)
              } else if (item.type === 'water') {
                triggerWaterCoolerTalk()
              } else if (item.type === 'whiteboard') {
                const timeStr = new Date().toLocaleTimeString()
                setConsolidatedLogs(prev => [
                  ...prev,
                  `[${timeStr}] [System] Inspeccionando Pizarra: Catálogo con ${productsCount} productos y logs operativos.`
                ])
                toast.info('Pizarra: Todo el equipo agéntico sincronizado.')
              }
            }
          }

          const onMouseDown = (e: React.MouseEvent) => {
            if (isEditingLayout && editMode === 'move') {
              handleItemMouseDown(e, item.id)
            }
          }

          return (
            <div
              key={item.id}
              onClick={handleItemClick}
              onMouseDown={onMouseDown}
              className={cn(
                "absolute flex flex-col justify-end items-center p-1.5 select-none",
                isEditingLayout ? "cursor-grab active:cursor-grabbing border border-dashed border-zinc-700/30 hover:bg-zinc-800/10" : "",
                isSelected ? "border-2 border-solid border-purple-500 rounded-2xl" : "",
                !isEditingLayout && item.type === 'desk' && agent ? "bg-zinc-950/20 backdrop-blur-[1px] border border-zinc-700/60 rounded-xl" : ""
              )}
              style={{
                left: `${item.col * 4.166}%`,
                top: `${item.row * 8.333}%`,
                width: `${item.w * 4.166}%`,
                height: `${item.h * 8.333}%`,
                transform: `rotate(${item.rotation || 0}deg)`,
                imageRendering: 'pixelated',
                zIndex: item.type === 'plant' ? 12 : 11
              }}
            >
              {isSelected && (
                <>
                  <span className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-purple-500 rounded-full z-30" />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-purple-500 rounded-full z-30" />
                  <span className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-purple-500 rounded-full z-30" />
                  <span className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-purple-500 rounded-full z-30" />
                </>
              )}

              {!isEditingLayout && item.type === 'desk' && (
                agent ? (
                  <div className="absolute top-1 left-1/2 -translate-x-1/2 w-[90%] bg-zinc-900/90 border border-zinc-800 rounded px-1.5 py-0.5 text-center shadow-sm select-none z-20">
                    <span className="flex items-center justify-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="text-[7.5px] font-black text-white uppercase tracking-wide truncate">{agent.name}</span>
                    </span>
                  </div>
                ) : (
                  <div className="absolute top-1 left-1/2 -translate-x-1/2 w-[90%] text-center select-none z-20">
                    <span className="text-[7px] font-bold text-zinc-500 uppercase tracking-widest block">Vacante</span>
                  </div>
                )
              )}

              {!isEditingLayout && item.type === 'desk' && agent && agent.id === 'Logistics' && pendingOrdersCount > 0 && (
                <div 
                  className="absolute -top-2.5 -right-2.5 bg-red-600 hover:bg-red-500 text-white font-extrabold text-[8px] px-2 py-1 rounded-full shadow-lg border border-red-500 animate-bounce flex items-center gap-1 cursor-pointer z-30 select-none"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedAgentId(agent.id)
                    setActiveTab('console')
                    setInstruction('Despacha los pedidos pendientes')
                    toast.info('Coordinador seleccionado. Ejecuta la orden para despachar.')
                  }}
                >
                  <span>📦 {pendingOrdersCount}</span>
                </div>
              )}

              {!isEditingLayout && item.type === 'desk' && agent && (agent.id === 'Nova' || agent.id === 'SalesBot') && outOfStockCount > 0 && (
                <div 
                  className="absolute -top-2.5 -right-2.5 bg-amber-600 hover:bg-amber-500 text-white font-extrabold text-[8px] px-2 py-1 rounded-full shadow-lg border border-amber-500 animate-bounce flex items-center gap-1 cursor-pointer z-30 select-none"
                  onClick={(e) => {
                    e.stopPropagation()
                    setSelectedAgentId(agent.id)
                    setActiveTab('console')
                    setInstruction('Lista los productos agotados en stock')
                    toast.info('Agente seleccionado. Ejecuta la orden para ver stock.')
                  }}
                >
                  <span>⚠️ {outOfStockCount}</span>
                </div>
              )}

              {imgUrl ? (
                (item.type === 'desk' && agent && isAgentIdle && (
                  agent.id === 'SalesBot' || 
                  agent.sittingDeskUrl.includes('deskt') || 
                  agent.sittingDeskUrl.includes('deskt2') || 
                  agent.sittingDeskUrl.includes('deskt3') ||
                  agent.sittingDeskUrl.includes('deskt4')
                )) ? (
                  <div 
                    className="w-full h-full bg-no-repeat bg-contain bg-center mix-blend-multiply"
                    style={{
                      animation: agent.sittingDeskUrl.includes('deskt4')
                        ? 'growthDeskAnim 2.5s infinite'
                        : agent.sittingDeskUrl.includes('deskt3')
                        ? 'logisticsDeskAnim 2.0s infinite'
                        : agent.sittingDeskUrl.includes('deskt2')
                        ? 'novaDeskAnim 2.0s infinite'
                        : 'salesDeskAnim 1.5s infinite',
                      width: '100%',
                      height: '92%',
                      imageRendering: 'pixelated'
                    }}
                  />
                ) : (
                  <img
                    src={imgUrl}
                    alt={item.name}
                    className="max-w-full max-h-[85%] object-contain mix-blend-multiply"
                    style={{ imageRendering: 'pixelated' }}
                  />
                )
              ) : (
                <div className="w-[85%] h-[80%] bg-zinc-900 border border-zinc-800 rounded-lg flex flex-col items-center justify-center text-center">
                  <span className="text-xl">
                    {item.type === 'meeting' ? '👥' : item.type === 'shelf' ? '📚' : '📦'}
                  </span>
                  <span className="text-[6.5px] text-zinc-500 font-black uppercase mt-0.5">{item.name}</span>
                </div>
              )}

              {isEditingLayout && (
                <span className="absolute bottom-1 right-1 bg-zinc-950/80 text-[6.5px] font-bold text-zinc-400 px-1 rounded block pointer-events-none select-none">
                  {item.w}x{item.h}
                </span>
              )}
            </div>
          )
        })}

        {/* DYNAMIC AGENT CHARACTERS */}
        {[...BASE_AGENTS, ...customAgents].map(agent => {
          const isActive = selectedAgentId === agent.id
          const position = agentPositions[agent.id] || office.getAgentDeskPosition(agent.id)
          const isLeft = agentFacingLeft[agent.id]
          const status = agentStatus[agent.id] || 'idle'
          
          return (
            <div 
              key={agent.id}
              className="absolute group z-20 transition-all duration-[3000ms] ease-in-out"
              style={{
                top: position.top,
                left: position.left,
                transform: 'translate(-50%, -50%)'
              }}
            >
              <div className="flex flex-col items-center">
                <button 
                  type="button"
                  onClick={() => {
                    if (!isEditingLayout) setSelectedAgentId(agent.id)
                  }}
                  className={cn(
                    "w-12 h-12 flex flex-col justify-end items-center relative outline-none cursor-pointer transform transition-all duration-300 z-10",
                    status === 'walking' ? "animate-bounce" : ""
                  )}
                  style={{ animationDuration: '0.8s' }}
                >
                  {status === 'walking' && (
                    <img 
                      src={processedSprites[agent.id] || agent.spriteUrl} 
                      alt={agent.name} 
                      className={cn(
                        "w-11 h-11 object-contain select-none transition-transform pointer-events-none mix-blend-multiply",
                        isLeft ? "scale-x-[-1]" : "",
                        isActive ? "scale-110 drop-shadow-[0_0_6px_rgba(255,255,255,0.8)]" : ""
                      )}
                      style={{ imageRendering: 'pixelated' }}
                    />
                  )}

                  <span className={cn(
                    "absolute bottom-0 w-6 h-1 rounded-full opacity-65 -z-10 blur-[1px]",
                    status === 'idle' ? 'bg-emerald-500/80 animate-pulse' :
                    status === 'walking' ? 'bg-blue-500/80' :
                    'bg-purple-500/80 animate-pulse'
                  )} />
                </button>
              </div>
            </div>
          )
        })}

        {/* Grid controls overlay when editing */}
        {isEditingLayout && (
          <div className="absolute top-4 left-4 bg-zinc-950/90 border border-zinc-800 backdrop-blur text-white p-3 rounded-xl shadow-lg z-30 flex flex-col gap-2 max-w-xs text-xs font-semibold text-left">
            <label className="flex items-center gap-2 cursor-pointer select-none text-[9px] uppercase font-black tracking-wider text-zinc-400">
              <input
                type="checkbox"
                checked={showGrid}
                onChange={() => setShowGrid(!showGrid)}
                className="rounded border-zinc-800 bg-zinc-900 text-purple-500 focus:ring-0 cursor-pointer"
              />
              <span>Mostrar cuadrícula</span>
            </label>
            <div>
              <span className="text-[8px] text-zinc-500 uppercase font-black block mb-1">Tamaño de cuadrícula</span>
              <select
                value={gridSize}
                onChange={e => setGridSize(Number(e.target.value))}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-[9px] text-white focus:outline-none"
              >
                <option value={16}>16px</option>
                <option value={32}>32px (Estándar)</option>
                <option value={48}>48px</option>
              </select>
            </div>
          </div>
        )}

        {/* Floating Controls Tip info overlay when not editing */}
        {!isEditingLayout && (
          <div className="absolute bottom-4 left-4 bg-zinc-900/85 backdrop-blur text-white px-3 py-2 rounded-xl text-[10px] font-semibold flex items-center gap-2 max-w-xs shadow-md border border-zinc-800 select-none z-20">
            <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Oficina Pixel Art de Flashcheckouts. Haz clic en un agente para abrir su terminal e ingresarle tareas.</span>
          </div>
        )}

        {/* Bottom toolbar for editor mode */}
        {isEditingLayout && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-zinc-950/90 border border-zinc-800 backdrop-blur rounded-xl px-4 py-2 flex items-center gap-3 shadow-xl z-30 select-none">
            <button
              type="button"
              onClick={() => setEditMode('select')}
              className={cn(
                "flex items-center gap-1 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer active:scale-95",
                editMode === 'select' ? "bg-purple-600 text-white" : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              <span>Seleccionar</span>
            </button>
            <button
              type="button"
              onClick={() => setEditMode('move')}
              className={cn(
                "flex items-center gap-1 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer active:scale-95",
                editMode === 'move' ? "bg-purple-600 text-white" : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              <span>Mover</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (selectedItemId) {
                  handleRotateItem(selectedItemId)
                } else {
                  setEditMode('rotate')
                  toast.info('Modo Rotar activo: Haz clic en un mueble para rotarlo.')
                }
              }}
              className={cn(
                "flex items-center gap-1 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer active:scale-95",
                editMode === 'rotate' ? "bg-purple-600 text-white" : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              <span>Rotar</span>
            </button>
            <button
              type="button"
              onClick={() => {
                if (selectedItemId) {
                  handleDeleteItem(selectedItemId)
                } else {
                  setEditMode('delete')
                  toast.info('Modo Eliminar activo: Haz clic en un mueble para borrarlo.')
                }
              }}
              className={cn(
                "flex items-center gap-1 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer active:scale-95",
                editMode === 'delete' ? "bg-purple-600 text-white" : "text-zinc-400 hover:text-zinc-200"
              )}
            >
              <span>Eliminar</span>
            </button>
            <div className="w-px h-5 bg-zinc-800" />
            <button
              type="button"
              onClick={handleSaveLayout}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-[9px] font-black uppercase tracking-wider px-3.5 py-1.5 rounded-lg active:scale-95 cursor-pointer transition-all flex items-center gap-1 shadow-md"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Guardar diseño</span>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
