import fs from 'fs'
import path from 'path'

export function scanProject(projectRoot = process.cwd()) {
  const findings = {
    framework: 'unknown',
    language: 'unknown',
    database: 'none',
    backend: 'none',
    frontend: 'none',
    services: [],
    detectedRoutes: [],
    inferredArchitecture: {
      services: [],
      flows: []
    }
  }

  // 1. Detect language & manifests
  const pkgPath = path.join(projectRoot, 'package.json')
  const pyPath = path.join(projectRoot, 'requirements.txt')
  const pyprojectPath = path.join(projectRoot, 'pyproject.toml')
  const goPath = path.join(projectRoot, 'go.mod')
  const cargoPath = path.join(projectRoot, 'Cargo.toml')
  const composerPath = path.join(projectRoot, 'composer.json')
  const dockerComposePath = path.join(projectRoot, 'docker-compose.yml')

  if (fs.existsSync(pkgPath)) {
    findings.language = 'JavaScript / TypeScript'
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'))
      const allDeps = { ...pkg.dependencies, ...pkg.devDependencies }

      if (allDeps['next']) findings.framework = 'Next.js'
      else if (allDeps['vite']) findings.framework = 'Vite'
      else if (allDeps['nuxt']) findings.framework = 'Nuxt'
      else if (allDeps['@nestjs/core']) findings.framework = 'NestJS'
      else if (allDeps['express']) findings.framework = 'Express'
      else if (allDeps['fastify']) findings.framework = 'Fastify'
      else findings.framework = 'Node.js'

      if (allDeps['prisma'] || allDeps['@prisma/client']) findings.database = 'Prisma ORM'
      else if (allDeps['drizzle-orm']) findings.database = 'Drizzle ORM'
      else if (allDeps['typeorm']) findings.database = 'TypeORM'
      else if (allDeps['mongoose']) findings.database = 'MongoDB / Mongoose'
      else if (allDeps['pg']) findings.database = 'PostgreSQL'

      if (allDeps['react']) findings.frontend = 'React'
      else if (allDeps['vue']) findings.frontend = 'Vue'
      else if (allDeps['svelte']) findings.frontend = 'Svelte'

    } catch (e) {
      // fallback
    }
  } else if (fs.existsSync(pyPath) || fs.existsSync(pyprojectPath)) {
    findings.language = 'Python'
    findings.framework = 'Python Backend'
    // Detect Django/FastAPI/Flask
    const content = fs.existsSync(pyPath) ? fs.readFileSync(pyPath, 'utf-8') : ''
    if (content.includes('fastapi')) findings.framework = 'FastAPI'
    else if (content.includes('django')) findings.framework = 'Django'
    else if (content.includes('flask')) findings.framework = 'Flask'
  } else if (fs.existsSync(goPath)) {
    findings.language = 'Go'
    findings.framework = 'Go Application'
  } else if (fs.existsSync(cargoPath)) {
    findings.language = 'Rust'
    findings.framework = 'Rust Application'
  } else if (fs.existsSync(composerPath)) {
    findings.language = 'PHP'
    findings.framework = 'PHP / Laravel'
  }

  // 2. Detect Docker Compose services
  if (fs.existsSync(dockerComposePath)) {
    try {
      const composeContent = fs.readFileSync(dockerComposePath, 'utf-8')
      const serviceMatches = composeContent.match(/^\s{2}([a-zA-Z0-9_-]+):/gm)
      if (serviceMatches) {
        findings.services = serviceMatches.map(s => s.trim().replace(':', ''))
      }
    } catch {
      // fallback
    }
  }

  // 3. Scan routes
  const possibleRouteDirs = [
    path.join(projectRoot, 'app', 'api'),
    path.join(projectRoot, 'src', 'routes'),
    path.join(projectRoot, 'routes'),
    path.join(projectRoot, 'api')
  ]

  for (const rDir of possibleRouteDirs) {
    if (fs.existsSync(rDir)) {
      try {
        const listFiles = (dir, prefix = '') => {
          const entries = fs.readdirSync(dir, { withFileTypes: true })
          for (const entry of entries) {
            const fullPath = path.join(dir, entry.name)
            if (entry.isDirectory()) {
              listFiles(fullPath, `${prefix}/${entry.name}`)
            } else if (entry.name.startsWith('route.') || entry.name.endsWith('.js') || entry.name.endsWith('.ts')) {
              findings.detectedRoutes.push(prefix || `/${entry.name}`)
            }
          }
        }
        listFiles(rDir)
      } catch {
        // ignore
      }
    }
  }

  // 4. Synthesize inferred architecture
  findings.inferredArchitecture.services.push({
    id: 'core-app',
    label: `${findings.framework || 'Main'} Application`,
    type: 'Backend / Fullstack',
    status: 'online',
    tech: `${findings.language} (${findings.framework})`,
    healthPercent: 100,
    description: `Servicio principal detectado automáticamente en ${projectRoot}`,
    submodules: findings.detectedRoutes.slice(0, 10)
  })

  if (findings.database !== 'none') {
    findings.inferredArchitecture.services.push({
      id: 'db-service',
      label: `Base de Datos (${findings.database})`,
      type: 'Database',
      status: 'online',
      tech: findings.database,
      healthPercent: 100,
      description: 'Persistencia de datos detectada'
    })
  }

  findings.services.forEach(svc => {
    if (svc !== 'web' && svc !== 'app') {
      findings.inferredArchitecture.services.push({
        id: `docker-${svc}`,
        label: `Contenedor ${svc}`,
        type: 'Infrastructure',
        status: 'online',
        tech: 'Docker Service',
        healthPercent: 100,
        description: `Servicio orquestado en docker-compose: ${svc}`
      })
    }
  })

  return findings
}
