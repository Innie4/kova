type RateLimitConfig = {
  namespace: string;
  limit: number;
  windowMs: number;
};

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

type RateLimitResult = {
  allowed: boolean;
  limit: number;
  remaining: number;
  retryAfterSeconds: number;
  resetAt: number;
};

const DEFAULT_RATE_LIMIT_CONFIG: RateLimitConfig = {
  namespace: "default",
  limit: 120,
  windowMs: 60_000,
};

const RATE_LIMIT_STORE_KEY = "__kovaRateLimitStore";

function getRateLimitStore(): Map<string, RateLimitBucket> {
  const globalStore = globalThis as typeof globalThis & {
    [RATE_LIMIT_STORE_KEY]?: Map<string, RateLimitBucket>;
  };

  if (!globalStore[RATE_LIMIT_STORE_KEY]) {
    globalStore[RATE_LIMIT_STORE_KEY] = new Map<string, RateLimitBucket>();
  }

  return globalStore[RATE_LIMIT_STORE_KEY]!;
}

function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "unknown";
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}

function buildClientKey(request: Request, namespace: string): string {
  const ip = getClientIp(request);
  const userAgent = request.headers.get("user-agent") ?? "unknown-agent";
  return `${namespace}:${ip}:${userAgent}`;
}

function pruneExpiredBuckets(store: Map<string, RateLimitBucket>, now: number) {
  store.forEach((bucket, key) => {
    if (bucket.resetAt <= now) {
      store.delete(key);
    }
  });
}

export function applyRateLimit(
  request: Request,
  config: Partial<RateLimitConfig> = {},
): RateLimitResult {
  const resolvedConfig = {
    ...DEFAULT_RATE_LIMIT_CONFIG,
    ...config,
  };

  const now = Date.now();
  const store = getRateLimitStore();
  pruneExpiredBuckets(store, now);

  const key = buildClientKey(request, resolvedConfig.namespace);
  const existingBucket = store.get(key);

  if (!existingBucket || existingBucket.resetAt <= now) {
    const resetAt = now + resolvedConfig.windowMs;
    store.set(key, {
      count: 1,
      resetAt,
    });

    return {
      allowed: true,
      limit: resolvedConfig.limit,
      remaining: Math.max(0, resolvedConfig.limit - 1),
      retryAfterSeconds: Math.ceil(resolvedConfig.windowMs / 1000),
      resetAt,
    };
  }

  if (existingBucket.count >= resolvedConfig.limit) {
    return {
      allowed: false,
      limit: resolvedConfig.limit,
      remaining: 0,
      retryAfterSeconds: Math.max(
        1,
        Math.ceil((existingBucket.resetAt - now) / 1000),
      ),
      resetAt: existingBucket.resetAt,
    };
  }

  existingBucket.count += 1;
  store.set(key, existingBucket);

  return {
    allowed: true,
    limit: resolvedConfig.limit,
    remaining: Math.max(0, resolvedConfig.limit - existingBucket.count),
    retryAfterSeconds: Math.max(
      1,
      Math.ceil((existingBucket.resetAt - now) / 1000),
    ),
    resetAt: existingBucket.resetAt,
  };
}
