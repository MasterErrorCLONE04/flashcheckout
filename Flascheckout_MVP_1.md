🚀 FlashCheckout V1 (MVP)

Objetivo
Permitir que cualquier negocio venda automáticamente por WhatsApp y una tienda web utilizando un empleado digital impulsado por IA, desde el primer contacto hasta la creación del pedido.

==================================================
🏗️ ARQUITECTURA DE FLASHCHECKOUT (CONGELADA)
==================================================

El sistema se estructura formalmente sobre capas desacopladas, donde los agentes y las APIs de consumo externo actúan en paralelo como interfaces de entrada al sistema, canalizando las acciones a través de la capa de aplicación y del dominio.

```text
Presentation
        │
 ┌──────┴────────┐
 │               │
API          Agent Layer (Nova, Nexus, Pulse)
 │               │
 └──────┬────────┘
        ▼
Command Bus / Query Bus
        │
        ▼
Application Layer
├── Commands
├── Queries
├── DTOs
├── Handlers
├── Mappers
└── Services
        │
        ▼
Domain (Bounded Contexts)
├── catalog/
├── orders/
├── payments/
├── crm/
├── store/
├── automation/
└── analytics/
        │
        ▼
Integration Hub (Anti-Corruption Layer)
├── Payment Connectors
├── Messaging Connectors
├── AI Connectors
├── Commerce Connectors
└── Notification Connectors
        │
        ▼
Infrastructure
├── database/ & Repositories (Prisma adapters)
├── cache/ (Redis implementation)
├── storage/ (Cloudflare R2, S3, Supabase Storage)
├── logger/
└── scheduler/ (BullMQ/Agenda)

──────────────

Core (Transversal / Interfaces)
├── Event Bus Backbone
├── Command/Query Bus (Behaviors)
├── Outbox Worker & Outbox Table
├── Notification Dispatcher
├── Clock
└── Interfaces (ICache, ILogger, JobScheduler)
```

---

## 📋 Reglas de Dependencia
El flujo de dependencia de la plataforma sigue estrictamente la siguiente jerarquía:

```text
Presentation
     │
┌────┴────┐
▼         ▼
API Layer  Agent Layer (Agents)
│         │
└────┬────┘
     ▼
Application Layer (Commands, Queries & Application Services)
     │
     ▼
Domain (Bounded Contexts)
     │
     ▼
Integration Hub (Anti-Corruption Layer)
     │
     ▼
Infrastructure
```

### Reglas estrictas de desarrollo:
1.  **Presentation nunca accede directamente a la base de datos o Prisma.**
2.  **Domain nunca llama directamente a Mercado Pago** (o proveedores externos).
3.  **Nova nunca calcula precios.**
4.  **Smart Pay nunca modifica inventario.**
5.  **Integration Hub nunca contiene reglas del negocio.**
6.  **FlashCheckout Core nunca contiene lógica funcional del negocio.**
7.  **Todo evento del sistema se publica a través del Event Bus.**
8.  **Toda llamada a un LLM pasa por el AI Gateway.**
9.  **Todos los servicios deben depender de interfaces (Ports) y nunca de implementaciones concretas.**
    *   *Ejemplo de Pagos:* El Checkout Engine depende de la interfaz `PaymentService` (la cual es implementada por Smart Pay Service que a su vez consume `MercadoPagoProvider` o `StripeProvider`).
    *   *Ejemplo de IA:* Nova depende de `LLMProvider` a través del AI Gateway, el cual puede mapearse a `DeepSeek`, `Gemini` o `Qwen` en el Integration Hub sin alterar la lógica de negocio.
10. **Los eventos del sistema representan hechos pasados y nunca retornan información ni deben usarse como RPC (Remote Procedure Call).**
11. **Los consumidores de eventos del sistema deben ser idempotentes.** Si llega duplicado un evento (como `PaymentApproved` por reintentos de webhook), el sistema debe garantizar que no se duplique el inventario, los registros de pedido o las métricas comerciales.

---

## 📂 Estructura de Directorios de la Plataforma
El código fuente del sistema se organizará físicamente bajo el siguiente árbol estructural:

