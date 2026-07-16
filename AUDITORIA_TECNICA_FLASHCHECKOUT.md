# Auditoría técnica de FlashCheckout

Fecha: 2026-07-16

## Resumen ejecutivo

FlashCheckout ya no se comporta como un prototipo. El repo contiene un SaaS operativo con checkout público, dashboard privado, bot de WhatsApp, pagos, CRM, logística, automatizaciones y verificación manual. La base funcional es real y extensa.

La principal conclusión técnica es esta: el producto está cerca de ser operable en producción, pero todavía no está suficientemente endurecido para escalar sin seguir invirtiendo en tipado, pruebas, seguridad de integraciones y observabilidad.

## Estado general

- La arquitectura base es coherente y está bien alineada con el dominio comercial.
- El schema de Prisma cubre bien las entidades del negocio.
- El dashboard y el checkout ya tienen mucha funcionalidad real.
- La deuda técnica sigue siendo alta en componentes grandes, flujos de bot y helpers de IA.

## Hallazgos P0

### P0.1 Webhooks y cron jobs siguen siendo superficies críticas

Los puntos más sensibles del sistema son los webhooks de WhatsApp, Mercado Pago y Stripe, junto con el cron de limpieza.

Archivos a priorizar:

- [app/api/whatsapp/webhook/route.ts](/C:/Users/david/flashcheckout/app/api/whatsapp/webhook/route.ts)
- [app/api/webhook/mp/route.ts](/C:/Users/david/flashcheckout/app/api/webhook/mp/route.ts)
- [app/api/webhook/stripe/route.ts](/C:/Users/david/flashcheckout/app/api/webhook/stripe/route.ts)
- [app/api/cron/cleanup-storage/route.ts](/C:/Users/david/flashcheckout/app/api/cron/cleanup-storage/route.ts)
- [app/api/debug/products/route.ts](/C:/Users/david/flashcheckout/app/api/debug/products/route.ts)

Riesgo:

- fallos silenciosos;
- duplicados;
- exposición accidental de datos;
- comportamiento distinto entre entornos;
- dependencia excesiva de secretos y URLs estables.

### P0.2 Separación de almacenamiento sensible y público

El repo ya apunta a buckets separados, pero el riesgo sigue siendo alto si se mezclan imágenes públicas y comprobantes privados.

Archivos a priorizar:

- [lib/supabase.ts](/C:/Users/david/flashcheckout/lib/supabase.ts)
- [app/api/upload/route.ts](/C:/Users/david/flashcheckout/app/api/upload/route.ts)
- [app/api/orders/[id]/report/route.ts](/C:/Users/david/flashcheckout/app/api/orders/[id]/report/route.ts)
- [app/api/cron/cleanup-storage/route.ts](/C:/Users/david/flashcheckout/app/api/cron/cleanup-storage/route.ts)

Riesgo:

- URLs públicas de comprobantes;
- mezcla de activos de catálogo con documentos sensibles;
- problemas de privacidad y cumplimiento.

### P0.3 Complejidad del bot y de los helpers de IA

La lógica conversacional sigue siendo una zona de alta complejidad. Hay mucho flujo, muchos estados y bastante contrato implícito.

Archivos a priorizar:

- [lib/bot/chatbot-logic.ts](/C:/Users/david/flashcheckout/lib/bot/chatbot-logic.ts)
- [lib/bot/intent-engine.ts](/C:/Users/david/flashcheckout/lib/bot/intent-engine.ts)
- [lib/bot/search-service.ts](/C:/Users/david/flashcheckout/lib/bot/search-service.ts)
- [lib/ai/nova-tools.ts](/C:/Users/david/flashcheckout/lib/ai/nova-tools.ts)
- [app/api/agent/nova/route.ts](/C:/Users/david/flashcheckout/app/api/agent/nova/route.ts)

Riesgo:

- regresiones en estados de conversación;
- salidas inconsistentes;
- payloads mal formados;
- crecimiento difícil de mantener.

## Hallazgos P1

### P1.1 Sigue habiendo deuda de tipos relevante

El repo todavía muestra una base importante de `any` y `as any`. En el scan más reciente aparecieron 222 coincidencias.

Archivos con más superficie pendiente:

- [components/TiendaClient.tsx](/C:/Users/david/flashcheckout/components/TiendaClient.tsx)
- [components/StoreSettingsManager.tsx](/C:/Users/david/flashcheckout/components/StoreSettingsManager.tsx)
- [components/TheOfficeClient.tsx](/C:/Users/david/flashcheckout/components/TheOfficeClient.tsx)
- [components/ProductManager.tsx](/C:/Users/david/flashcheckout/components/ProductManager.tsx)
- [components/CheckoutForm.tsx](/C:/Users/david/flashcheckout/components/CheckoutForm.tsx)
- [components/AgentSettingsManager.tsx](/C:/Users/david/flashcheckout/components/AgentSettingsManager.tsx)
- [components/LandingContent.tsx](/C:/Users/david/flashcheckout/components/LandingContent.tsx)
- [components/LogisticsManager.tsx](/C:/Users/david/flashcheckout/components/LogisticsManager.tsx)
- [components/dashboard/DashboardClientContainer.tsx](/C:/Users/david/flashcheckout/components/dashboard/DashboardClientContainer.tsx)
- [components/dashboard/StoreSwitcher.tsx](/C:/Users/david/flashcheckout/components/dashboard/StoreSwitcher.tsx)
- [app/tienda/[slug]/page.tsx](/C:/Users/david/flashcheckout/app/tienda/[slug]/page.tsx)
- [app/explorar/page.tsx](/C:/Users/david/flashcheckout/app/explorar/page.tsx)
- [app/solutions/[slug]/page.tsx](/C:/Users/david/flashcheckout/app/solutions/[slug]/page.tsx)

