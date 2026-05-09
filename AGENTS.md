# AGENTS.md

General instructions for coding agents working on this repository.

## Repository identity

This is **LocalOps Platform**, a modular SaaS foundation for vertical operating
systems serving small local businesses.

The **active product layer** is **PharmaOps MVP**, built as a standalone
Next.js app inside `pharmaops/`. Other verticals (ObraRentable OS in
`construction`, plus `dental`) remain available but on hold.

## Do not break the platform

- Agents must not convert this repo into a single-purpose app or destroy
  vertical extensibility.
- Existing vertical code (`lib/construction/`, `lib/dental/`, `lib/pharma/`,
  `types/construction.ts`, `types/dental.ts`, `types/pharma.ts`) and the root
  `app/` routes must remain intact and importable.
- PharmaOps work happens inside `pharmaops/`. Do not move it into root unless
  explicitly approved.

## Internal naming

- Architecture must be **English-first**.
- User-facing **Spanish** copy is allowed and expected for PharmaOps screens.
- Internal vertical keys stay stable: `pharma`, `construction`, `dental`.

## Approved current work (PharmaOps MVP)

Safe current work includes:

- PharmaOps types, adapters, validators, demo data
- Supabase schema files inside `pharmaops/supabase/` (local files only — never
  push to a remote Supabase project without approval)
- App shell, navigation, route slices inside `pharmaops/app/`
- Dashboard, imports, suppliers, finance, reports, tasks, integrations,
  settings UI slices
- PDF/Excel report generation (local, on-demand)
- Local mock auth or session-store auth scaffolding
- Documentation, READMEs, compliance disclaimer copy
- typecheck / build / lint runs

Continued safe work for **ObraRentable OS** is preserving the existing code —
do not refactor or delete it during PharmaOps work.

## Forbidden without approval

- real Supabase connection / live data writes against a remote project
- real Supabase Auth wired against a real project
- real Unycop / Farmatic / Nixfarma API or database integration
- real OCR, AI API calls, payments, email, WhatsApp, banking
- real tax / accounting submission, VeriFactu certification claims
- patient-level or prescription-level data handling
- deleting major architecture (vertical lib/, types/)
- broad route renames or directory moves
- package installs or dependency upgrades
- git write actions (add, commit, push, checkout, branch, merge, rebase, reset)
- production deploys
- `.env` changes or any secret handling

## Validation

After meaningful code changes, run from the relevant package root:

- `npx tsc --noEmit`
- `npm run build`
- `npm run lint` (when lint config is present)

Summaries should include:

- files added
- files changed
- routes added / updated
- what remains mocked
- compliance disclaimers added or updated
- risks / limitations
- next recommended slice
