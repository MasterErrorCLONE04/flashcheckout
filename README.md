# ⚡ FlashCheckout — El Ecosistema de Comercio Conversacional Definitivo

<p align="center">
  <img src="https://www.vectorlogo.zone/logos/shopify/shopify-ar21.svg" alt="E-commerce Logo" width="120" style="vertical-align: middle; filter: grayscale(100%) brightness(0%);" />
  <span style="font-size: 30px; font-weight: bold; margin: 0 15px; vertical-align: middle;">+</span>
  <img src="https://www.vectorlogo.zone/logos/whatsapp/whatsapp-ar21.svg" alt="WhatsApp Logo" width="120" style="vertical-align: middle;" />
</p>

**FlashCheckout** es una plataforma micro-SaaS de alto rendimiento diseñada para el mercado de Latinoamérica (LATAM) que convierte las interacciones en redes sociales (Instagram, TikTok, WhatsApp) en ventas inmediatas. El sistema combina **páginas de checkout públicas ultrarrápidas** y un **asistente de ventas conversacional con Inteligencia Artificial en WhatsApp**, permitiendo a comercios locales y marcas emergentes cerrar ventas en menos de 30 segundos, gestionar inventarios, procesar cobros y coordinar entregas de forma automatizada.

---

## 🚀 Características Clave

### 1. Dos Experiencias de Compra Dinámicas