```text
src/
├── presentation/
│   ├── api/             # Controladores y rutas HTTP
│   └── agents/          # Orquestadores de IA (Nova, Nexus, Pulse)
├── application/
│   ├── commands/        # Comandos de mutación y sus handlers
│   ├── queries/         # Consultas de lectura y sus handlers
│   ├── dto/             # Objetos de transferencia de datos de entrada/salida
│   ├── mappers/         # Conversores entre DTOs y Agregados de dominio
│   └── services/        # Módulos de aplicación desglosados (Checkout, Smart Pay, AI Gateway)
├── domain/
│   # Estructura organizada por Bounded Contexts
│   ├── catalog/         # Agregado Product, Category
│   ├── orders/          # Agregado Order
│   ├── payments/        # Agregados Payment y PaymentSession
│   ├── crm/             # Agregado Customer, Conversation
│   ├── store/           # Agregados Store, StoreSettings, Theme, BusinessProfile
│   ├── automation/      # Reglas e interruptores de automatizaciones
│   └── analytics/       # Análisis y métricas consolidadas
│       # Cada contexto contiene internamente:
│       # Aggregates, Entities, Value Objects, Policies, Domain Services, Domain Events, Ports (Repositories)
├── core/
│   ├── command-bus/     # Bus de comandos y Pipeline Behaviors
│   ├── query-bus/       # Bus de consultas y Pipeline Behaviors
│   ├── event-bus/       # Bus de eventos y publicación
│   ├── outbox/          # Outbox worker y despachador
│   └── interfaces/      # Interfaces de infraestructura comunes (ICache, ILogger, IScheduler)
├── integration/
│   ├── payments/        # Conectores y ACL con pasarelas externas
│   ├── messaging/       # Conectores con WhatsApp (Evolution/Meta)
│   ├── ai/              # Conectores con LLMs (DeepSeek, Gemini, Qwen)
│   ├── commerce/        # Conectores con Shopify, WooCommerce
│   └── notifications/   # Conectores con servicios de Email/SMS
└── infrastructure/
    ├── database/        # Cliente Prisma y migraciones
    ├── repositories/    # Implementaciones concretas de Repositories
    ├── cache/           # Cliente e implementaciones de caché (Redis)
    ├── storage/         # Adaptadores concretos S3, R2, Supabase Storage
    ├── logger/          # Implementación de logging estructurado
    └── scheduler/       # Motor de colas y jobs (BullMQ/Agenda)
```

---

## 🏛️ Componentes y Responsabilidades

### 1. Presentation & API/Agent Layer
*   **Presentation:** Tienda Web (portal público de catálogo y compra) y Dashboard Administrativo del vendedor.
*   **API Layer:** Controladores y rutas HTTP privadas y públicas.
*   **Agent Layer:** Agentes cognitivos (**Nova**, **Nexus**, **Pulse**) diseñados como orquestadores muy ligeros en paralelo a la API. Consumen comandos y consultas de la Application Layer y no tienen lógica de negocio propia ni conservan estado.

### 2. Core (Capa Transversal)
*   **Command Bus & Query Bus (Pipeline Behaviors):** Despachan comandos y consultas implementando patrones de decoración (Behaviors) para inyectar validación, logging, transacciones y caché sin ensuciar los Handlers:
    *   *Command Pipeline:* `Validation` -> `Authorization` -> `Logging` -> `Transaction` -> `Handler`.
    *   *Query Pipeline:* `Cache` -> `Authorization` -> `Query` -> `Handler`.
*   **Event Bus Backbone:** Flujo de desacoplamiento desacoplado:
    `Aggregate` -> `Domain Event` -> `Publisher` -> `Event Bus` -> `Handler` -> `Subscriber` -> `Integration Event`.
*   **Outbox Pattern:** Asegura que todo evento se publique. Escribe de manera transaccional (`Outbox Table`) y publica mediante un despachador (`Outbox Worker`).
*   **Notification Service:**
    *   `Notification Dispatcher` — Decide el canal final (WhatsApp, Email, SMS, Push) en función de las reglas de entrega.
    *   `Templates` — Renderizador de plantillas dinámicas.
    *   `Channels` — Conectores lógicos de cada canal.
    *   `Formatter` — Adaptador de mensajes al formato de salida.
