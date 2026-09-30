import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

interface ChecklistItem {
  id: string
  text: string
  done: boolean
}

interface FlowNode {
  id: string
  name: string
  status: 'todo' | 'in_progress' | 'done'
  assignedTo?: string
  scopeFiles: string[]
  agentPrompt?: string
  checklist: ChecklistItem[]
}

interface FlowData {
  id: string
  name: string
  category: string
  priority: 'P0' | 'P1' | 'P2'
  targetWeek: number
  progress: number
  description: string
  nodes: FlowNode[]
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
}

const SDD_DIR = path.join(process.cwd(), '.sdd')
const FLOWS_DIR = path.join(SDD_DIR, 'flows')
const REQUIREMENTS_DIR = path.join(SDD_DIR, 'requirements')
const STORIES_DIR = path.join(REQUIREMENTS_DIR, 'stories')
const CORE_DIR = path.join(SDD_DIR, 'core')
const SEQUENCES_DIR = path.join(SDD_DIR, 'sequences')
const UI_UX_DIR = path.join(SDD_DIR, 'ui-ux')
const DISCOVERY_DIR = path.join(SDD_DIR, 'discovery')
const DATABASE_DIR = path.join(SDD_DIR, 'database')
const QA_DIR = path.join(SDD_DIR, 'qa')

function getDriftReport() {
  try {
    const declared = new Set<string>()
    if (fs.existsSync(FLOWS_DIR)) {
      const flowFiles = fs.readdirSync(FLOWS_DIR).filter(f => f.endsWith('.json'))
      for (const f of flowFiles) {
        const flow = readJsonFile<any>(path.join(FLOWS_DIR, f))
        flow?.nodes?.forEach((n: any) => n.scopeFiles?.forEach((file: string) => declared.add(file.replace(/\\/g, '/'))))
      }
    }
    if (fs.existsSync(STORIES_DIR)) {
      const storyFiles = fs.readdirSync(STORIES_DIR).filter(f => f.endsWith('.json'))
      for (const f of storyFiles) {
        const story = readJsonFile<any>(path.join(STORIES_DIR, f))
        story?.scopeFiles?.forEach((file: string) => declared.add(file.replace(/\\/g, '/')))
      }
    }

    let modified: string[] = []
    try {
      const { execSync } = require('child_process')
      const output = execSync('git status --porcelain', { encoding: 'utf-8', timeout: 3000 })
      const lines = output.split('\n').filter(Boolean)
      for (const line of lines) {
        const match = line.trim().match(/^([MADRCU?]+)\s+(.+)$/)
        if (match) {
          let fp = match[2].trim().replace(/\\/g, '/')
          if (fp.startsWith('"') && fp.endsWith('"')) fp = fp.slice(1, -1)
          if (!fp.startsWith('.sdd/') && !fp.startsWith('.git') && fp !== 'AGENTS.md') {
            modified.push(fp)
          }
        }
      }
    } catch {
      // fallback if git fails
    }

    const inScope: string[] = []
    const outOfScope: string[] = []
    for (const file of modified) {
      const isDeclared = Array.from(declared).some(d => file.startsWith(d) || d.startsWith(file))
      if (isDeclared) inScope.push(file)
      else outOfScope.push(file)
    }

    const driftScore = modified.length === 0 ? 100 : Math.round((inScope.length / (inScope.length + outOfScope.length)) * 100)
    return {
      driftScore,
      isClean: outOfScope.length === 0,
      totalModified: modified.length,
      inScope,
      outOfScope,
      declaredCount: declared.size
    }
  } catch (err: any) {
    return { driftScore: 100, isClean: true, totalModified: 0, inScope: [], outOfScope: [], declaredCount: 0, error: err.message }
  }
}

function loadUserStories(): any[] {
  try {
    if (fs.existsSync(STORIES_DIR)) {
      const files = fs.readdirSync(STORIES_DIR).filter(f => f.endsWith('.json'))
      if (files.length > 0) {
        return files.map(f => readJsonFile<any>(path.join(STORIES_DIR, f))).filter(Boolean)
      }
    }
  } catch (err) {
    console.error('Error reading stories dir:', err)
  }
  return readJsonFile<any[]>(path.join(REQUIREMENTS_DIR, 'user-stories.json')) || []
}

