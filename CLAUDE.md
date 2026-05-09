# CLAUDE.md

This file gives Claude Code operating instructions for this repository.

## Project

This repository is **LocalOps Platform**, a modular multi-tenant SaaS foundation.

The first focused product layer is **ObraRentable OS**, built on the internal `construction` vertical.

## Current priority

Build ObraRentable OS as a local/session-store MVP for solo tradespeople and small trade teams.

Target users:

- small reformistas
- electricians
- plumbers
- painters
- installers
- carpenters
- maintenance technicians
- micro-businesses of 1–5 people

## Product promise

“Menos Excel, menos papeles, menos olvidos. Trabajos, presupuestos, facturas, gastos, cobros y reports para tu gestor en una sola app.”

## Architecture rules

- Keep LocalOps modular foundation.
- Keep internal vertical key as `construction`.
- Keep Pharma and Dental architecture available.
- Do not make ObraRentable a separate app.
- ObraRentable OS is the user-facing product name.
- Internal architecture must be English-first.
- Spanish only for user-facing copy.

## Current MVP boundaries

Do not implement without explicit approval:

- real Supabase persistence
- real Supabase Auth
- real OCR
- real AI API calls
- real payments
- real email/WhatsApp
- real bank reconciliation
- real tax filing
- real accounting integrations
- real Unycop integration

## Implementation style

Prefer small slices:

1. types
2. mock data
3. pure helpers
4. store update
5. UI slice
6. typecheck/build
7. summary

Keep code TypeScript strict.
Avoid `any`.
Avoid hardcoding mock data inside UI components.
Reuse existing components where sensible.
Avoid broad architecture rewrites.

## Safe commands

Allowed:

- npx tsc --noEmit
- npm run build
- npm run lint
- git status
- git diff --stat
- git diff --name-only

Ask before:

- npm install
- package.json changes
- git write actions
- destructive commands
- database migrations
- deploys
- .env changes
- major renames