*   **Configuration Manager & Feature Flags:** Variables de entorno, secretos y activación controlada de características en caliente.
*   **Clock:** Reloj centralizado de eventos y timers.

### 3. Application Layer
Servicios de aplicación CQRS segregados físicamente:
*   **Commands:** `CreateOrderCommand`, `CreatePaymentCommand`, `UpdateStockCommand`.
*   **Queries:** `GetDashboardQuery`, `GetOrdersQuery`.
*   **DTOs & Mappers:** Evitan la filtración de agregados del dominio hacia el cliente.

#### Módulos de Aplicación (Application Services desglosados):
*   **Checkout (Saga Orchestrator):** Orquestador de la compra que coordina secuencialmente la validación de inventario (`Inventory Validator`), la aritmética de cálculo de subtotales, totales, cupones e impuestos (`Pricing, Promotion & Tax Engine`), la creación del pedido (`Order Builder`) y la solicitud de pago al `Payment Orchestrator` delegando a la interfaz `PaymentService`.
*   **Smart Pay Service:** Orquestador de cobros que recibe llamadas mediante el `Webhook Handler`, valida seguridad mediante el `Payment Validator` y delega a la `PaymentSession` del dominio. Actualiza en tiempo real al cliente vía `Realtime Gateway` y genera códigos de escritorio con `QR Generator`.
*   **AI Gateway Pipeline:** Funciona como un pipeline estructurado:
    `AI Gateway` -> `Providers (LLMProvider Interface)` -> `Pipeline` -> `Prompt Builder` -> `Context Builder` -> `Tool Resolver` -> `LLM Client` -> `Response Parser (Validator)` -> `Post Processor`.
    El `Tool Registry` consolida también el `ToolExecutor` (ejecutor de herramientas), `ToolValidator` y `ToolDefinition`.

### 4. Domain Layer (Organizado por Bounded Contexts)
*   **Aggregates del MVP:**
    *   `Store Context`: Agregados `Store`, `StoreSettings`, `Theme`, `BusinessProfile`.
    *   `Catalog Context`: Agregados `Product`, `Category`.
    *   `Orders Context`: Agregado `Order` (Timeline, Status, Assignments).
    *   `Payments Context`: Agregados `Payment` (monto, estado, proveedor, referencia) y `PaymentSession` (token, expiración, url, dispositivo, QR).
    *   `CRM Context`: Agregados `Customer`, `Conversation`.
    *   `Automation & Analytics Context`: Mapeo de reglas y KPI comerciales.
*   **Value Objects:** `Money`, `PhoneNumber`, `Email`, `ProductPrice`, `Quantity`, `OrderStatus` / `PaymentStatus`, y `Slug`.
*   **Policies:** `CanCreateOrderPolicy`, `CanApplyCouponPolicy`, `CanCancelOrderPolicy`.
*   **Domain Services:** `PriceCalculator`, `CouponValidator`, `InventoryAllocator`.
*   **Domain Events:** `OrderCreated`, `OrderCancelled`, `PaymentApproved`, `InventoryReserved`.
*   **Repository Ports (Interfaces de persistencia):** `ProductRepository`, `OrderRepository`, `PaymentRepository`, `ConversationRepository`.

### 5. Integration Hub (Anti-Corruption Layer - ACL)
Aísla las dependencias externas para que el sistema interactúe mediante conectores y adaptadores limpios, impidiendo la propagación de APIs de terceros hacia el negocio.
*   **Messaging Connectors:** Evolution API/Meta Cloud API.
*   **Payment Connectors:** Mercado Pago, Stripe, Wompi, ePayco.
*   **AI Connectors:** DeepSeek, Qwen, Gemini.
*   **Commerce Connectors:** Shopify, WooCommerce.
*   **Notification Connectors:** Sendgrid, Twilio.

