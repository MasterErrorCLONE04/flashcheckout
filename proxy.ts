import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'

const isPublicRoute = createRouteMatcher([
  '/',
  '/tienda/(.*)',
  '/api/orders(.*)',
  '/api/checkout/store(.*)',
  '/api/webhook/stripe(.*)', // Stripe firma el cuerpo; no hay sesión Clerk
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/explorar(.*)',
  '/work/doc(.*)',
])

export default clerkMiddleware(async (auth, req) => {
  if (!isPublicRoute(req)) {
    await auth.protect()
  }
})

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
