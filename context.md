# FlashCheckout — Documento Maestro de Construcción
 
> **Stack actualizado al 31 de marzo de 2026**  
> Next.js 16.2.1 · Supabase · TypeScript 5 · Clerk 7 · Prisma 6  
> **Meta:** MVP en producción en 48h. Primera facturación en 7 días.
 
---
 
## 01. Visión del Producto
 
**FlashCheckout** es un micro-SaaS que convierte conversaciones de Instagram y TikTok en ventas reales mediante un link de checkout que automatiza el cierre del pedido por WhatsApp.
 
| Campo | Detalle |
|---|---|
| Problema | Vendedores pierden 15–20 min por venta coordinando pedidos manualmente por DM |
| Solución | Link de checkout público que pre-llena el mensaje de WhatsApp con el pedido completo |
| Resultado | Cierre de venta en menos de 30 segundos desde el celular del comprador |
| Nicho | Emprendedores de ropa, joyería, snacks y accesorios que venden por redes sociales |
| Mercado | Colombia (Medellín / Bogotá). Expansión a LATAM en fase 2 |
 
### Modelo de Negocio
 
- **Beta Tester Pass:** USD $30 pago único (primeros 10 clientes)
- **Plan Mensual:** USD $15/mes después del beta
- **Meta semana 1:** 10 clientes = USD $300 en caja
 
---
 
## 02. Stack Tecnológico
 
Versiones exactas verificadas al 31 de marzo de 2026.
 
| Capa | Herramienta | Versión |
|---|---|---|
| Framework | Next.js (App Router + Turbopack por defecto) | `16.2.1` |
| Lenguaje | TypeScript strict mode | `5.x` |
| Runtime mínimo | Node.js | `20.9+` |
| Estilos | Tailwind CSS + shadcn/ui | `3.4.x` |
| Base de datos | Supabase (PostgreSQL managed) | `2.x` |
| ORM | Prisma | `6.x` |
| Auth | Clerk (Core 3) | `7.0.7` |
| Archivos | Supabase Storage | — |
| Despliegue | Vercel | — |
| Email (fase 2) | Resend | — |
 
### Novedades clave de Next.js 16 que usamos
 
- **Turbopack es el bundler por defecto** en `next dev` y `next build`. Ya no hay que activarlo con flags.
- **`proxy.ts`** reemplaza a `middleware.ts` para el middleware de Clerk en Next.js 16+.
- **`params` es una `Promise`** en páginas y layouts — siempre usar `await params`.
- **Server Fast Refresh:** hot reload granular del lado del servidor sin perder estado.
- **Adapter API estable:** permite desplegar en plataformas distintas a Vercel.
 
---
 
## 03. Arquitectura del Proyecto
 
```
flashcheckout/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/[[...sign-in]]/page.tsx
│   │   └── sign-up/[[...sign-up]]/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx              ← layout privado con Clerk
│   │   ├── dashboard/page.tsx      ← panel principal
│   │   ├── productos/page.tsx      ← CRUD de catálogo
│   │   └── pedidos/page.tsx        ← registro de órdenes
│   ├── tienda/
│   │   └── [slug]/page.tsx         ← checkout público (sin auth)
│   ├── api/
│   │   ├── orders/route.ts         ← POST: guardar pedido
│   │   ├── products/route.ts       ← CRUD productos
│   │   └── stores/route.ts         ← CRUD tiendas
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                         ← shadcn/ui components
│   ├── ProductCard.tsx
│   ├── CheckoutForm.tsx
│   └── OrderPanel.tsx
├── lib/
│   ├── prisma.ts                   ← singleton Prisma client
│   ├── supabase.ts                 ← cliente Supabase
│   └── whatsapp.ts                 ← generador deep link
├── prisma/
│   └── schema.prisma
└── proxy.ts                        ← Clerk middleware (Next.js 16+)
```
 
> **Cambio importante vs Next.js 15:** El archivo de middleware de Clerk se llama `proxy.ts` en Next.js 16, no `middleware.ts`. El código interno es idéntico.
 
---
 
## 04. Base de Datos (Prisma 6 + Supabase)
 
### Schema Completo — `prisma/schema.prisma`
 
