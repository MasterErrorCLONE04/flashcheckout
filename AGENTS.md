<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:sdd-protocol-rules -->
# Protocolo SDD (Spec-Driven Development) — "Single Source of Truth"

El desarrollo, las especificaciones y las tareas del proyecto se gestionan formalmente en `.sdd/`. Cualquier agente de IA (Antigravity, Claude, Cursor, etc.) DEBE acatar estrictamente las siguientes reglas:

0. **Compuertas de Calidad & Non-Goals:**
   - Consulta `.sdd/project.json` para entender el propósito (`comercial`, `interno`, `personal`) y profundidad (`serio`, `escala`).
   - Lee `.sdd/core/scope-boundaries.json`: NUNCA programes features listadas en `explicitNonGoals` (ej: Meta Flows v2, The Office, apps nativas, multi-warehouse en V1).

1. **Lectura Previa Obligatoria:**
   - Antes de escribir código, consulta la Historia en `.sdd/requirements/stories/<US-ID>.json` o el nodo de flujo en `.sdd/flows/<flujo>.json`.
   - Identifica el objetivo técnico y la lista blanca de archivos `scopeFiles`.

2. **Aislamiento de Alcance (Scope Protection):**
   - NO modifiques archivos que no estén listados en `scopeFiles` del nodo o historia activa. Está prohibido alterar código fuera de alcance.

3. **Criterios de Aceptación Gherkin (Dado-Cuando-Entonces):**
   - Cada Historia de Usuario define criterios de aceptación específicos.
   - Verifica cada uno contra el código real y cambia `"done": false` a `"done": true` en `.sdd/requirements/stories/<US-ID>.json`.

4. **Actualización Atómica del Estado (1 Archivo por Entidad):**
   - Trabaja sobre el archivo individual de la entidad para evitar conflictos de merge en Git.
   - Cuando todas las tareas estén completadas, actualiza `"status": "done"` y firma en `"assignedTo": "Antigravity"`.
<!-- END:sdd-protocol-rules -->