### 6. Infrastructure Layer
Soporte técnico y físico de la plataforma. Implementa las interfaces de puertos definidas por el dominio y el Core.
*   **ORM:** Prisma.
*   **Repositories (Prisma Adapters):** `PrismaProductRepository`, `PrismaOrderRepository`, `PrismaPaymentRepository`, `PrismaConversationRepository`.
*   **Cache:** Redis (Implementa `ICacheProvider` de Core).
*   **Storage Provider Adapter:** Adaptadores específicos `SupabaseStorageAdapter`, `CloudflareR2Adapter`, `AmazonS3Adapter` (Implementan `StorageProvider` de Core).
*   **Logger:** Implementa `ILogger` de Core.
*   **Scheduler:** BullMQ/Agenda (Implementa `IScheduler` de Core).

==================================================
⚡ EVENTOS DEL SISTEMA (Event Bus Backbone)
==================================================

El Event Bus actúa como la columna vertebral de la plataforma. Todos los módulos publican o consumen eventos del sistema para evitar dependencias directas.

#### Segregación de Eventos del Sistema
Para mantener el dominio limpio de dependencias de infraestructura y APIs de terceros, se distinguen explícitamente:
*   **Domain Events (Internos de negocio):** Representan hechos puros del negocio (e.g. `OrderCreated`, `PaymentApproved`, `CustomerCreated`, `InventoryChecked`).
*   **Integration Events (Externos/Adaptadores):** Representan llamadas externas procesadas por conectores del Integration Hub (e.g. `WhatsAppMessageReceived`, `MercadoPagoWebhookReceived`, `StripeWebhookReceived`).

#### Estructura y Metadatos de un Evento
Cada evento del sistema debe ser versionado (e.g. `OrderCreated.v1` o propiedad `version: 1`) e incluir los siguientes metadatos obligatorios para asegurar la trazabilidad (Correlation):
*   `eventId` — Identificador único del evento emitido.
*   `correlationId` — Identificador común de toda la transacción o flujo de negocio (e.g. `checkout-8dk32`).
*   `causationId` — ID del evento o comando directo que causó esta emisión.
*   `timestamp` — Marca de tiempo UTC precisa de la ocurrencia.

```text
                               Event Bus
                                   ▲
  ┌──────────────┬──────────────┬──┴───────────┬──────────────┬──────────────┐
  │              │              │              │              │              │
Orders        Payments          AI         Dashboard     Notifications   Inventory
```

### Eventos por Categoría
*   **Conversaciones:** `conversation.started`, `conversation.updated`, `conversation.closed`
*   **Clientes:** `customer.created`, `customer.updated`
*   **Carrito:** `cart.created`, `cart.updated`, `cart.abandoned`
*   **Checkout:** `checkout.created`, `checkout.completed`, `checkout.expired`
*   **Pagos:** `payment.created`, `payment.pending`, `payment.approved`, `payment.rejected`, `payment.expired`, `payment.refunded`
*   **Pedidos:** `order.created`, `order.confirmed`, `order.preparing`, `order.ready`, `order.delivered`, `order.cancelled`
*   **Productos:** `product.created`, `product.updated`, `product.deleted`, `stock.updated`
*   **Tienda:** `store.updated`, `theme.updated`, `settings.updated`

==================================================
🔄 FLUJO PRINCIPAL DEL SISTEMA
==================================================

El flujo operativo completo del sistema se define en la siguiente secuencia desacoplada por eventos:

```text
Cliente
   │
   ▼
WhatsApp
   │
   ▼
Nova (Agent Layer)
   │
   ▼
Command Bus (CreateCheckoutCommand)
   │
   ▼
CreateCheckoutHandler (Application Layer)
   │
   ▼
Checkout Engine (Saga Orchestrator)
   │
   ▼
Smart Pay (PaymentSession & Payment)
   │
   ▼
Mercado Pago
   │
   ▼
Webhook (Integration Event)
   │
   ▼
FlashCheckout Core (Outbox Table & Outbox Worker)
   │
   ▼
PaymentApproved (Domain Event v1)
   │
   ▼
Atlas (V2 / Post-MVP)
   │
   ▼
order.preparing
   │
   ▼
Nova (Agent Layer)
   │
   ▼
Cliente recibe confirmación
   │
   ▼
Dashboard actualizado
   │
   ▼
Pulse registra la venta
```

==================================================
🟢 ÉPICAS DEL MVP
==================================================

