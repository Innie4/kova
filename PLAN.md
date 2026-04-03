# Kova Build Plan

Kova is the product name for the MVP described in the original RemitAgent PRD. This plan keeps the PRD scope, but all user-facing branding and repository naming should use `Kova`.

## Reference Inputs

- PRD: `C:\Users\Itoro\Downloads\RemitAgent_PRD.docx`
- Brand asset: `public/brand/kova-logo.png`
- Design direction:
  - Mercury for authenticated dashboard structure
  - Linear and Vercel for agent execution and step logs
  - Ramp and Wise for savings hierarchy and human fee copy
  - Stripe, Wealthfront, Plaid, Circle, and Cosmos for launch, onboarding, proof, and atmosphere
  - Perplexity, Resend, and Raycast for dense-but-clear AI tooling patterns
- Kite docs and SDK references:
  - https://docs.gokite.ai/
  - https://docs.gokite.ai/kite-chain/account-abstraction-sdk
  - https://docs.gokite.ai/kite-agent-passport/service-provider-guide
  - https://docs.gokite.ai/kite-chain/9-gasless-integration

## Planned Project Structure

```text
.
├─ CLAUDE.md
├─ PLAN.md
├─ PROGRESS.md
├─ README.md
├─ components.json
├─ next.config.mjs
├─ package.json
├─ playwright.config.ts
├─ postcss.config.mjs
├─ tailwind.config.ts
├─ tsconfig.json
├─ vercel.json
├─ vitest.config.ts
├─ vitest.setup.ts
├─ .env.example
├─ prisma
│  ├─ schema.prisma
│  └─ seed.ts
├─ public
│  ├─ brand
│  │  └─ kova-logo.png
│  ├─ demo
│  │  ├─ dashboard-shot.png
│  │  ├─ send-flow-shot.png
│  │  └─ attestation-shot.png
│  └─ icons
│     ├─ kite-mark.svg
│     ├─ kotani-mark.svg
│     ├─ mock-mark.svg
│     └─ wise-mark.svg
├─ src
│  ├─ app
│  │  ├─ (app)
│  │  │  ├─ dashboard
│  │  │  │  ├─ loading.tsx
│  │  │  │  └─ page.tsx
│  │  │  ├─ history
│  │  │  │  ├─ loading.tsx
│  │  │  │  └─ page.tsx
│  │  │  ├─ layout.tsx
│  │  │  ├─ profile
│  │  │  │  └─ page.tsx
│  │  │  ├─ send
│  │  │  │  ├─ loading.tsx
│  │  │  │  └─ page.tsx
│  │  │  └─ wallet
│  │  │     ├─ loading.tsx
│  │  │     └─ page.tsx
│  │  ├─ api
│  │  │  ├─ kyc
│  │  │  │  ├─ upload
│  │  │  │  │  └─ route.ts
│  │  │  │  └─ verify
│  │  │  │     └─ route.ts
│  │  │  ├─ trpc
│  │  │  │  └─ [trpc]
│  │  │  │     └─ route.ts
│  │  │  ├─ wallet
│  │  │  │  ├─ balance
│  │  │  │  │  └─ route.ts
│  │  │  │  └─ deposit
│  │  │  │     └─ route.ts
│  │  │  └─ webhooks
│  │  │     ├─ kotani
│  │  │     │  └─ route.ts
│  │  │     └─ wise
│  │  │        └─ route.ts
│  │  ├─ attestation
│  │  │  └─ [hash]
│  │  │     ├─ loading.tsx
│  │  │     └─ page.tsx
│  │  ├─ auth
│  │  │  ├─ login
│  │  │  │  └─ page.tsx
│  │  │  └─ verify
│  │  │     └─ page.tsx
│  │  ├─ onboarding
│  │  │  ├─ kyc
│  │  │  │  └─ page.tsx
│  │  │  ├─ layout.tsx
│  │  │  ├─ page.tsx
│  │  │  ├─ profile
│  │  │  │  └─ page.tsx
│  │  │  └─ wallet
│  │  │     └─ page.tsx
│  │  ├─ favicon.ico
│  │  ├─ globals.css
│  │  ├─ layout.tsx
│  │  └─ page.tsx
│  ├─ components
│  │  ├─ app-shell
│  │  │  ├─ app-sidebar.tsx
│  │  │  ├─ balance-chip.tsx
│  │  │  ├─ mobile-nav.tsx
│  │  │  └─ topbar.tsx
│  │  ├─ attestation
│  │  │  ├─ attestation-card.tsx
│  │  │  ├─ attestation-explainer.tsx
│  │  │  └─ attestation-log.tsx
│  │  ├─ dashboard
│  │  │  ├─ quick-send-card.tsx
│  │  │  ├─ transfer-feed.tsx
│  │  │  └─ wallet-summary.tsx
│  │  ├─ forms
│  │  │  ├─ intent-form.tsx
│  │  │  ├─ profile-form.tsx
│  │  │  ├─ recipient-form.tsx
│  │  │  └─ wallet-funding-card.tsx
│  │  ├─ providers
│  │  │  ├─ app-providers.tsx
│  │  │  ├─ query-provider.tsx
│  │  │  └─ trpc-provider.tsx
│  │  ├─ send-flow
│  │  │  ├─ execution-steps.tsx
│  │  │  ├─ rail-result-table.tsx
│  │  │  ├─ route-highlight.tsx
│  │  │  ├─ send-success.tsx
│  │  │  └─ working-feed.tsx
│  │  ├─ shared
│  │  │  ├─ empty-state.tsx
│  │  │  ├─ kova-logo.tsx
│  │  │  ├─ metric-card.tsx
│  │  │  ├─ page-header.tsx
│  │  │  ├─ section-shell.tsx
│  │  │  └─ status-badge.tsx
│  │  └─ ui
│  │     ├─ avatar.tsx
│  │     ├─ badge.tsx
│  │     ├─ button.tsx
│  │     ├─ card.tsx
│  │     ├─ dialog.tsx
│  │     ├─ input.tsx
│  │     ├─ label.tsx
│  │     ├─ progress.tsx
│  │     ├─ sheet.tsx
│  │     ├─ skeleton.tsx
│  │     ├─ sonner.tsx
│  │     └─ tabs.tsx
│  ├─ hooks
│  │  ├─ use-demo-mode.ts
│  │  ├─ use-mobile.ts
│  │  ├─ use-transfer-preview.ts
│  │  └─ use-wallet-balance.ts
│  ├─ lib
│  │  ├─ agent
│  │  │  ├─ executor.ts
│  │  │  ├─ execution-helpers.ts
│  │  │  └─ intent-parser.ts
│  │  ├─ config
│  │  │  ├─ app.ts
│  │  │  ├─ env.ts
│  │  │  └─ kite.ts
│  │  ├─ constants
│  │  │  ├─ copy.ts
│  │  │  ├─ countries.ts
│  │  │  ├─ rails.ts
│  │  │  └─ routes.ts
│  │  ├─ kite
│  │  │  ├─ attestation.ts
│  │  │  ├─ client.ts
│  │  │  ├─ gasless.ts
│  │  │  ├─ passport.ts
│  │  │  └─ x402.ts
│  │  ├─ notifications
│  │  │  └─ twilio.ts
│  │  ├─ rails
│  │  │  ├─ kite-native.ts
│  │  │  ├─ kotani.ts
│  │  │  ├─ mock.ts
│  │  │  ├─ orchestrator.ts
│  │  │  └─ wise.ts
│  │  ├─ stores
│  │  │  ├─ onboarding-store.ts
│  │  │  └─ send-flow-store.ts
│  │  ├─ supabase.ts
│  │  ├─ trpc
│  │  │  ├─ client.ts
│  │  │  └─ query-client.ts
│  │  ├─ utils.ts
│  │  └─ validations
│  │     ├─ auth.ts
│  │     ├─ kyc.ts
│  │     ├─ recipient.ts
│  │     └─ transfer.ts
│  ├─ middleware.ts
│  ├─ server
│  │  ├─ db.ts
│  │  ├─ trpc.ts
│  │  └─ routers
│  │     ├─ _app.ts
│  │     ├─ index.ts
│  │     ├─ profile.ts
│  │     ├─ transfer.ts
│  │     └─ wallet.ts
│  └─ types
│     ├─ agent.ts
│     ├─ kite.ts
│     ├─ rail.ts
│     └─ transfer.ts
└─ tests
   ├─ e2e
   │  ├─ attestation.spec.ts
   │  ├─ auth.spec.ts
   │  ├─ history.spec.ts
   │  ├─ onboarding.spec.ts
   │  ├─ send-money-large.spec.ts
   │  ├─ send-money.spec.ts
   │  └─ wallet.spec.ts
   ├─ fixtures
   │  ├─ auth.ts
   │  ├─ rails.ts
   │  └─ users.ts
   ├─ integration
   │  ├─ kite-flow.test.ts
   │  ├─ rails-orchestrator.test.ts
   │  └─ webhooks.test.ts
   └─ unit
      ├─ agent-executor.test.ts
      ├─ intent-parser.test.ts
      ├─ kite-client.test.ts
      ├─ prisma-schema.test.ts
      ├─ supabase.test.ts
      └─ trpc-context.test.ts
```

