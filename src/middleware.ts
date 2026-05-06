import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/legal/(.*)",
  "/sitemap.xml",
  "/robots.txt",
  "/opengraph-image(.*)",
  "/support",
  "/api/paddle/webhook",
]);

export default clerkMiddleware(async (auth, request) => {
  // Let search engine bots bypass Clerk auth entirely to prevent redirect errors
  const userAgent = request.headers.get("user-agent") || "";
  const isBot = /Googlebot|bingbot|Baiduspider|YandexBot|DuckDuckBot|Slurp|Applebot|NaverBot|Yeti/i.test(userAgent);

  if (isBot) {
    // Bots should only see public pages; protected pages are blocked by robots.txt
    return NextResponse.next();
  }

  const { userId } = await auth();

  // Logged-in users hitting landing page → redirect to dashboard
  if (userId && request.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!isPublicRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