🟢 EPIC 1 — Autenticación y Registro
Registro
✅ Registro con Clerk
✅ Inicio de sesión
✅ Recuperación de contraseña
✅ Logout
✅ Protección de rutas

🟢 EPIC 2 — Onboarding AI First (Simplificado)
☐ Asistente interactivo de onboarding guiado por Nexus
☐ Nombre y enlace de la tienda (Slug)
☐ Categoría comercial básica
☐ WhatsApp del negocio (conectar mediante QR)
☐ Crear primeros productos básicos

🟢 EPIC 3 — FlashCheckout Core & Event Bus
☐ Command Bus / Query Bus & Event Bus (Event Bus backbone con Outbox Worker)
☐ Servicio de notificaciones internas y templates (Notification Service & Templates)
☐ Bitácora de logs y logs de auditoría
☐ Configuración central de secrets y feature flags (Configuration Manager & Feature Flags)
☐ Cache en memoria para datos de lectura rápida
☐ Task Scheduler para expiraciones y timers
☐ Reloj centralizado de eventos y timers (Clock)
☐ Health Monitor de integraciones

🟢 EPIC 4 — Dashboard
☐ Ventas hoy
☐ Pedidos activos
☐ Conversaciones activas
☐ Productos
☐ Clientes
☐ Actividad reciente del motor de IA
☐ Alertas importantes
☐ Acciones rápidas

🟢 EPIC 5 — Conversaciones (CRM de Chats)
Bandeja
☐ Conversaciones
☐ Estados
☐ Búsqueda
☐ Etiquetas
Chat
☐ Historial
☐ Productos recomendados
☐ Carrito
☐ Información del cliente
☐ Estado del pedido
☐ Escalar a humano

🟢 EPIC 6 — Productos
☐ Crear
☐ Editar
☐ Eliminar
☐ Inventario
☐ Categorías
☐ Variantes
☐ Imágenes
☐ Precio
☐ Estado

🟢 EPIC 7 — Clientes
☐ Lista
☐ Historial
☐ Compras
☐ Conversaciones
☐ Información
☐ Etiquetas

🟢 EPIC 8 — Pedidos
☐ Lista
☐ Estados (Pendiente, Pagado, Preparando, Listo, Entregado, Cancelado)
☐ Pago
☐ Productos
☐ Cliente
☐ Timeline
☐ Cambiar estado
☐ Buscar

🟢 EPIC 9 — Checkout Engine
☐ Módulo orquestador (Saga Orchestrator)
☐ Inventory Validator
☐ Pricing Engine
☐ Promotion & Tax Engines
☐ Order Builder
☐ Payment Orchestrator (Despacho a PaymentService)

🟢 EPIC 10 — FlashCheckout Smart Pay ⭐
Detección inteligente del dispositivo:
☐ Código QR grande (Computador)
☐ Botón grande "Pagar ahora" (Móvil)
☐ Opción "Mostrar código QR" (Móvil)
Ruta /pay/:paymentId:
☐ Logo, Nombre, Número de pedido, Productos, Total, Estado del pago, QR, Botón, Tiempo restante (Payment Session).
Estados (Smart Pay State Machine):
☐ CREATED, PENDING, APPROVED, EXPIRED, REFUNDED.
Realtime:
☐ Actualizar página, Dashboard y pedidos mediante Realtime Gateway.
Arquitectura:
☐ Tabla Payment y tabla OutboxEvent en base de datos.
☐ Interfaz PaymentProvider y MercadoPagoProvider.

🟢 EPIC 11 — Tienda (Básica)
☐ Configurar Logo
☐ Configurar Banner
☐ Configurar Colores

🟢 EPIC 12 — AI Gateway ⭐
☐ Context Builder & Context Manager
☐ Prompt Manager
│   ├── Prompt Builder
├── Conversation Manager
├── Tool Registry
│   ├── ToolExecutor
│   ├── ToolValidator
│   └── ToolDefinition
├── Memory Manager
├── Model Provider & LLMProvider Interface
├── Response Parser (Validator)
├── Token Manager
├── Streaming
├── Post Processor
└── Guardrails (Seguridad y PII)