## Data Model

### `User`

- `id` string `@id`
- `email` string `@unique`
- `fullName` string?
- `phone` string?
- `country` string?
- `kitePassportAddress` string?
- `kitePassportHash` string?
- `kycStatus` enum `PENDING | SUBMITTED | VERIFIED | REJECTED`
- `notificationPreference` enum `SMS | WHATSAPP | BOTH | NONE`
- `demoModeEnabled` boolean
- `createdAt` datetime
- `updatedAt` datetime
- Relations:
  - one-to-one `wallet`
  - one-to-many `recipients`
  - one-to-many sent `transfers`

### `Wallet`

- `id` string `@id`
- `userId` string `@unique`
- `kiteAddress` string `@unique`
- `depositAddress` string?
- `usdcBalance` decimal
- `reputationScore` int
- `totalSavingsUsd` decimal
- `createdAt` datetime
- `updatedAt` datetime

### `Recipient`

- `id` string `@id`
- `userId` string
- `name` string
- `country` string
- `phone` string
- `preferredMethod` enum `WALLET | BANK | MOBILE_MONEY | CASH`
- `bankName` string?
- `bankAccountHint` string?
- `mobileNetwork` string?
- `isFavorite` boolean
- `createdAt` datetime
- `updatedAt` datetime

### `Transfer`

