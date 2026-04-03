# Kova Conventions

## Naming and Structure

- Product name in UI copy: `Kova`
- Repo/package name: `kova`
- Use strict TypeScript everywhere.
- Prefer one file per concern.
- App Router routes live in `src/app`.
- Server-only code lives in `src/server` or `src/lib/*` server helpers.
- Shared UI belongs in `src/components`.
- Domain helpers should stay grouped by vertical:
  - `src/lib/kite/*`
  - `src/lib/rails/*`
  - `src/lib/agent/*`
  - `src/lib/notifications/*`
- Use the `@/*` import alias for repo-local imports.
- Keep database code behind `src/server/db.ts` and Prisma models.

## Commands

- `pnpm dev`
- `pnpm lint`
- `pnpm test`
- `pnpm test:e2e`
- `pnpm build`

## Architecture Decisions

- Next.js 14 App Router is the application shell and API host.
- Prisma + Postgres are the source of truth for user, recipient, transfer, and audit data.
- Supabase Auth provides email and magic-link auth.
- tRPC is the typed server boundary for app features.
- React Query handles server state.
- Zustand is reserved for local multi-step flow state.
- shadcn/ui is the component foundation, with `sonner` for toast notifications.
- External payment rails must fail soft and log richly.
- Any unavailable live rail gets a clearly labeled simulated fallback.
- Build the UI with Kova branding from the start to avoid a late rename pass.

## Kite Testnet References

- Docs host: `https://docs.gokite.ai/`
- Chain name: `KiteAI Testnet`
- Chain ID: `2368`
- RPC URL: `https://rpc-testnet.gokite.ai/`
- Explorer: `https://testnet.kitescan.ai/`
- Faucet: `https://faucet.gokite.ai`
- AA SDK package: `gokite-aa-sdk`
- AA SDK sample init:
  - network: `kite_testnet`
  - rpc: `https://rpc-testnet.gokite.ai`
  - bundler: `https://bundler-service.staging.gokite.ai/rpc/`
- Public x402 facilitator base URL: `https://facilitator.pieverse.io`
- Current x402 testnet settlement token from Kite docs: `0x0fF5393387ad2f9f691FD6Fd28e07E3969e27e63`
- Current AA settlement contract from Kite docs: `0x8d9FaD78d5Ce247aA01C140798B9558fd64a63E3`
- Current AA ClientAgentVault implementation from Kite docs: `0xB5AAFCC6DD4DFc2B80fb8BCcf406E1a2Fd559e23`
- Current gasless API base URL: `https://gasless.gokite.ai`
- Current gasless testnet token shown in docs:
  - address: `0x8E04D099b1a8Dd20E6caD4b2Ab2B405B98242ec9`
  - symbol: `PYUSD`
- Note: production attestation and USDC contract addresses should stay env-driven until validated against the latest Kite explorer or portal during implementation.
