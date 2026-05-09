# PharmaOps MVP

> "La capa de control operativo encima de tu software de farmacia."

PharmaOps is a management and reporting layer for Spanish community
pharmacies. It is **not** a replacement for Unycop, Farmatic or Nixfarma,
**not** a prescription system, **not** a patient CRM, and **not** a
certified e-invoicing product. See [`docs/COMPLIANCE_LIMITATIONS.md`](docs/COMPLIANCE_LIMITATIONS.md)
for the full list of what PharmaOps does not do.

## What you get out of the box

- Dashboard with KPIs (sales, purchases, gross margin, supplier spend,
  pending invoices, stock risk, import health, tasks due, reports).
- Imports center with end-to-end flow: upload → preview → auto-mapping →
  validation → confirm. Generic + Unycop / Farmatic / Nixfarma adapters.
- Suppliers list with spend / pending / overdue metrics + per-supplier
  detail page and 6-month spend chart.
- Finance section: expenses (with manual entry), VAT estimate, cash-flow
  estimate, accountant pack.
- Reports: monthly management, supplier spend, accountant pack, VAT
  summary, stock risk. PDF + Excel/CSV exports.
- Tasks with auto-suggested reminders (overdue invoices, near-expiry stock,
  monthly accountant pack, imports with errors).
- Integrations centre with adapter diagnostics and downloadable Excel
  templates.
- Settings: pharmacy profile, role/permission overview, import templates,
  privacy notes.
- A deterministic Spanish pharmacy demo dataset that loads on first run
  and can be reset / cleared from the dashboard or settings.

## Stack

- **Next.js 16** App Router + React 19 + TypeScript (strict)
- **Tailwind CSS v4** with a tuned PharmaOps palette
- **Supabase** (Postgres + Auth + Storage) — schema and RLS migrations
  shipped; the app runs in demo mode by default and only talks to Supabase
  when you flip the switch.
- **Zod** for row validation
- **TanStack Table** for tables, **Recharts** for charts
- **xlsx (SheetJS)** for spreadsheet IO, **pdf-lib** for PDF generation
- **lucide-react** icons

## Getting started

```bash
cd pharmaops
npm install
cp .env.example .env.local
npm run dev
```

Open http://localhost:3000 — the landing page links to the demo dashboard.

The app boots in **demo mode**
(`NEXT_PUBLIC_PHARMAOPS_DEMO_MODE=true` in `.env.example`). All data is held
in-memory, the demo dataset is seeded automatically on first request, and
nothing talks to Supabase.

### Try the import flow

1. Open `/imports`.
2. Drop one of the sample files in `data/sample-imports/` into the upload
   zone (`unycop-sample-purchases.csv`, `generic-sample-suppliers.csv`,
   `generic-sample-expenses.csv`).
3. Review the auto-detected adapter and import type, accept or override.
4. Inspect the proposed mapping in the Mapeo step.
5. Validate; PharmaOps shows a Spanish-locale error report.
6. Confirm — the dashboard KPIs and the suppliers / finance pages update
   immediately.

### Try the reports

1. Open `/reports`.
2. Pick a date range on any card and click **PDF** or **Excel/CSV**.
3. The Route Handler at `/api/reports/[type]` generates the file with
   `pdf-lib` / SheetJS and streams it as a download.
4. The "informes generados" table records each download.

## Scripts

- `npm run dev` — local dev server
- `npm run build` — production build
- `npm run check` — `tsc --noEmit`
- `npm run lint` — Next.js ESLint

## Environment variables

See `.env.example`. The required pair only kicks in when demo mode is
turned **off**:

| Var | Purpose |
|---|---|
| `NEXT_PUBLIC_PHARMAOPS_DEMO_MODE` | `true` (default) keeps the in-memory demo. `false` requires a real Supabase project. |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anonymous key for client-side reads. |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional, for server-only privileged tasks. |
| `NEXT_PUBLIC_PHARMAOPS_DEFAULT_PHARMACY_NAME` | Override of the demo pharmacy display name. |

## Supabase setup (when you're ready)

1. Create a Supabase project.
2. Apply the SQL files in order:
   - `supabase/migrations/0001_init.sql`
   - `supabase/migrations/0002_rls.sql`
   - `supabase/seed.sql` (optional — seeds a placeholder pharmacy & member)
3. Set the env vars above and flip `NEXT_PUBLIC_PHARMAOPS_DEMO_MODE=false`.
4. The middleware at `middleware.ts` will then refresh the auth session on
   every request via `@supabase/ssr`.

> Do **not** push migrations to a shared / production Supabase project
> without the team's approval. The migrations are intentionally additive
> and idempotent so you can apply them locally without risk.

## Project layout

See [`docs/PHARMAOPS_MVP.md`](docs/PHARMAOPS_MVP.md) for a guided tour of the
folder structure and the per-module mapping. See
[`docs/LOCALOPS_ARCHITECTURE.md`](docs/LOCALOPS_ARCHITECTURE.md) for how
PharmaOps fits inside the broader LocalOps platform.

## Compliance posture

PharmaOps MVP **does not**:

- replace Unycop, Farmatic, Nixfarma, or any official pharmacy management
  software.
- connect to electronic prescription systems.
- store patient medical records.
- certify VeriFactu or fiscal compliance.
- replace accountant or legal advice.

Generated reports are management aids and must be reviewed by qualified
professionals where required by Spanish law. See
[`docs/COMPLIANCE_LIMITATIONS.md`](docs/COMPLIANCE_LIMITATIONS.md) and
[`docs/UNYCOP_INTEGRATION_NOTES.md`](docs/UNYCOP_INTEGRATION_NOTES.md).

## Roadmap (post-MVP)

- Real Supabase Auth wiring + role-based data access verified end-to-end.
- Real Unycop / Farmatic / Nixfarma adapters once IT provider access is
  granted.
- Accountant portal with shareable links.
- Multi-pharmacy group dashboard.
- Stock expiry and margin optimisation.
- VeriFactu / e-invoicing readiness (architecture only, not certification).
- Document storage + OCR.
- AI assistant for pharmacy operations.
- Advanced permissions, immutable audit logs, retention controls.

## License & ownership

Internal MVP for the LocalOps platform. Not currently licensed for external
distribution.