- `id` string `@id`
- `senderId` string
- `recipientId` string
- `amountUsd` decimal
- `feeUsd` decimal
- `savingsUsd` decimal
- `netDeliveryUsd` decimal
- `routeSelected` enum `WISE | KOTANI | KITE_NATIVE | MOCK`
- `routeReason` string
- `status` enum `DRAFT | PREVIEWED | AWAITING_CONFIRMATION | EXECUTING | COMPLETED | FAILED`
- `requiresConfirmation` boolean
- `intentRaw` string
- `kiteAttestationHash` string?
- `kiteAttestationUrl` string?
- `kiteTxHash` string?
- `notificationStatus` enum `PENDING | SENT | FAILED`
- `railsQueried` json
- `createdAt` datetime
- `completedAt` datetime?

### `RailQuery`

- `id` string `@id`
- `transferId` string
- `railName` enum `WISE | KOTANI | KITE_NATIVE | MOCK`
- `feeUsd` decimal
- `etaMinutes` int
- `rate` decimal
- `available` boolean
- `reason` string?
- `queryTimeMs` int
- `queriedAt` datetime

### `AgentLog`

- `id` string `@id`
- `transferId` string?
- `step` enum
  - `INTENT_PARSED`
  - `RAIL_QUERY_STARTED`
  - `RAIL_QUERY_COMPLETED`
  - `ROUTE_SCORED`
  - `CONFIRMATION_REQUIRED`
  - `TRANSFER_EXECUTED`
  - `ATTESTATION_WRITTEN`
  - `NOTIFICATION_SENT`
  - `ERROR`
- `detail` json
- `createdAt` datetime

### `KycDocument`

- `id` string `@id`
- `userId` string
- `documentType` enum `PASSPORT | NATIONAL_ID | DRIVERS_LICENSE`
- `frontPath` string
- `backPath` string?
- `metadataHash` string
- `attestationHash` string?
- `status` enum `UPLOADED | VERIFIED`
- `createdAt` datetime

## API Surface

### tRPC procedures

- `transfer.parseIntent`
  - input: `{ rawText: string }`
  - output: `{ amount, currency, country, recipientHint, errors? }`
- `transfer.previewTransfer`
  - input: `{ parsedIntent, recipientId }`
  - output: `{ winner, allResults, totalQueryTimeMs }`
- `transfer.executeTransfer`
  - input: `{ transferId?: string, parsedIntent, recipientId }`
  - output: `ExecutionResult`
- `transfer.confirmTransfer`
  - input: `{ transferId: string }`
  - output: `ExecutionResult`
- `transfer.getHistory`
  - input: `{ cursor?: string, status?: TransferStatus }`
  - output: `{ items, nextCursor }`
- `transfer.getAttestation`
  - input: `{ attestationHash: string }`
  - output: `AttestationView`
- `profile.getCurrentUser`
  - input: `void`
  - output: user profile and KYC state
- `profile.updateProfile`
  - input: `{ fullName, phone, country, notificationPreference }`
  - output: updated user
- `profile.upsertRecipient`
  - input: recipient payload
  - output: recipient
- `profile.deleteRecipient`
  - input: `{ recipientId: string }`
  - output: `{ success: true }`
- `wallet.getSummary`
  - input: `void`
  - output: balance, passport, savings, recent movements
