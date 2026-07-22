import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/sso-callback(.*)',
  '/tienda(.*)',
  '/explorar(.*)',
  '/work(.*)',
  '/sitemap.xml',
  '/robots.txt',
  '/api/whatsapp/webhook(.*)',
  '/api/webhook/(.*)',
  '/api/checkout/(.*)',
  '/api/cron/(.*)',
  '/api/agent/flashy(.*)',
  '/api/explore/assistant(.*)',
  '/api/breb/payment-intents(.*)',
  '/pay(.*)',
  '/api/qr(.*)',
  '/legal(.*)'
]);

export const proxy = clerkMiddleware(async (auth, request) => {
  console.log("=== CLERK PROXY CALLED FOR ===", request.nextUrl.pathname);
  const url = new URL(request.url);
  const ref = url.searchParams.get("ref");

  if (!isPublicRoute(request)) {
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
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|xml)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
