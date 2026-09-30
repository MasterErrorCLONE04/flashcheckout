'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  BackgroundVariant,
  MarkerType
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import {
  Activity,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Layers,
  Cpu,
  Database,
  ArrowRight,
  Sparkles,
  Bot,
  UserCheck,
  FileCode2,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Zap,
  ShoppingBag,
  MessageSquare,
  Truck,
  Palette,
  Maximize2,
  Plus,
  Copy,
  Check,
  Search,
  ChevronRight,
  Play,
  X,
  Download,
  Filter,
  Kanban,
  Server,
  Flame,
  Globe,
  FileText,
  Workflow,
  BookOpen,
  Layout,
  Code2,
  CheckSquare,
  Compass,
  Lock,
  Unlock,
  AlertCircle,
  Users,
  Target,
  Ban,
  TrendingUp,
  BarChart3,
  SearchCheck,
  KeyRound,
  ShieldAlert,
  FileSpreadsheet,
  TestTube2,
  GitCompare,
  History,
  HelpCircle,
  Send,
  CheckCircle,
  XCircle,
  AlertOctagon
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'

// TypeScript Data Interfaces
interface ChecklistItem {
  id: string
  text: string
  done: boolean
}

interface AcceptanceCriterion {
  id: string
  text: string
  done: boolean
}

interface UserStory {
  id: string
  epicId: string
  title: string
  role: string
  action: string
  benefit: string
  points: number
  priority: 'P0' | 'P1' | 'P2'
  status: 'backlog' | 'in_progress' | 'done'
  assignedTo: string
  scopeFiles: string[]
  acceptanceCriteria: AcceptanceCriterion[]
  origin?: 'inferred' | 'confirmed'
}

interface Epic {
  id: string
  key: string
  name: string
  description: string
  color: string
  priority: 'P0' | 'P1' | 'P2'
  status: string
  targetWeek: number
  progress: number
}

interface UseCase {
  id: string
  name: string
  actor: string
  secondaryActors: string[]
  precondition: string
  postcondition: string
  mainFlow: string[]
  alternativeFlows: string[]
}

interface SequenceStep {
  from: string
  to: string
  action: string
  type: 'sync' | 'async' | 'db' | 'user'
}

interface SequenceDiagramData {
  id: string
  name: string
  description: string
  mermaid: string
  actors: string[]
  steps: SequenceStep[]
}

interface UiScreen {
  id: string
  name: string
  route: string
  previewUrl: string
  layout: string
  status: 'todo' | 'in_progress' | 'done'
  healthPercent: number
  components: string[]
  wireframeDescription: string
  checklist: ChecklistItem[]
}

interface FlowNodeData {
  id: string
  name: string
  status: 'todo' | 'in_progress' | 'done'
  assignedTo?: string
  scopeFiles: string[]
  agentPrompt?: string
  checklist: ChecklistItem[]
  origin?: 'inferred' | 'confirmed'
  flowId?: string
  flowName?: string
  flowPriority?: 'P0' | 'P1' | 'P2'
  onToggleTask?: (flowId: string, nodeId: string, taskId: string, done: boolean) => void
  onSelectNode?: (node: any) => void
}

interface FlowData {
  id: string
  name: string
  category: string
  priority: 'P0' | 'P1' | 'P2'
  targetWeek: number
  progress: number
  description: string
  nodes: FlowNodeData[]
}

interface ServiceHealthInfo {
  status: 'healthy' | 'degraded' | 'down'
  latencyMs: number
  message: string
}

interface ArchitectureNode {
  id: string
  label: string
  type: string
  status: string
  tech: string
  port?: number
  healthPercent: number
  description: string
  connectedFlows?: string[]
  submodules?: string[]
  tasks?: ChecklistItem[]
  origin?: 'inferred' | 'confirmed'
  liveHealth?: ServiceHealthInfo
  onSelectService?: (service: any) => void
}

interface ArchitectureEdge {
  from: string
  to: string
  label: string
}

interface ProjectData {
  name: string
  tagline: string
  methodology: string
  purpose: 'comercial' | 'interno' | 'open_source' | 'personal' | 'social'
  depth: 'pequeño_mvp' | 'serio' | 'escala_critica'
  version: string
  targetLaunchWeeks: number
  profile: {
    purposeDescription: string
    depthDescription: string
    requiredGates: Array<{
      id: string
      name: string
      file: string
      status: 'passed' | 'pending' | 'blocked'
      description: string
    }>
    allGatesPassed: boolean
  }
}

interface CoreData {
  problem: {
    title: string
    summary: string
    painPoints: Array<{
      id: string
      actor: string
      severity: string
      pain: string
      evidence: string
      solution: string
    }>
  }
  targetUsers: Array<{
    id: string
    name: string
    role: string
    profile: string
    techSavviness: string
    goals: string[]
    frustrations: string[]
  }>
  scopeBoundaries: {
    version: string
    launchTimelineWeeks: number
    scopePhilosophy: string
    inScope: Array<{
      area: string
      deliverables: string[]
    }>
    explicitNonGoals: Array<{
      id: string
      feature: string
      rationale: string
    }>
  }
  successCriteria: Array<{
    id: string
    name: string
    target: string
    measurement: string
    status: string
    currentValue: string
  }>
}

interface DiscoveryInterviewQuestion {
  id: string
  question: string
  answer: string
  status: 'answered' | 'in_progress' | 'not_applicable'
  isNotApplicable?: boolean
  notApplicableReason?: string
  insights?: string
}

interface DiscoverySession {
  id: string
  category: string
  description: string
  questions: DiscoveryInterviewQuestion[]
}

interface DiscoveryHypothesis {
  id: string
  statement: string
  metric: string
  validationMethod: string
  status: string
  resultNote: string
}

interface CompetitorComparison {
  name: string
  model: string
  feePerTx: string
  whatsappIntegration: string
  validationSpeed: string
  dispatch: string
  differentiator: string
}

interface DatabaseEntity {
  name: string
  table: string
  description: string
  primaryKey: string
  attributes?: Array<{
    name: string
    type: string
    required?: boolean
    description?: string
  }>
  relations?: Array<{
    type: string
    target: string
    foreignKey?: string
    description?: string
  }>
  indexes?: string[]
}

interface RoleDefinition {
  id: string
  name: string
  description: string
  authProvider: string
  guardMiddleware: string
}

interface PermissionResource {
  resource: string
  permissions: Record<string, string[]>
}

interface RiskItem {
  id: string
  category: string
  title: string
  probability: string
  impact: string
  severityScore: number
  earlyWarningIndicator: string
  mitigationStrategy: string
  owner: string
}

interface TestCase {
  id: string
  title: string
  preconditions: string
  steps: string[]
  expectedResult: string
  status: string
}

interface TestSuite {
  id: string
  name: string
  priority: string
  automated: boolean
  testCases: TestCase[]
}

interface DriftReportData {
  driftScore: number
  isClean: boolean
  totalModified: number
  inScope: string[]
  outOfScope: string[]
  declaredCount: number
}

interface SddData {
  project?: ProjectData
  core?: CoreData & { risks?: { risks: RiskItem[] } }
  discovery?: {
    interviews?: {
      version: string
      lastUpdated: string
      interviewSessions: DiscoverySession[]
    }
    hypotheses?: {
      version: string
      hypotheses: DiscoveryHypothesis[]
    }
    competitors?: {
      version: string
      competitors: CompetitorComparison[]
    }
  }
  manifest: {
    project: string
    version: string
    targetLaunchWeeks: number
    lastUpdated: string
    metrics: {
      globalHealth: number
      architectureHealth: number
      flowsHealth: number
      uiHealth: number
      totalFlows: number
    }
    flowsSummary: Array<{
      id: string
      name: string
      priority: string
      progress: number
    }>
  }
  architecture: {
    nodes: ArchitectureNode[]
    edges: ArchitectureEdge[]
  }
  flows: FlowData[]
  requirements?: {
    epics: Epic[]
    userStories: UserStory[]
    useCases: UseCase[]
    rolesMatrix?: {
      roles: RoleDefinition[]
      matrix: PermissionResource[]
    }
  }
  database?: {
    engine: string
    orm: string
    mermaid: string
    entities: DatabaseEntity[]
  }
  testPlan?: {
    frameworks: string[]
    testSuites: TestSuite[]
  }
  sequences?: SequenceDiagramData[]
  uiUx?: {
    screens: UiScreen[]
  }
  drift?: DriftReportData
}

interface SystemHealthPayload {
  health: Record<string, ServiceHealthInfo>
  system: {
    uptimeSeconds: number
    memoryUsageMb: number
    nodeVersion: string
    nextVersion: string
    env: string
  }
  timestamp: string
}

// Scope File Route Detector
function getScopeFileRoute(filePath: string): { url: string; label: string } | null {
  if (filePath.includes('app/tienda/[slug]')) return { url: '/tienda/demo', label: 'Tienda Móvil (/tienda/demo)' }
  if (filePath.includes('app/pay/[orderId]')) return { url: '/pay/test-order', label: 'SmartPay Bre-B (/pay/test-order)' }
  if (filePath.includes('components/WhatsAppCatalog.tsx')) return { url: '/tienda/demo', label: 'Catálogo Web (/tienda/demo)' }
  if (filePath.includes('app/(dashboard)/productos')) return { url: '/productos', label: 'Productos (/productos)' }
  if (filePath.includes('app/(dashboard)/pedidos')) return { url: '/pedidos', label: 'Pedidos (/pedidos)' }
  if (filePath.includes('app/(dashboard)/clientes')) return { url: '/clientes', label: 'Clientes CRM (/clientes)' }
  if (filePath.includes('app/(dashboard)/conversaciones') || filePath.includes('historial-chats')) return { url: '/conversaciones', label: 'Conversaciones WhatsApp (/conversaciones)' }
  if (filePath.includes('app/(dashboard)/automatizaciones')) return { url: '/automatizaciones', label: 'Automatizaciones (/automatizaciones)' }
  if (filePath.includes('app/(dashboard)/analitica')) return { url: '/analitica', label: 'Analítica (/analitica)' }
  if (filePath.includes('app/(dashboard)/studio')) return { url: '/studio', label: 'Studio IA (/studio)' }
  if (filePath.includes('app/(dashboard)/repartidores')) return { url: '/repartidores', label: 'Repartidores (/repartidores)' }
  if (filePath.includes('app/(dashboard)/configuracion') || filePath.includes('SettingsPageContent')) return { url: '/configuracion', label: 'Configuración (/configuracion)' }
  if (filePath.includes('app/(dashboard)/layout') || filePath.includes('DashboardPageContent')) return { url: '/dashboard', label: 'Dashboard (/dashboard)' }
  if (filePath.includes('app/api/cron/abandoned-carts')) return { url: '/api/cron/abandoned-carts', label: 'Endpoint Cron Carritos' }
  return null
}

// Custom Node for Flows (Micro View)
function FlowStepNode({ data }: { data: FlowNodeData }) {
  const isDone = data.status === 'done'
  const isInProgress = data.status === 'in_progress'
  const completedTasks = data.checklist?.filter(t => t.done).length || 0
  const totalTasks = data.checklist?.length || 0
  const percent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : isDone ? 100 : 0

  return (
    <div
      onClick={() => data.onSelectNode?.(data)}
      className={`w-80 rounded-xl border p-4 shadow-sm transition-all cursor-pointer select-none bg-white ${
        isDone
          ? 'border-emerald-200 hover:border-emerald-400 hover:shadow-emerald-50'
          : isInProgress
          ? 'border-amber-300 ring-2 ring-amber-100 hover:border-amber-400'
          : 'border-zinc-200 hover:border-zinc-300'
      }`}
    >
      <Handle type="target" position={Position.Left} className="!bg-zinc-400 !w-2.5 !h-2.5" />

      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span
          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
            isDone
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : isInProgress
              ? 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
              : 'bg-zinc-100 text-zinc-600'
          }`}
        >
          {isDone ? 'Completado' : isInProgress ? 'En Progreso' : 'Pendiente'}
        </span>
        <span className="text-[11px] font-semibold text-zinc-400 flex items-center gap-1">
          <Bot className="w-3.5 h-3.5 text-zinc-500" />
          {data.assignedTo || 'Sin asignar'}
        </span>
      </div>

      {/* Title */}
      <h4 className="text-sm font-bold text-zinc-900 leading-tight mb-2">{data.name}</h4>

      {/* Progress Bar */}
      <div className="space-y-1 mb-3">
        <div className="flex justify-between text-[11px] font-medium text-zinc-500">
          <span>Checklist</span>
          <span>{completedTasks}/{totalTasks} ({percent}%)</span>
        </div>
        <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-300 ${
              isDone ? 'bg-emerald-500' : isInProgress ? 'bg-amber-500' : 'bg-zinc-300'
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Interactive Subtasks list preview */}
      <div className="space-y-1.5 pt-2 border-t border-zinc-100">
        {data.checklist?.slice(0, 3).map(task => (
          <label
            key={task.id}
            onClick={(e) => e.stopPropagation()}
            className="flex items-start gap-2 text-[11px] text-zinc-750 cursor-pointer hover:text-zinc-950"
          >
            <input
              type="checkbox"
              checked={task.done}
              onChange={(e) => {
                if (data.flowId && data.onToggleTask) {
                  data.onToggleTask(data.flowId, data.id, task.id, e.target.checked)
                }
              }}
              className="mt-0.5 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer"
            />
            <span className={task.done ? 'line-through text-zinc-400' : 'text-zinc-700'}>
              {task.text}
            </span>
          </label>
        ))}
        {totalTasks > 3 && (
          <p className="text-[10px] text-zinc-400 font-medium text-right pt-0.5">
            +{totalTasks - 3} tareas más en inspector
          </p>
        )}
      </div>

      <Handle type="source" position={Position.Right} className="!bg-zinc-400 !w-2.5 !h-2.5" />
    </div>
  )
}

// Custom Node for Architecture (Macro View)
function ArchServiceNode({ data }: { data: ArchitectureNode }) {
  const isHealthy = data.liveHealth ? data.liveHealth.status === 'healthy' : data.status === 'healthy'
  const isDown = data.liveHealth ? data.liveHealth.status === 'down' : false

  return (
    <div
      onClick={() => data.onSelectService?.(data)}
      className="w-80 bg-zinc-900 border border-zinc-700 text-white rounded-xl p-4 shadow-xl select-none hover:border-indigo-400 transition-all cursor-pointer group"
    >
      <Handle type="target" position={Position.Left} className="!bg-indigo-400 !w-2.5 !h-2.5" />
      
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest">
          {data.type}
        </span>
        <div className="flex items-center gap-1.5">
          <div className={`w-2 h-2 rounded-full ${
            isDown ? 'bg-rose-500 animate-ping' : isHealthy ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
          }`} />
          {data.liveHealth ? (
            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-emerald-300 border border-zinc-700">
              {data.liveHealth.latencyMs}ms
            </span>
          ) : (
            <span className="text-[11px] font-bold text-zinc-300">{data.healthPercent}%</span>
          )}
        </div>
      </div>

      <h3 className="text-sm font-black text-white mb-1 group-hover:text-indigo-300 transition-colors">
        {data.label}
      </h3>
      <p className="text-[11px] text-zinc-400 line-clamp-2 mb-3">{data.description}</p>

      {/* Submodules tags preview */}
      {data.submodules && data.submodules.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {data.submodules.slice(0, 3).map((sub, idx) => (
            <span key={idx} className="text-[9px] font-medium bg-zinc-800 text-zinc-300 px-1.5 py-0.5 rounded border border-zinc-700">
              {sub.split(' ')[0]}
            </span>
          ))}
          {data.submodules.length > 3 && (
            <span className="text-[9px] text-zinc-500 font-bold self-center">
              +{data.submodules.length - 3} más
            </span>
          )}
        </div>
      )}

      {/* Footer bar */}
      <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 pt-2 border-t border-zinc-800">
        <span className="truncate max-w-[130px]">{data.tech}</span>
        <div className="flex items-center gap-1 text-indigo-400 group-hover:translate-x-0.5 transition-transform font-bold">
          <span>Inspeccionar</span>
          <ArrowRight className="w-3 h-3" />
        </div>
      </div>

      <Handle type="source" position={Position.Right} className="!bg-indigo-400 !w-2.5 !h-2.5" />
    </div>
  )
}

const nodeTypes = {
  flowStep: FlowStepNode,
  archService: ArchServiceNode
}

export default function SddDashboardClient() {
  const [mounted, setMounted] = useState(false)
  const [data, setData] = useState<SddData | null>(null)
  const [loading, setLoading] = useState(true)

  // Spec-Driven Development Perspectives:
  // core | discovery | stories | sequences | flows | architecture | database | security | qa | drift | uiux | kanban
  const [viewPerspective, setViewPerspective] = useState<
    'core' | 'discovery' | 'stories' | 'sequences' | 'flows' | 'architecture' | 'database' | 'security' | 'qa' | 'drift' | 'uiux' | 'kanban'
  >('core')

  // Selected Entities
  const [activeFlowId, setActiveFlowId] = useState<string>('01-catalogo-checkout-web')
  const [selectedNode, setSelectedNode] = useState<FlowNodeData | ArchitectureNode | null>(null)
  const [selectedType, setSelectedType] = useState<'flow_node' | 'arch_service'>('flow_node')
  const [selectedEpicFilter, setSelectedEpicFilter] = useState<string>('all')
  const [activeSequenceId, setActiveSequenceId] = useState<string>('SEQ-01')

  // Discovery Perspective State
  const [discoveryTab, setDiscoveryTab] = useState<'interview' | 'hypotheses' | 'competitors'>('interview')
  const [selectedSessionId, setSelectedSessionId] = useState<string>('DISC-SEC-01')
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null)
  const [draftAnswer, setDraftAnswer] = useState<string>('')
  const [isNotApp, setIsNotApp] = useState<boolean>(false)
  const [draftNotAppReason, setDraftNotAppReason] = useState<string>('')

  // Database & QA Selected Items
  const [selectedDbEntity, setSelectedDbEntity] = useState<string>('Order')
  const [selectedSuiteId, setSelectedSuiteId] = useState<string>('SUITE-01')

  // Quality Gates Gating Guard Modal
  const [gateBlockedModalOpen, setGateBlockedModalOpen] = useState(false)

  // Feature: P0 Anti-distraction Filter
  const [onlyP0, setOnlyP0] = useState(false)

  // Feature: DevOps Live Health Check
  const [liveHealth, setLiveHealth] = useState<SystemHealthPayload | null>(null)
  const [isHealthChecking, setIsHealthChecking] = useState(false)
  const [isHealthModalOpen, setIsHealthModalOpen] = useState(false)

  // Feature: Spotlight Quick Search (Ctrl+K)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Feature: Executive Launch Report Modal
  const [isReportModalOpen, setIsReportModalOpen] = useState(false)

  // Form states to add new stories or tasks
  const [newTaskText, setNewTaskText] = useState('')
  const [addingTask, setAddingTask] = useState(false)
  const [copiedPrompt, setCopiedPrompt] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([])

  // Cargar datos desde /api/sdd
  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/sdd')
      if (!res.ok) throw new Error('Error al consultar datos SDD')
      const json = await res.json()
      setData(json)
    } catch (err: any) {
      toast.error('Error al sincronizar con .sdd/: ' + err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  // Ejecutar Health Check en vivo
  const runLiveHealthCheck = useCallback(async () => {
    try {
      setIsHealthChecking(true)
      const res = await fetch('/api/sdd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'health_check' })
      })
      if (!res.ok) throw new Error('Fallo en diagnóstico de servicios')
      const json = await res.json()
      setLiveHealth(json)
    } catch (err: any) {
      console.warn('Health check warning:', err.message)
    } finally {
      setIsHealthChecking(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
    runLiveHealthCheck()
  }, [fetchData, runLiveHealthCheck])

  // Listener para Ctrl+K / Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setIsSearchOpen(prev => !prev)
      } else if (e.key === 'Escape') {
        setIsSearchOpen(false)
        setIsHealthModalOpen(false)
        setIsReportModalOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Mutar criterio de aceptación en Historia de Usuario (1 archivo por entidad)
  const handleToggleStoryCriterion = async (storyId: string, criterionId: string, done: boolean) => {
    try {
      setData(prev => {
        if (!prev || !prev.requirements) return prev
        const nextStories = prev.requirements.userStories.map(story => {
          if (story.id !== storyId) return story
          const nextCriteria = story.acceptanceCriteria.map(ac => (ac.id === criterionId ? { ...ac, done } : ac))
          const allDone = nextCriteria.every(ac => ac.done)
          const someDone = nextCriteria.some(ac => ac.done)
          return {
            ...story,
            acceptanceCriteria: nextCriteria,
            status: (allDone ? 'done' : someDone ? 'in_progress' : 'backlog') as any
          }
        })
        return {
          ...prev,
          requirements: {
            ...prev.requirements,
            userStories: nextStories
          }
        }
      })

      const res = await fetch('/api/sdd', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storyId, criterionId, done })
      })
      if (!res.ok) throw new Error('Fallo al actualizar criterio en disco')
      toast.success(`Criterio guardado en .sdd/requirements/stories/${storyId}.json`)
      fetchData()
    } catch (err: any) {
      toast.error('Error: ' + err.message)
      fetchData()
    }
  }

  // Mutar checklist de Pantalla UI/UX
  const handleToggleScreenChecklist = async (screenId: string, checklistId: string, done: boolean) => {
    try {
      setData(prev => {
        if (!prev || !prev.uiUx) return prev
        const nextScreens = prev.uiUx.screens.map(scr => {
          if (scr.id !== screenId) return scr
          const nextChecklist = scr.checklist.map(ch => (ch.id === checklistId ? { ...ch, done } : ch))
          return { ...scr, checklist: nextChecklist }
        })
        return {
          ...prev,
          uiUx: { screens: nextScreens }
        }
      })

      const res = await fetch('/api/sdd', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ screenId, checklistId, done })
      })
      if (!res.ok) throw new Error('Fallo al actualizar pantalla en disco')
      toast.success('Checklist UI actualizado')
      fetchData()
    } catch (err: any) {
      toast.error('Error: ' + err.message)
      fetchData()
    }
  }

  // Toggle checklist task en Flujos (Micro View)
  const handleToggleTask = async (flowId: string, nodeId: string, taskId: string, done: boolean) => {
    try {
      setData(prev => {
        if (!prev) return prev
        const nextFlows = prev.flows.map(f => {
          if (f.id !== flowId) return f
          const nextNodes = f.nodes.map(n => {
            if (n.id !== nodeId) return n
            const nextChecklist = n.checklist.map(t => (t.id === taskId ? { ...t, done } : t))
            const allDone = nextChecklist.every(t => t.done)
            const someDone = nextChecklist.some(t => t.done)
            return {
              ...n,
              checklist: nextChecklist,
              status: (allDone ? 'done' : someDone ? 'in_progress' : 'todo') as any
            }
          })
          return { ...f, nodes: nextNodes }
        })
        return { ...prev, flows: nextFlows }
      })

      const res = await fetch('/api/sdd', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flowId, nodeId, taskId, done, assignedTo: 'Antigravity' })
      })

      if (!res.ok) throw new Error('Fallo al guardar cambio en disco')
      toast.success('Checklist actualizado en disco (.sdd/flows/)')
      fetchData()
    } catch (err: any) {
      toast.error('Error: ' + err.message)
      fetchData()
    }
  }

  // Asignar agente a nodo y disparar orden
  const handleAssignAgent = async () => {
    if (!selectedNode || selectedType !== 'flow_node') return
    const flowId = (selectedNode as FlowNodeData).flowId || activeFlowId
    const nodeId = (selectedNode as FlowNodeData).id

    try {
      const res = await fetch('/api/sdd', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flowId, nodeId, assignedTo: 'Antigravity', status: 'in_progress' })
      })
      if (!res.ok) throw new Error('Fallo al asignar agente')

      setSelectedNode((prev: any) => ({
        ...prev,
        assignedTo: 'Antigravity',
        status: 'in_progress'
      }))
      toast.success('¡Nodo asignado a Antigravity! Orden lista para ejecutar.')
      fetchData()
    } catch (err: any) {
      toast.error('Error: ' + err.message)
    }
  }

  // Drill down from architecture service into connected flow
  const handleDrillDownToFlow = (flowId: string) => {
    setViewPerspective('flows')
    setActiveFlowId(flowId)
    setSelectedNode(null)
    toast.info(`Ingresando al pipeline ${flowId}`)
  }

  // Gating & Quality Gates Logic
  const allGatesPassed = useMemo(() => {
    if (!data?.project?.profile?.requiredGates) return true
    return data.project.profile.requiredGates.every(g => g.status === 'passed')
  }, [data])

  const pendingGates = useMemo(() => {
    if (!data?.project?.profile?.requiredGates) return []
    return data.project.profile.requiredGates.filter(g => g.status !== 'passed')
  }, [data])

  // Despacho protegido por Compuertas de Calidad
  const handleProtectedDispatch = (prompt: string, title: string) => {
    if (!allGatesPassed) {
      setGateBlockedModalOpen(true)
      toast.error('Compuertas de Calidad Pendientes: no se puede despachar a Antigravity')
      return false
    }
    navigator.clipboard.writeText(prompt)
    setCopiedPrompt(true)
    setTimeout(() => setCopiedPrompt(false), 2500)
    toast.success(`¡Prompt para Antigravity copiado! (${title})`)
    return true
  }

  // Alternar estado de Compuerta de Calidad (Sign-off)
  const handleToggleGate = async (gateId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'passed' ? 'pending' : 'passed'
    try {
      const res = await fetch('/api/sdd', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gateId, gateStatus: nextStatus, verifiedBy: 'Human Architect' })
      })
      if (!res.ok) throw new Error('Error al actualizar compuerta')
      toast.success(`Compuerta ${gateId} actualizada a ${nextStatus.toUpperCase()}`)
      fetchData()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  // Guardar respuesta de entrevista de descubrimiento
  const handleSaveDiscoveryAnswer = async (questionId: string, answer: string, isNotApp?: boolean, notAppReason?: string) => {
    try {
      const res = await fetch('/api/sdd', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId,
          answer,
          status: isNotApp ? 'not_applicable' : (answer.trim() ? 'answered' : 'in_progress'),
          isNotApplicable: Boolean(isNotApp),
          notApplicableReason: notAppReason
        })
      })
      if (!res.ok) throw new Error('Error al guardar respuesta de descubrimiento')
      toast.success('Respuesta guardada en .sdd/discovery/interviews.json')
      setEditingQuestionId(null)
      fetchData()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  // Confirmar origen de especificación (Existing Project Mode: Inferred -> Confirmed)
  const handleConfirmOrigin = async (entityType: 'story' | 'architecture' | 'flowNode', entityId: string, flowId?: string) => {
    try {
      const res = await fetch('/api/sdd', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmOrigin: true, entityType, entityId, flowId })
      })
      if (!res.ok) throw new Error('Error al confirmar especificación')
      toast.success('¡Especificación confirmada por humano! [ORIGEN: CONFIRMED]')
      fetchData()
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  // Flujos filtrados según solo P0
  const filteredFlows = useMemo(() => {
    if (!data) return []
    if (!onlyP0) return data.flows
    return data.flows.filter(f => f.priority === 'P0')
  }, [data, onlyP0])

  // Historias filtradas por Épica y P0
  const filteredStories = useMemo(() => {
    if (!data || !data.requirements) return []
    return data.requirements.userStories.filter(story => {
      const matchesEpic = selectedEpicFilter === 'all' || story.epicId === selectedEpicFilter
      const matchesP0 = !onlyP0 || story.priority === 'P0'
      return matchesEpic && matchesP0
    })
  }, [data, selectedEpicFilter, onlyP0])

  // Todos los nodos para Kanban
  const allFlowNodes = useMemo(() => {
    if (!data) return []
    const list: FlowNodeData[] = []
    data.flows.forEach(flow => {
      if (onlyP0 && flow.priority !== 'P0') return
      flow.nodes.forEach(node => {
        list.push({
          ...node,
          flowId: flow.id,
          flowName: flow.name,
          flowPriority: flow.priority,
          onToggleTask: handleToggleTask,
          onSelectNode: (n) => {
            setSelectedNode(n)
            setSelectedType('flow_node')
          }
        })
      })
    })
    return list
  }, [data, onlyP0])

  // Resultados de Búsqueda Rápida (Spotlight)
  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || !data) return []
    const q = searchQuery.toLowerCase()
    const results: Array<{
      type: 'story' | 'flow' | 'node' | 'screen' | 'service' | 'sequence' | 'core'
      title: string
      subtitle: string
      payload: any
      targetView: 'core' | 'stories' | 'flows' | 'architecture' | 'uiux' | 'sequences'
      flowId?: string
    }> = []

    // Core
    if (data.core?.problem.title.toLowerCase().includes(q) || data.core?.problem.summary.toLowerCase().includes(q)) {
      results.push({
        type: 'core',
        title: 'Problema & Dolor de Negocio',
        subtitle: data.core.problem.title,
        payload: data.core.problem,
        targetView: 'core'
      })
    }

    // Historias
    data.requirements?.userStories.forEach(s => {
      if (s.title.toLowerCase().includes(q) || s.action.toLowerCase().includes(q) || s.role.toLowerCase().includes(q)) {
        results.push({
          type: 'story',
          title: `[${s.id}] ${s.title}`,
          subtitle: `Historia (${s.points} pts) • ${s.role}`,
          payload: s,
          targetView: 'stories'
        })
      }
    })

    // Pantallas UI
    data.uiUx?.screens.forEach(scr => {
      if (scr.name.toLowerCase().includes(q) || scr.route.toLowerCase().includes(q)) {
        results.push({
          type: 'screen',
          title: scr.name,
          subtitle: `Ruta: ${scr.route} (${scr.healthPercent}% completado)`,
          payload: scr,
          targetView: 'uiux'
        })
      }
    })

    // Secuencias
    data.sequences?.forEach(seq => {
      if (seq.name.toLowerCase().includes(q) || seq.description.toLowerCase().includes(q)) {
        results.push({
          type: 'sequence',
          title: seq.name,
          subtitle: `Secuencia Técnica UML (${seq.steps.length} pasos)`,
          payload: seq,
          targetView: 'sequences'
        })
      }
    })

    // Flujos & Nodos
    data.flows.forEach(flow => {
      if (flow.name.toLowerCase().includes(q) || flow.id.includes(q)) {
        results.push({
          type: 'flow',
          title: flow.name,
          subtitle: `Pipeline ${flow.priority} • ${flow.progress}%`,
          payload: flow,
          targetView: 'flows',
          flowId: flow.id
        })
      }
      flow.nodes.forEach(node => {
        if (node.name.toLowerCase().includes(q)) {
          results.push({
            type: 'node',
            title: node.name,
            subtitle: `Nodo en ${flow.name} • Estado: ${node.status}`,
            payload: { ...node, flowId: flow.id },
            targetView: 'flows',
            flowId: flow.id
          })
        }
      })
    })

    return results.slice(0, 10)
  }, [searchQuery, data])

  // Generar Nodos y Conexiones para React Flow
  useEffect(() => {
    if (!data) return

    if (viewPerspective === 'architecture') {
      const archNodes: Node[] = (data.architecture.nodes || []).map((srv, idx) => {
        let liveInfo: ServiceHealthInfo | undefined
        if (liveHealth) {
          if (srv.id.includes('db') || srv.id.includes('postgres')) liveInfo = liveHealth.health['postgres']
          else if (srv.id.includes('evolution') || srv.id.includes('whatsapp')) liveInfo = liveHealth.health['evolution']
          else if (srv.id.includes('breb') || srv.id.includes('smartpay')) liveInfo = liveHealth.health['breb']
          else if (srv.id.includes('clerk') || srv.id.includes('auth')) liveInfo = liveHealth.health['clerk']
          else if (srv.id.includes('deepseek') || srv.id.includes('ai')) liveInfo = liveHealth.health['deepseek']
          else if (srv.id.includes('supabase') || srv.id.includes('storage')) liveInfo = liveHealth.health['supabase']
        }

        return {
          id: srv.id,
          type: 'archService',
          position: {
            x: (idx % 3) * 360 + 50,
            y: Math.floor(idx / 3) * 250 + 50
          },
          data: {
            ...srv,
            liveHealth: liveInfo,
            onSelectService: (serviceData: any) => {
              setSelectedNode(serviceData)
              setSelectedType('arch_service')
            }
          }
        }
      })

      const archEdges: Edge[] = (data.architecture.edges || []).map((edg, idx) => ({
        id: `e-${idx}`,
        source: edg.from,
        target: edg.to,
        label: edg.label,
        animated: true,
        style: { stroke: '#6366f1', strokeWidth: 2 },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' }
      }))

      setNodes(archNodes)
      setEdges(archEdges)
    } else if (viewPerspective === 'flows') {
      const activeFlow = data.flows.find(f => f.id === activeFlowId) || data.flows[0]
      if (!activeFlow) return

      const flowNodes: Node[] = (activeFlow.nodes || []).map((step, idx) => ({
        id: step.id,
        type: 'flowStep',
        position: {
          x: idx * 360 + 50,
          y: 120
        },
        data: {
          ...step,
          flowId: activeFlow.id,
          onToggleTask: handleToggleTask,
          onSelectNode: (nodeData: any) => {
            setSelectedNode(nodeData)
            setSelectedType('flow_node')
          }
        }
      }))

      const flowEdges: Edge[] = (activeFlow.nodes || []).slice(0, -1).map((step, idx) => {
        const nextStep = activeFlow.nodes[idx + 1]
        const isConnectedDone = step.status === 'done'
        return {
          id: `fe-${step.id}-${nextStep.id}`,
          source: step.id,
          target: nextStep.id,
          animated: step.status === 'in_progress',
          style: {
            stroke: isConnectedDone ? '#10b981' : step.status === 'in_progress' ? '#f59e0b' : '#d4d4d8',
            strokeWidth: 2.5
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: isConnectedDone ? '#10b981' : step.status === 'in_progress' ? '#f59e0b' : '#d4d4d8'
          }
        }
      })

      setNodes(flowNodes)
      setEdges(flowEdges)
    }
  }, [data, viewPerspective, activeFlowId, liveHealth])

  if (!mounted || (loading && !data)) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-50">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 animate-spin text-zinc-800" />
          <p className="text-sm font-bold text-zinc-600">Cargando Cabina Spec-Driven (SDD)...</p>
        </div>
      </div>
    )
  }

  const project = data?.project
  const core = data?.core
  const manifest = data?.manifest
  const activeFlow = data?.flows.find(f => f.id === activeFlowId)
  const activeSequence = data?.sequences?.find(s => s.id === activeSequenceId) || data?.sequences?.[0]

  // Prompt Generator for Agent
  const agentCommandText = selectedNode && selectedType === 'flow_node'
    ? `Antigravity, resuelve las tareas pendientes del nodo "${(selectedNode as FlowNodeData).name}" en el flujo "${(selectedNode as FlowNodeData).flowId || activeFlowId}".
Scope Files permitidos:
${(selectedNode as FlowNodeData).scopeFiles?.map(f => `- ${f}`).join('\n')}

Tareas a completar:
${(selectedNode as FlowNodeData).checklist?.filter(t => !t.done).map(t => `- [ ] ${t.text}`).join('\n')}

Directriz técnica:
${(selectedNode as FlowNodeData).agentPrompt || 'Implementar y validar sin alterar archivos fuera del scope.'}

Al finalizar:
1. Actualiza el checklist a done: true en .sdd/flows/${(selectedNode as FlowNodeData).flowId || activeFlowId}.json
2. Si completaste todas, cambia status a "done" y asigna tu firma en assignedTo: "Antigravity".`
    : ''

  // Executive Markdown Report Generator
  const generateMarkdownReport = () => {
    if (!data) return ''
    const dateStr = new Date().toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })
    let md = `# 🚀 ${project?.name || 'Proyecto'} — Informe Spec-Driven Development (SDD)\n`
    md += `**Propósito:** ${project?.purpose.toUpperCase()} | **Profundidad:** ${project?.depth.toUpperCase()} | **Meta:** ${project?.targetLaunchWeeks} Semanas\n`
    md += `**Fecha:** ${dateStr}\n\n`
    md += `## 🧭 Núcleo del Proyecto\n`
    md += `- **Problema Principal:** ${core?.problem.title}\n`
    md += `- **Compuertas de Calidad:** ${project?.profile.requiredGates.filter(g => g.status === 'passed').length}/${project?.profile.requiredGates.length} Aprobadas\n\n`
    md += `## 📈 Salud Consolidada\n`
    md += `- **Salud Global:** ${manifest?.metrics.globalHealth}%\n`
    md += `- **Arquitectura:** ${manifest?.metrics.architectureHealth}%\n`
    md += `- **Flujos de Negocio:** ${manifest?.metrics.flowsHealth}%\n`
    md += `- **UI/UX Design:** ${manifest?.metrics.uiHealth}%\n\n`
    md += `## 🛑 Non-Goals Explícitos (Congelados para V2)\n`
    core?.scopeBoundaries.explicitNonGoals.forEach(ng => {
      md += `- **${ng.feature}:** ${ng.rationale}\n`
    })
    md += `\n## 📋 Historias de Usuario (Gherkin)\n`
    data.requirements?.userStories.forEach(st => {
      md += `### [${st.id}] ${st.title} (${st.priority} • ${st.points} pts)\n`
      st.acceptanceCriteria.forEach(ac => {
        md += `- [${ac.done ? 'x' : ' '}] ${ac.text}\n`
      })
      md += `\n`
    })
    return md
  }

  return (
    <div className="flex h-screen w-full flex-col bg-zinc-50 font-sans overflow-hidden select-none">
      {/* LEVEL 1: TOP EXECUTIVE HEADER */}
      <header className="flex h-14 shrink-0 items-center justify-between border-b border-zinc-200 bg-white px-5 z-30 gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-zinc-950 flex items-center justify-center text-white shadow-xs">
              <Zap className="w-3.5 h-3.5 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black tracking-tight text-zinc-950">{project?.name || 'FlashCheckout'}</span>
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-purple-50 text-purple-700 border border-purple-200 uppercase">
                  SDD {project?.depth || 'serio'}
                </span>
                <span className="px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 uppercase">
                  {project?.purpose || 'comercial'}
                </span>
              </div>
            </div>
          </div>

          <div className="hidden h-5 w-px bg-zinc-200 lg:block" />

          {/* Quick Metrics Bar */}
          <div className="hidden xl:flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-zinc-400 text-[11px]">Salud Global:</span>
              <span className="font-black text-zinc-900">{manifest?.metrics.globalHealth}%</span>
              <div className="h-1.5 w-16 bg-zinc-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${manifest?.metrics.globalHealth}%` }}
                />
              </div>
            </div>

            <div className="text-[10px] text-zinc-500 flex items-center gap-2">
              <span>Arqui: <b className="text-zinc-800">{manifest?.metrics.architectureHealth}%</b></span>
              <span>Flujos: <b className="text-zinc-800">{manifest?.metrics.flowsHealth}%</b></span>
              <span>UI: <b className="text-amber-600">{manifest?.metrics.uiHealth}%</b></span>
            </div>
          </div>
        </div>

        {/* Global Toolbar */}
        <div className="flex items-center gap-2">
          {/* Spotlight Search Button */}
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg border border-zinc-200 bg-zinc-50 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 text-xs font-medium transition-all"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Buscar...</span>
            <kbd className="hidden sm:inline-block px-1 py-0.5 text-[9px] font-mono bg-white border border-zinc-200 rounded text-zinc-400">
              ⌘K
            </kbd>
          </button>

          {/* Quality Gates Badge */}
          <div
            onClick={() => setViewPerspective('core')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 cursor-pointer hover:bg-emerald-100 transition-colors"
            title="5/5 Compuertas de calidad aprobadas — Auto-Pilot Habilitado"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden md:inline">5/5 Compuertas ✓</span>
          </div>

          {/* Filter: Solo P0 Toggle */}
          <button
            onClick={() => setOnlyP0(prev => !prev)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-all ${
              onlyP0
                ? 'bg-amber-500 text-white border-amber-600 shadow-xs ring-2 ring-amber-200'
                : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'
            }`}
            title="Mostrar únicamente elementos críticos P0"
          >
            <Flame className={`w-3.5 h-3.5 ${onlyP0 ? 'fill-white' : 'text-amber-500'}`} />
            <span className="hidden md:inline">Solo P0</span>
          </button>

          {/* Live DevOps Health Button */}
          <button
            onClick={() => setIsHealthModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-bold text-zinc-700 transition-all"
            title="Diagnóstico en vivo de servicios Docker y base de datos"
          >
            <div className={`w-2 h-2 rounded-full ${
              liveHealth && Object.values(liveHealth.health).every(s => s.status === 'healthy')
                ? 'bg-emerald-500 animate-pulse'
                : 'bg-amber-500'
            }`} />
            <Server className="w-3.5 h-3.5 text-zinc-500" />
            <span className="hidden md:inline">DevOps</span>
          </button>

          {/* Export Report Button */}
          <button
            onClick={() => setIsReportModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-zinc-200 bg-white hover:bg-zinc-50 text-xs font-bold text-zinc-700 transition-all"
            title="Generar informe ejecutivo de estado"
          >
            <Download className="w-3.5 h-3.5 text-zinc-500" />
            <span className="hidden md:inline">Informe</span>
          </button>

          <button
            onClick={() => { fetchData(); runLiveHealthCheck(); }}
            title="Sincronizar con disco"
            className="p-1.5 rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <Link href="/dashboard">
            <button className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-zinc-900 text-white hover:bg-zinc-800 transition-colors flex items-center gap-1">
              <span className="hidden sm:inline">Dashboard</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </Link>
        </div>
      </header>

      {/* LEVEL 2: SPEC-DRIVEN DEVELOPMENT PERSPECTIVES BAR */}
      <nav className="flex h-11 shrink-0 items-center justify-between border-b border-zinc-200 bg-zinc-50 px-5 z-20 overflow-x-auto">
        <div className="flex items-center gap-1">
          {/* 0. Núcleo Universal & Compuertas */}
          <button
            onClick={() => { setViewPerspective('core'); setSelectedNode(null); }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-extrabold transition-all shrink-0 ${
              viewPerspective === 'core'
                ? 'bg-white text-zinc-950 shadow-xs border border-zinc-200'
                : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-emerald-600" />
            Núcleo & Compuertas
            <span className={`ml-1 text-[10px] font-mono px-1.5 py-0.2 rounded-full font-black ${
              allGatesPassed ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800 animate-pulse'
            }`}>
              {project?.profile.requiredGates.filter(g => g.status === 'passed').length}/5
            </span>
          </button>

          {/* 1. Discovery Perspective (Entrevistas & Hipótesis) */}
          <button
            onClick={() => { setViewPerspective('discovery'); setSelectedNode(null); }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-extrabold transition-all shrink-0 ${
              viewPerspective === 'discovery'
                ? 'bg-white text-zinc-950 shadow-xs border border-zinc-200'
                : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Discovery & Hipótesis
            <span className="ml-1 text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              {data.discovery?.interviews?.interviewSessions.reduce((acc, s) => acc + s.questions.length, 0) || 0} Qs
            </span>
          </button>

          {/* 2. Historias de Usuario (Jira / Linear) */}
          <button
            onClick={() => { setViewPerspective('stories'); setSelectedNode(null); }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-extrabold transition-all shrink-0 ${
              viewPerspective === 'stories'
                ? 'bg-white text-zinc-950 shadow-xs border border-zinc-200'
                : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            Historias & Casos (Jira)
            <span className="ml-1 text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-zinc-100 text-zinc-600">
              {data.requirements?.userStories.length || 0}
            </span>
          </button>

          {/* 3. Diagramas de Secuencia (UML) */}
          <button
            onClick={() => { setViewPerspective('sequences'); setSelectedNode(null); }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-extrabold transition-all shrink-0 ${
              viewPerspective === 'sequences'
                ? 'bg-white text-zinc-950 shadow-xs border border-zinc-200'
                : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
            }`}
          >
            <Workflow className="w-3.5 h-3.5 text-purple-600" />
            Secuencias (UML)
            <span className="ml-1 text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-zinc-100 text-zinc-600">
              {data.sequences?.length || 0}
            </span>
          </button>

          {/* 4. Flujos & Nodos del Agente */}
          <button
            onClick={() => { setViewPerspective('flows'); setSelectedNode(null); }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-extrabold transition-all shrink-0 ${
              viewPerspective === 'flows'
                ? 'bg-white text-zinc-950 shadow-xs border border-zinc-200'
                : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-teal-600" />
            Flujos & Nodos
          </button>

          {/* 5. Arquitectura C4 & Paquetes */}
          <button
            onClick={() => { setViewPerspective('architecture'); setSelectedNode(null); }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-extrabold transition-all shrink-0 ${
              viewPerspective === 'architecture'
                ? 'bg-white text-zinc-950 shadow-xs border border-zinc-200'
                : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
            }`}
          >
            <Cpu className="w-3.5 h-3.5 text-indigo-600" />
            Arquitectura Macro (C4)
          </button>

          {/* 6. Modelo de Datos ERD */}
          <button
            onClick={() => { setViewPerspective('database'); setSelectedNode(null); }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-extrabold transition-all shrink-0 ${
              viewPerspective === 'database'
                ? 'bg-white text-zinc-950 shadow-xs border border-zinc-200'
                : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-cyan-600" />
            Modelo ERD (DB)
            <span className="ml-1 text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200">
              {data.database?.entities?.length || 0}
            </span>
          </button>

          {/* 7. Roles & Riesgos */}
          <button
            onClick={() => { setViewPerspective('security'); setSelectedNode(null); }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-extrabold transition-all shrink-0 ${
              viewPerspective === 'security'
                ? 'bg-white text-zinc-950 shadow-xs border border-zinc-200'
                : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-orange-600" />
            Roles & Riesgos
          </button>

          {/* 8. Plan de Pruebas (QA) */}
          <button
            onClick={() => { setViewPerspective('qa'); setSelectedNode(null); }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-extrabold transition-all shrink-0 ${
              viewPerspective === 'qa'
                ? 'bg-white text-zinc-950 shadow-xs border border-zinc-200'
                : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
            }`}
          >
            <TestTube2 className="w-3.5 h-3.5 text-emerald-600" />
            Plan QA (Pruebas)
            <span className="ml-1 text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              {data.testPlan?.testSuites?.reduce((acc, s) => acc + s.testCases.length, 0) || 0} TCs
            </span>
          </button>

          {/* 9. Drift Check (Integridad de Código) */}
          <button
            onClick={() => { setViewPerspective('drift'); setSelectedNode(null); }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-extrabold transition-all shrink-0 ${
              viewPerspective === 'drift'
                ? 'bg-white text-zinc-950 shadow-xs border border-zinc-200'
                : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5 text-red-600" />
            Deriva (Drift)
            <span className={`ml-1 text-[10px] font-mono px-1.5 py-0.2 rounded-full font-black ${
              data.drift?.isClean ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {data.drift?.driftScore ?? 100}%
            </span>
          </button>

          {/* 10. Matriz UI/UX */}
          <button
            onClick={() => { setViewPerspective('uiux'); setSelectedNode(null); }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-extrabold transition-all shrink-0 ${
              viewPerspective === 'uiux'
                ? 'bg-white text-zinc-950 shadow-xs border border-zinc-200'
                : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
            }`}
          >
            <Layout className="w-3.5 h-3.5 text-pink-600" />
            UI/UX
            <span className="ml-1 text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-zinc-100 text-zinc-600">
              {data.uiUx?.screens.length || 0}
            </span>
          </button>

          {/* 11. Tablero Kanban Sprint */}
          <button
            onClick={() => { setViewPerspective('kanban'); setSelectedNode(null); }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-extrabold transition-all shrink-0 ${
              viewPerspective === 'kanban'
                ? 'bg-white text-zinc-950 shadow-xs border border-zinc-200'
                : 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-100'
            }`}
          >
            <Kanban className="w-3.5 h-3.5 text-amber-600" />
            Kanban
          </button>
        </div>
      </nav>

      {/* LEVEL 3: DYNAMIC PERSPECTIVE WORKSPACE */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* ======================================================== */}
        {/* PERSPECTIVE 0: NÚCLEO UNIVERSAL & COMPUERTAS (SDD CORE)  */}
        {/* ======================================================== */}
        {viewPerspective === 'core' && (
          <main className="flex-1 overflow-y-auto p-6 bg-zinc-100/60 space-y-6">
            {/* Project Profile Header Banner */}
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Propósito: {project?.purpose.toUpperCase()}
                  </span>
                  <span className="text-xs font-black uppercase tracking-wider text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                    Profundidad: {project?.depth.toUpperCase()}
                  </span>
                  <span className="text-xs font-mono font-bold text-zinc-500">
                    Meta: {project?.targetLaunchWeeks} Semanas
                  </span>
                </div>
                <h1 className="text-xl font-black text-zinc-950 mt-2">
                  {project?.name}: {project?.tagline}
                </h1>
                <p className="text-xs text-zinc-600 mt-1 max-w-3xl leading-relaxed">
                  {project?.profile.purposeDescription}
                </p>
              </div>

              {/* Quality Gates Pill */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 flex items-center gap-3 shrink-0">
                <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-black text-emerald-950">Compuertas de Calidad SDD</div>
                  <div className="text-[11px] text-emerald-800 font-bold">
                    {project?.profile.requiredGates.filter(g => g.status === 'passed').length} de {project?.profile.requiredGates.length} Aprobadas
                  </div>
                  <div className="text-[10px] text-emerald-700">Auto-Pilot Habilitado</div>
                </div>
              </div>
            </div>

            {/* Quality Gates Checklist Bar */}
            <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-zinc-800 uppercase tracking-wider flex items-center gap-2">
                  <Unlock className="w-4 h-4 text-emerald-600" />
                  Compuertas Obligatorias para Programar (Quality Gates):
                </span>
                <span className="text-[11px] font-mono text-emerald-600 font-bold">
                  Definidas en project.json
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {project?.profile.requiredGates.map(gate => (
                  <div
                    key={gate.id}
                    className="p-3 rounded-xl border bg-emerald-50/40 border-emerald-200 flex flex-col justify-between space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-950 leading-tight">{gate.name}</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    </div>
                    <div className="text-[10px] font-mono text-zinc-500">{gate.file}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Core Columns: Problema & Non-Goals */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Card 1: Problema / Necesidad */}
              <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  <h3 className="text-sm font-black text-zinc-950 uppercase tracking-wider">
                    1. Problema & Dolores del Negocio
                  </h3>
                </div>
                <p className="text-xs text-zinc-600 leading-relaxed bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                  {core?.problem.summary}
                </p>

                <div className="space-y-3">
                  {core?.problem.painPoints.map(pp => (
                    <div key={pp.id} className="p-3 rounded-xl border border-rose-100 bg-rose-50/30 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-rose-950">{pp.pain}</span>
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded uppercase bg-rose-100 text-rose-800">
                          {pp.severity}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-600 leading-snug"><b>Evidencia:</b> {pp.evidence}</p>
                      <p className="text-[11px] text-emerald-800 font-medium"><b>Solución SDD:</b> {pp.solution}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 2: Límites de Alcance & NON-GOALS EXPLÍCITOS */}
              <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Ban className="w-4 h-4 text-amber-600" />
                    <h3 className="text-sm font-black text-zinc-950 uppercase tracking-wider">
                      2. Límites de Alcance & Non-Goals
                    </h3>
                  </div>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                    Regla Anti-Dispersión
                  </span>
                </div>
                <p className="text-xs text-zinc-600 leading-relaxed bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                  {core?.scopeBoundaries.scopePhilosophy}
                </p>

                <div className="space-y-3">
                  <span className="text-xs font-black text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                    <Ban className="w-3.5 h-3.5 text-amber-600" />
                    Non-Goals Explícitos (Congelados para V2):
                  </span>
                  <div className="space-y-2">
                    {core?.scopeBoundaries.explicitNonGoals.map(ng => (
                      <div key={ng.id} className="p-3 rounded-xl border border-amber-200 bg-amber-50/40 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-zinc-900">{ng.feature}</span>
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded uppercase bg-amber-200 text-amber-900">
                            Congelado
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-600 leading-relaxed">{ng.rationale}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Core Columns: Arquetipos de Usuario & Criterios de Éxito */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Card 3: Arquetipos de Usuario */}
              <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <h3 className="text-sm font-black text-zinc-950 uppercase tracking-wider">
                    3. Arquetipos de Usuario (Target Personas)
                  </h3>
                </div>

                <div className="space-y-3">
                  {core?.targetUsers.map(user => (
                    <div key={user.id} className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-zinc-950">{user.name}</span>
                        <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                          {user.role}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-600">{user.profile}</p>
                      <div className="text-[10px] text-zinc-500 pt-1 border-t border-zinc-200/50">
                        <b>Objetivos clave:</b> {user.goals.join(' • ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 4: Criterios de Éxito Numéricos */}
              <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-emerald-600" />
                  <h3 className="text-sm font-black text-zinc-950 uppercase tracking-wider">
                    4. Criterios de Éxito Numéricos
                  </h3>
                </div>

                <div className="space-y-3">
                  {core?.successCriteria.map(sc => (
                    <div key={sc.id} className="p-3 rounded-xl border border-zinc-200 bg-zinc-50/50 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-zinc-900">{sc.name}</span>
                        <span className="text-xs font-mono font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          {sc.target}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-600 leading-snug">{sc.measurement}</p>
                      <div className="text-[10px] font-mono text-zinc-500 pt-1">
                        <b>Valor actual:</b> {sc.currentValue}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </main>
        )}

        {/* ======================================================== */}
        {/* PERSPECTIVE 1: ASISTENTE DE DISCOVERY E HIPÓTESIS        */}
        {/* ======================================================== */}
        {viewPerspective === 'discovery' && (
          <div className="flex flex-1 overflow-hidden">
            {/* Discovery Sub-navigation Sidebar */}
            <aside className="w-80 shrink-0 border-r border-zinc-200 bg-white flex flex-col justify-between overflow-y-auto p-4 space-y-4">
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 pb-2 border-b border-zinc-100">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-black uppercase text-zinc-900 tracking-wider">Módulos de Discovery</span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 pt-2">
                    <button
                      onClick={() => setDiscoveryTab('interview')}
                      className={`px-2 py-1.5 rounded-lg text-[11px] font-bold transition-all text-center ${
                        discoveryTab === 'interview'
                          ? 'bg-zinc-950 text-white shadow-xs'
                          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200/70'
                      }`}
                    >
                      Entrevistas
                    </button>
                    <button
                      onClick={() => setDiscoveryTab('hypotheses')}
                      className={`px-2 py-1.5 rounded-lg text-[11px] font-bold transition-all text-center ${
                        discoveryTab === 'hypotheses'
                          ? 'bg-zinc-950 text-white shadow-xs'
                          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200/70'
                      }`}
                    >
                      Hipótesis
                    </button>
                    <button
                      onClick={() => setDiscoveryTab('competitors')}
                      className={`px-2 py-1.5 rounded-lg text-[11px] font-bold transition-all text-center ${
                        discoveryTab === 'competitors'
                          ? 'bg-zinc-950 text-white shadow-xs'
                          : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200/70'
                      }`}
                    >
                      Competencia
                    </button>
                  </div>
                </div>

                {discoveryTab === 'interview' && (
                  <div className="space-y-2">
                    <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Dimensiones de Entrevista</span>
                    <div className="space-y-1.5">
                      {data?.discovery?.interviews?.interviewSessions?.map(session => {
                        const isSelected = selectedSessionId === session.id
                        const answeredCount = session.questions.filter(q => q.status === 'answered' || q.isNotApplicable).length
                        return (
                          <button
                            key={session.id}
                            onClick={() => setSelectedSessionId(session.id)}
                            className={`w-full text-left p-3 rounded-xl border text-xs font-bold transition-all flex flex-col gap-1 ${
                              isSelected
                                ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm'
                                : 'bg-white text-zinc-700 border-zinc-200/80 hover:border-zinc-300 hover:bg-zinc-50'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-mono font-bold uppercase tracking-wider" style={{ color: isSelected ? '#fde68a' : '#d97706' }}>
                                {session.id}
                              </span>
                              <span className="text-[10px] font-black">
                                {answeredCount}/{session.questions.length}
                              </span>
                            </div>
                            <span className="truncate">{session.category}</span>
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-3 border-t border-zinc-100 bg-zinc-50 rounded-xl text-[10px] text-zinc-500 leading-tight">
                <b>Discovery en SDD:</b> Permite definir el problema, validar hipótesis y congelar requerimientos antes de escribir una sola línea de código.
              </div>
            </aside>

            {/* Discovery Main Content */}
            <main className="flex-1 overflow-y-auto p-6 bg-zinc-100/60">
              {discoveryTab === 'interview' && (
                <div className="space-y-5 max-w-5xl">
                  {(() => {
                    const currentSession = data?.discovery?.interviews?.interviewSessions?.find(s => s.id === selectedSessionId) || data?.discovery?.interviews?.interviewSessions?.[0]
                    if (!currentSession) return <div className="text-xs text-zinc-500">No hay sesiones de entrevista registradas.</div>

                    return (
                      <>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                                {currentSession.id}
                              </span>
                              <h2 className="text-base font-black text-zinc-950">{currentSession.category}</h2>
                            </div>
                            <p className="text-xs text-zinc-500 mt-1">{currentSession.description}</p>
                          </div>

                          <button
                            onClick={() => {
                              const interviewPrompt = `Antigravity, actúa como mi entrevistador técnico y arquitecto de software SDD para el proyecto ${project?.name}. Necesito profundizar en la dimensión: '${currentSession.category}'.\nPreguntas de la sesión:\n${currentSession.questions.map(q => `- ${q.id}: ${q.question} (Estado: ${q.status})`).join('\n')}\nHazme 2 o 3 preguntas incisivas para resolver cualquier duda pendiente y actualizar .sdd/discovery/interviews.json.`
                              handleProtectedDispatch(interviewPrompt, 'Entrevista con Antigravity')
                            }}
                            className="px-3.5 py-2 rounded-xl text-xs font-black bg-purple-600 text-white hover:bg-purple-700 transition-colors flex items-center gap-2 shrink-0 shadow-xs"
                          >
                            <Bot className="w-4 h-4" />
                            Entrevistarme con Antigravity
                          </button>
                        </div>

                        <div className="space-y-4">
                          {currentSession.questions.map((q, idx) => {
                            const isEditing = editingQuestionId === q.id
                            const isAnswered = q.status === 'answered'
                            const isNA = Boolean(q.isNotApplicable)

                            return (
                              <div
                                key={q.id}
                                className={`bg-white border rounded-2xl p-5 shadow-xs transition-all space-y-3 ${
                                  isNA
                                    ? 'border-zinc-300 opacity-80'
                                    : isAnswered
                                    ? 'border-emerald-200 hover:border-emerald-300'
                                    : 'border-amber-300'
                                }`}
                              >
                                <div className="flex items-center justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-mono font-black text-zinc-500">#{idx + 1} ({q.id})</span>
                                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                                      isNA
                                        ? 'bg-zinc-200 text-zinc-700'
                                        : isAnswered
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : 'bg-amber-100 text-amber-800'
                                    }`}>
                                      {isNA ? 'No Aplica' : isAnswered ? 'Respondido' : 'Pendiente'}
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-2">
                                    <button
                                      onClick={() => {
                                        const prompt = `Antigravity, profundicemos en esta pregunta de descubrimiento de ${project?.name}:\nPregunta: '${q.question}'\nContexto: '${q.insights || ''}'\nPor favor analiza y propón la respuesta técnica recomendada para guardar en .sdd/discovery/interviews.json.`
                                        handleProtectedDispatch(prompt, q.id)
                                      }}
                                      className="px-2.5 py-1 rounded-lg text-[10px] font-bold border border-zinc-200 text-zinc-600 hover:bg-zinc-50 flex items-center gap-1"
                                      title="Consultar al agente sobre esta pregunta"
                                    >
                                      <Bot className="w-3 h-3 text-purple-600" />
                                      Consultar IA
                                    </button>

                                    {!isEditing && (
                                      <button
                                        onClick={() => {
                                          setEditingQuestionId(q.id)
                                          setDraftAnswer(q.answer || '')
                                          setIsNotApp(Boolean(q.isNotApplicable))
                                          setDraftNotAppReason(q.notApplicableReason || '')
                                        }}
                                        className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-zinc-900 text-white hover:bg-zinc-800 transition-colors"
                                      >
                                        Editar
                                      </button>
                                    )}
                                  </div>
                                </div>

                                <h3 className="text-sm font-black text-zinc-950 leading-snug">{q.question}</h3>

                                {q.insights && (
                                  <div className="text-[11px] text-amber-900 bg-amber-50/70 border border-amber-200/70 p-2.5 rounded-xl flex items-center gap-2">
                                    <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                    <span><b>Insight:</b> {q.insights}</span>
                                  </div>
                                )}

                                {isEditing ? (
                                  <div className="space-y-3 pt-2 border-t border-zinc-100">
                                    <label className="flex items-center gap-2 text-xs font-bold text-zinc-700 cursor-pointer">
                                      <input
                                        type="checkbox"
                                        checked={isNotApp}
                                        onChange={(e) => setIsNotApp(e.target.checked)}
                                        className="rounded border-zinc-300 text-amber-600 focus:ring-amber-500 w-4 h-4"
                                      />
                                      <span>Marcar como &quot;No Aplica&quot; en esta versión del proyecto</span>
                                    </label>

                                    {isNotApp ? (
                                      <div>
                                        <label className="text-[11px] font-bold text-zinc-500 block mb-1">
                                          Motivo / Justificación de por qué no aplica:
                                        </label>
                                        <input
                                          type="text"
                                          value={draftNotAppReason}
                                          onChange={(e) => setDraftNotAppReason(e.target.value)}
                                          placeholder="Ej: Flashcheckout V1 está enfocado en Pymes colombianas; ERPs corporativos quedan fuera de alcance..."
                                          className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                                        />
                                      </div>
                                    ) : (
                                      <div>
                                        <label className="text-[11px] font-bold text-zinc-500 block mb-1">
                                          Respuesta documentada:
                                        </label>
                                        <textarea
                                          value={draftAnswer}
                                          onChange={(e) => setDraftAnswer(e.target.value)}
                                          rows={3}
                                          placeholder="Describe la respuesta, comportamiento o métrica validada..."
                                          className="w-full text-xs p-2.5 rounded-xl border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-zinc-900"
                                        />
                                      </div>
                                    )}

                                    <div className="flex justify-end gap-2 pt-1">
                                      <button
                                        onClick={() => setEditingQuestionId(null)}
                                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-zinc-600 hover:bg-zinc-100"
                                      >
                                        Cancelar
                                      </button>
                                      <button
                                        onClick={() => handleSaveDiscoveryAnswer(q.id, draftAnswer, isNotApp, draftNotAppReason)}
                                        className="px-3.5 py-1.5 rounded-lg text-xs font-black bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs"
                                      >
                                        Guardar en Disco
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div>
                                    {isNA ? (
                                      <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-xs text-zinc-600">
                                        <b className="text-zinc-900">Motivo No Aplica:</b> {q.notApplicableReason || 'Declarado fuera de alcance V1.'}
                                      </div>
                                    ) : (
                                      <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 text-xs text-zinc-800 leading-relaxed">
                                        {q.answer || <span className="italic text-zinc-400">Sin respuesta documentada todavía. Haz clic en &quot;Editar&quot; para registrarla.</span>}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      </>
                    )
                  })()}
                </div>
              )}

              {discoveryTab === 'hypotheses' && (
                <div className="space-y-4 max-w-5xl">
                  <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-black text-zinc-950 flex items-center gap-2">
                        <Target className="w-5 h-5 text-indigo-600" />
                        Hipótesis de Valor & Crecimiento
                      </h2>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        Supuestos clave del negocio validados mediante experimentación controlada y datos empíricos.
                      </p>
                    </div>
                    <span className="text-xs font-bold text-zinc-600 font-mono">
                      {data?.discovery?.hypotheses?.hypotheses?.length || 0} Hipótesis
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {data?.discovery?.hypotheses?.hypotheses?.map(hyp => (
                      <div key={hyp.id} className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono font-black px-2 py-0.5 rounded bg-zinc-900 text-white">
                            {hyp.id}
                          </span>
                          <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                            hyp.status === 'validated'
                              ? 'bg-emerald-100 text-emerald-800'
                              : hyp.status === 'in_validation'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-zinc-100 text-zinc-600'
                          }`}>
                            {hyp.status === 'validated' ? 'Validada ✓' : hyp.status === 'in_validation' ? 'En Validación' : 'Pendiente'}
                          </span>
                        </div>

                        <h3 className="text-sm font-black text-zinc-900 leading-snug">{hyp.statement}</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
                          <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Métrica Clave:</span>
                            <span className="text-zinc-800 font-semibold">{hyp.metric}</span>
                          </div>
                          <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-100">
                            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">Método de Validación:</span>
                            <span className="text-zinc-800 font-semibold">{hyp.validationMethod}</span>
                          </div>
                        </div>

                        {hyp.resultNote && (
                          <div className="p-3 rounded-xl bg-emerald-50/60 border border-emerald-200/70 text-xs text-emerald-950 flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <div>
                              <b>Evidencia / Resultado:</b> {hyp.resultNote}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {discoveryTab === 'competitors' && (
                <div className="space-y-4 max-w-5xl">
                  <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-black text-zinc-950 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-purple-600" />
                        Matriz de Benchmarking Competitivo
                      </h2>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        Comparación directa frente a pasarelas tradicionales, catálogos pesados y chats manuales.
                      </p>
                    </div>
                  </div>

                  <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-bold uppercase text-[10px] tracking-wider">
                          <tr>
                            <th className="p-3.5">Plataforma / Canal</th>
                            <th className="p-3.5">Tarifa x Transacción</th>
                            <th className="p-3.5">WhatsApp Integrado</th>
                            <th className="p-3.5">Validación de Pago</th>
                            <th className="p-3.5">Despacho Radar</th>
                            <th className="p-3.5">Diferenciador Demoledor</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100">
                          {data?.discovery?.competitors?.competitors?.map((comp, idx) => (
                            <tr key={idx} className={comp.name.includes('Flashcheckout') ? 'bg-purple-50/30 font-semibold' : 'hover:bg-zinc-50'}>
                              <td className="p-3.5 font-black text-zinc-950 flex items-center gap-1.5">
                                {comp.name.includes('Flashcheckout') && <Zap className="w-3.5 h-3.5 text-purple-600 fill-purple-600" />}
                                {comp.name}
                              </td>
                              <td className="p-3.5 text-zinc-800">{comp.feePerTx}</td>
                              <td className="p-3.5 text-zinc-700">{comp.whatsappIntegration}</td>
                              <td className="p-3.5 text-zinc-700">{comp.validationSpeed}</td>
                              <td className="p-3.5 text-zinc-700">{comp.dispatch}</td>
                              <td className="p-3.5 text-purple-900 font-bold">{comp.differentiator}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </main>
          </div>
        )}

        {/* ======================================================== */}
        {/* PERSPECTIVE 2: HISTORIAS DE USUARIO & CASOS DE USO (JIRA) */}
        {/* ======================================================== */}
        {viewPerspective === 'stories' && (
          <div className="flex flex-1 overflow-hidden">
            {/* Epics Filter Sidebar */}
            <aside className="w-72 shrink-0 border-r border-zinc-200 bg-white flex flex-col justify-between overflow-y-auto p-4 space-y-3">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                  <span className="text-[11px] font-black uppercase text-zinc-400 tracking-wider">Épicas del Negocio</span>
                  <span className="text-[10px] font-bold text-zinc-500">{data.requirements?.epics.length} épicas</span>
                </div>

                <div className="space-y-1.5 pt-2">
                  <button
                    onClick={() => setSelectedEpicFilter('all')}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between ${
                      selectedEpicFilter === 'all'
                        ? 'bg-zinc-950 text-white'
                        : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200/70'
                    }`}
                  >
                    <span>Todas las Épicas</span>
                    <span className="text-[10px] font-mono opacity-70">
                      {data.requirements?.userStories.length}
                    </span>
                  </button>

                  {data.requirements?.epics.map(epic => {
                    const count = data.requirements?.userStories.filter(s => s.epicId === epic.id).length || 0
                    const isSelected = selectedEpicFilter === epic.id
                    return (
                      <button
                        key={epic.id}
                        onClick={() => setSelectedEpicFilter(epic.id)}
                        className={`w-full text-left p-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col gap-1 ${
                          isSelected
                            ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm'
                            : 'bg-white text-zinc-700 border-zinc-200/80 hover:border-zinc-300 hover:bg-zinc-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-mono font-bold uppercase tracking-wider" style={{ color: isSelected ? '#a5b4fc' : epic.color }}>
                            {epic.key}
                          </span>
                          <span className="text-[10px] font-black">{epic.progress}%</span>
                        </div>
                        <span className="truncate">{epic.name}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="p-3 border-t border-zinc-100 bg-zinc-50 rounded-xl text-[10px] text-zinc-500 leading-tight">
                <b>1 archivo por entidad:</b> Las historias se guardan individualmente en <code>.sdd/requirements/stories/US-*.json</code> para prevenir conflictos de merge en Git.
              </div>
            </aside>

            {/* Stories Grid */}
            <main className="flex-1 overflow-y-auto p-6 bg-zinc-100/60">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-black text-zinc-950 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    Historias de Usuario & Criterios de Aceptación (Gherkin)
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Estándar de ingeniería de software in-repo: Dado-Cuando-Entonces (Given-When-Then).
                  </p>
                </div>
                <span className="text-xs font-bold text-zinc-600">
                  {filteredStories.length} historias encontradas
                </span>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {filteredStories.map(story => {
                  const epic = data.requirements?.epics.find(e => e.id === story.epicId)
                  const completedCriteria = story.acceptanceCriteria.filter(c => c.done).length
                  const totalCriteria = story.acceptanceCriteria.length
                  const storyPercent = totalCriteria > 0 ? Math.round((completedCriteria / totalCriteria) * 100) : 0

                  return (
                    <div
                      key={story.id}
                      className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs space-y-4 hover:border-zinc-300 transition-all flex flex-col justify-between"
                    >
                      <div className="space-y-3">
                        {/* Story Top Badges */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-black bg-zinc-900 text-white">
                              {story.id}
                            </span>
                            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-blue-50 text-blue-700 border border-blue-200">
                              {epic?.name || story.epicId}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                              story.priority === 'P0' ? 'bg-amber-100 text-amber-800' : 'bg-zinc-100 text-zinc-600'
                            }`}>
                              {story.priority}
                            </span>
                            {/* Inferred vs Confirmed Origin Badge */}
                            {story.origin === 'inferred' ? (
                              <button
                                onClick={() => handleConfirmOrigin('story', story.id)}
                                className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100 transition-colors flex items-center gap-1"
                                title="Especificación inferida por ingeniería inversa. Clic para confirmar por humano."
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                Inferido (Confirmar)
                              </button>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[9px] font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                                Confirmado ✓
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-[11px] font-mono font-bold text-zinc-500">
                              {story.points} Story Pts
                            </span>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                              story.status === 'done' ? 'bg-emerald-100 text-emerald-800' :
                              story.status === 'in_progress' ? 'bg-amber-100 text-amber-800 animate-pulse' :
                              'bg-zinc-100 text-zinc-600'
                            }`}>
                              {story.status}
                            </span>
                          </div>
                        </div>

                        {/* Title */}
                        <h3 className="text-sm font-black text-zinc-950 leading-snug">
                          {story.title}
                        </h3>

                        {/* As a / I want / So that (User Story Format) */}
                        <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/70 text-xs space-y-1">
                          <div className="text-zinc-600">
                            <b className="text-zinc-900">Como:</b> {story.role}
                          </div>
                          <div className="text-zinc-600">
                            <b className="text-zinc-900">Quiero:</b> {story.action}
                          </div>
                          <div className="text-zinc-600">
                            <b className="text-zinc-900">Para:</b> {story.benefit}
                          </div>
                        </div>

                        {/* Acceptance Criteria (Gherkin Checkboxes) */}
                        <div className="space-y-2 pt-1">
                          <div className="flex items-center justify-between text-xs font-bold text-zinc-700">
                            <span>Criterios de Aceptación:</span>
                            <span className="text-[11px] font-mono text-zinc-400">
                              {completedCriteria}/{totalCriteria} ({storyPercent}%)
                            </span>
                          </div>

                          <div className="space-y-1.5">
                            {story.acceptanceCriteria.map(ac => (
                              <label
                                key={ac.id}
                                className="flex items-start gap-2 p-2 rounded-lg border border-zinc-200 hover:bg-zinc-50 cursor-pointer text-xs transition-colors"
                              >
                                <input
                                  type="checkbox"
                                  checked={ac.done}
                                  onChange={(e) => handleToggleStoryCriterion(story.id, ac.id, e.target.checked)}
                                  className="mt-0.5 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer"
                                />
                                <span className={ac.done ? 'line-through text-zinc-400' : 'text-zinc-800 leading-tight font-medium'}>
                                  {ac.text}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Scope Files */}
                        {story.scopeFiles && story.scopeFiles.length > 0 && (
                          <div className="space-y-1 pt-2">
                            <span className="text-[11px] font-bold text-zinc-500">Archivos en Alcance:</span>
                            <div className="flex flex-wrap gap-1">
                              {story.scopeFiles.map(file => {
                                const previewRoute = getScopeFileRoute(file)
                                return (
                                  <div key={file} className="flex items-center gap-1 bg-zinc-100 px-2 py-0.5 rounded text-[10px] font-mono text-zinc-700 border border-zinc-200">
                                    <span className="truncate max-w-[200px]">{file}</span>
                                    {previewRoute && (
                                      <a
                                        href={previewRoute.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="text-emerald-700 hover:text-emerald-900 font-bold ml-1"
                                        title={previewRoute.label}
                                      >
                                        ↗
                                      </a>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Footer: Action Agent Dispatch */}
                      <div className="pt-3 border-t border-zinc-100 flex items-center justify-between">
                        <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                          <Bot className="w-3.5 h-3.5 text-zinc-400" />
                          {story.assignedTo}
                        </span>

                        <button
                          onClick={() => {
                            const storyPrompt = `Antigravity, resuelve la Historia de Usuario [${story.id}] "${story.title}".\nAlcance: ${story.scopeFiles?.join(', ')}\nCriterios de Aceptación:\n${story.acceptanceCriteria.map(ac => `- [${ac.done ? 'x' : ' '}] ${ac.text}`).join('\n')}\nAl finalizar actualiza .sdd/requirements/stories/${story.id}.json con done: true.`
                            handleProtectedDispatch(storyPrompt, `Historia ${story.id}`)
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-extrabold flex items-center gap-1.5 shadow-xs transition-colors ${
                            allGatesPassed
                              ? 'bg-zinc-900 text-white hover:bg-zinc-800'
                              : 'bg-zinc-200 text-zinc-500 hover:bg-zinc-300'
                          }`}
                        >
                          {allGatesPassed ? <Play className="w-3 h-3 fill-white" /> : <Lock className="w-3 h-3" />}
                          {allGatesPassed ? 'Copiar Orden de Historia' : 'Compuertas Pendientes'}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </main>
          </div>
        )}

        {/* ======================================================== */}
        {/* PERSPECTIVE 2: DIAGRAMAS DE SECUENCIA TÉCNICOS (UML)      */}
        {/* ======================================================== */}
        {viewPerspective === 'sequences' && (
          <div className="flex flex-1 overflow-hidden">
            {/* Sequence Selector Sidebar */}
            <aside className="w-80 shrink-0 border-r border-zinc-200 bg-white flex flex-col justify-between overflow-y-auto p-4 space-y-3">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                  <span className="text-[11px] font-black uppercase text-zinc-400 tracking-wider">Secuencias Técnicas</span>
                  <span className="text-[10px] font-bold text-zinc-500">{data.sequences?.length} diagramas</span>
                </div>

                <div className="space-y-2 pt-2">
                  {data.sequences?.map(seq => {
                    const isSelected = activeSequence?.id === seq.id
                    return (
                      <button
                        key={seq.id}
                        onClick={() => setActiveSequenceId(seq.id)}
                        className={`w-full text-left p-3 rounded-xl border transition-all flex flex-col gap-1 ${
                          isSelected
                            ? 'bg-zinc-950 text-white border-zinc-950 shadow-sm'
                            : 'bg-white text-zinc-700 border-zinc-200/80 hover:border-zinc-300 hover:bg-zinc-50'
                        }`}
                      >
                        <span className={`text-[9px] font-mono font-bold uppercase tracking-wider ${
                          isSelected ? 'text-purple-300' : 'text-purple-600'
                        }`}>
                          {seq.id}
                        </span>
                        <h4 className="text-xs font-bold leading-tight">{seq.name}</h4>
                        <span className="text-[10px] opacity-70 mt-0.5">{seq.actors.length} actores involucrados</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200 text-xs text-purple-900 space-y-1">
                <div className="font-black flex items-center gap-1.5">
                  <Workflow className="w-4 h-4 text-purple-600" />
                  Modelado UML Interactivo
                </div>
                <p className="text-[11px] text-purple-750">
                  Muestra la traza exacta de comunicación entre el Comprador, WhatsApp, el Core API y PostgreSQL.
                </p>
              </div>
            </aside>

            {/* Sequence Detail & Visualizer */}
            <main className="flex-1 overflow-y-auto p-6 bg-zinc-100/60 flex flex-col space-y-6">
              {activeSequence && (
                <>
                  <div className="flex items-center justify-between bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-black px-2 py-0.5 rounded bg-purple-100 text-purple-800">
                          {activeSequence.id}
                        </span>
                        <h2 className="text-base font-black text-zinc-950">{activeSequence.name}</h2>
                      </div>
                      <p className="text-xs text-zinc-500 mt-1">{activeSequence.description}</p>
                    </div>

                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(activeSequence.mermaid)
                        toast.success('Diagrama Mermaid copiado al portapapeles')
                      }}
                      className="px-3 py-1.5 rounded-lg text-xs font-bold border border-zinc-200 bg-white hover:bg-zinc-50 text-zinc-700 flex items-center gap-1.5"
                    >
                      <Copy className="w-3.5 h-3.5 text-zinc-500" />
                      Copiar Mermaid
                    </button>
                  </div>

                  {/* Actor Swimlanes Header */}
                  <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs space-y-3">
                    <span className="text-xs font-black text-zinc-700 uppercase tracking-wider">
                      Actores y Componentes del Sistema:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {activeSequence.actors.map((actor, idx) => (
                        <div
                          key={idx}
                          className="px-3 py-1.5 rounded-xl bg-zinc-50 border border-zinc-200 font-bold text-xs text-zinc-800 flex items-center gap-1.5 shadow-2xs"
                        >
                          <span className="w-2 h-2 rounded-full bg-purple-500" />
                          {actor}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Numbered Step-by-Step Flow */}
                  <div className="bg-white p-5 rounded-2xl border border-zinc-200 shadow-xs space-y-4">
                    <span className="text-xs font-black text-zinc-700 uppercase tracking-wider">
                      Traza de Ejecución Paso a Paso:
                    </span>

                    <div className="space-y-2">
                      {activeSequence.steps.map((step, idx) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl border border-zinc-200/80 bg-zinc-50/50 hover:bg-zinc-50 transition-colors flex items-center justify-between text-xs gap-4"
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-full bg-zinc-950 text-white font-mono font-bold flex items-center justify-center text-[10px] shrink-0">
                              {idx + 1}
                            </span>
                            <div>
                              <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-500">
                                <span className="font-bold text-zinc-800">{step.from}</span>
                                <ArrowRight className="w-3 h-3 text-purple-600" />
                                <span className="font-bold text-zinc-800">{step.to}</span>
                              </div>
                              <p className="text-xs font-bold text-zinc-900 mt-0.5">{step.action}</p>
                            </div>
                          </div>

                          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded uppercase shrink-0 ${
                            step.type === 'db' ? 'bg-amber-100 text-amber-800' :
                            step.type === 'async' ? 'bg-purple-100 text-purple-800' :
                            step.type === 'user' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {step.type}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </main>
          </div>
        )}

        {/* ======================================================== */}
        {/* PERSPECTIVE 3: FLUJOS DE TRABAJO & NODOS (REACT FLOW)     */}
        {/* ======================================================== */}
        {viewPerspective === 'flows' && (
          <div className="flex flex-1 overflow-hidden">
            {/* Left Sub-Sidebar (Flows Switcher) */}
            <aside className="w-72 shrink-0 border-r border-zinc-200 bg-white flex flex-col justify-between overflow-y-auto">
              <div className="p-4 space-y-2">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                  <span className="text-[11px] font-black uppercase text-zinc-400 tracking-wider">
                    {onlyP0 ? 'Flujos Críticos P0' : 'Flujos del Sistema'}
                  </span>
                  <span className="text-[10px] font-bold text-zinc-500">{filteredFlows.length} pipelines</span>
                </div>

                <div className="space-y-1.5 pt-1">
                  {filteredFlows.map(flow => {
                    const isActive = flow.id === activeFlowId
                    return (
                      <button
                        key={flow.id}
                        onClick={() => { setActiveFlowId(flow.id); setSelectedNode(null); }}
                        className={`w-full text-left p-3 rounded-xl border transition-all flex flex-col gap-1.5 ${
                          isActive
                            ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm'
                            : 'bg-white text-zinc-700 border-zinc-200/70 hover:border-zinc-300 hover:bg-zinc-50'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded uppercase tracking-wider ${
                            flow.priority === 'P0' ? 'bg-amber-400 text-zinc-950' : 'opacity-70'
                          }`}>
                            {flow.priority}
                          </span>
                          <span className="text-xs font-black tabular-nums">{flow.progress}%</span>
                        </div>
                        <span className="text-xs font-bold leading-tight">{flow.name}</span>
                        <div className="h-1 w-full bg-zinc-200/50 rounded-full overflow-hidden mt-0.5">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isActive ? 'bg-emerald-400' : 'bg-zinc-800'
                            }`}
                            style={{ width: `${flow.progress}%` }}
                          />
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="p-4 border-t border-zinc-100 bg-zinc-50">
                <div className="text-[11px] font-bold text-zinc-600 mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Single Source of Truth
                </div>
                <p className="text-[10px] text-zinc-400 leading-tight">
                  Cualquier cambio muta <code>.sdd/flows/*.json</code> al instante.
                </p>
              </div>
            </aside>

            {/* Canvas */}
            <div className="flex-1 h-full relative">
              {activeFlow && (
                <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-md border border-zinc-200 rounded-xl px-4 py-2.5 shadow-sm max-w-md">
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-black text-zinc-900">{activeFlow.name}</h2>
                    <span className="text-[10px] font-extrabold px-1.5 py-0.5 bg-zinc-100 rounded text-zinc-600">
                      Semana {activeFlow.targetWeek}
                    </span>
                    {activeFlow.priority === 'P0' && (
                      <span className="text-[9px] font-black px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded">
                        P0 Crítico
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-500 mt-0.5">{activeFlow.description}</p>
                </div>
              )}

              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                nodeTypes={nodeTypes}
                fitView
                className="bg-zinc-50/50"
              >
                <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#d4d4d8" />
                <Controls className="!bg-white !border-zinc-200 !shadow-sm !rounded-lg" />
                <MiniMap
                  className="!bg-white !border-zinc-200 !rounded-lg"
                  nodeColor={(n) => (n.type === 'archService' ? '#18181b' : '#10b981')}
                />
              </ReactFlow>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* PERSPECTIVE 4: ARQUITECTURA C4 & SERVICIOS MACRO          */}
        {/* ======================================================== */}
        {viewPerspective === 'architecture' && (
          <div className="flex-1 h-full relative">
            <div className="absolute top-4 left-4 z-10 bg-zinc-900/90 text-white backdrop-blur-md border border-zinc-700 rounded-xl px-4 py-2.5 shadow-md max-w-md">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-400" />
                <h2 className="text-sm font-black text-white">Mapa de Arquitectura & Servicios (C4)</h2>
              </div>
              <p className="text-[11px] text-zinc-400 mt-0.5">
                Haz clic en cualquier servicio para inspeccionar módulos, tareas y flujos conectados.
              </p>
            </div>

            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              nodeTypes={nodeTypes}
              fitView
              className="bg-zinc-50/50"
            >
              <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#d4d4d8" />
              <Controls className="!bg-white !border-zinc-200 !shadow-sm !rounded-lg" />
              <MiniMap
                className="!bg-white !border-zinc-200 !rounded-lg"
                nodeColor={(n) => (n.type === 'archService' ? '#18181b' : '#10b981')}
              />
            </ReactFlow>
          </div>
        )}

        {/* ======================================================== */}
        {/* PERSPECTIVE 6: MODELO DE DATOS & ERD (DATABASE)           */}
        {/* ======================================================== */}
        {viewPerspective === 'database' && (
          <div className="flex flex-1 overflow-hidden">
            {/* Entities List Sidebar */}
            <aside className="w-72 shrink-0 border-r border-zinc-200 bg-white flex flex-col justify-between overflow-y-auto p-4 space-y-3">
              <div>
                <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                  <span className="text-[11px] font-black uppercase text-zinc-400 tracking-wider">Entidades Relacionales</span>
                  <span className="text-[10px] font-bold text-zinc-500">{data?.database?.entities?.length || 0} modelos</span>
                </div>

                <div className="space-y-1.5 pt-2">
                  {data?.database?.entities?.map(ent => {
                    const isSelected = selectedDbEntity === ent.name
                    return (
                      <button
                        key={ent.name}
                        onClick={() => setSelectedDbEntity(ent.name)}
                        className={`w-full text-left p-2.5 rounded-xl border text-xs font-bold transition-all flex flex-col gap-0.5 ${
                          isSelected
                            ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm'
                            : 'bg-white text-zinc-700 border-zinc-200/80 hover:border-zinc-300 hover:bg-zinc-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black">{ent.name}</span>
                          <span className="text-[9px] font-mono opacity-70">
                            {ent.attributes?.length || 0} cols
                          </span>
                        </div>
                        <span className="text-[10px] opacity-80 truncate">{ent.table}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="p-3 border-t border-zinc-100 bg-zinc-50 rounded-xl text-[10px] text-zinc-500 leading-tight">
                <b>Prisma ORM 5.x:</b> Modelos sincronizados con <code>prisma/schema.prisma</code> en PostgreSQL 16 con extensión pgvector.
              </div>
            </aside>

            {/* Entity Details & Mermaid ERD */}
            <main className="flex-1 overflow-y-auto p-6 bg-zinc-100/60 space-y-6">
              {/* ERD Top Banner */}
              <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded bg-cyan-100 text-cyan-900">
                      PostgreSQL 16 + pgvector
                    </span>
                    <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-100 text-zinc-700">
                      Prisma ORM
                    </span>
                  </div>
                  <h2 className="text-base font-black text-zinc-950 mt-1">
                    Diagrama Entidad-Relación & Diccionario de Datos
                  </h2>
                  <p className="text-xs text-zinc-500">
                    Estructura normalizada en 3FN con soporte de pagos Bre-B EMVCo, OCR gemelo y radar de repartidores.
                  </p>
                </div>

                <button
                  onClick={() => {
                    if (data?.database?.mermaid) {
                      navigator.clipboard.writeText(data.database.mermaid)
                      toast.success('¡Diagrama Mermaid copiado al portapapeles!')
                    }
                  }}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold bg-zinc-900 text-white hover:bg-zinc-800 transition-colors flex items-center gap-1.5 shrink-0"
                >
                  <Copy className="w-3.5 h-3.5" />
                  Copiar Mermaid ERD
                </button>
              </div>

              {/* Mermaid Diagram Code Block */}
              {data?.database?.mermaid && (
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-sm space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400 border-b border-zinc-800 pb-2">
                    <span>Mermaid ER Diagram (Flujo Relacional Macro)</span>
                    <span className="text-emerald-400 font-bold">PostgreSQL Relational Topology</span>
                  </div>
                  <pre className="text-xs font-mono text-cyan-300 overflow-x-auto whitespace-pre p-2 leading-relaxed">
                    {data.database.mermaid}
                  </pre>
                </div>
              )}

              {/* Selected Entity Card */}
              {(() => {
                const currentEntity = data?.database?.entities?.find(e => e.name === selectedDbEntity) || data?.database?.entities?.[0]
                if (!currentEntity) return null

                return (
                  <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs space-y-5">
                    <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-base font-black text-zinc-950">{currentEntity.name}</span>
                          <span className="text-xs font-mono text-zinc-400">table: `{currentEntity.table}`</span>
                        </div>
                        <p className="text-xs text-zinc-600 mt-1">{currentEntity.description}</p>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] font-mono uppercase text-zinc-400 block font-bold">Primary Key:</span>
                        <span className="text-xs font-mono font-black text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                          {currentEntity.primaryKey}
                        </span>
                      </div>
                    </div>

                    {/* Attributes Table */}
                    {currentEntity.attributes && currentEntity.attributes.length > 0 && (
                      <div className="space-y-2">
                        <span className="text-xs font-black uppercase tracking-wider text-zinc-700 block">
                          Atributos & Columnas:
                        </span>
                        <div className="border border-zinc-200 rounded-xl overflow-hidden">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-bold uppercase text-[10px]">
                              <tr>
                                <th className="p-3">Campo</th>
                                <th className="p-3">Tipo</th>
                                <th className="p-3">Requerido</th>
                                <th className="p-3">Descripción</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 font-mono">
                              {currentEntity.attributes.map((attr, idx) => (
                                <tr key={idx} className="hover:bg-zinc-50/50">
                                  <td className="p-3 font-bold text-zinc-900">{attr.name}</td>
                                  <td className="p-3 text-indigo-600">{attr.type}</td>
                                  <td className="p-3">
                                    {attr.required ? (
                                      <span className="text-[10px] font-sans font-bold text-rose-600 bg-rose-50 px-1.5 py-0.2 rounded">Obligatorio</span>
                                    ) : (
                                      <span className="text-[10px] font-sans text-zinc-400">Opcional</span>
                                    )}
                                  </td>
                                  <td className="p-3 font-sans text-zinc-600">{attr.description || '—'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    {/* Relations Table */}
                    {currentEntity.relations && currentEntity.relations.length > 0 && (
                      <div className="space-y-2 pt-2">
                        <span className="text-xs font-black uppercase tracking-wider text-zinc-700 block">
                          Relaciones (Foreign Keys):
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {currentEntity.relations.map((rel, idx) => (
                            <div key={idx} className="p-3 rounded-xl border border-zinc-200 bg-zinc-50/50 text-xs space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="font-mono font-bold text-zinc-900 flex items-center gap-1.5">
                                  <ArrowRight className="w-3 h-3 text-purple-600" />
                                  {rel.target}
                                </span>
                                <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded bg-purple-100 text-purple-800">
                                  {rel.type}
                                </span>
                              </div>
                              <p className="text-[11px] text-zinc-500">{rel.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Indexes */}
                    {currentEntity.indexes && currentEntity.indexes.length > 0 && (
                      <div className="space-y-2 pt-2">
                        <span className="text-xs font-black uppercase tracking-wider text-zinc-700 block">
                          Índices & Restricciones:
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {currentEntity.indexes.map((idxVal, idx) => (
                            <span key={idx} className="text-xs font-mono bg-zinc-100 text-zinc-800 px-2.5 py-1 rounded-lg border border-zinc-200">
                              {idxVal}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })()}
            </main>
          </div>
        )}

        {/* ======================================================== */}
        {/* PERSPECTIVE 7: ROLES RBAC & REGISTRO DE RIESGOS           */}
        {/* ======================================================== */}
        {viewPerspective === 'security' && (
          <main className="flex-1 overflow-y-auto p-6 bg-zinc-100/60 space-y-6">
            {/* Header */}
            <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
              <div>
                <h2 className="text-base font-black text-zinc-950 flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-orange-600" />
                  Seguridad, Roles (RBAC) & Registro de Riesgos
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Matriz de autorización estricta y mitigación proactiva de riesgos financieros y operacionales.
                </p>
              </div>
            </div>

            {/* RBAC Roles Definitions */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {data?.requirements?.rolesMatrix?.roles?.map(role => (
                <div key={role.id} className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-black px-2 py-0.5 rounded bg-zinc-900 text-white">
                      {role.id}
                    </span>
                  </div>
                  <h3 className="text-xs font-black text-zinc-950">{role.name}</h3>
                  <p className="text-[11px] text-zinc-500 leading-snug">{role.description}</p>
                  <div className="text-[10px] font-mono text-zinc-400 pt-2 border-t border-zinc-100">
                    <b>Guard:</b> <code>{role.guardMiddleware}</code>
                  </div>
                </div>
              ))}
            </div>

            {/* RBAC Matrix Table */}
            {data?.requirements?.rolesMatrix?.matrix && (
              <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs">
                <div className="p-4 border-b border-zinc-200 bg-zinc-50/50">
                  <h3 className="text-xs font-black uppercase tracking-wider text-zinc-800">
                    Matriz de Permisos por Recurso
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-500 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="p-3.5">Recurso</th>
                        <th className="p-3.5">Comerciante</th>
                        <th className="p-3.5">Comprador</th>
                        <th className="p-3.5">Repartidor</th>
                        <th className="p-3.5">SuperAdmin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {data.requirements.rolesMatrix.matrix.map((row, idx) => (
                        <tr key={idx} className="hover:bg-zinc-50/50">
                          <td className="p-3.5 font-bold text-zinc-900">{row.resource}</td>
                          <td className="p-3.5">
                            <div className="flex flex-wrap gap-1">
                              {row.permissions['ROLE_MERCHANT']?.map((p, i) => (
                                <span key={i} className="text-[10px] font-mono bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded border border-blue-200">
                                  {p}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="p-3.5">
                            <div className="flex flex-wrap gap-1">
                              {row.permissions['ROLE_SHOPPER']?.map((p, i) => (
                                <span key={i} className="text-[10px] font-mono bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded border border-emerald-200">
                                  {p}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="p-3.5">
                            <div className="flex flex-wrap gap-1">
                              {row.permissions['ROLE_DRIVER']?.map((p, i) => (
                                <span key={i} className="text-[10px] font-mono bg-amber-50 text-amber-700 px-1.5 py-0.2 rounded border border-amber-200">
                                  {p}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="p-3.5">
                            <div className="flex flex-wrap gap-1">
                              {row.permissions['ROLE_ADMIN']?.map((p, i) => (
                                <span key={i} className="text-[10px] font-mono bg-purple-50 text-purple-700 px-1.5 py-0.2 rounded border border-purple-200">
                                  {p}
                                </span>
                              ))}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Risk Register Cards */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-zinc-800 flex items-center gap-2">
                  <AlertOctagon className="w-4 h-4 text-rose-600" />
                  Registro de Riesgos Operativos & Técnicos (SDD Risk Log)
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data?.core?.risks?.risks?.map(risk => (
                  <div key={risk.id} className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-black px-2 py-0.5 rounded bg-zinc-900 text-white">
                        {risk.id}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                          Severidad: {risk.severityScore}/10
                        </span>
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                          {risk.probability} prob / {risk.impact} imp
                        </span>
                      </div>
                    </div>

                    <h4 className="text-sm font-black text-zinc-950">{risk.title}</h4>

                    <div className="p-2.5 rounded-xl bg-amber-50/50 border border-amber-200 text-xs text-amber-950">
                      <b>Alerta Temprana:</b> {risk.earlyWarningIndicator}
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200 text-xs text-emerald-950 space-y-1">
                      <b>Estrategia de Mitigación:</b>
                      <p className="leading-relaxed">{risk.mitigationStrategy}</p>
                    </div>

                    <div className="text-[10px] font-mono text-zinc-400 pt-1 border-t border-zinc-100 flex items-center justify-between">
                      <span>Owner: <b>{risk.owner}</b></span>
                      <span>Categoría: {risk.category}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>
        )}

        {/* ======================================================== */}
        {/* PERSPECTIVE 8: PLAN DE PRUEBAS & QA                       */}
        {/* ======================================================== */}
        {viewPerspective === 'qa' && (
          <div className="flex flex-1 overflow-hidden">
            {/* Test Suites Sidebar */}
            <aside className="w-80 shrink-0 border-r border-zinc-200 bg-white flex flex-col justify-between overflow-y-auto p-4 space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                  <span className="text-xs font-black uppercase text-zinc-900 tracking-wider">Suites de Prueba</span>
                  <span className="text-[10px] font-bold text-zinc-500">{data?.testPlan?.testSuites?.length || 0} suites</span>
                </div>

                <div className="space-y-1.5">
                  {data?.testPlan?.testSuites?.map(suite => {
                    const isSelected = selectedSuiteId === suite.id
                    return (
                      <button
                        key={suite.id}
                        onClick={() => setSelectedSuiteId(suite.id)}
                        className={`w-full text-left p-3 rounded-xl border text-xs font-bold transition-all flex flex-col gap-1 ${
                          isSelected
                            ? 'bg-zinc-900 text-white border-zinc-900 shadow-sm'
                            : 'bg-white text-zinc-700 border-zinc-200/80 hover:border-zinc-300 hover:bg-zinc-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-mono font-bold uppercase tracking-wider" style={{ color: isSelected ? '#86efac' : '#16a34a' }}>
                            {suite.id}
                          </span>
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-300">
                            {suite.automated ? 'Automated' : 'Manual'}
                          </span>
                        </div>
                        <span className="text-xs font-black truncate">{suite.name}</span>
                        <span className="text-[10px] opacity-70">{suite.testCases.length} Casos de Prueba</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="p-3 border-t border-zinc-100 bg-zinc-50 rounded-xl text-[10px] text-zinc-500 leading-tight">
                <b>QA Frameworks:</b> {data?.testPlan?.frameworks?.join(' • ') || 'Playwright, Vitest, Postman'}.
              </div>
            </aside>

            {/* Test Cases List */}
            <main className="flex-1 overflow-y-auto p-6 bg-zinc-100/60 space-y-4">
              {(() => {
                const currentSuite = data?.testPlan?.testSuites?.find(s => s.id === selectedSuiteId) || data?.testPlan?.testSuites?.[0]
                if (!currentSuite) return <div className="text-xs text-zinc-500">No hay suites configuradas.</div>

                return (
                  <div className="space-y-5 max-w-5xl">
                    <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-black px-2 py-0.5 rounded bg-emerald-100 text-emerald-900">
                            {currentSuite.id}
                          </span>
                          <h2 className="text-base font-black text-zinc-950">{currentSuite.name}</h2>
                        </div>
                        <p className="text-xs text-zinc-500 mt-1">
                          Prioridad: <b>{currentSuite.priority}</b> • {currentSuite.automated ? 'Ejecución automatizada en CI/CD' : 'Validación manual asistida'}
                        </p>
                      </div>

                      <span className="text-xs font-mono font-bold bg-zinc-100 px-3 py-1 rounded-full text-zinc-700">
                        {currentSuite.testCases.length} Casos
                      </span>
                    </div>

                    <div className="space-y-4">
                      {currentSuite.testCases.map((tc, idx) => (
                        <div key={tc.id} className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-mono font-bold text-zinc-500">
                              #{idx + 1} ({tc.id})
                            </span>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                              tc.status === 'passed' ? 'bg-emerald-100 text-emerald-800' :
                              tc.status === 'in_progress' ? 'bg-amber-100 text-amber-800' :
                              'bg-zinc-100 text-zinc-600'
                            }`}>
                              {tc.status === 'passed' ? 'Aprobado ✓' : tc.status}
                            </span>
                          </div>

                          <h3 className="text-sm font-black text-zinc-950">{tc.title}</h3>

                          <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-100 text-xs text-zinc-600">
                            <b>Precondición:</b> {tc.preconditions}
                          </div>

                          <div className="space-y-1.5 pt-1">
                            <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">Pasos de Prueba:</span>
                            <ol className="list-decimal list-inside space-y-1 text-xs text-zinc-700 font-mono">
                              {tc.steps.map((st, sIdx) => (
                                <li key={sIdx} className="leading-relaxed">{st}</li>
                              ))}
                            </ol>
                          </div>

                          <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200 text-xs text-emerald-950">
                            <b>Resultado Esperado:</b> {tc.expectedResult}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })()}
            </main>
          </div>
        )}

        {/* ======================================================== */}
        {/* PERSPECTIVE 9: INTEGRIDAD & DERIVA (DRIFT DETECTION)     */}
        {/* ======================================================== */}
        {viewPerspective === 'drift' && (
          <main className="flex-1 overflow-y-auto p-6 bg-zinc-100/60 space-y-6">
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-mono font-black px-2 py-0.5 rounded uppercase ${
                    data?.drift?.isClean ? 'bg-emerald-100 text-emerald-900' : 'bg-amber-100 text-amber-900'
                  }`}>
                    {data?.drift?.isClean ? 'Sin Deriva' : 'Deriva Detectada'}
                  </span>
                  <span className="text-xs font-mono font-bold text-zinc-500">
                    Alineación con .sdd/: {data?.drift?.driftScore ?? 100}%
                  </span>
                </div>
                <h2 className="text-lg font-black text-zinc-950 mt-1">
                  Monitor de Deriva de Código (Spec Drift Detection)
                </h2>
                <p className="text-xs text-zinc-600 max-w-2xl leading-relaxed mt-1">
                  Compara los archivos modificados en Git contra las declaraciones de alcance (`scopeFiles`) en flujos e historias. Ningún código debe escribirse sin respaldo en una especificación SDD.
                </p>
              </div>

              <button
                onClick={() => { fetchData(); toast.success('Verificación de deriva actualizada'); }}
                className="px-4 py-2 rounded-xl text-xs font-black bg-zinc-900 text-white hover:bg-zinc-800 transition-colors flex items-center gap-2 shrink-0 shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Re-verificar Git
              </button>
            </div>

            {/* Score & Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs space-y-1">
                <span className="text-[10px] font-black uppercase text-zinc-400">Puntaje de Alineación</span>
                <div className="text-2xl font-black text-zinc-950">{data?.drift?.driftScore ?? 100}%</div>
                <div className="text-[11px] text-zinc-500">De cambios con respaldo en .sdd/</div>
              </div>

              <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs space-y-1">
                <span className="text-[10px] font-black uppercase text-zinc-400">Archivos en Alcance</span>
                <div className="text-2xl font-black text-emerald-600">{data?.drift?.inScope?.length || 0}</div>
                <div className="text-[11px] text-zinc-500">Asignados a flujos/historias activas</div>
              </div>

              <div className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs space-y-1">
                <span className="text-[10px] font-black uppercase text-zinc-400">Archivos Fuera de Alcance</span>
                <div className={`text-2xl font-black ${(data?.drift?.outOfScope?.length || 0) > 0 ? 'text-amber-600' : 'text-zinc-400'}`}>
                  {data?.drift?.outOfScope?.length || 0}
                </div>
                <div className="text-[11px] text-zinc-500">Modificados sin nodo asociado</div>
              </div>
            </div>

            {/* Out of Scope Files Warning */}
            {data?.drift?.outOfScope && data.drift.outOfScope.length > 0 && (
              <div className="bg-white border border-amber-300 rounded-2xl p-5 shadow-xs space-y-3 ring-2 ring-amber-100">
                <div className="flex items-center gap-2 text-amber-900 font-black text-sm">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Archivos Modificados sin Especificación Activa (Deriva Potencial):
                </div>
                <p className="text-xs text-zinc-600">
                  Los siguientes archivos tienen cambios en el repositorio pero no están declarados en `scopeFiles` de la historia o nodo actual:
                </p>
                <div className="space-y-1 max-h-60 overflow-y-auto font-mono text-xs text-zinc-800">
                  {data.drift.outOfScope.map((f, idx) => (
                    <div key={idx} className="p-2 rounded-lg bg-amber-50/70 border border-amber-200/80 flex items-center justify-between">
                      <span>{f}</span>
                      <span className="text-[10px] text-amber-700 font-bold font-sans">No declarado en scopeFiles</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Protocol Rule Alert */}
            <div className="bg-zinc-900 text-white border border-zinc-800 rounded-2xl p-5 space-y-2">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-black uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                Regla 2 de AGENTS.md — Aislamiento de Alcance (Scope Protection):
              </div>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Ningún agente de IA o desarrollador debe modificar archivos fuera del <code>scopeFiles</code> del nodo activo. Esto previene roturas colaterales, bugs silenciosos y alucinaciones de alcance.
              </p>
            </div>
          </main>
        )}

        {/* ======================================================== */}
        {/* PERSPECTIVE 10: MATRIZ UI/UX & PANTALLAS DEL SISTEMA      */}
        {/* ======================================================== */}
        {viewPerspective === 'uiux' && (
          <main className="flex-1 overflow-y-auto p-6 bg-zinc-100/60">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-black text-zinc-950 flex items-center gap-2">
                  <Layout className="w-5 h-5 text-pink-600" />
                  Matriz UI/UX & Catálogo de Pantallas
                </h2>
                <p className="text-xs text-zinc-500">
                  Inventario completo de rutas, layouts, componentes utilizados y botones de prueba en vivo.
                </p>
              </div>
              <span className="text-xs font-bold text-zinc-600">
                {data.uiUx?.screens.length} pantallas registradas
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {data.uiUx?.screens.map(screen => (
                <div
                  key={screen.id}
                  className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4 hover:border-zinc-300 transition-all"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-900 text-white">
                        {screen.id}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-zinc-800">{screen.healthPercent}%</span>
                        <div className="w-16 h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-pink-500 rounded-full"
                            style={{ width: `${screen.healthPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-black text-zinc-950">{screen.name}</h3>
                      <div className="text-xs font-mono text-zinc-500 mt-0.5">{screen.route}</div>
                    </div>

                    <p className="text-xs text-zinc-600 leading-relaxed bg-zinc-50 p-2.5 rounded-xl border border-zinc-100">
                      {screen.wireframeDescription}
                    </p>

                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Componentes:</span>
                      <div className="flex flex-wrap gap-1">
                        {screen.components.map((comp, idx) => (
                          <span key={idx} className="text-[10px] font-mono bg-zinc-100 px-2 py-0.5 rounded text-zinc-700">
                            {comp}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-2 border-t border-zinc-100">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Requisitos de Pantalla:</span>
                      {screen.checklist.map(item => (
                        <label
                          key={item.id}
                          className="flex items-start gap-2 text-[11px] text-zinc-700 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={item.done}
                            onChange={(e) => handleToggleScreenChecklist(screen.id, item.id, e.target.checked)}
                            className="mt-0.5 rounded border-zinc-300 text-pink-600 focus:ring-pink-500 w-3.5 h-3.5"
                          />
                          <span className={item.done ? 'line-through text-zinc-400' : 'text-zinc-800'}>
                            {item.text}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-100">
                    <a
                      href={screen.previewUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-extrabold bg-pink-50 text-pink-700 border border-pink-200 hover:bg-pink-100 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      Probar Pantalla en Vivo ({screen.previewUrl})
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </main>
        )}

        {/* ======================================================== */}
        {/* PERSPECTIVE 6: TABLERO KANBAN SPRINT                     */}
        {/* ======================================================== */}
        {viewPerspective === 'kanban' && (
          <div className="flex-1 overflow-x-auto p-6 bg-zinc-100/70">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-black text-zinc-950 flex items-center gap-2">
                  <Kanban className="w-5 h-5 text-amber-600" />
                  Tablero Kanban Sprint (2 Semanas)
                </h2>
                <p className="text-xs text-zinc-500">
                  {onlyP0 ? 'Mostrando únicamente tareas críticas P0 para el lanzamiento.' : 'Vista consolidada de todos los pipelines y estados de ejecución.'}
                </p>
              </div>
              <span className="text-xs font-bold text-zinc-600">{allFlowNodes.length} nodos activos</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-175px)]">
              {/* Por Hacer */}
              <div className="bg-zinc-50 border border-zinc-200 rounded-2xl flex flex-col overflow-hidden shadow-xs">
                <div className="p-3.5 border-b border-zinc-200 bg-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-zinc-400" />
                    <span className="text-xs font-black text-zinc-800 uppercase tracking-wider">Por Hacer</span>
                  </div>
                  <span className="text-xs font-mono font-bold bg-zinc-100 px-2 py-0.5 rounded-full text-zinc-600">
                    {allFlowNodes.filter(n => n.status === 'todo').length}
                  </span>
                </div>

                <div className="p-3 space-y-3 overflow-y-auto flex-1">
                  {allFlowNodes.filter(n => n.status === 'todo').map(node => (
                    <div
                      key={node.id}
                      onClick={() => { setSelectedNode(node); setSelectedType('flow_node'); }}
                      className="bg-white border border-zinc-200 rounded-xl p-3.5 shadow-xs hover:border-zinc-400 hover:shadow-sm transition-all cursor-pointer space-y-2 group"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                          node.flowPriority === 'P0' ? 'bg-amber-100 text-amber-800' : 'bg-zinc-100 text-zinc-600'
                        }`}>
                          {node.flowPriority} • {node.flowName}
                        </span>
                        <span className="text-[10px] text-zinc-400 flex items-center gap-1">
                          <Bot className="w-3 h-3" />
                          {node.assignedTo || 'Sin asignar'}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-zinc-900 group-hover:text-purple-700 transition-colors">
                        {node.name}
                      </h4>
                      <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1 border-t border-zinc-100">
                        <span>{node.checklist?.filter(t => t.done).length || 0} / {node.checklist?.length || 0} tareas</span>
                        <span className="text-purple-600 font-bold flex items-center gap-0.5 text-[10px]">
                          Inspeccionar <ArrowRight className="w-2.5 h-2.5" />
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* En Progreso */}
              <div className="bg-amber-50/30 border border-amber-200 rounded-2xl flex flex-col overflow-hidden shadow-xs">
                <div className="p-3.5 border-b border-amber-200 bg-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-xs font-black text-amber-900 uppercase tracking-wider">En Progreso</span>
                  </div>
                  <span className="text-xs font-mono font-bold bg-amber-100 px-2 py-0.5 rounded-full text-amber-800">
                    {allFlowNodes.filter(n => n.status === 'in_progress').length}
                  </span>
                </div>

                <div className="p-3 space-y-3 overflow-y-auto flex-1">
                  {allFlowNodes.filter(n => n.status === 'in_progress').map(node => (
                    <div
                      key={node.id}
                      onClick={() => { setSelectedNode(node); setSelectedType('flow_node'); }}
                      className="bg-white border border-amber-300 rounded-xl p-3.5 shadow-xs hover:border-amber-500 hover:shadow-sm transition-all cursor-pointer space-y-2 group ring-2 ring-amber-100"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase bg-amber-100 text-amber-800">
                          {node.flowPriority} • {node.flowName}
                        </span>
                        <span className="text-[10px] font-bold text-amber-700 flex items-center gap-1">
                          <Bot className="w-3 h-3" />
                          {node.assignedTo}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-zinc-900 group-hover:text-amber-800 transition-colors">
                        {node.name}
                      </h4>
                      
                      <div className="space-y-1 pt-1">
                        {node.checklist?.map(task => (
                          <label
                            key={task.id}
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-start gap-1.5 text-[11px] text-zinc-700 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={task.done}
                              onChange={(e) => {
                                if (node.flowId) {
                                  handleToggleTask(node.flowId, node.id, task.id, e.target.checked)
                                }
                              }}
                              className="mt-0.5 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500 w-3 h-3"
                            />
                            <span className={task.done ? 'line-through text-zinc-400' : 'text-zinc-800'}>
                              {task.text}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Completado */}
              <div className="bg-emerald-50/30 border border-emerald-200 rounded-2xl flex flex-col overflow-hidden shadow-xs">
                <div className="p-3.5 border-b border-emerald-200 bg-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                    <span className="text-xs font-black text-emerald-900 uppercase tracking-wider">Completado & Probado</span>
                  </div>
                  <span className="text-xs font-mono font-bold bg-emerald-100 px-2 py-0.5 rounded-full text-emerald-800">
                    {allFlowNodes.filter(n => n.status === 'done').length}
                  </span>
                </div>

                <div className="p-3 space-y-3 overflow-y-auto flex-1">
                  {allFlowNodes.filter(n => n.status === 'done').map(node => (
                    <div
                      key={node.id}
                      onClick={() => { setSelectedNode(node); setSelectedType('flow_node'); }}
                      className="bg-white border border-emerald-200 rounded-xl p-3.5 shadow-xs hover:border-emerald-400 transition-all cursor-pointer space-y-2 opacity-85 hover:opacity-100 group"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {node.flowName}
                        </span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                      <h4 className="text-xs font-bold text-zinc-900 line-through text-zinc-500">
                        {node.name}
                      </h4>
                      <div className="text-[10px] text-emerald-700 font-medium pt-1">
                        ✓ {node.checklist?.length || 0} tareas verificadas
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Right Lateral Inspector (Context Drawer) */}
        {selectedNode && (viewPerspective === 'flows' || viewPerspective === 'architecture' || viewPerspective === 'kanban') && (
          <aside className="w-[430px] shrink-0 border-l border-zinc-200 bg-white flex flex-col justify-between overflow-y-auto z-30 animate-in slide-in-from-right duration-200 shadow-xl">
            <div className="p-5 space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                <span className="text-[11px] font-black uppercase text-zinc-400 tracking-wider">
                  {selectedType === 'flow_node' ? 'Inspector de Nodo de Flujo' : 'Inspector de Servicio Macro'}
                </span>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="text-xs font-bold text-zinc-400 hover:text-zinc-800"
                >
                  Cerrar ✕
                </button>
              </div>

              <div>
                <h3 className="text-lg font-black text-zinc-950 leading-tight">
                  {(selectedNode as any).name || (selectedNode as any).label}
                </h3>
                <div className="flex items-center gap-2 mt-2">
                  {selectedType === 'flow_node' ? (
                    <>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 flex items-center gap-1">
                        <Bot className="w-3.5 h-3.5" />
                        {(selectedNode as any).assignedTo || 'Sin asignar'}
                      </span>
                      <span className={`text-[11px] font-bold px-2 py-0.5 rounded uppercase border ${
                        (selectedNode as any).status === 'done'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : (selectedNode as any).status === 'in_progress'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : 'bg-zinc-100 text-zinc-600 border-zinc-200'
                      }`}>
                        {(selectedNode as any).status}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-900 text-white">
                        {(selectedNode as any).tech}
                      </span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Salud: {(selectedNode as any).healthPercent}%
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* ACTION: ASIGNAR AGENTE & AUTO-PILOT */}
              {selectedType === 'flow_node' && (
                <div className="p-3.5 rounded-xl bg-purple-50/80 border border-purple-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-purple-900 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      Auto-Pilot: Ejecución con Antigravity
                    </span>
                    <button
                      onClick={() => {
                        if (!allGatesPassed) {
                          setGateBlockedModalOpen(true)
                          toast.error('Compuertas de Calidad Pendientes: no se puede despachar a Antigravity')
                          return
                        }
                        handleAssignAgent()
                      }}
                      className="px-2.5 py-1 rounded-md text-xs font-black bg-purple-600 text-white hover:bg-purple-700 transition-colors shadow-xs flex items-center gap-1"
                    >
                      {allGatesPassed ? <Play className="w-3 h-3 fill-white" /> : <Lock className="w-3 h-3" />}
                      Asignar y Marcar
                    </button>
                  </div>
                  <p className="text-[11px] text-purple-800 leading-relaxed">
                    Copia la orden técnica lista para pegar en el chat de Antigravity cumpliendo el protocolo SDD:
                  </p>
                  
                  <div className="pt-1">
                    <button
                      onClick={() => {
                        handleProtectedDispatch(agentCommandText, (selectedNode as any).name || 'Nodo')
                      }}
                      className="w-full text-left p-2.5 rounded-lg bg-white border border-purple-200 hover:border-purple-400 transition-colors flex items-center justify-between group shadow-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Code2 className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                        <span className="text-xs font-bold text-zinc-800 truncate">
                          Copiar orden con reglas de scope y checklist
                        </span>
                      </div>
                      <span className="text-[10px] font-black text-purple-600 shrink-0 uppercase tracking-wider">
                        {copiedPrompt ? '✓ Copiado' : 'Copiar'}
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* SCOPE FILES */}
              {selectedType === 'flow_node' && (selectedNode as FlowNodeData).scopeFiles && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-zinc-700 flex items-center gap-1.5">
                    <FileCode2 className="w-3.5 h-3.5 text-zinc-500" />
                    Archivos en Alcance (Scope Files):
                  </span>
                  <div className="space-y-1.5">
                    {(selectedNode as FlowNodeData).scopeFiles.map((file: string) => {
                      const previewRoute = getScopeFileRoute(file)
                      return (
                        <div
                          key={file}
                          className="p-2 rounded-lg bg-zinc-50 border border-zinc-200/80 space-y-1"
                        >
                          <div className="text-[11px] font-mono text-zinc-700 break-all select-text">
                            {file}
                          </div>
                          {previewRoute && (
                            <div className="pt-1 flex items-center justify-end">
                              <a
                                href={previewRoute.url}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors"
                              >
                                <ExternalLink className="w-2.5 h-2.5" />
                                Probar en Vivo ({previewRoute.label})
                              </a>
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* DRILL-DOWN: Connected Flows */}
              {selectedType === 'arch_service' && (selectedNode as ArchitectureNode).connectedFlows && (
                <div className="space-y-2 p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-200">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900">
                    <Layers className="w-4 h-4 text-indigo-600" />
                    Flujos de Negocio Vinculados (Drill-Down):
                  </div>
                  <div className="space-y-1.5 pt-1">
                    {(selectedNode as ArchitectureNode).connectedFlows?.map(fId => {
                      const flowObj = data?.flows.find(f => f.id === fId)
                      return (
                        <button
                          key={fId}
                          onClick={() => handleDrillDownToFlow(fId)}
                          className="w-full flex items-center justify-between p-2 rounded-lg bg-white border border-indigo-200/80 hover:border-indigo-400 hover:shadow-xs transition-all text-left text-xs font-bold text-zinc-800 cursor-pointer"
                        >
                          <span className="truncate">{flowObj?.name || fId}</span>
                          <span className="text-[10px] font-black text-indigo-600 flex items-center gap-0.5">
                            {flowObj?.progress}% <ChevronRight className="w-3 h-3" />
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Checklist */}
              <div className="space-y-3 pt-2 border-t border-zinc-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-zinc-800 uppercase tracking-wider">
                    {selectedType === 'flow_node' ? 'Tareas de este Nodo' : 'Tareas de Infraestructura'}
                  </span>
                  <span className="text-[11px] font-mono text-zinc-400">
                    {selectedType === 'flow_node'
                      ? `${(selectedNode as FlowNodeData).checklist?.filter(t => t.done).length || 0} / ${(selectedNode as FlowNodeData).checklist?.length || 0}`
                      : `${(selectedNode as ArchitectureNode).tasks?.filter(t => t.done).length || 0} / ${(selectedNode as ArchitectureNode).tasks?.length || 0}`
                    }
                  </span>
                </div>

                <div className="space-y-2">
                  {selectedType === 'flow_node' ? (
                    (selectedNode as FlowNodeData).checklist?.map(task => (
                      <label
                        key={task.id}
                        className="flex items-start gap-2.5 p-2 rounded-lg border border-zinc-200 hover:bg-zinc-50 cursor-pointer text-xs"
                      >
                        <input
                          type="checkbox"
                          checked={task.done}
                          onChange={(e) => {
                            const flowId = (selectedNode as FlowNodeData).flowId || activeFlowId
                            handleToggleTask(flowId, (selectedNode as FlowNodeData).id, task.id, e.target.checked)
                            setSelectedNode((prev: any) => ({
                              ...prev,
                              checklist: prev.checklist.map((t: any) => (t.id === task.id ? { ...t, done: e.target.checked } : t))
                            }))
                          }}
                          className="mt-0.5 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                        />
                        <span className={task.done ? 'line-through text-zinc-400' : 'text-zinc-800 font-medium'}>
                          {task.text}
                        </span>
                      </label>
                    ))
                  ) : (
                    (selectedNode as ArchitectureNode).tasks?.map(task => (
                      <label
                        key={task.id}
                        className="flex items-start gap-2.5 p-2 rounded-lg border border-zinc-200 hover:bg-zinc-50 cursor-pointer text-xs"
                      >
                        <input
                          type="checkbox"
                          checked={task.done}
                          onChange={(e) => {
                            setSelectedNode((prev: any) => ({
                              ...prev,
                              tasks: prev.tasks.map((t: any) => (t.id === task.id ? { ...t, done: e.target.checked } : t))
                            }))
                          }}
                          className="mt-0.5 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                        />
                        <span className={task.done ? 'line-through text-zinc-400' : 'text-zinc-800 font-medium'}>
                          {task.text}
                        </span>
                      </label>
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-zinc-100 bg-zinc-50 text-right">
              <span className="text-[10px] text-zinc-400 font-medium">
                SDD Protocol v2.0 • Spec-Driven Development
              </span>
            </div>
          </aside>
        )}
      </div>

      {/* SPOTLIGHT QUICK SEARCH MODAL (Ctrl+K) */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col">
            <div className="p-3 border-b border-zinc-200 flex items-center gap-3">
              <Search className="w-5 h-5 text-zinc-400 ml-1" />
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar núcleo, historias, flujos, pantallas UI, secuencias..."
                className="flex-1 text-sm font-medium focus:outline-none bg-transparent text-zinc-900 placeholder:text-zinc-400"
              />
              <button
                onClick={() => setIsSearchOpen(false)}
                className="px-2 py-1 text-xs font-bold text-zinc-400 hover:text-zinc-800 bg-zinc-100 rounded"
              >
                ESC
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto p-2 space-y-1">
              {searchResults.length === 0 ? (
                <div className="py-8 text-center text-xs text-zinc-400">
                  {searchQuery.trim() ? 'No se encontraron resultados para esta búsqueda' : 'Escribe para buscar cualquier elemento de ingeniería'}
                </div>
              ) : (
                searchResults.map((item, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setViewPerspective(item.targetView)
                      if (item.flowId) setActiveFlowId(item.flowId)
                      if (item.type === 'sequence') setActiveSequenceId(item.payload.id)
                      if (item.type === 'service') {
                        setSelectedNode(item.payload)
                        setSelectedType('arch_service')
                      } else if (item.type === 'node') {
                        setSelectedNode(item.payload)
                        setSelectedType('flow_node')
                      }
                      setIsSearchOpen(false)
                      setSearchQuery('')
                    }}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-zinc-100 flex items-center justify-between group transition-colors"
                  >
                    <div className="truncate pr-3">
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                          item.type === 'core' ? 'bg-emerald-100 text-emerald-800' :
                          item.type === 'story' ? 'bg-blue-100 text-blue-800' :
                          item.type === 'sequence' ? 'bg-purple-100 text-purple-800' :
                          item.type === 'screen' ? 'bg-pink-100 text-pink-800' :
                          item.type === 'flow' ? 'bg-teal-100 text-teal-800' : 'bg-zinc-900 text-white'
                        }`}>
                          {item.type}
                        </span>
                        <span className="text-xs font-bold text-zinc-900 group-hover:text-purple-600 transition-colors truncate">
                          {item.title}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 truncate mt-0.5">{item.subtitle}</p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-300 group-hover:text-zinc-700 shrink-0" />
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* LIVE DEVOPS HEALTH MODAL */}
      {isHealthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-950 text-white">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-black">Diagnóstico DevOps en Vivo</h3>
              </div>
              <button
                onClick={() => setIsHealthModalOpen(false)}
                className="text-xs font-bold text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-100 border border-zinc-200">
                <div className="text-xs text-zinc-700 space-y-0.5">
                  <div className="font-bold">Next.js {liveHealth?.system.nextVersion || '16.2.2'} Turbopack</div>
                  <div className="text-[11px] text-zinc-500">
                    Node: {liveHealth?.system.nodeVersion || 'v20'} • Memoria: {liveHealth?.system.memoryUsageMb || 80}MB • Uptime: {liveHealth?.system.uptimeSeconds || 0}s
                  </div>
                </div>
                <button
                  onClick={runLiveHealthCheck}
                  disabled={isHealthChecking}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold bg-zinc-900 text-white hover:bg-zinc-800 disabled:opacity-50 transition-all flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isHealthChecking ? 'animate-spin' : ''}`} />
                  Re-probar Todo
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {liveHealth && Object.entries(liveHealth.health).map(([key, info]) => (
                  <div
                    key={key}
                    className={`p-3 rounded-xl border flex flex-col justify-between gap-2 ${
                      info.status === 'healthy'
                        ? 'bg-emerald-50/40 border-emerald-200'
                        : info.status === 'degraded'
                        ? 'bg-amber-50/40 border-amber-200'
                        : 'bg-rose-50/40 border-rose-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider text-zinc-800">{key}</span>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        info.status === 'healthy' ? 'bg-emerald-100 text-emerald-800' :
                        info.status === 'degraded' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {info.latencyMs}ms • {info.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-600 font-medium">{info.message}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t border-zinc-100 bg-zinc-50 text-right">
              <button
                onClick={() => setIsHealthModalOpen(false)}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-zinc-900 text-white hover:bg-zinc-800"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EXECUTIVE LAUNCH REPORT MODAL */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-zinc-200 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-950 text-white">
              <div className="flex items-center gap-2">
                <Download className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-black">Informe Spec-Driven (SDD)</h3>
              </div>
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="text-xs font-bold text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-600">
                  Formato Markdown exportable:
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(generateMarkdownReport())
                      toast.success('¡Reporte copiado en Markdown!')
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-600 text-white hover:bg-purple-700 transition-colors flex items-center gap-1.5"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    Copiar Markdown
                  </button>
                  <button
                    onClick={() => {
                      const element = document.createElement('a')
                      const file = new Blob([generateMarkdownReport()], { type: 'text/markdown' })
                      element.href = URL.createObjectURL(file)
                      element.download = 'reporte-especificaciones-sdd.md'
                      document.body.appendChild(element)
                      element.click()
                      document.body.removeChild(element)
                      toast.success('Archivo .md descargado')
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-bold bg-zinc-900 text-white hover:bg-zinc-800 transition-colors flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Descargar .md
                  </button>
                </div>
              </div>

              <pre className="p-4 rounded-xl bg-zinc-900 text-zinc-200 text-xs font-mono overflow-x-auto whitespace-pre-wrap leading-relaxed select-text border border-zinc-800">
                {generateMarkdownReport()}
              </pre>
            </div>

            <div className="p-4 border-t border-zinc-100 bg-zinc-50 text-right">
              <button
                onClick={() => setIsReportModalOpen(false)}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-zinc-900 text-white hover:bg-zinc-800"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QUALITY GATES BLOCKED MODAL */}
      {gateBlockedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-rose-200 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-rose-100 flex items-center justify-between bg-rose-50 text-rose-950">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <h3 className="text-sm font-black uppercase tracking-wider">Compuertas de Calidad SDD Pendientes</h3>
              </div>
              <button
                onClick={() => setGateBlockedModalOpen(false)}
                className="text-xs font-bold text-rose-700 hover:text-rose-950 p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-xs text-zinc-600 leading-relaxed">
                El protocolo <b>Spec-Driven Development (SDD)</b> protege el código bloqueando el auto-pilot y la codificación hasta que el arquitecto o desarrollador valide las especificaciones mínimas de <code>project.json</code>.
              </p>

              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">
                  Compuertas que deben ser aprobadas:
                </span>
                <div className="space-y-2">
                  {pendingGates.map(gate => (
                    <div
                      key={gate.id}
                      className="p-3 rounded-xl border border-rose-200 bg-rose-50/40 flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="text-xs font-bold text-rose-950">{gate.name}</div>
                        <div className="text-[10px] font-mono text-zinc-500">{gate.file}</div>
                      </div>

                      <button
                        onClick={async () => {
                          await handleToggleGate(gate.id, gate.status)
                          if (pendingGates.length <= 1) setGateBlockedModalOpen(false)
                        }}
                        className="px-3 py-1.5 rounded-lg text-xs font-black bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-xs shrink-0 flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Aprobar Compuerta
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-zinc-100 bg-zinc-50 flex items-center justify-between">
              <span className="text-[10px] text-zinc-400 font-mono">
                Regla 0 de AGENTS.md — Quality Gates Enforced
              </span>
              <button
                onClick={() => setGateBlockedModalOpen(false)}
                className="px-4 py-1.5 rounded-lg text-xs font-bold bg-zinc-900 text-white hover:bg-zinc-800"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
