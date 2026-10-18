import fs from 'fs'
import path from 'path'

const WATCH_DIRS = [
  'C:\\Users\\Usuario\\Desktop\\proyect_01',
  'c:\\Users\\Usuario\\Desktop\\flashcheckout'
]

console.log('🤖 [SDD_AGENT_DAEMON] Observador agéntico iniciado en Antigravity.')
console.log('👀 Monitoreando proyectos:', WATCH_DIRS.join(', '))

const notifiedTasks = new Set()

function checkProject(dir) {
  const taskFile = path.join(dir, '.sdd', 'genesis_task.json')
  if (!fs.existsSync(taskFile)) return

  try {
    const raw = fs.readFileSync(taskFile, 'utf-8')
    const task = JSON.parse(raw)
    if (task && task.status === 'pending' && !notifiedTasks.has(task.taskId)) {
      notifiedTasks.add(task.taskId)
      console.log(`\n=======================================================`)
      console.log(`🔔 [SDD_GENESIS_TASK_ALERT] ¡NUEVA ORDEN EN DISCO!`)
      console.log(`📁 Directorio: ${dir}`)
      console.log(`🆔 Task ID: ${task.taskId}`)
      console.log(`💡 Idea del Usuario: "${task.prompt}"`)
      console.log(`⚡ Acción requerida: Antigravity Agent, procesa esta orden y genera la especificación SDD en disco.`)
      console.log(`=======================================================\n`)
    }
  } catch (err) {
    // ignore transient file write collisions
  }
}

// Check every 1200ms
setInterval(() => {
  for (const dir of WATCH_DIRS) {
    checkProject(dir)
  }
}, 1200)
