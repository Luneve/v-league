import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Volunteer route prefixes (route group: (volunteer))
const VOLUNTEER_ROUTES = ["/feed", "/profile", "/opportunity", "/leaderboard", "/notifications", "/applications"];
// Org route prefixes (route group: (org))
const ORG_ROUTES = ["/org"];
// Admin route prefixes (route group: (admin))
const ADMIN_ROUTES = ["/admin"];

function matchesAny(pathname: string, prefixes: string[]): boolean {
  return prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session if expired
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isAuthPage = pathname.startsWith("/auth");

  // Protect routes: redirect unauthenticated users to login
  if (!user && !isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/login";
    return NextResponse.redirect(url);
  }

  // Read role from JWT user_metadata (set at signup) to avoid a DB query per request.
  // Falls back to profiles table only if metadata is missing (e.g. older accounts).
  let role: string | undefined = user?.user_metadata?.role;
  if (user && !role) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();
    role = profile?.role;
  }

  // If authenticated user visits auth pages, redirect to appropriate home
  if (user && isAuthPage) {
    const url = request.nextUrl.clone();
    if (role === "organization") {
      url.pathname = "/org/dashboard";
    } else if (role === "admin") {
      url.pathname = "/admin/dashboard";
    } else {
      url.pathname = "/feed";
    }
    return NextResponse.redirect(url);
  }

  // Role-based route protection
  if (user && !isAuthPage) {
    const url = request.nextUrl.clone();

    if (role === "volunteer") {
      if (matchesAny(pathname, ORG_ROUTES) || matchesAny(pathname, ADMIN_ROUTES)) {
        url.pathname = "/feed";
        return NextResponse.redirect(url);
      }
    } else if (role === "organization") {
      if (matchesAny(pathname, VOLUNTEER_ROUTES) || matchesAny(pathname, ADMIN_ROUTES)) {
        url.pathname = "/org/dashboard";
        return NextResponse.redirect(url);
      }
    } else if (role === "admin") {
      if (matchesAny(pathname, VOLUNTEER_ROUTES) || matchesAny(pathname, ORG_ROUTES)) {
        url.pathname = "/admin/dashboard";
        return NextResponse.redirect(url);
      }
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon file)
     * - public folder assets
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
