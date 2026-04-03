import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { applyRateLimit } from "@/lib/api/rate-limit";
import { appRouter } from "@/server/routers";
import { createTRPCContext } from "@/server/trpc";

const handler = (request: Request) => {
  const rateLimit = applyRateLimit(request, {
    namespace: "trpc",
    limit: 120,
    windowMs: 60_000,
  });

  if (!rateLimit.allowed) {
    return Response.json(
      {
        error: {
          code: "TOO_MANY_REQUESTS",
          message: "Rate limit exceeded. Please retry in a moment.",
        },
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfterSeconds),
          "X-RateLimit-Limit": String(rateLimit.limit),
          "X-RateLimit-Remaining": String(rateLimit.remaining),
          "X-RateLimit-Reset": String(rateLimit.resetAt),
        },
      },
    );
  }

  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: request,
    router: appRouter,
    createContext: () =>
      createTRPCContext({
        headers: request.headers,
      }),
  });
};

export { handler as GET, handler as POST };