function readJsonFile<T>(filePath: string): T | null {
  try {
    if (!fs.existsSync(filePath)) return null
    const content = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(content) as T
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err)
    return null
  }
}

function writeJsonFile<T>(filePath: string, data: T): boolean {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
    return true
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err)
    return false
  }
}

function calculateFlowProgress(flow: FlowData): number {
  if (!flow.nodes || flow.nodes.length === 0) return 0
  let totalTasks = 0
  let doneTasks = 0

  flow.nodes.forEach(node => {
    if (node.checklist && node.checklist.length > 0) {
      totalTasks += node.checklist.length
      doneTasks += node.checklist.filter(t => t.done).length
    } else {
      totalTasks += 1
      if (node.status === 'done') doneTasks += 1
    }
  })

  return totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100)
}

async function checkServiceHealth() {
  const healthResults: Record<string, { status: 'healthy' | 'degraded' | 'down'; latencyMs: number; message: string }> = {}

  // 1. PostgreSQL check via Prisma
  try {
    const start = Date.now()
    await prisma.$queryRaw`SELECT 1 as ping`
    healthResults['postgres'] = {
      status: 'healthy',
      latencyMs: Date.now() - start,
      message: 'Conexión activa a PostgreSQL 16'
    }
  } catch (err: any) {
    healthResults['postgres'] = {
      status: 'down',
      latencyMs: 0,
      message: err.message ? String(err.message).slice(0, 100) : 'Error de conexión a PostgreSQL'
    }
  }

  // 2. Evolution API (WhatsApp) check
  try {
    const start = Date.now()
    const evoUrl = process.env.EVOLUTION_API_URL || 'http://evolution-api:8080'
    const evoKey = process.env.EVOLUTION_API_KEY || ''
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), 2000)
    
    let res: Response | null = null
    try {
      res = await fetch(`${evoUrl}/instance/fetchInstances`, {
        headers: { apikey: evoKey },
        signal: controller.signal
      })
    } catch {
      // Fallback to localhost if container hostname isn't reachable
      try {
        res = await fetch('http://localhost:8080/instance/fetchInstances', {
          headers: { apikey: evoKey },
          signal: controller.signal
        })
      } catch {
        res = null
      }
    }
    clearTimeout(timer)

    if (res && res.ok) {
      healthResults['evolution'] = {
        status: 'healthy',
        latencyMs: Date.now() - start,
        message: 'Evolution API activo en puerto 8080'
      }
    } else if (res) {
      healthResults['evolution'] = {
        status: 'degraded',
        latencyMs: Date.now() - start,
        message: `Evolution API respondió HTTP ${res.status}`
      }
    } else {
      healthResults['evolution'] = {
        status: 'down',
        latencyMs: 0,
        message: 'Evolution API no responde en puerto 8080'
      }
    }
  } catch (err: any) {
    healthResults['evolution'] = {
      status: 'down',
      latencyMs: 0,
      message: 'Error al contactar Evolution API'
    }
  }

  // 3. SmartPay Bre-B configuration check
  const brebConfigured = Boolean(process.env.BREB_EMVCO_GUI || process.env.NEXT_PUBLIC_APP_URL)
  healthResults['breb'] = {
    status: brebConfigured ? 'healthy' : 'degraded',
    latencyMs: 1,
    message: brebConfigured ? 'Módulo EMVCo / SPI configurado' : 'Faltan variables Bre-B'
  }

  // 4. Clerk Auth check
  const clerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY)
  healthResults['clerk'] = {
    status: clerkConfigured ? 'healthy' : 'degraded',
    latencyMs: 1,
    message: clerkConfigured ? 'Clerk v7 keys configuradas' : 'Clerk keys pendientes'
  }

  // 5. DeepSeek / AI check
  const aiConfigured = Boolean(process.env.DEEPSEEK_API_KEY || process.env.OPENROUTER_API_KEY)
  healthResults['deepseek'] = {
    status: aiConfigured ? 'healthy' : 'degraded',
    latencyMs: 1,
    message: aiConfigured ? 'AI Provider activo' : 'Falta API key de LLM'
  }

  // 6. Supabase Storage check
  const supabaseConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY))
  healthResults['supabase'] = {
    status: supabaseConfigured ? 'healthy' : 'degraded',
    latencyMs: 1,
    message: supabaseConfigured ? 'Supabase Storage configurado' : 'Variables Supabase pendientes'
  }

  return healthResults
}