*   **Páginas de Checkout Públicas (`/tienda/[slug]`)**:
    *   Diseño móvil-primero minimalista y elegante con animaciones suaves impulsadas por [Framer Motion](https://www.framer.com/motion/).
    *   Carrito de compras interactivo y reactivo.
    *   **Selector de Ubicación Geográfica**: Integración con mapas interactivos de [Leaflet](https://leafletjs.com/) para que el comprador marque sus coordenadas exactas de entrega, reduciendo errores de despacho.
*   **Asistente Conversacional en WhatsApp (Chatbot AI)**:
    *   Motor de detección de intenciones (`intent-engine.ts`) que interpreta el lenguaje natural del cliente.
    *   Búsqueda global inteligente de tiendas y productos mediante lenguaje conversacional.
    *   Flujos interactivos nativos (**WhatsApp Flows**) para desplegar catálogos visuales directamente dentro del chat sin salir de WhatsApp.
    *   Recopilación secuencial de datos de facturación (Nombre, Dirección, Ciudad) mediante un árbol de estados interactivo.

### 2. Procesamiento de Pagos Seguro e Integrado

*   **Mercado Pago (LATAM)**: Generación automática de enlaces de pago seguro (tarjetas, PSE, efectivo local) asociados a las órdenes creadas en WhatsApp o la Web.
*   **Stripe Connect**: Soporte para cuentas conectadas (*Connected Accounts*), facilitando a los comercios cobrar en línea de forma transparente mientras la plataforma procesa comisiones automáticamente.
*   **Suscripciones SaaS (Stripe)**: Sistema de cobro integrado para los comerciantes suscriptores del servicio de FlashCheckout, con control automático de periodos de facturación y límites de catálogo.

### 3. Logística Inteligente y Red de Repartidores (Drivers)

*   **Despacho Automatizado**: Cuando una orden requiere envío a domicilio, el sistema notifica y difunde el pedido instantáneamente a todos los repartidores activos en la zona a través de botones interactivos de WhatsApp.
*   **Asignación Segura anti-condiciones de carrera**: Implementado mediante transacciones de base de datos a nivel de PostgreSQL para garantizar que un pedido solo pueda ser aceptado por un repartidor a la vez.
*   **Monitoreo en el Mapa**: Panel de logística para el comerciante que geolocaliza las órdenes y facilita la planificación de rutas.

### 4. Consola de Administración para el Comercio (Dashboard)

*   **Estadísticas y Analíticas Visuales**: Gráficos interactivos de ventas creados con [Recharts](https://recharts.org/) que desglosan ventas totales, número de órdenes, ticket promedio e histórico de conversiones.
*   **Gestor de Productos (CRUD)**: Carga y administración de catálogo con soporte para imágenes almacenadas de forma pública en **Supabase Storage**.
*   **Generador de Códigos QR**: Permite al comercio descargar códigos QR dinámicos para colocar en mesas, empaques o vitrinas físicas, dirigiendo a los clientes directamente al flujo de checkout digital.
*   **CRM de Clientes**: Historial completo de compradores con métricas de valor de vida del cliente (LTV), cantidad de órdenes y accesos rápidos de contacto.
*   **Configuración del Asistente AI**: Personalización del mensaje de bienvenida, instrucciones del prompt del bot e interruptor de encendido del agente virtual para cada tienda.

---

## 🛠️ Stack Tecnológico

FlashCheckout está construido sobre un stack de desarrollo moderno y altamente eficiente de última generación:

| Capa | Tecnología | Versión | Rol en el Proyecto |
| :--- | :--- | :--- | :--- |
| **Framework** | Next.js (App Router + Turbopack) | `16.2.2` | Core del frontend y backend API. |
| **Biblioteca UI** | React | `19.2.4` | Renderizado interactivo y componentes del cliente. |
| **Estilos y Componentes** | Tailwind CSS + shadcn/ui | `v4` | Sistema de diseño de alta fidelidad, fluido y responsivo. |
| **Autenticación** | Clerk (Core 3) | `7.0.8` | Gestión segura de identidad de comercios y perfiles privados. |
| **Base de Datos** | Supabase (PostgreSQL) | `2.101.1` | Almacenamiento relacional de datos y bucket para archivos de catálogo. |
| **ORM** | Prisma Client | `7.7.0` | Modelado y consulta estructurada de la base de datos PostgreSQL. |
| **Mapas** | Leaflet / React-Leaflet | `1.9.4` | Geolocalización de entregas y paneles de rutas. |
| **Pagos** | Mercado Pago & Stripe | — | Gateways de suscripciones y transacciones de clientes. |

---

## 📂 Arquitectura del Directorio

La estructura del código sigue el patrón moderno de Next.js App Router:

```
flashcheckout/
├── app/                              # Rutas del App Router
│   ├── (auth)/                       # Páginas de inicio y registro con Clerk
│   ├── (dashboard)/                  # Panel privado del comerciante (productos, pedidos, etc.)
│   ├── api/                          # Endpoints HTTP (orders, products, stores, webhooks)
│   ├── tienda/[slug]/                # Checkout público autogenerado para cada comercio
│   ├── layout.tsx                    # Layout raíz (proveedores de estado y estilos globales)
│   └── globals.css                   # Estilos principales de Tailwind CSS
├── components/                       # Componentes modulares y reutilizables
│   ├── ui/                           # Componentes base de shadcn/ui (botones, tarjetas, acordeones)
│   ├── AnalyticsDashboard.tsx        # Dashboard visual y paneles gráficos
│   ├── CheckoutForm.tsx              # Formulario de pago público con Leaflet
│   ├── LogisticsManager.tsx          # Panel de geolocalización de pedidos para comercios
│   ├── OrderList.tsx                 # Administrador de órdenes y facturación (PDF)
│   ├── ProductManager.tsx            # CRUD de catálogo de productos
│   └── WhatsAppCatalog.tsx           # Configuración de WhatsApp Flows
├── lib/                              # Módulos de lógica del sistema y utilidades
│   ├── bot/                          # Lógica del Chatbot AI
│   │   ├── chatbot-logic.ts          # Máquina de estados conversacional y flows
│   │   └── intent-engine.ts          # Motor de parseo de intenciones con palabras clave
│   ├── whatsapp/                     # API de mensajería en la nube
│   │   └── cloud-api.ts              # Cliente para WhatsApp Cloud API (Listas, Flows, Botones)
│   ├── prisma.ts                     # Cliente Singleton de Prisma
│   └── supabase.ts                   # Cliente de Supabase Storage para carga de fotos
├── prisma/
│   └── schema.prisma                 # Definición del esquema de datos relacional
├── proxy.ts                          # Middleware de Clerk optimizado para Next.js 16
└── docker-compose.yml                # Configuración local de base de datos PostgreSQL
```

---

## 🗄️ Esquema de Base de Datos (Modelos Clave)

El esquema de datos en `prisma/schema.prisma` define las siguientes entidades clave:

```mermaid
erDiagram
    STORE ||--o{ PRODUCT : "contiene"
    STORE ||--o{ ORDER : "recibe"
    DRIVER ||--o{ ORDER : "entrega"
    STORE {
        string id PK
        string slug UK
        string name
        string whatsapp
        string userId
        boolean active
        string logoUrl
        string systemPrompt
        string welcomeMessage
        boolean aiActive
    }
    PRODUCT {
        string id PK
        string name
        int price
        int stock
        string imageUrl
        boolean active
        string storeId FK
    }
    ORDER {
        string id PK
        string customerName
        string customerPhone
        string address
        string city
        json items
        int total
        string status
        string storeId FK
        string driverId FK
        string paymentStatus
        string source
    }
    DRIVER {
        string id PK
        string name
        string phoneNumber UK
        boolean active
        boolean available
    }
    WHATSAPP_SESSION {
        string id PK
        string phoneNumber UK
        string storeId
        json cart
        string step
    }
```

---

## ⚙️ Configuración e Instalación

Sigue estos pasos para poner en marcha el proyecto en tu entorno de desarrollo local:

### 1. Clonar el repositorio y configurar variables de entorno
Crea un archivo `.env` en la raíz del proyecto basándote en `.env.example`:

```env
# ── Autenticación (Clerk) ──
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# ── Almacenamiento (Supabase) ──
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...
SUPABASE_SERVICE_ROLE_KEY=eyJh...

# ── Base de Datos (PostgreSQL) ──
# Conexión local usando el servicio db del docker-compose.yml
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/flashcheckout?schema=public

# ── WhatsApp Cloud API ──
WHATSAPP_ACCESS_TOKEN=tu_token_aqui
WHATSAPP_PHONE_NUMBER_ID=tu_phone_number_id_aqui
WHATSAPP_CATALOG_FLOW_ID=tu_flow_id_aqui

# ── Aplicación ──
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Levantar la base de datos local
El proyecto incluye un entorno preconfigurado con Docker Compose para inicializar PostgreSQL:

```bash
docker-compose up -d
```

### 3. Instalar dependencias
Instala los paquetes necesarios utilizando npm:

```bash
npm install
```

### 4. Ejecutar migraciones de la base de datos
Genera el cliente de Prisma y aplica el esquema relacional sobre la base de datos:

```bash
npx prisma migrate dev --name init
```

### 5. Iniciar el servidor de desarrollo
Inicia el entorno de desarrollo potenciado por **Turbopack**:

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador para ver la aplicación web.

---

## 🤖 Funcionamiento del Chatbot de WhatsApp

La máquina de estados conversacional (`chatbot-logic.ts`) procesa los mensajes entrantes de los clientes y actualiza la sesión (`WhatsAppSession`) de acuerdo a la siguiente lógica:

```mermaid
stateDiagram-v2
    [*] --> START : Cliente envía "Hola"
    START --> IDLE : Envía Botones de Inicio (Buscar / Ver Tiendas)
    IDLE --> AWAITING_STORE_SELECTION : Cliente selecciona "Ver tiendas"
    AWAITING_STORE_SELECTION --> IDLE : Selecciona una tienda y abre el Catálogo Pro (Flows/Web)
    IDLE --> AWAITING_QUANTITY : Selecciona un producto en formato texto
    AWAITING_QUANTITY --> IDLE : Confirma la cantidad (Añade al carrito)
    IDLE --> AWAITING_NAME : Selecciona "Finalizar Pedido" (Carrito confirmado)
    AWAITING_NAME --> AWAITING_ADDRESS : Registra el nombre del comprador
    AWAITING_ADDRESS --> AWAITING_CONFIRMATION : Registra la dirección física
    AWAITING_CONFIRMATION --> IDLE : Genera orden en base de datos y envía link de Mercado Pago
```

1.  **Detección e Inicio**: El cliente saluda y el bot responde presentando las opciones principales (Ver Tiendas / Buscar).
2.  **Exploración**: El cliente puede elegir una tienda, lo cual envía un **WhatsApp Flow** interactivo para armar el carrito de forma gráfica, o usar el catálogo interactivo basado en listas nativas.
3.  **Conversión**: Cuando el cliente confirma el carrito, el bot inicia el checkout conversacional pidiendo sus datos de entrega.
4.  **Pago**: Al finalizar, la orden se crea en estado `PENDING` y se le envía al cliente un botón dinámico conectado a **Mercado Pago** para liquidar el pago con tarjeta o transferencia.

---

## 🚚 Protocolo de Despacho de Pedidos (Logística)

Cuando una tienda solicita un repartidor para un pedido:
1.  El servidor cambia el estado de la orden a `deliveryRequested: true`.
2.  Se localizan los repartidores registrados en la tabla `Driver` que tengan `active: true` y `available: true`.
3.  Se envía un mensaje de WhatsApp a los repartidores con los detalles del servicio y el botón **"Aceptar Domicilio"**.
4.  El primer repartidor que presione el botón activa una transacción segura (`prisma.$transaction`) que asigna su `driverId` a la orden y cambia el estado a `shipped` ("En camino"), informando simultáneamente al comerciante que su despacho va en ruta.
