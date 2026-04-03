import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { NextResponse, type NextRequest } from "next/server";
import { getSupabaseConfig, isSupabaseConfigured } from "@/lib/supabase";

function buildLoginRedirect(request: NextRequest): NextResponse {
  const loginUrl = new URL("/auth/login", request.url);
  loginUrl.searchParams.set("redirectedFrom", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

function shouldBypassProtectedRoutes() {
  return (
    process.env.NODE_ENV === "development" ||
    process.env.PLAYWRIGHT_TEST === "true" ||
    process.env.DEMO_MODE === "true" ||
    process.env.KOVA_LOCAL_AUTH_BYPASS === "true"
  );
}

export async function middleware(request: NextRequest) {
  if (shouldBypassProtectedRoutes()) {
    return NextResponse.next();
  }

  if (!isSupabaseConfigured()) {
    return buildLoginRedirect(request);
  }

  const config = getSupabaseConfig();
  if (!config) {
    return buildLoginRedirect(request);
  }

  const response = NextResponse.next();
  const supabase = createServerClient(config.url, config.anonKey, {
    cookies: {
      getAll: () =>
        request.cookies.getAll().map((cookie) => ({
          name: cookie.name,
          value: cookie.value,
        })),
      setAll: (cookies) => {
        cookies.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return buildLoginRedirect(request);
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/send",
    "/history",
    "/profile",
    "/wallet",
    "/onboarding/:path*",
  ],
};