🟢 EPIC 13 — IA Conversacional (Nova)
Nova será quien atienda la venta en WhatsApp.
☐ Saludo inicial y bienvenida
☐ Recomendación de productos y consulta de catálogo
☐ Respuestas a preguntas frecuentes
☐ Agregado de productos y edición de cantidades en el carrito
☐ Envío del link Smart Pay
☐ Manejo de evento `payment.approved` para notificar.

🟢 EPIC 14 — IA Administrativa & Nexus (Mover a V1.1)
Interfaz de comandos en lenguaje natural para la administración de la tienda mediante Tool Calling:
☐ Tool: `createProduct()`, `updateProduct()`, `deleteProduct()`
☐ Tool: `updateStoreTheme()`, `connectWhatsApp()`, `connectMercadoPago()`
☐ Tool: `createPromotion()`, `createCoupon()`, `generateReport()`, `changeBusinessHours()`

🟢 EPIC 15 — Automatizaciones (Simplificadas)
No habrá editor visual. Solo plantillas con interruptores ON/OFF:
☐ Bienvenida
☐ Pedido pagado
☐ Pedido listo
☐ Recuperar carrito

🟢 EPIC 16 — Inteligencia Pulse (Simplificada - V1.1)
Métricas sencillas para el MVP:
☐ Ventas totales
☐ Ticket promedio
☐ Producto más vendido

🟢 EPIC 17 — Configuración (Monousuario para MVP)
☐ Perfil del negocio
☐ Datos de la empresa
☐ Conexión de Pagos
☐ Estado del bot de IA

🟢 EPIC 18 — Integration Hub (Integraciones)
☐ Messaging Connectors (Evolution API en VPS)
│   ├── EvolutionConnector
☐ AI Connectors (DeepSeek/Qwen/Gemini)
│   ├── LLMProviders
☐ Payment Connectors (Mercado Pago/Stripe Connect)
│   ├── MercadoPagoConnector
│   └── StripeConnector
☐ Commerce Connectors
│   ├── ShopifyConnector
│   └── WooCommerceConnector
☐ Notification Connectors (Sendgrid/Twilio)
☐ Webhooks

🟢 EPIC 19 — Backend & APIs
☐ APIs de Productos, Pedidos, Chats, IA Gateway, Checkout y Dashboard.

🟢 EPIC 20 — Base de Datos (Infrastructure)
☐ Modelos: Store, Product, Category, Order, Payment, OutboxEvent, WhatsAppSession.

🟢 EPIC 21 — Producción y Robustez
☐ Servidor VPS dedicado, HTTPS, Webhooks seguros.
☐ Observabilidad (Logs de IA, WhatsApp, pagos) y Monitoreo (Health Monitor).
☐ Reintentos automáticos y capa de caché (Performance).
☐ Límite de costos de IA.

🟢 EPIC 22 — Landing Page & Suscripciones
☐ Home informativo, Características, Precios, Demo, Registro.
☐ Plan Founder (Stripe Connect / Stripe Billing).

==================================================
📊 PRIORIZACIÓN (Hoja de Ruta de Ingeniería)
==================================================

🔴 PRIORIDAD 1 (Lo que literalmente impide vender)
- Smart Pay (EPIC 10 - Backend, Frontend e Integración con Event Bus)
- Checkout Engine (EPIC 9 - Orquestador transaccional)
- AI Gateway (EPIC 12 - Gateway central de IA)
- IA Conversacional / Nova (EPIC 13 - Asistente de ventas)
- Payment DB (Tabla Payment e interfaz PaymentProvider)
- FlashCheckout Core & Event Bus (EPIC 3 - Desacoplamiento asíncrono básico)
- Integration Hub & Evolution VPS (WhatsApp e integraciones estables en producción)
- Onboarding AI (Asistente interactivo guiado por Nexus simplificado)
- Autenticación (Clerk)
- Backend y APIs básicas

🟠 PRIORIDAD 2 (Lo que mejora la experiencia)
- IA Administrativa / Nexus & Tool Registry (EPIC 14)
- Automatizaciones básicas (EPIC 15 - Toggles de plantillas)
- Pulse (Estadísticas básicas en el Dashboard)
- Dashboard Pagos (Sección dedicada del panel)

