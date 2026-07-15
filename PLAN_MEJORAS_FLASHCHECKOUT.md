# Plan de mejoras para FlashCheckout

Fecha: 2026-07-14

## Objetivo

Subir el proyecto de una base funcional amplia a una plataforma más mantenible, confiable y lista para escalar sin que la complejidad actual se convierta en fricción operativa.

## Criterios de prioridad

- **P0**: bloquea estabilidad, seguridad o producción.
- **P1**: mejora fuerte de calidad, soporte o mantenibilidad.
- **P2**: optimización, orden o crecimiento posterior.

## P1 Cerrado Hasta Ahora

- [x] Extraer lógica de negocio fuera de rutas de soporte críticas
  - Hecho en `app/api/automation/route.ts`, `app/api/agent/office/route.ts`, `app/api/agent/nova/route.ts` y rutas de soporte de WhatsApp / panel.
- [x] Crear capa compartida de validación
  - Hecho con `lib/api/route-utils.ts` y `lib/whatsapp/session-state.ts`.
- [x] Normalizar contratos de mensajes del bot
  - Hecho en sesiones WhatsApp, envío de mensajes y link de pago.
- [x] Unificar manejo de errores
  - Hecho en rutas de agente, soporte y flujos de checkout / WhatsApp.
- [x] Reducir `any` en APIs de soporte
  - Hecho en `products`, `drivers`, `customers`, `automation`, `whatsapp`, `agent`.
- [x] Cerrar `app/api/agent/*`
  - Revisado y refactorizado `app/api/agent/nova/route.ts`, `app/api/agent/office/route.ts`, `app/api/agent/office/custom/route.ts` y `app/api/agent/office/layout/route.ts`.
- [x] Completar el resto de rutas internas fuera de `app/api/agent/*`
  - Tipado y normalización aplicada en rutas internas de WhatsApp, Stripe, pedidos, stores y cobros.
- [x] Limpieza final de tipos en dashboards y componentes
  - Tipado aplicado en gráficas, layout del dashboard, páginas de clientes, pagos, analítica, conversaciones, envíos, suscripción y descuentos.

## P1 Pendiente

- [ ] Añadir pruebas mínimas de rutas y servicios.
- [ ] Documentar el estado real del producto.
- [ ] Revisar experiencia mobile-first del checkout.

## Fase 1. Estabilidad y seguridad

### 1. Reducir el uso de `any` en rutas críticas

- **Prioridad:** P0
- **Áreas:** `lib/bot/*`, `app/api/*`, `components/*` más usados
- **Problema:** hay mucho casteo manual y estructuras no tipadas en bot, webhooks, pedidos, pagos y dashboard.
- **Acción:** crear tipos compartidos para `Store`, `Order`, `WhatsAppSession`, `Message`, `CartItem`, `Automation`, `Coupon` y respuestas de API.
- **Resultado esperado:** menos regresiones, mejor autocompletado, validación más fuerte y refactors más seguros.

### 2. Separar datos públicos, sensibles y temporales en Storage

- **Prioridad:** P0
- **Áreas:** comprobantes de pago, imágenes de productos, archivos de soporte
- **Problema:** hoy el almacenamiento puede mezclar contenido público con información sensible.
- **Acción:** crear buckets o políticas separadas para:
  - imágenes públicas de catálogo,
  - comprobantes privados,
  - archivos temporales.
- **Resultado esperado:** menor riesgo de exposición accidental de datos.

### 3. Blindar webhooks y cron jobs

- **Prioridad:** P0
- **Áreas:** WhatsApp webhook, Mercado Pago webhook, Stripe webhook, cron cleanup
- **Problema:** estas rutas son la columna vertebral del sistema y dependen de secretos, URLs estables y validación de firma.
- **Acción:** revisar:
  - validación estricta de firma,
  - secretos por entorno,
  - respuestas idempotentes,
  - logs estructurados,
  - reintentos controlados.
- **Resultado esperado:** menos fallos silenciosos y menor riesgo de duplicados.

### 4. Eliminar rutas de debug o protegerlas

- **Prioridad:** P0
- **Áreas:** endpoints de inspección y pruebas
- **Problema:** existen rutas y scripts de inspección que pueden exponer información si se despliegan sin control.
- **Acción:** moverlas a entorno local, protegerlas por auth o deshabilitarlas en producción.
- **Resultado esperado:** superficie de ataque reducida.

## Fase 2. Mantenibilidad

### 5. Extraer lógica de negocio fuera de rutas gigantes

- **Prioridad:** P1
- **Áreas:** `app/api/whatsapp/webhook/route.ts`, `lib/bot/chatbot-logic.ts`, `app/api/agent/*`
- **Problema:** hay archivos que mezclan parsing, reglas, persistencia, notificación y respuesta.
- **Acción:** dividir en servicios:
  - `services/orders`
  - `services/whatsapp`
  - `services/payments`
  - `services/automation`
  - `services/ai`
- **Resultado esperado:** código más fácil de leer, probar y extender.

