# AGENTS.md

General instructions for coding agents working on this repository.

## Repository identity

This is LocalOps Platform, a modular SaaS foundation for micro-SME operating systems.

The current active product layer is ObraRentable OS for small trades businesses.

## Do not break the platform

Agents must not convert this repo into a single-purpose app in a way that destroys future vertical extensibility.

The current product visible to users can be ObraRentable OS, but the architecture must remain modular.

## Internal naming

Architecture must be English-first.

User-facing Spanish copy is allowed.

## Approved current work

Safe current work includes:

- ObraRentable UI slices
- construction vertical types
- mock data
- session store updates
- invoice/report/export mock flows
- local demo features
- documentation
- rules
- tests/typecheck/build fixes

## Forbidden without approval

- real Supabase integration
- real auth
- real OCR
- real AI calls
- real payment processing
- real tax/accounting submission
- deleting major architecture
- broad route renames
- package installs
- dependency upgrades
- git write actions
- production deploys

## Validation

After meaningful code changes, run:

- npx tsc --noEmit
- npm run build

Summaries should include:

- files added
- files changed
- routes added/updated
- what remains mocked
- risks/limitations
- next recommended slice