- `wallet.refreshBalance`
  - input: `{ address?: string }`
  - output: `{ usdcBalance: string }`

### Route handlers

- `GET/POST /api/trpc/[trpc]`
- `POST /api/webhooks/wise`
- `POST /api/webhooks/kotani`
- `GET /api/wallet/balance`
- `POST /api/wallet/deposit`
- `POST /api/kyc/upload`
- `POST /api/kyc/verify`

## Kite Integration Checklist

- Read and follow the current GoKite AA SDK docs before implementation.
- Install and validate `gokite-aa-sdk` during the Kite phase.
- Configure testnet network:
  - chain name: `KiteAI Testnet`
  - chain id: `2368`
  - rpc: `https://rpc-testnet.gokite.ai/`
  - explorer: `https://testnet.kitescan.ai/`
- AA wallet:
  - initialize SDK with `kite_testnet`
  - use the published testnet bundler URL from Kite docs
  - derive or deploy account abstraction wallets per user
- x402:
  - return or consume `402 Payment Required` payloads per Kite service provider guide
  - support `X-PAYMENT` verification flow
  - test settlement against facilitator endpoints
  - current public facilitator base URL: `https://facilitator.pieverse.io`
- Gasless:
  - list supported tokens from `https://gasless.gokite.ai/supported_tokens`
  - post signed EIP-3009 payloads to `/testnet`
  - respect nonce, validity window, and minimum transfer amount constraints
- Attestations:
  - confirm target contract/API before implementation
  - include rails queried, rates seen, winner, reason, timestamp, and transfer hash
- Logging:
  - store every Kite request, response, and failure in `AgentLog`

## Component Inventory

### Public pages

- Marketing landing page
- Login page
- Verify email page
- Public attestation viewer

### Protected product pages

- App shell with sidebar and topbar
- Dashboard
- Send flow
- History
- Wallet
- Profile
- Onboarding profile step
- Onboarding KYC step
- Onboarding wallet step

### Shared states

- Loading skeletons for every route group
- Empty states for recipients, history, and wallet movements
- Toast notifications via Sonner
- Route status badges
- Savings summary cards
- Execution step feed

## Environment Variables

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `KITE_RPC_URL`
- `KITE_CHAIN_ID`
- `KITE_BUNDLER_RPC_URL`
- `KITE_AGENT_PRIVATE_KEY`
- `KITE_X402_ASSET_ADDRESS`
- `KITE_SETTLEMENT_CONTRACT_ADDRESS`
- `KITE_USDC_CONTRACT_ADDRESS`
- `KITE_ATTESTATION_CONTRACT_ADDRESS`
- `KITE_GASLESS_API_URL`
- `WISE_SANDBOX_API_KEY`
- `WISE_PROFILE_ID`
- `KOTANI_API_KEY`
- `KOTANI_API_URL`
- `TWILIO_ACCOUNT_SID`
- `TWILIO_AUTH_TOKEN`
- `TWILIO_PHONE_NUMBER`
- `NEXT_PUBLIC_APP_URL`
- `DEMO_MODE`

## Phase Completion Criteria

### Phase 0

- Kova project scaffold exists in this workspace.
- Base dependencies, shadcn primitives, planning docs, and branding are committed.
- `pnpm lint`, `pnpm test`, and `pnpm build` pass on the bootstrap state.

### Phase 1

- Prisma schema is implemented and migrated.
- Supabase auth works for protected and public routes.
- tRPC context and root router are functional.
- Phase 1 unit tests pass.

### Phase 2

- Kite client performs real testnet requests for passport, x402, gasless, and attestation flows.
- Responses are logged and persisted.
- Integration test covers the happy path from passport creation through attestation.

### Phase 3

- Wise, Kotani, Kite native, and mock rails are implemented.
- Rail orchestration runs in parallel and degrades gracefully.
- Scoring and route selection tests pass.

### Phase 4

- Natural-language parsing supports the PRD examples.
- Agent executor logs each step, handles confirmation thresholds, and writes final state to DB.
- Notifications fail safely.

### Phase 5

- All product pages are built and responsive at 375px width.
- Send flow works end to end in the browser.
- Loading, empty, and toast states are implemented.

### Phase 6

- Wallet, KYC, and webhook routes are functional and validated.
- Signature verification is in place for inbound webhooks.

### Phase 7

- Seed data exists and Playwright covers the main user journeys.
- `pnpm test`, `pnpm test:e2e`, `pnpm build`, and `vercel build` succeed.
- Security, performance, and env configuration are audited.

### Phase 8

- Demo mode produces the timed judge flow with compelling seeded data.
- Manual demo rehearsal completes in under 90 seconds.
