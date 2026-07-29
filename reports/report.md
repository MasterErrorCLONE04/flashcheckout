# Repository Analysis Report: Node.js
Generated at: 2026-07-29 22:22:07

## Project Detection Tags
`Node.js`, `TypeScript`, `Prisma ORM`, `Next.js`, `Docker`

## AI Agent Readiness Diagnosis
### **Ready Score: 82/100 (Aceptable)**
> El repositorio es apto, pero los archivos grandes o dependencias complejas pueden degradar el contexto de la IA.

| Evaluation Category | Diagnostics Check | Details |
| --- | --- | --- |
| **Context Window Compatibility** | ⚠ | ⚠ Moderado (Requiere 1M) |
| **Architecture & File Sizes** | ✔ | ✔ Limpia (Archivos modulares y enfocados) |
| **Dependency Coupling & Loops** | ⚠ | ⚠ Riesgo (1 ciclos circulares detectados) |
| **Documentation & Guidelines** | ✔ | ✔ Completa (README y guías auxiliares) |

## Estructura y Complejidad por Lenguaje
### Lenguaje: TypeScript
| Métrica | Conteo Total |
| --- | --- |
| **Components** | 252 |
| **Hooks** | 687 |
| **Functions** | 463 |
| **Classes** | 8 |
| **Interfaces** | 46 |
| **Enums** | 0 |
| **Imports** | 827 |
| **Exports** | 448 |

### Lenguaje: JavaScript
| Métrica | Conteo Total |
| --- | --- |
| **Components** | 0 |
| **Hooks** | 0 |
| **Functions** | 30 |
| **Classes** | 0 |
| **Interfaces** | 0 |
| **Enums** | 0 |
| **Imports** | 70 |
| **Exports** | 0 |

### Lenguaje: Python
| Métrica | Conteo Total |
| --- | --- |
| **Classes** | 5 |
| **Functions** | 59 |
| **Decorators** | 0 |
| **Imports** | 77 |
| **Modules** | 25 |

## Estructura y Componentes de Frameworks
### Framework: Next.js
| Componente / Ruta | Conteo Total |
| --- | --- |
| **Rutas de Página** | 64 |
| **Rutas de API** | 48 |
| **Server Components** | 6 |

### ⚠️ Circular Dependency Cycles Detected
- **Ciclo 1**: lib/whatsapp/cloud-api.ts ➔ lib/whatsapp/send-invoice.ts ➔ lib/whatsapp/cloud-api.ts

## General Codebase Statistics
| Metric | Count | Details |
| --- | --- | --- |
| **Files** | 515 | Relevant text files analyzed |
| **Lines** | 85.065 | Total lines of code/text |
| **Characters** | 3.333.193 | Total text size |
| **Tokens (o200k)** | 841.448 | Input tokens weight |
| **Cache Hits** | 515 | Skipped due to SQLite cache |

## Category Breakdown
| Category | Files | Tokens | Share | Est. Cost |
| --- | --- | --- | --- | --- |
| Código | 312 | 610.090 | 72.5% | USD 3.05 |
| Documentación | 187 | 225.457 | 26.8% | USD 1.13 |
| Configuración | 9 | 4.814 | 0.6% | USD 0.02 |
| Infraestructura | 3 | 936 | 0.1% | USD 0.00 |
| Otros | 4 | 151 | 0.0% | USD 0.00 |

## Scenarios for AI Agents (GPT-5.6 Sol)
| Scenario | Input Context | Output Generated | Cost (USD) | Description |
| --- | --- | --- | --- | --- |
| **Agente Explorador** | 841.448.00 (100%) | 84.144.80 (10%) | USD 6.73 | Basic scanning / code reviews |
| **Agente Desarrollador** | 1.682.896.00 (200%) | 420.724.00 (50%) | USD 21.04 | Standard feature builds |
| **Agente Autónomo** | 4.207.240.00 (500%) | 841.448.00 (100%) | USD 46.28 | Iterative loops and rewrites |

## Dependency Impact Analysis (Top 10 Files)
| File Path | Language | Recursive Dependents (Impact Score) |
| --- | --- | --- |
| `lib/prisma.ts` | TypeScript | **110 archivos** |
| `lib/utils.ts` | TypeScript | **106 archivos** |
| `components/ui/avatar.tsx` | TypeScript | **35 archivos** |
| `components/dashboard/CustomUserMenu.tsx` | TypeScript | **34 archivos** |
| `components/StoreCreationWizard.tsx` | TypeScript | **33 archivos** |
| `lib/store-context.ts` | TypeScript | **20 archivos** |
| `lib/whatsapp/evolution.ts` | TypeScript | **20 archivos** |
| `lib/api/route-utils.ts` | TypeScript | **19 archivos** |
| `components/ui/button.tsx` | TypeScript | **17 archivos** |
| `lib/whatsapp/cloud-api.ts` | TypeScript | **14 archivos** |

## Historical Snapshot Timeline
| Date | Total Files | Lines of Code | Total Tokens | Estimated Cost (USD) |
| --- | --- | --- | --- | --- |
| 2026-07-29 | 515 | 85.065 | 841.448 | USD 4.21 |
