import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/sso-callback(.*)',
  '/api(.*)',
  '/tienda(.*)',
  '/explorar(.*)',
  '/work(.*)',
  '/sitemap.xml',
  '/robots.txt'
]);

const clerkHandler = clerkMiddleware(async (auth, request) => {
  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export async function proxy(request: any, event: any) {
  console.log("=== NEXT.JS PROXY CALLED FOR ===", request.nextUrl.pathname);
  return clerkHandler(request, event);
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|xml)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
