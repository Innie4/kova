import { createTRPCRouter, publicProcedure } from "@/server/trpc";

export const appRouter = createTRPCRouter({
  health: publicProcedure.query(() => ({
    status: "ok",
    service: "kova-api",
    timestamp: new Date().toISOString(),
  })),
  viewer: publicProcedure.query(({ ctx }) => ({
    isAuthenticated: Boolean(ctx.session?.user),
    email: ctx.session?.user.email ?? null,
  })),
});

export type AppRouter = typeof appRouter;
