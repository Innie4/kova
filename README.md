# Kova

Kova is an autonomous remittance MVP built around Kite Chain primitives: Agent Passport identity, x402 micropayments for rail discovery, gasless settlement, and public transfer attestations. This repository is currently in Phase 0 bootstrap, with the implementation plan captured in `PLAN.md` and active build state tracked in `PROGRESS.md`.

## Current Status

- Phase 0 scaffold complete
- Branding normalized from the original RemitAgent PRD to Kova
- Next up: Prisma, Supabase auth, and tRPC foundation

## Commands

```bash
pnpm dev
pnpm lint
pnpm test
pnpm test:e2e
pnpm build
```

## Working Notes

- `PLAN.md` contains the target file map, API surface, schema, env vars, and phase gates.
- `PROGRESS.md` is the recovery point for resumable work.
- `CLAUDE.md` captures repo conventions, architecture decisions, and Kite testnet references.

## References Reviewed

- PRD source: `C:\Users\Itoro\Downloads\RemitAgent_PRD.docx`
- Logo source: `C:\Users\Itoro\Downloads\Kova Logo.png`
- Kite docs: `docs.gokite.ai`
- Design references: Mercury, Linear, Ramp, Stripe, Wealthfront, Plaid, Circle, Cosmos, Perplexity, Resend, Raycast, Vercel, Wise, and Duolingo

The production README outlined in the PRD Appendix C will replace this bootstrap version in the hardening phase.