```prisma
generator client {
  provider = "prisma-client-js"
}
 
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}
 
model Store {
  id        String    @id @default(cuid())
  slug      String    @unique
  name      String
  whatsapp  String    // formato: 573001234567
  userId    String    // clerk user id
  active    Boolean   @default(true)
  products  Product[]
  orders    Order[]
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}
 
model Product {
  id        String   @id @default(cuid())
  name      String
  price     Int      // en pesos colombianos enteros
  stock     Int      @default(0)
  imageUrl  String?
  active    Boolean  @default(true)
  storeId   String
  store     Store    @relation(fields: [storeId], references: [id])
  createdAt DateTime @default(now())
}
 
model Order {
  id            String   @id @default(cuid())
  customerName  String
  customerPhone String?
  address       String
  city          String
  items         Json     // [{ productId, name, qty, price }]
  total         Int
  status        String   @default("pending")
  storeId       String
  store         Store    @relation(fields: [storeId], references: [id])
  createdAt     DateTime @default(now())
}
```
 
### Comandos de Migración
 
```bash
# 1. Primera migración
npx prisma migrate dev --name init
 
# 2. Generar el cliente
npx prisma generate
 
# 3. Verificar en el navegador
npx prisma studio
```
 
> **Importante:** Supabase requiere dos URLs. `DATABASE_URL` usa el Transaction Pooler (puerto 6543) para Next.js en producción. `DIRECT_URL` usa conexión directa (puerto 5432) solo para migraciones. Obtén ambas en: Supabase Dashboard → Settings → Database → Connection String.
 
---
 
## 05. Autenticación con Clerk 7 (Core 3)
 
Clerk v7 tiene dos cambios críticos respecto a v6: `auth()` es **completamente asíncrono** y el middleware va en `proxy.ts`.
 
### Instalación
 
```bash
npm install @clerk/nextjs@latest
```
 
### Variables en `.env.local`
 
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```
 
### `proxy.ts` — Middleware (Next.js 16+)
 
```typescript
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
 
const isPublicRoute = createRouteMatcher([
  '/',
  '/tienda/(.*)',      // checkout público — sin auth
  '/api/orders(.*)',  // endpoint público
  '/sign-in(.*)',
  '/sign-up(.*)',
])
 
export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect()  // ← en Clerk v7, auth.protect() es async
  }
})
 
export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
```
 
### `app/layout.tsx`
 
```tsx
import type { Metadata } from 'next'
import { ClerkProvider } from '@clerk/nextjs'
import './globals.css'
 
export const metadata: Metadata = {
  title: 'FlashCheckout',
  description: 'El Shopify de WhatsApp',
}
 
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        <ClerkProvider>
          {children}
        </ClerkProvider>
      </body>
    </html>
  )
}
```
 
> En Clerk v7, `<ClerkProvider>` ya no fuerza rendering dinámico en toda la app por defecto. El checkout público sigue siendo estático y rápido.
 
### Obtener el usuario en Server Components (Clerk v7)
 
```typescript
import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
 
export default async function DashboardPage() {
  const { userId } = await auth()  // ← siempre await en v7
  if (!userId) redirect('/sign-in')
 
  // tu lógica aquí
}
```
 
---
 
## 06. Variables de Entorno
 
Crea el archivo `.env.local` en la raíz. **Nunca lo subas a GitHub** (ya está en `.gitignore` por defecto).
 
```env
# ── Clerk Auth ─────────────────────────────────────────
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
 
# ── Supabase ────────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...
SUPABASE_SERVICE_ROLE_KEY=eyJh...
 
# ── Prisma / PostgreSQL ─────────────────────────────────
# Transaction Pooler (puerto 6543) — para Next.js en producción
DATABASE_URL=postgresql://postgres:[pass]@db.xxx.supabase.co:6543/postgres?pgbouncer=true
# Direct Connection (puerto 5432) — solo para migraciones
DIRECT_URL=postgresql://postgres:[pass]@db.xxx.supabase.co:5432/postgres
 
