# Kova

Kova is an autonomous remittance MVP that turns a natural-language payment instruction into a rail comparison, a routed transfer, and a public Kite Chain proof. The stack combines Next.js 14, tRPC, Prisma, Supabase Auth, Wise and Kotani quote integrations, Kite AA flows, and a demo-friendly UI that makes savings and attestation data easy to understand.

## Architecture

```text
Browser UI (Next.js App Router + shadcn/ui + Zustand)
        |
        v
tRPC procedures + App Router APIs
        |
        +--> Prisma + Postgres (users, wallets, recipients, transfers, logs)
        +--> Supabase Auth + Storage (sessions, KYC file uploads)
        +--> Rail adapters (Wise, Kotani, Kite native, mock fallback)
        +--> Twilio notifications
        |
        v
Kite Chain services (Agent Passport, x402, gasless relay, attestations)
```

## Prerequisites

- Node.js 18 or newer
- pnpm 10 or newer
- A Postgres database for Prisma
- A Supabase project for auth and storage
- Kite testnet access and a funded service key for live signed writes
- Wise sandbox credentials
- Kotani sandbox credentials
- Twilio credentials for SMS notifications

## Installation

```bash
pnpm install
copy .env.example .env.local
```

Fill in `.env.local` with your real credentials, then initialize the database:

```bash
npx prisma migrate dev
pnpm db:seed
```

## Running Locally

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

Additional validation commands:

```bash
pnpm lint
pnpm test
pnpm test:e2e
pnpm build
pnpm vercel:build
```

## Demo Mode

Set `DEMO_MODE=true` in `.env.local` to enable the guided judge experience.

- Dashboard shows a dedicated guided-demo launch card.
- `/send` auto-runs the seeded `Send $150 to Nigeria` transfer with paced reveals.
- Twilio notifications are logged instead of sent when demo mode is active.
- The public attestation and history flow stay wired to the same seeded story.

## Kite Integration Guide

Kova keeps Kite integration in `src/lib/kite/*` and `src/lib/config/kite.ts`.

- Agent Passport: `registerPassport` provisions a deterministic passport address for the user and stores it on the `User` and `Wallet` records.
- x402 payments: `chargeRailQuery` fetches an x402 challenge and records per-query micropayment attempts in `AgentLog`.
- Native settlement: `sendUSDCFromPassport` and `sendUSDC` use the Kite AA SDK plus gasless helpers to construct Kite-native transfers.
- Attestations: `buildAttestationPayload` assembles the route evidence, and `publishAttestation` anchors it on-chain for the public attestation viewer.

## Demo Walkthrough

1. Open `/dashboard` and confirm the seeded `$1,000.00` wallet balance and recent transfer feed.
2. Navigate to `/send`, keep the default `Send $150 to Nigeria` intent, and let Kova compare routes.
3. Watch the execution steps complete, then open the generated attestation page.
4. Visit `/history` to inspect the saved rail comparison and export CSV data.
5. Visit `/wallet` and `/profile` to review passport stats, KYC status, and saved recipients.

Screenshot placeholders:

- `public/screenshots/dashboard.png` - Dashboard with balance card, transfer feed, and wallet summary.
- `public/screenshots/send-flow.png` - Route comparison and execution steps during a transfer.
- `public/screenshots/attestation.png` - Public attestation view with queried rails and verification status.

## Testing Notes

- Playwright uses an auto-started local Next.js server from `playwright.config.ts`.
- The frontend currently runs in a demo-friendly mode when Supabase is not configured, so protected routes remain reviewable during local development.
- Live Kite reads are real today, while signed writes require `KITE_SERVICE_PRIVATE_KEY`.

## Deployment

Live deployment URL placeholder: `https://your-kova-deployment.vercel.app`

Vercel is configured through `vercel.json`, and `pnpm vercel:build` runs the local deployment build check before shipping.

## Roadmap

- Replace demo data with full live tRPC-backed queries across dashboard, wallet, and history views.
- Finish production payout execution flows for Wise and Kotani, not just quote retrieval.
- Add richer KYC review workflows, admin tooling, and operator analytics.
- Introduce dedicated demo mode orchestration and seeded proof tours for hackathon judging.