### 6. Crear capa compartida de validación

- **Prioridad:** P1
- **Áreas:** APIs, forms, webhook payloads
- **Problema:** la validación se hace de forma manual en múltiples lugares.
- **Acción:** usar un esquema común de validación para entradas y salidas.
- **Resultado esperado:** menos inconsistencias entre frontend y backend.

### 7. Normalizar contratos de mensajes del bot

- **Prioridad:** P1
- **Áreas:** WhatsApp sessions, chat history, AI assistant
- **Problema:** el sistema guarda mensajes en formatos distintos según el flujo.
- **Acción:** definir un modelo común para mensajes entrantes, salientes, notas internas y mensajes del asesor.
- **Resultado esperado:** historial unificado y más fácil de renderizar.

### 8. Unificar manejo de errores

- **Prioridad:** P1
- **Áreas:** todas las rutas API
- **Problema:** cada archivo responde distinto ante fallos.
- **Acción:** crear un helper estándar para:
  - errores de negocio,
  - errores de validación,
  - errores inesperados.
- **Resultado esperado:** API más consistente y depurable.

## Fase 3. Calidad del producto

### 9. Añadir pruebas mínimas de rutas y servicios

- **Prioridad:** P1
- **Áreas:** checkout, órdenes, pagos, webhook, bot
- **Problema:** no se observó una suite formal de tests en el repositorio.
- **Acción:** empezar con pruebas de:
  - creación de pedido,
  - cálculo de totales,
  - validación de stock,
  - sincronización de mensajes,
  - asignación de driver,
  - webhooks principales.
- **Resultado esperado:** menos regresiones en flujos críticos.

### 10. Documentar el estado real del producto

- **Prioridad:** P1
- **Áreas:** README, status report, setup, despliegue
- **Problema:** la documentación visible no coincide totalmente con el estado actual del código.
- **Acción:** actualizar:
  - stack de versiones,
  - estructura real,
  - variables de entorno,
  - rutas públicas/privadas,
  - dependencias externas.
- **Resultado esperado:** onboarding más rápido y menos confusión operativa.

### 11. Revisar experiencia mobile-first del checkout

- **Prioridad:** P1
- **Áreas:** `app/tienda/[slug]`, `components/CheckoutForm.tsx`
- **Problema:** el checkout es el punto de conversión principal y debe ser extremadamente simple.
- **Acción:** optimizar:
  - tamaño de botones,
  - jerarquía visual,
  - feedback de carga,
  - accesibilidad táctil,
  - reducción de distracciones.
- **Resultado esperado:** mejor conversión.

## Fase 4. Escalabilidad

### 12. Crear observabilidad operativa

- **Prioridad:** P2
- **Áreas:** webhooks, pagos, checkout, IA
- **Problema:** a medida que suba el tráfico, será difícil depurar sin métricas claras.
- **Acción:** agregar:
  - logs estructurados,
  - trazas por `orderId` y `sessionId`,
  - alertas para fallos de webhook,
  - métricas de éxito/fallo por proveedor.
- **Resultado esperado:** soporte más rápido y menos tiempo perdido.

### 13. Separar integración de proveedores externos por adaptadores

- **Prioridad:** P2
- **Áreas:** Stripe, Mercado Pago, WhatsApp, Supabase
- **Problema:** si cambia un SDK, puede impactar demasiado el core.
- **Acción:** encapsular cada proveedor en una interfaz común.
- **Resultado esperado:** menor acoplamiento y migraciones más simples.

### 14. Construir una estrategia de permisos por rol

- **Prioridad:** P2
- **Áreas:** dashboard, CRM, pagos, logística
- **Problema:** hoy el acceso parece centrarse más en “usuario autenticado” que en permisos granulares.
- **Acción:** definir roles como:
  - owner,
  - manager,
  - support,
  - logistics.
- **Resultado esperado:** mejor control interno en equipos más grandes.

## Orden recomendado de ejecución

### Semana 1

1. Tipos compartidos en rutas críticas.
2. Separación y protección de Storage.
3. Blindaje de webhooks y cron jobs.
4. Protección de rutas de debug.

### Semana 2

1. Extraer lógica de negocio a servicios.
2. Unificar validación y manejo de errores.
3. Normalizar contratos de mensajes.

### Semana 3

1. Añadir pruebas mínimas.
2. Actualizar documentación real.
3. Pulir checkout mobile-first.

### Semana 4

1. Logs estructurados y trazabilidad.
2. Adaptadores por proveedor.
3. Sistema de roles.

## Indicadores de éxito

- Menos `any` en el código base.
- Menos errores en webhooks y pagos.
- Documentación alineada con el repo actual.
- Pruebas cubriendo flujos de dinero y mensajería.
- Checkout más estable y simple en móvil.

## Siguiente paso recomendado

Si quieres, puedo convertir este plan en una de estas dos versiones:

1. un roadmap por semanas con tareas concretas tipo checklist;
2. una lista de tareas técnicas ordenadas por archivo y prioridad.
