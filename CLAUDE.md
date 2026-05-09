# CLAUDE.md

This file gives Claude Code operating instructions for this repository.

## Project

This repository is **LocalOps Platform**, a modular multi-tenant SaaS foundation
for vertical operating systems serving small local businesses (pharmacies,
construction trades, dental clinics, and more).

Each vertical is a specialized operating layer with its own canonical model,
modules, and integrations, while reusing the LocalOps shell, workspace, roles,
imports, reports, tasks, audit, and integration primitives.

## Current priority

Build **PharmaOps MVP** as the first serious vertical module for Spanish
community pharmacies. PharmaOps lives as a **standalone Next.js app inside
`pharmaops/`** so it can move fast without destabilising the existing
`construction` (ObraRentable OS) and `dental` verticals already in this repo.

PharmaOps positioning: *the business control layer above the pharmacy software*.
It is **not** a replacement for Unycop, Farmatic or Nixfarma, **not** a
prescription system, **not** a certified e-invoicing product, and **not** a
patient CRM.

Target users:

- pharmacy owners (titulares)
- pharmacy managers (regentes / adjuntos)
- staff with limited operational access
- accountants (gestores) who consume reports and exports

## Active product layers

| Layer | Status | Location |
|---|---|---|
| PharmaOps MVP | **Active priority** | `pharmaops/` (standalone Next.js app) |
| ObraRentable OS demo | Available, on hold | root `app/`, `lib/construction/`, `types/construction.ts` |
| Dental vertical | Architecture only | `lib/dental/`, `types/dental.ts` |
| LocalOps core | Shared primitives | `lib/core/`, `lib/permissions/`, `lib/modules/`, `lib/integrations/`, `types/core.ts` |

ObraRentable OS work is paused but its code, types and routes must remain
intact and importable.

## Architecture rules

- Keep LocalOps modular foundation. Never collapse it into a single-product app.
- Internal architecture is **English-first**. Spanish only for user-facing copy.
- Internal vertical keys stay stable: `pharma`, `construction`, `dental`.
- Do not delete or rename existing vertical types/lib without explicit approval.
- PharmaOps is a self-contained Next.js app in `pharmaops/` with its own
  `package.json`, `tsconfig`, `tailwind.config`, and Supabase migrations.
- Shared concepts (workspace, roles, audit, imports, reports, tasks,
  integrations) should be modeled in PharmaOps in a way that can later be
  promoted into LocalOps core.

## PharmaOps MVP boundaries

The MVP must run end-to-end (auth, imports, dashboard, suppliers, finance,
reports, integrations, demo data) but the following remain explicitly
**out of scope** until the user approves them:

- patient-level data, prescription records, electronic prescription connection
- direct Unycop / Farmatic / Nixfarma API or DB integration (file-based only)
- VeriFactu / certified e-invoicing
- real payments, banking, or bank reconciliation
- real tax filing or accounting submission to AEAT
- real OCR
- real AI API calls
- real email / WhatsApp messaging
- production deploys

For each of those, ship the architecture (adapters, types, UI placeholders,
clear disclaimers) but do not implement the live integration.

## Implementation style

Prefer small slices, in this order:

1. types
2. mock / demo data
3. pure helpers and validators
4. Supabase schema or store update
5. UI slice
6. typecheck / build
7. summary

Rules:

- TypeScript strict, no `any`.
- Server-side validation with Zod for any imported / user-supplied data.
- No mock data hardcoded inside UI components — always via `lib/.../demo` or store.
- Reuse existing components where sensible; do not fork the UI kit per page.
- No broad architecture rewrites without approval.
- Compliance disclaimers must be visible in the UI for finance, reports,
  imports, and integrations screens.

## Safe commands (no approval needed)

- `npx tsc --noEmit`
- `npm run build` (within `pharmaops/` or root)
- `npm run lint`
- `npm run check`
- `git status`, `git status --short --untracked-files=all`
- `git diff`, `git diff --stat`, `git diff --name-only`
- `git log --oneline -5`
- `git branch --show-current`

## Ask before

- `npm install` / any package add or upgrade
- `package.json` changes
- any `git` write action (`add`, `commit`, `push`, `checkout`, `branch -d`,
  `merge`, `rebase`, `reset --hard`)
- destructive filesystem commands
- Supabase remote changes (project create, migrations push, RLS changes
  applied to a remote project, storage bucket creation)
- `.env` changes or secret handling
- deployments (Vercel, Supabase, etc.)
- major renames or directory moves
- any change that could plausibly imply a regulatory / fiscal / health claim