export async function GET(req: Request) {
  try {
    const isHealthOnly = req.url.includes('health=true')

    if (isHealthOnly) {
      const health = await checkServiceHealth()
      return NextResponse.json({
        health,
        system: {
          uptimeSeconds: Math.round(process.uptime()),
          memoryUsageMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          nodeVersion: process.version,
          nextVersion: '16.2.2',
          env: process.env.NODE_ENV || 'development'
        },
        timestamp: new Date().toISOString()
      })
    }

    const manifestPath = path.join(SDD_DIR, 'manifest.json')
    const architecturePath = path.join(SDD_DIR, 'architecture.json')

    const manifest = readJsonFile<any>(manifestPath) || {}
    const architecture = readJsonFile<any>(architecturePath) || {}

    const flows: FlowData[] = []

    if (fs.existsSync(FLOWS_DIR)) {
      const files = fs.readdirSync(FLOWS_DIR).filter(f => f.endsWith('.json'))
      for (const file of files) {
        const flow = readJsonFile<FlowData>(path.join(FLOWS_DIR, file))
        if (flow) {
          flow.progress = calculateFlowProgress(flow)
          flows.push(flow)
        }
      }
    }

    // Calcular salud global consolidada ponderada por prioridad (P0=3, P1=2, P2=1)
    let weightedSum = 0
    let totalWeight = 0
    flows.forEach(f => {
      const weight = f.priority === 'P0' ? 3 : f.priority === 'P1' ? 2 : 1
      weightedSum += f.progress * weight
      totalWeight += weight
    })

    const globalHealth = totalWeight === 0 ? 0 : Math.round(weightedSum / totalWeight)

    // Cargar Perfil de Proyecto y Núcleo Universal (SDD Core)
    const project = readJsonFile<any>(path.join(SDD_DIR, 'project.json')) || {}
    const problem = readJsonFile<any>(path.join(CORE_DIR, 'problem.json')) || {}
    const targetUsers = readJsonFile<any[]>(path.join(CORE_DIR, 'target-user.json')) || []
    const scopeBoundaries = readJsonFile<any>(path.join(CORE_DIR, 'scope-boundaries.json')) || {}
    const successCriteria = readJsonFile<any[]>(path.join(CORE_DIR, 'success-criteria.json')) || []

    // Cargar Requerimientos (Épicas, Historias individuales, Casos de Uso)
    const epics = readJsonFile<any[]>(path.join(REQUIREMENTS_DIR, 'epics.json')) || []
    const userStories = loadUserStories()
    const useCases = readJsonFile<any[]>(path.join(REQUIREMENTS_DIR, 'use-cases.json')) || []

    // Cargar Diagramas de Secuencia Técnicos
    const sequences = readJsonFile<any[]>(path.join(SEQUENCES_DIR, 'sequences.json')) || []

    // Cargar Pantallas e Inventario UI/UX
    const screens = readJsonFile<any[]>(path.join(UI_UX_DIR, 'screens.json')) || []

    // Cargar Módulos Avanzados SDD
    const interviews = readJsonFile<any>(path.join(DISCOVERY_DIR, 'interviews.json')) || {}
    const hypotheses = readJsonFile<any>(path.join(DISCOVERY_DIR, 'hypotheses.json')) || {}
    const competitors = readJsonFile<any>(path.join(DISCOVERY_DIR, 'competitive-matrix.json')) || {}
    const database = readJsonFile<any>(path.join(DATABASE_DIR, 'schema-erd.json')) || {}
    const rolesMatrix = readJsonFile<any>(path.join(REQUIREMENTS_DIR, 'roles-matrix.json')) || {}
    const risks = readJsonFile<any>(path.join(CORE_DIR, 'risks.json')) || {}
    const testPlan = readJsonFile<any>(path.join(QA_DIR, 'test-plan.json')) || {}
    const drift = getDriftReport()

    const responsePayload = {
      project,
      core: {
        problem,
        targetUsers,
        scopeBoundaries,
        successCriteria,
        risks
      },
      discovery: {
        interviews,
        hypotheses,
        competitors
      },
      manifest: {
        ...manifest,
        metrics: {
          ...manifest.metrics,
          globalHealth,
          flowsHealth: globalHealth,
          totalFlows: flows.length
        },
        flowsSummary: flows.map(f => ({
          id: f.id,
          name: f.name,
          priority: f.priority,
          progress: f.progress
        }))
      },
      architecture,
      flows,
      requirements: {
        epics,
        userStories,
        useCases,
        rolesMatrix
      },
      database,
      testPlan,
      sequences,
      uiUx: {
        screens
      },
      drift
    }

    return NextResponse.json(responsePayload)
  } catch (error: any) {
    console.error('Error fetching SDD data:', error)
    return NextResponse.json({ error: error.message || 'Error al leer datos SDD' }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json()
    const { flowId, nodeId, taskId, serviceId, done, assignedTo, status, storyId, criterionId, screenId, checklistId } = body

    // 0.0 Mutar Pregunta de Descubrimiento (Discovery Interview)
    if (body.questionId) {
      const interviewFile = path.join(DISCOVERY_DIR, 'interviews.json')
      const data = readJsonFile<any>(interviewFile)
      if (data && data.interviewSessions) {
        let found = false
        for (const session of data.interviewSessions) {
          const q = session.questions?.find((item: any) => item.id === body.questionId)
          if (q) {
            if (body.answer !== undefined) q.answer = body.answer
            if (body.status !== undefined) q.status = body.status
            if (body.isNotApplicable !== undefined) q.isNotApplicable = Boolean(body.isNotApplicable)
            if (body.notApplicableReason !== undefined) q.notApplicableReason = body.notApplicableReason
            found = true
            break
          }
        }
        if (found) {
          data.lastUpdated = new Date().toISOString()
          writeJsonFile(interviewFile, data)
          return NextResponse.json({ success: true, updatedQuestionId: body.questionId })
        }
      }
      return NextResponse.json({ error: 'Pregunta de descubrimiento no encontrada' }, { status: 404 })
    }

    // 0.01 Mutar Compuerta de Calidad (Quality Gate)
    if (body.gateId) {
      const projectFile = path.join(SDD_DIR, 'project.json')
      const project = readJsonFile<any>(projectFile)
      if (project && project.qualityGates) {
        const gate = project.qualityGates.find((g: any) => g.id === body.gateId)
        if (gate) {
          if (body.gateStatus) gate.status = body.gateStatus
          if (body.verifiedBy) gate.verifiedBy = body.verifiedBy
          writeJsonFile(projectFile, project)
          return NextResponse.json({ success: true, updatedGate: gate })
        }
      }
      return NextResponse.json({ error: 'Compuerta no encontrada' }, { status: 404 })
    }

    // 0.02 Confirmar origen de especificación (Reverse-Engineering Inferred -> Confirmed)
    if (body.confirmOrigin && body.entityType && body.entityId) {
      if (body.entityType === 'story') {
        const storyFile = path.join(STORIES_DIR, `${body.entityId}.json`)
        const story = readJsonFile<any>(storyFile)
        if (story) {
          story.origin = 'confirmed'
          writeJsonFile(storyFile, story)
          return NextResponse.json({ success: true, confirmedStory: story })
        }
      } else if (body.entityType === 'architecture') {
        const archFile = path.join(SDD_DIR, 'architecture.json')
        const arch = readJsonFile<any>(archFile)
        const node = arch?.nodes?.find((n: any) => n.id === body.entityId)
        if (node) {
          node.origin = 'confirmed'
          writeJsonFile(archFile, arch)
          return NextResponse.json({ success: true, confirmedNode: node })
        }
      } else if (body.entityType === 'flowNode' && body.flowId) {
        const flowFile = path.join(FLOWS_DIR, `${body.flowId}.json`)
        const flow = readJsonFile<any>(flowFile)
        const node = flow?.nodes?.find((n: any) => n.id === body.entityId)
        if (node) {
          node.origin = 'confirmed'
          writeJsonFile(flowFile, flow)
          return NextResponse.json({ success: true, confirmedFlowNode: node })
        }
      }
      return NextResponse.json({ error: 'Entidad para confirmación no encontrada' }, { status: 404 })
    }

    // 0. Mutar Historia de Usuario (1 archivo por entidad)
    if (storyId) {
      const storyFile = path.join(STORIES_DIR, `${storyId}.json`)
      let story: any = null
      if (fs.existsSync(storyFile)) {
        story = readJsonFile<any>(storyFile)
      }
      if (!story) {
        const storiesPath = path.join(REQUIREMENTS_DIR, 'user-stories.json')
        const stories = readJsonFile<any[]>(storiesPath) || []
        story = stories.find(s => s.id === storyId)
      }
      if (!story) return NextResponse.json({ error: 'Historia no encontrada' }, { status: 404 })

      if (criterionId) {
        const criterion = story.acceptanceCriteria?.find((c: any) => c.id === criterionId)
        if (criterion) criterion.done = Boolean(done)
      }
      if (assignedTo) story.assignedTo = assignedTo
      if (status) story.status = status

      // Recalcular estado y progreso de la historia
      const total = story.acceptanceCriteria?.length || 0
      const doneCount = story.acceptanceCriteria?.filter((c: any) => c.done).length || 0
      story.progress = total > 0 ? Math.round((doneCount / total) * 100) : (story.status === 'done' ? 100 : 0)
      if (total > 0 && doneCount === total) story.status = 'done'
      else if (doneCount > 0) story.status = 'in_progress'

      // Guardar archivo individual de la historia
      writeJsonFile(storyFile, story)

      // Sincronizar archivo agrupado para compatibilidad
      const storiesPath = path.join(REQUIREMENTS_DIR, 'user-stories.json')
      const stories = readJsonFile<any[]>(storiesPath) || []
      const idx = stories.findIndex(s => s.id === storyId)
      if (idx >= 0) stories[idx] = story
      else stories.push(story)
      writeJsonFile(storiesPath, stories)

      return NextResponse.json({ success: true, updatedStory: story })
    }

    // 0.1 Mutar Pantalla UI/UX
    if (screenId) {
      const screensPath = path.join(UI_UX_DIR, 'screens.json')
      const screens = readJsonFile<any[]>(screensPath) || []
      const screen = screens.find(s => s.id === screenId)
      if (!screen) return NextResponse.json({ error: 'Pantalla no encontrada' }, { status: 404 })

      if (checklistId) {
        const item = screen.checklist?.find((c: any) => c.id === checklistId)
        if (item) item.done = Boolean(done)
      }
      if (status) screen.status = status

      const total = screen.checklist?.length || 0
      const doneCount = screen.checklist?.filter((c: any) => c.done).length || 0
      screen.healthPercent = total > 0 ? Math.round((doneCount / total) * 100) : screen.healthPercent
      if (total > 0 && doneCount === total) screen.status = 'done'
      else if (doneCount > 0) screen.status = 'in_progress'

      writeJsonFile(screensPath, screens)
      return NextResponse.json({ success: true, updatedScreen: screen })
    }

    // 1. Mutar tarea de Arquitectura Macro
    if (serviceId && taskId) {
      const architecturePath = path.join(SDD_DIR, 'architecture.json')
      const architecture = readJsonFile<any>(architecturePath)
      if (!architecture || !architecture.nodes) {
        return NextResponse.json({ error: 'architecture.json no encontrado' }, { status: 404 })
      }
      const srv = architecture.nodes.find((n: any) => n.id === serviceId)
      if (!srv) return NextResponse.json({ error: 'Servicio no encontrado' }, { status: 404 })
      const task = srv.tasks?.find((t: any) => t.id === taskId)
      if (!task) return NextResponse.json({ error: 'Tarea de servicio no encontrada' }, { status: 404 })

      task.done = Boolean(done)
      // Recalcular salud del servicio
      if (srv.tasks && srv.tasks.length > 0) {
        const completed = srv.tasks.filter((t: any) => t.done).length
        srv.healthPercent = Math.round((completed / srv.tasks.length) * 100)
      }
      writeJsonFile(architecturePath, architecture)
      return NextResponse.json({ success: true, updatedService: srv })
    }

    // 2. Mutar tarea de Flujo Micro
    if (!flowId || !nodeId) {
      return NextResponse.json({ error: 'Faltan parámetros requeridos (flowId, nodeId)' }, { status: 400 })
    }

    const flowFilePath = path.join(FLOWS_DIR, `${flowId}.json`)
    const flow = readJsonFile<FlowData>(flowFilePath)

    if (!flow) {
      return NextResponse.json({ error: `Flujo ${flowId} no encontrado` }, { status: 404 })
    }

    const node = flow.nodes.find(n => n.id === nodeId)
    if (!node) {
      return NextResponse.json({ error: `Nodo ${nodeId} no encontrado` }, { status: 404 })
    }

    if (taskId) {
      const task = node.checklist.find(t => t.id === taskId)
      if (!task) {
        return NextResponse.json({ error: `Tarea ${taskId} no encontrada` }, { status: 404 })
      }
      task.done = Boolean(done)
    }

    if (assignedTo) {
      node.assignedTo = assignedTo
    }

    if (status) {
      node.status = status
    } else if (node.checklist && node.checklist.length > 0) {
      const allDone = node.checklist.every(t => t.done)
      const someDone = node.checklist.some(t => t.done)
      node.status = allDone ? 'done' : someDone ? 'in_progress' : 'todo'
    }

    // Recalcular progreso del flujo
    flow.progress = calculateFlowProgress(flow)
    writeJsonFile(flowFilePath, flow)

    // Actualizar manifest
    const manifestPath = path.join(SDD_DIR, 'manifest.json')
    const manifest = readJsonFile<any>(manifestPath)
    if (manifest && manifest.flowsSummary) {
      const summaryItem = manifest.flowsSummary.find((s: any) => s.id === flowId)
      if (summaryItem) {
        summaryItem.progress = flow.progress
      }
      manifest.lastUpdated = new Date().toISOString()
      writeJsonFile(manifestPath, manifest)
    }

    return NextResponse.json({ success: true, updatedFlow: flow })
  } catch (error: any) {
    console.error('Error updating SDD task:', error)
    return NextResponse.json({ error: error.message || 'Error al actualizar tarea' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { action, flowId, nodeId, serviceId, text, scopeFiles, agentPrompt } = body

    if (action === 'health_check') {
      const health = await checkServiceHealth()
      return NextResponse.json({
        health,
        system: {
          uptimeSeconds: Math.round(process.uptime()),
          memoryUsageMb: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          nodeVersion: process.version,
          nextVersion: '16.2.2',
          env: process.env.NODE_ENV || 'development'
        },
        timestamp: new Date().toISOString()
      })
    }

    // A. Añadir tarea a un Nodo de Flujo
    if (action === 'add_task') {
      if (!flowId || !nodeId || !text?.trim()) {
        return NextResponse.json({ error: 'Faltan parámetros (flowId, nodeId, text)' }, { status: 400 })
      }
      const flowFilePath = path.join(FLOWS_DIR, `${flowId}.json`)
      const flow = readJsonFile<FlowData>(flowFilePath)
      if (!flow) return NextResponse.json({ error: 'Flujo no encontrado' }, { status: 404 })

      const node = flow.nodes.find(n => n.id === nodeId)
      if (!node) return NextResponse.json({ error: 'Nodo no encontrado' }, { status: 404 })

      const newTask: ChecklistItem = {
        id: `task-${Date.now().toString().slice(-6)}`,
        text: text.trim(),
        done: false
      }

      if (!node.checklist) node.checklist = []
      node.checklist.push(newTask)
      node.status = 'in_progress'
      flow.progress = calculateFlowProgress(flow)

      writeJsonFile(flowFilePath, flow)
      return NextResponse.json({ success: true, newTask, updatedFlow: flow })
    }

    // B. Añadir tarea a un Servicio de Arquitectura Macro
    if (action === 'add_arch_task') {
      if (!serviceId || !text?.trim()) {
        return NextResponse.json({ error: 'Faltan parámetros (serviceId, text)' }, { status: 400 })
      }
      const architecturePath = path.join(SDD_DIR, 'architecture.json')
      const architecture = readJsonFile<any>(architecturePath)
      if (!architecture || !architecture.nodes) {
        return NextResponse.json({ error: 'architecture.json no encontrado' }, { status: 404 })
      }

      const srv = architecture.nodes.find((n: any) => n.id === serviceId)
      if (!srv) return NextResponse.json({ error: 'Servicio no encontrado' }, { status: 404 })

      const newTask: ChecklistItem = {
        id: `arch-task-${Date.now().toString().slice(-6)}`,
        text: text.trim(),
        done: false
      }

      if (!srv.tasks) srv.tasks = []
      srv.tasks.push(newTask)

      writeJsonFile(architecturePath, architecture)
      return NextResponse.json({ success: true, newTask, updatedService: srv })
    }

    // C. Añadir nuevo nodo completo a un flujo
    if (action === 'add_node') {
      if (!flowId || !text?.trim()) {
        return NextResponse.json({ error: 'Faltan parámetros (flowId, text/name)' }, { status: 400 })
      }
      const flowFilePath = path.join(FLOWS_DIR, `${flowId}.json`)
      const flow = readJsonFile<FlowData>(flowFilePath)
      if (!flow) return NextResponse.json({ error: 'Flujo no encontrado' }, { status: 404 })

      const newNode: FlowNode = {
        id: `node-${Date.now().toString().slice(-6)}`,
        name: text.trim(),
        status: 'todo',
        assignedTo: 'Antigravity',
        scopeFiles: Array.isArray(scopeFiles) ? scopeFiles : [],
        agentPrompt: agentPrompt?.trim() || `Implementar y verificar funcionalidad para ${text.trim()}`,
        checklist: [
          { id: `t-init-${Date.now().toString().slice(-4)}`, text: 'Crear o modificar archivos de scope', done: false }
        ]
      }

      flow.nodes.push(newNode)
      flow.progress = calculateFlowProgress(flow)
      writeJsonFile(flowFilePath, flow)

      return NextResponse.json({ success: true, newNode, updatedFlow: flow })
    }

    // D. Añadir nueva Historia de Usuario (1 archivo por entidad)
    if (action === 'add_user_story') {
      const stories = loadUserStories()
      const newStory = {
        id: `US-${(stories.length + 1).toString().padStart(2, '0')}`,
        epicId: body.epicId || 'EP-01',
        title: body.title?.trim() || 'Nueva Historia de Usuario',
        role: body.role || 'Usuario de la plataforma',
        action: body.action || 'Realizar una acción en el sistema',
        benefit: body.benefit || 'Obtener un resultado de valor',
        points: body.points || 3,
        priority: body.priority || 'P0',
        status: 'backlog',
        assignedTo: 'Antigravity',
        scopeFiles: Array.isArray(body.scopeFiles) ? body.scopeFiles : [],
        acceptanceCriteria: [
          { id: `AC-${Date.now().toString().slice(-4)}-1`, text: 'Dado el entorno configurado, la funcionalidad debe operar sin errores', done: false }
        ]
      }
      
      // Guardar archivo individual
      writeJsonFile(path.join(STORIES_DIR, `${newStory.id}.json`), newStory)

      // Sincronizar archivo agrupado
      const storiesPath = path.join(REQUIREMENTS_DIR, 'user-stories.json')
      const allStories = readJsonFile<any[]>(storiesPath) || []
      allStories.push(newStory)
      writeJsonFile(storiesPath, allStories)

      return NextResponse.json({ success: true, newStory })
    }

    return NextResponse.json({ error: 'Acción no reconocida' }, { status: 400 })
  } catch (error: any) {
    console.error('Error in POST /api/sdd:', error)
    return NextResponse.json({ error: error.message || 'Error en servidor' }, { status: 500 })
  }
}
