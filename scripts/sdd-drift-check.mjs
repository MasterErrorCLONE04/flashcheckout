import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

const SDD_DIR = path.resolve(process.cwd(), '.sdd')
const FLOWS_DIR = path.join(SDD_DIR, 'flows')
const STORIES_DIR = path.join(SDD_DIR, 'requirements', 'stories')

function getDeclaredScopeFiles() {
  const declared = new Set()

  // Read all flows
  if (fs.existsSync(FLOWS_DIR)) {
    const flowFiles = fs.readdirSync(FLOWS_DIR).filter(f => f.endsWith('.json'))
    for (const f of flowFiles) {
      try {
        const flow = JSON.parse(fs.readFileSync(path.join(FLOWS_DIR, f), 'utf-8'))
        flow.nodes?.forEach(n => {
          n.scopeFiles?.forEach(file => declared.add(file.replace(/\\/g, '/')))
        })
      } catch (e) {}
    }
  }

  // Read all stories
  if (fs.existsSync(STORIES_DIR)) {
    const storyFiles = fs.readdirSync(STORIES_DIR).filter(f => f.endsWith('.json'))
    for (const f of storyFiles) {
      try {
        const story = JSON.parse(fs.readFileSync(path.join(STORIES_DIR, f), 'utf-8'))
        story.scopeFiles?.forEach(file => declared.add(file.replace(/\\/g, '/')))
      } catch (e) {}
    }
  }

  return declared
}

function getGitModifiedFiles() {
  try {
    const output = execSync('git status --porcelain', { encoding: 'utf-8' })
    const lines = output.split('\n').filter(Boolean)
    const modified = []
    for (const line of lines) {
      const match = line.trim().match(/^([MADRCU?]+)\s+(.+)$/)
      if (match) {
        let filePath = match[2].trim().replace(/\\/g, '/')
        if (filePath.startsWith('"') && filePath.endsWith('"')) {
          filePath = filePath.slice(1, -1)
        }
        modified.push(filePath)
      }
    }
    return modified
  } catch (err) {
    return []
  }
}

export function performDriftCheck() {
  const declared = getDeclaredScopeFiles()
  const modified = getGitModifiedFiles()

  const inScope = []
  const outOfScope = []

  for (const file of modified) {
    // Ignore internal .sdd/ tracking changes and git artifacts
    if (file.startsWith('.sdd/') || file.startsWith('.git') || file === 'AGENTS.md') {
      continue
    }

    // Check if file or its prefix is in declared scope
    const isDeclared = Array.from(declared).some(d => file.startsWith(d) || d.startsWith(file))
    if (isDeclared) {
      inScope.push(file)
    } else {
      outOfScope.push(file)
    }
  }

  const driftScore = modified.length === 0 ? 100 : Math.round((inScope.length / (inScope.length + outOfScope.length)) * 100)

  return {
    timestamp: new Date().toISOString(),
    driftScore,
    isClean: outOfScope.length === 0,
    totalModified: modified.length,
    inScope,
    outOfScope,
    declaredScopeCount: declared.size
  }
}

// If executed directly from CLI
if (process.argv[1] && process.argv[1].endsWith('sdd-drift-check.mjs')) {
  const result = performDriftCheck()
  console.log('\n========================================')
  console.log('   🔍 SDD DRIFT DETECTION REPORT')
  console.log('========================================')
  console.log(`Estado: ${result.isClean ? '✅ SIN DERIVA (100% Alineado)' : '⚠️ DERIVA DETECTADA'}`)
  console.log(`Puntuación de Alineación: ${result.driftScore}%`)
  console.log(`Archivos en Alcance: ${result.inScope.length}`)
  console.log(`Archivos Fuera de Alcance: ${result.outOfScope.length}`)
  if (result.outOfScope.length > 0) {
    console.log('\n⚠️ Archivos modificados sin nodo o historia asignada:')
    result.outOfScope.forEach(f => console.log(`  - ❌ ${f}`))
  }
  console.log('========================================\n')
}
