import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  '/',
  '/pricing',
  '/enterprise',
  '/solutions(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/sso-callback(.*)',
  '/tienda(.*)',
  '/explorar(.*)',
  '/work(.*)',
  '/sitemap.xml',
  '/robots.txt',
  '/api/whatsapp/webhook(.*)',
  '/api/whatsapp/flows(.*)',
  '/api/whatsapp/sync-cart(.*)',
  '/api/webhook(.*)',
  '/api/webhooks(.*)',
  '/api/checkout/(.*)',
  '/api/orders/status(.*)',
  '/api/orders/invoice/(.*)',
  '/api/orders/(.*)/report',
  '/api/cron/(.*)',
  '/api/agent/flashy(.*)',
  '/api/explore/assistant(.*)',
  '/api/breb/payment-intents(.*)',
  '/api/breb/proofs(.*)',
  '/pay(.*)',
  '/api/qr(.*)',
  '/legal(.*)'
]);

export const proxy = clerkMiddleware(async (auth, request) => {
  const url = new URL(request.url);
  const ref = url.searchParams.get("ref");
  const isPublicOrderCreation =
    request.nextUrl.pathname === '/api/orders' && request.method === 'POST';

  if (!isPublicRoute(request) && !isPublicOrderCreation) {
    const { userId } = await auth();
    if (!userId) {
      if (request.nextUrl.pathname.startsWith('/api/')) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
      }
      await auth.protect();
    }
  }

  if (ref) {
    const response = NextResponse.next();
    response.cookies.set("referred_by_slug", ref, {
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
      httpOnly: false, // Must be accessible on client side
    });
    return response;
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|xml|txt)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
