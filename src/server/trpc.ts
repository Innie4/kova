import { TRPCError, initTRPC } from "@trpc/server";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Session } from "@supabase/supabase-js";
import { getSupabaseConfig, isSupabaseConfigured } from "@/lib/supabase";
import { db } from "@/server/db";

type SupabaseLike = {
  auth: {
    getSession: () => Promise<{ data: { session: Session | null } }>;
  };
} | null;

type CreateContextOptions = {
  headers: Headers;
  supabaseClient?: SupabaseLike;
};

async function resolveSupabaseClient(
  override?: SupabaseLike,
): Promise<SupabaseLike> {
  if (override !== undefined) {
    return override;
  }

  if (!isSupabaseConfigured()) {
    return null;
  }

  const config = getSupabaseConfig();
  if (!config) {
    return null;
  }

  const cookieStore = cookies();

  return createServerClient(config.url, config.anonKey, {
    cookies: {
      getAll: () =>
        cookieStore.getAll().map((cookie) => ({
          name: cookie.name,
          value: cookie.value,
        })),
      setAll: () => {
        // tRPC context only needs read access to the current auth cookies.
      },
    },
  });
}

export async function createTRPCContext({
  headers,
  supabaseClient,
}: CreateContextOptions) {
  const resolvedSupabase = await resolveSupabaseClient(supabaseClient);

  let session: Session | null = null;
  if (resolvedSupabase) {
    try {
      const result = await resolvedSupabase.auth.getSession();
      session = result.data.session;
    } catch {
      session = null;
    }
  }

  return {
    db,
    headers,
    supabase: resolvedSupabase,
    session,
  };
}

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;

const t = initTRPC.context<TRPCContext>().create();

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;
export const protectedProcedure = t.procedure.use(async ({ ctx, next }) => {
  if (!ctx.session?.user) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "You must be signed in to access this resource.",
    });
  }

  return next({
    ctx: {
      ...ctx,
      session: ctx.session,
    },
  });
});