Impacto:

- refactors más riesgosos;
- mayor probabilidad de errores de runtime;
- autocompletado pobre;
- más trabajo manual para mantener consistencia.

### P1.2 Documentación desalineada con el código real

Hay varios documentos que describen una foto más antigua o más optimista del proyecto.

Archivos a revisar:

- [README.md](/C:/Users/david/flashcheckout/README.md)
- [FLASHCHECKOUT_STATUS_REPORT.md](/C:/Users/david/flashcheckout/FLASHCHECKOUT_STATUS_REPORT.md)
- [INFORME_PROYECTO_FLASHCHECKOUT.md](/C:/Users/david/flashcheckout/INFORME_PROYECTO_FLASHCHECKOUT.md)
- [PLAN_MEJORAS_FLASHCHECKOUT.md](/C:/Users/david/flashcheckout/PLAN_MEJORAS_FLASHCHECKOUT.md)

Impacto:

- onboarding confuso;
- prioridades desactualizadas;
- dificultad para coordinar nuevas fases del trabajo.

### P1.3 El build script depende de shell específico

El script de build en `package.json` usa sustitución de shell y `sed`, lo que no es portable entre entornos.

Archivo:

- [package.json](/C:/Users/david/flashcheckout/package.json)

Impacto:

- builds frágiles fuera de shell POSIX;
- riesgo de diferencias entre CI y desarrollo local;
- menor previsibilidad operativa.

### P1.4 Varias pantallas grandes siguen cargando demasiada lógica

Aunque hubo una limpieza importante, todavía hay componentes grandes que combinan estado, reglas de negocio, presentación y serialización.

Archivos a revisar:

- [components/TiendaClient.tsx](/C:/Users/david/flashcheckout/components/TiendaClient.tsx)
- [components/WhatsAppCatalog.tsx](/C:/Users/david/flashcheckout/components/WhatsAppCatalog.tsx)
- [components/TheOfficeClient.tsx](/C:/Users/david/flashcheckout/components/TheOfficeClient.tsx)
- [components/StoreSettingsManager.tsx](/C:/Users/david/flashcheckout/components/StoreSettingsManager.tsx)
- [components/dashboard/DashboardClientContainer.tsx](/C:/Users/david/flashcheckout/components/dashboard/DashboardClientContainer.tsx)

Impacto:

- mayor coste de mantenimiento;
- más riesgo de regresión visual y funcional;
- difícil testear con confianza.

## Hallazgos P2

### P2.1 Falta observabilidad operativa formal

El sistema necesita mejores señales de depuración: trazas, logs estructurados y correlación por `orderId` y `sessionId`.

### P2.2 Falta una suite mínima de pruebas

No se observa una batería formal de tests para checkout, pedidos, webhooks y bot.

### P2.3 Faltan límites más claros por rol

El acceso está bastante orientado a “usuario autenticado” y todavía puede crecer hacia roles reales de operación.

## Fortalezas del proyecto

- El dominio de negocio está bien cubierto.
- El schema de datos está alineado con el producto.
- El checkout y el dashboard ya resuelven el flujo principal.
- WhatsApp, pagos y CRM están conectados de forma útil.
- El proyecto ya tiene base real para convertirse en un producto escalable.

## Recomendación de orden

### Siguiente bloque recomendado

1. Cerrar tipado y contratos en [components/TiendaClient.tsx](/C:/Users/david/flashcheckout/components/TiendaClient.tsx).
2. Revisar [components/StoreSettingsManager.tsx](/C:/Users/david/flashcheckout/components/StoreSettingsManager.tsx) y [components/TheOfficeClient.tsx](/C:/Users/david/flashcheckout/components/TheOfficeClient.tsx).
3. Atacar [lib/ai/nova-tools.ts](/C:/Users/david/flashcheckout/lib/ai/nova-tools.ts) y [lib/bot/chatbot-logic.ts](/C:/Users/david/flashcheckout/lib/bot/chatbot-logic.ts).
4. Añadir pruebas mínimas para checkout y webhooks.
5. Actualizar documentación para que refleje el estado real del repo.

## Conclusión

FlashCheckout está en una etapa avanzada y valiosa, pero todavía requiere una segunda ola de endurecimiento técnico. El producto ya funciona; lo que falta ahora es reducir fragilidad, mejorar trazabilidad y terminar de formalizar tipos, pruebas y documentación.