🟡 PRIORIDAD 3 (Lo que mejora la escalabilidad y monitoreo inicial)
- Logs y Observabilidad (IA, WhatsApp, pagos)
- Cache local de la base de datos
- Monitor de salud de integraciones (Dashboard interno / Health Monitor)
- Rate Limit básico
- Backups automáticos

🟢 PRIORIDAD 4 (Escalabilidad a Gran Escala - Hito Futuro)
- Distribución con Redis y colas (Queue)
- Event Bus distribuido y escalable (RabbitMQ / Kafka / Redis PubSub)
- Concurrencia Multi-Worker y caché distribuido

🟢 Post-MVP (Negocios avanzados)
- Buckets privados para comprobantes (Storage Provider / R2 / S3)
- Editor visual de automatizaciones
- Múltiples pasarelas de pago (Wompi, ePayco, Stripe Connect extendido)
- Roles avanzados y multiusuarios
- Constructor visual avanzado de tienda
- Instagram, Facebook y TikTok
- Multiempresa y multisucursal
- App móvil
- Marketplace
- API pública y White Label

==================================================
🗓️ ROADMAP TÉCNICO (Sprints de Implementación)
==================================================

### Sprint 1: Infraestructura
Configuración de entornos estables. Despliegue de Evolution API en VPS dedicado, túneles HTTPS con SSL permanente y configuración inicial de variables de entorno de producción.

### Sprint 2: FlashCheckout Core
Construcción de los cimientos. Programación del Command Bus / Query Bus, Event Bus, Outbox Worker, servicio de notificaciones y templates, capa de Configuration Manager & Feature Flags, caché local, Health Monitor y el componente **Clock**.

### Sprint 3: Checkout Engine
Implementación del orquestador transaccional (Saga Orchestrator). Lógica para la validación de inventario, Pricing Engine, Promotion Engine, Tax Engine, Order Builder y la comunicación mediante interfaces de cobro.

### Sprint 4: Smart Pay
Integración de pagos en línea. Interfaz `PaymentProvider`, `MercadoPagoProvider`, diseño de la ruta `/pay/:paymentId`, webhooks (Webhook Handler con Payment Validator), Realtime Gateway, QR Generator y la máquina de estados del cobro (PaymentSession).

### Sprint 5: AI Gateway
Montaje del motor de IA. Creación de los proveedores de modelos (Qwen/DeepSeek/Gemini) en el Integration Hub, estructuración del Context Builder, Prompt Manager, Memory Manager, Conversation Manager, Guardrails y el Tool Registry.

### Sprint 6: Nova Conversacional
Configuración del bot de WhatsApp (ligero). Conexión del chatbot con el AI Gateway, pruebas de intenciones de venta y envío de los enlaces Smart Pay en la conversación de compra.

### Sprint 7: Onboarding AI
Desarrollo del flujo interactivo inicial guiado por Nexus para la creación de tiendas de los comercios.

### Sprint 8: Beta Privada
Fase final de control de calidad. Lanzamiento cerrado con los primeros 10 clientes ("Beta Tester Pass") para recopilar logs, optimizar performance y corregir errores.

==================================================
🎯 DEFINICIÓN DE "MVP LISTO PARA PRODUCCIÓN"
==================================================

FlashCheckout estará listo para producción cuando un comerciante pueda completar un onboarding guiado por Nexus en menos de cinco minutos, conectar su cuenta de WhatsApp, configurar su catálogo y comenzar a vender automáticamente mediante Nova; cuando el cliente pueda descubrir productos, conversar, recibir recomendaciones, pagar mediante Smart Pay desde cualquier dispositivo y recibir confirmaciones sin intervención humana; y cuando el comerciante pueda supervisar toda la operación desde un único panel impulsado por inteligencia artificial.

==================================================
🔮 VISIÓN DEL PRODUCTO
==================================================

> **FlashCheckout es una plataforma de comercio conversacional impulsada por inteligencia artificial que permite a cualquier negocio vender automáticamente desde WhatsApp y su tienda web. Nova atiende a los clientes, recomienda productos, genera el checkout y cobra mediante Smart Pay, mientras FlashCheckout coordina pedidos, pagos, inventario y automatizaciones en tiempo real desde un único panel de control para el comerciante.**