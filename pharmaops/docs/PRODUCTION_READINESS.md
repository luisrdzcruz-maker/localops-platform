# PharmaOps — Production Readiness Checklist

This document tracks what PharmaOps is ready to do today, what is still
demo-only, and what must happen before the first real pilot with a real
pharmacy. It is a living document — update it as services land.

The branch this document lives on (`experiment/pharmaops-production-shell`)
is an intentional **production-ready shell**. The UI feels finished. The
external services it would talk to in production are not yet connected.

## Ready now (demo)

- Public landing with honest scope copy.
- Authenticated app shell with sidebar, topbar, mobile drawer.
- Dashboard KPIs, recent imports, tasks, supplier spend, sales chart.
- File-based imports: Unycop / Farmatic / Nixfarma adapters + generic.
- Validation pipeline with Zod and visible row-level errors.
- Suppliers list and detail view with metrics and monthly trend.
- Finance: expenses, supplier invoices, VAT estimate, cash-flow projection.
- Documents intake with metadata-only persistence (file bytes never leave
  the browser).
- Mock OCR provider with deterministic extraction proposals + human review.
- Reports as downloadable PDF and Excel/CSV.
- Auto-generated tasks (supplier payments, expiries, import errors).
- Integrations centre with adapter status, diagnostics, downloadable templates.
- Settings: pharmacy profile (read-only), roles, plantillas, privacy notes,
  and a "Servicios externos" table reflecting actual connection status.
- Runtime mode primitive (`lib/pharmaops/runtimeMode.ts`) + persistent
  "Modo demo" pill in the topbar.
- Service boundary registry (`lib/pharmaops/serviceBoundary.ts`) — single
  source of truth for what is connected vs. mocked.
- Route-level `error.tsx` and `not-found.tsx`.
- Compliance disclaimers visible in finance, reports, imports, integrations,
  documents and the public footer.

## Not production-connected yet

The following are intentionally absent in this branch. The architecture is
ready for each of them; the wiring is not.

- Supabase persistence (Postgres + RLS) for workspaces, imports, finance,
  tasks, audit logs.
- Supabase Auth for login, role enforcement and staff invitations.
- Real file storage for `/documents`. Today only metadata is kept in memory.
- Real OCR backend (Azure Document Intelligence, AWS Textract, Google
  Document AI). The `OcrProvider` interface is in place; only the mock
  provider produces real output.
- Email / WhatsApp / SMS notifications.
- Direct Unycop / Farmatic / Nixfarma API or DB integration. MVP is
  file-based by design.
- VeriFactu / certified e-invoicing.
- Real banking or payment integration.
- Real tax filing or AEAT submission.
- Immutable audit log (the demo store keeps an in-memory log; production
  needs an append-only table with RLS and retention policy).

## Before a real pilot

These steps must happen — in this order — before any pharmacy uses PharmaOps
against real data:

1. **Stand up a Supabase dev project**: schema, RLS, seeded roles. Verify
   that every read path that calls `getDemoState()` has a Supabase repo
   alternative.
2. **Wire Supabase Auth**: replace the demo session helper with real auth,
   protect `(app)/*` routes, persist memberships.
3. **Storage**: pick one of Supabase Storage or S3 for original document
   files. Lock down access via signed URLs. Document retention.
4. **RLS audit**: pen-test each table for cross-workspace leakage. Block any
   server action that does not assert the workspace.
5. **Logs and observability**: server log retention, error reporting,
   request-level audit log on imports/extractions.
6. **Data retention policy**: how long imports, extraction proposals and
   documents are kept. Make it visible in Settings → Privacy.
7. **Privacy / DPA review**: written processor agreement, mapping of all
   subprocessors (Supabase, OCR provider, hosting).
8. **Export template validation**: walk through every adapter with a real
   pharmacy export to make sure column mappings still hold.
9. **OCR provider validation**: end-to-end test with real (anonymised)
   invoices. Confirm accuracy thresholds; keep human review mandatory.
10. **Accountant report formats**: confirm CSV / PDF layouts against the
    target gestoría's expected inputs.
11. **Pilot agreement**: signed pilot agreement explicitly noting that
    PharmaOps does not replace official pharmacy software, does not connect
    to electronic prescriptions, and does not certify fiscal compliance.

## Out of scope (will stay out)

These are out of scope by design and should remain so even after a pilot:

- Patient-level data or prescription records.
- Electronic prescription (SNS / CCAA) connectivity.
- Auto-accounting (PharmaOps proposes, humans confirm).
- Replacement of the official pharmacy software.
- Marketing claims of "official certification" or "official integration" with
  Unycop / Farmatic / Nixfarma without written agreement from the vendor.

See [`COMPLIANCE_LIMITATIONS.md`](./COMPLIANCE_LIMITATIONS.md) for the user
facing version of these limits.

## How to check the current state

In the running app:

- Topbar pill always shows the current `RuntimeMode`.
- Settings → **Servicios externos** lists every external service with its
  computed status (connected / demo / mock / not_connected / planned /
  not_certified) and a one-line hint.
- Integrations centre shows per-adapter diagnostics and the
  "Importación por fichero" disclaimer.

In code:

- `lib/pharmaops/runtimeMode.ts` — derive the runtime mode from env.
- `lib/pharmaops/serviceBoundary.ts` — register new services here.
- `lib/ocr/provider.ts` — OCR provider resolution with safe fallback to mock.