# ── App ─────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=http://localhost:3000
```
 
> En Vercel, agrega estas mismas variables en **Project Settings → Environment Variables**. Marca `SUPABASE_SERVICE_ROLE_KEY` y `CLERK_SECRET_KEY` como sensibles.
 
---
 
## 07. Páginas y Componentes Clave
 
### `lib/prisma.ts` — Singleton
 
```typescript
import { PrismaClient } from '@prisma/client'
 
const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined
}
 
export const prisma =
  globalForPrisma.prisma ?? new PrismaClient()
 
if (process.env.NODE_ENV !== 'production')
  globalForPrisma.prisma = prisma
```
 
---
 
### `lib/whatsapp.ts` — Generador de Deep Link
 
```typescript
interface OrderPayload {
  storeName: string
  whatsapp: string
  customerName: string
  items: { name: string; qty: number; price: number }[]
  total: number
  address: string
  city: string
}
 
export function buildWhatsAppLink(order: OrderPayload): string {
  const lines = order.items
    .map(i => `${i.qty}x ${i.name} — $${i.price.toLocaleString('es-CO')}`)
    .join(', ')
 
  const total = order.total.toLocaleString('es-CO')
 
  const msg = [
    `Hola ${order.storeName}! Soy ${order.customerName},`,
    `acabo de armar mi pedido: ${lines}.`,
    `Total: $${total}.`,
    `Envío a: ${order.address}, ${order.city}.`,
    `¿A qué cuenta te transfiero?`,
  ].join(' ')
 
  return `https://wa.me/${order.whatsapp}?text=${encodeURIComponent(msg)}`
}
```
 
---
 
### `app/tienda/[slug]/page.tsx` — Checkout Público
 
```tsx
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import CheckoutForm from '@/components/CheckoutForm'
 
export default async function StorePage({
  params,
}: {
  params: Promise<{ slug: string }>  // ← Next.js 16: params es una Promise
}) {
  const { slug } = await params  // ← siempre await
 
  const store = await prisma.store.findUnique({
    where: { slug, active: true },
    include: {
      products: {
        where: { active: true },
        orderBy: { createdAt: 'asc' },
      },
    },
  })
 
  if (!store) notFound()
 
  return <CheckoutForm store={store} />
}
```
 
---
 
### `app/api/orders/route.ts` — Guardar Pedido
 
```typescript
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { buildWhatsAppLink } from '@/lib/whatsapp'
 
export async function POST(req: Request) {
  const body = await req.json()
  const { storeId, customerName, address, city, items } = body
 
  const total = items.reduce(
    (s: number, i: { price: number; qty: number }) => s + i.price * i.qty,
    0
  )
 
  const order = await prisma.order.create({
    data: { storeId, customerName, address, city, items, total },
  })
 
  const store = await prisma.store.findUnique({
    where: { id: storeId },
  })
 
  const whatsappUrl = buildWhatsAppLink({
    storeName: store!.name,
    whatsapp: store!.whatsapp,
    customerName,
    items,
    total,
    address,
    city,
  })
 
  return NextResponse.json({ orderId: order.id, whatsappUrl })
}
```
 
---
 
### `components/CheckoutForm.tsx` — Client Component
 
```tsx
'use client'
 
import { useState } from 'react'
 
type Product = {
  id: string
  name: string
  price: number
  stock: number
  imageUrl: string | null
}
 
type Store = {
  id: string
  name: string
  whatsapp: string
  products: Product[]
}
 
export default function CheckoutForm({ store }: { store: Store }) {
  const [cart, setCart] = useState<Record<string, number>>({})
  const [form, setForm] = useState({
    customerName: '',
    address: '',
    city: '',
  })
  const [loading, setLoading] = useState(false)
 
  const total = store.products.reduce(
    (s, p) => s + p.price * (cart[p.id] ?? 0),
    0
  )
 
  function changeQty(id: string, delta: number) {
    const product = store.products.find(p => p.id === id)!
    setCart(prev => ({
      ...prev,
      [id]: Math.max(0, Math.min((prev[id] ?? 0) + delta, product.stock)),
    }))
  }
 
  async function handleSubmit() {
    setLoading(true)
    const items = store.products
      .filter(p => (cart[p.id] ?? 0) > 0)
      .map(p => ({
        productId: p.id,
        name: p.name,
        qty: cart[p.id],
        price: p.price,
      }))
 
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ storeId: store.id, ...form, items }),
    })
 
    const { whatsappUrl } = await res.json()
    window.location.href = whatsappUrl
  }
 
  return (
    <main className="max-w-md mx-auto p-4 space-y-4">
      <h1 className="text-xl font-semibold">{store.name}</h1>
 
      <div className="space-y-2">
        {store.products.map(p => (
          <div key={p.id} className="flex items-center gap-3 border rounded-lg p-3">
            {p.imageUrl && (
              <img
                src={p.imageUrl}
                alt={p.name}
                className="w-12 h-12 rounded-md object-cover"
              />
            )}
            <div className="flex-1">
              <p className="font-medium text-sm">{p.name}</p>
              <p className="text-pink-600 text-sm">
                ${p.price.toLocaleString('es-CO')}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => changeQty(p.id, -1)}
                className="w-7 h-7 border rounded-md text-lg leading-none"
              >
                −
              </button>
              <span className="w-5 text-center text-sm font-medium">
                {cart[p.id] ?? 0}
              </span>
              <button
                onClick={() => changeQty(p.id, +1)}
                className="w-7 h-7 border rounded-md text-lg leading-none"
                disabled={(cart[p.id] ?? 0) >= p.stock}
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>
 
      <div className="space-y-2 pt-2">
        <input
          className="w-full border rounded-lg px-3 py-2 text-sm"
          placeholder="Tu nombre"
          value={form.customerName}
          onChange={e => setForm(f => ({ ...f, customerName: e.target.value }))}
        />
        <input
          className="w-full border rounded-lg px-3 py-2 text-sm"
          placeholder="Dirección de envío"
          value={form.address}
          onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
        />
        <input
          className="w-full border rounded-lg px-3 py-2 text-sm"
          placeholder="Ciudad"
          value={form.city}
          onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
        />
      </div>
 
      <button
        onClick={handleSubmit}
        disabled={total === 0 || loading}
        className="w-full bg-green-500 text-white rounded-lg py-3 font-medium text-sm disabled:opacity-50"
      >
        {loading
          ? 'Procesando...'
          : `Finalizar por WhatsApp — $${total.toLocaleString('es-CO')}`}
      </button>
    </main>
  )
}
```
 
---
 
## 08. Imágenes con Supabase Storage
 
### Configuración del Bucket
 
1. Supabase Dashboard → **Storage → New Bucket**
2. Nombre: `products-images`
3. Marcar como **Public bucket**
4. En **Policies**, agregar:
   - `SELECT`: para todos (público, sin auth)
   - `INSERT / UPDATE`: solo para usuarios autenticados
 
### Función de Upload
 
```typescript
import { createClient } from '@supabase/supabase-js'
 
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)
 
export async function uploadProductImage(
  file: File,
  productId: string
): Promise<string> {
  const ext = file.name.split('.').pop()
  const path = `products/${productId}.${ext}`
 
  const { error } = await supabase.storage
    .from('products-images')
    .upload(path, file, { upsert: true })
 
  if (error) throw error
 
  const {
    data: { publicUrl },
  } = supabase.storage.from('products-images').getPublicUrl(path)
 
  return publicUrl
}
```
 
---
 
## 09. Plan de Acción: 7 Días para Facturar
 
### Día 1 — Setup Inicial
 
```bash
# Next.js 16 con --yes activa TypeScript, Tailwind, ESLint, App Router y Turbopack por defecto
npx create-next-app@latest flashcheckout --yes
cd flashcheckout
 
# Dependencias principales
npm install @clerk/nextjs @prisma/client @supabase/supabase-js
 
# Prisma CLI como dev dependency
npm install -D prisma
 
# shadcn/ui
npx shadcn@latest init
 
# Inicializar Prisma
npx prisma init
```
 
- [ ] Configura `.env.local` con todas las variables (ver Sección 06)
- [ ] Crea el proyecto en Supabase y copia las keys
- [ ] Crea la app en Clerk y copia las keys
- [ ] Pega el schema en `prisma/schema.prisma` (ver Sección 04)
- [ ] Ejecuta `npx prisma migrate dev --name init`
- [ ] Verifica con `npx prisma studio` que las 3 tablas existen (`Store`, `Product`, `Order`)
 
### Día 2 — Core del Producto
 
- [ ] Crea `lib/prisma.ts` (singleton)
- [ ] Crea `lib/whatsapp.ts` (`buildWhatsAppLink`)
- [ ] Crea `proxy.ts` en la raíz con el middleware de Clerk (ver Sección 05)
- [ ] Crea `app/tienda/[slug]/page.tsx` (Server Component con `await params`)
- [ ] Crea `components/CheckoutForm.tsx` (Client Component con carrito)
- [ ] Crea `app/api/orders/route.ts` (POST)
- [ ] Inserta una tienda y productos de prueba con `npx prisma studio`
- [ ] Visita `localhost:3000/tienda/[tu-slug]` y prueba el flujo completo hasta WhatsApp
 
### Día 3 — Dashboard + Despliegue
 
- [ ] Crea `app/(dashboard)/layout.tsx` con verificación de Clerk (`await auth()`)
- [ ] Crea `app/(dashboard)/productos/page.tsx` con CRUD completo
- [ ] Crea `app/(dashboard)/pedidos/page.tsx` con lista de órdenes
- [ ] Conecta el repo de GitHub a Vercel
- [ ] Agrega todas las variables de entorno en Vercel
- [ ] Despliega y verifica que `[dominio].vercel.app/tienda/[slug]` funciona en producción
- [ ] Crea 3 tiendas demo con productos y fotos reales de Instagram
 
### Días 4–5 — Ventas
 
- [ ] Identifica 50 tiendas activas en Instagram Medellín (ropa, joyería, snacks)
- [ ] Para cada una: crea su tienda demo con sus productos reales en tu app
- [ ] Envía DM: *"Hola [nombre], te armé una tienda gratis para cerrar pedidos en 30 seg: [link]"*
- [ ] Graba un video de 30 segundos: link → carrito → mensaje WhatsApp
- [ ] Envía el video en DM de seguimiento si no responden en 24h
 
### Días 6–7 — Cierre y Cobro
 
- [ ] Cobra USD $30 por Nequi o transferencia directa
- [ ] Activa la cuenta poniendo `active: true` en Prisma Studio
- [ ] Documenta el feedback de cada cliente
- [ ] **Meta:** 10 clientes = USD $300 en la primera semana
 
---
 
## 10. Diferencias Clave: Next.js 15 vs 16 / Clerk v6 vs v7
 
Guía rápida para no cometer errores al seguir tutoriales desactualizados.
 
| Tema | Versión anterior (obsoleta) | Versión actual |
|---|---|---|
| Archivo de middleware | `middleware.ts` | `proxy.ts` |
| `params` en páginas | `params.slug` (objeto directo) | `(await params).slug` (Promise) |
| `auth()` en Clerk | Síncrono: `auth()` | Async: `await auth()` |
| `protect()` en Clerk | `auth().protect()` | `await auth.protect()` |
| Bundler por defecto | Webpack (Turbopack opcional) | Turbopack (Webpack con `--webpack`) |
| `create-next-app` | Preguntas interactivas | `--yes` acepta defaults automáticamente |
 
---
 
## 11. Roadmap Post-Lanzamiento
 
### Semana 2 — Retención
- Notificaciones por email al vendedor cuando llega un pedido (Resend)
- Panel de estadísticas: tasa de conversión, productos más vendidos
- QR de Nequi en la página de confirmación del pedido
 
### Mes 2 — Crecimiento
- Integración con Wompi para pagos en línea opcionales
- Múltiples imágenes por producto con galería
- Variantes de producto (tallas, colores)
- Link de catálogo optimizado para stories de Instagram
 
### Mes 3 — Escala
- Plan Team para tiendas con varios colaboradores
- API pública para integración con otras herramientas
- Expansión a México y Venezuela
 
---
 
> **Regla de oro:** No construyas features que ningún cliente activo te haya pedido. Valida cada decisión con los primeros 10 usuarios antes de escribir una sola línea de código extra.