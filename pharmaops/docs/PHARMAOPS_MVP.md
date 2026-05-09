# PharmaOps MVP — overview

> "La capa de control operativo encima de tu software de farmacia."

## What ships in the MVP

| Module | Path | Status |
|---|---|---|
| Dashboard with KPIs + charts | `/dashboard` | ✅ |
| Imports center (upload → mapping → validate → confirm) | `/imports` | ✅ |
| Suppliers list + detail + spend metrics | `/suppliers`, `/suppliers/[id]` | ✅ |
| Finance: expenses, VAT estimate, cash flow, accountant pack | `/finance` | ✅ |
| Reports & exports (PDF/Excel/CSV) | `/reports` + `/api/reports/[type]` | ✅ |
| Tasks (auto-suggested + manual) | `/tasks` | ✅ |
| Integrations centre + adapters | `/integrations` | ✅ |
| Settings (pharmacy profile, roles, templates, privacy) | `/settings` | ✅ |
| Demo data + load/clear toggle | dashboard / settings | ✅ |
| Supabase schema + RLS migrations | `supabase/migrations/` | ✅ (local files) |
| Compliance disclaimers | shell footer + page-level alerts | ✅ |

## Not in scope (deferred until explicit approval)

- Real Supabase Auth wiring against a live project
- Direct Unycop / Farmatic / Nixfarma API integration
- VeriFactu / certified e-invoicing
- Real OCR, AI, payments, banking, email/WhatsApp messaging
- Patient or prescription data
- Production deploy

## Key flows

### Import flow

1. User uploads `.xlsx` / `.csv` from the imports page.
2. The browser parses the file with SheetJS — no server upload needed.
3. The adapter registry picks the best matching adapter (Unycop / Farmatic /
   Nixfarma / generic) by filename + headers.
4. The auto-mapper proposes a column-to-field mapping based on hint scoring.
5. The user can override the mapping per field.
6. Zod-based validation runs row-by-row; errors and warnings show inline.
7. On confirm, a Server Action calls `confirmImport` which:
   - records an `ImportBatch` + `ImportRow[]` in the demo store
   - applies the normalized rows into the relevant business tables
   - logs an audit event
   - revalidates `/dashboard` so the KPIs update

### Reports flow

1. User opens `/reports` — sees one card per `ReportDefinition`.
2. They pick a period and click "Descargar PDF / Excel / CSV".
3. The `<a>` link hits `/api/reports/[type]?format=...&periodStart=...&periodEnd=...`.
4. The Route Handler resolves the definition, gathers store data, runs the
   format-specific generator, and streams the file with
   `Content-Disposition: attachment`.
5. Side effect: a `Report` row is appended to the store so the report shows
   up in the "informes generados" table.

## Where things live

```
pharmaops/
  app/
    (app)/                 protected route group, wraps AppShell
      dashboard/
      imports/
      suppliers/[id]/
      finance/
      reports/
      tasks/
      integrations/
      settings/
    api/
      reports/[type]/      report download Route Handler
      integrations/template/  Excel template downloads
    login/
    layout.tsx             root layout
    page.tsx               landing
  components/
    app/                   AppShell, Sidebar, Topbar, Compliance footer
    dashboard/             KPI cards, charts, demo toggle
    imports/               full import flow + history
    suppliers/             tables, charts
    finance/               expenses, VAT, cashflow, accountant pack cards
    reports/               report cards + history table
    integrations/          integration cards
    tasks/                 task list + add form
    ui/                    Button, Card, Table, Alert, Stat, Skeleton, ...
  lib/
    analytics/             KPI + time-series helpers
    audit/                 audit log helpers
    demo/                  in-memory store + seed + session
    finance/               server actions for finance
    imports/               schemas, parser, autoMap, normalize, validate, confirm
    integrations/          adapter contract, Unycop/Farmatic/Nixfarma/generic, registry
    pharmaops/             vertical analytics (suppliers, finance)
    reports/               report engine, builders, definitions
    security/              permissions, sensitive column detection
    supabase/              client/server/middleware helpers (demo-aware)
    tasks/                 server actions for tasks
    utils/                 cn, format, parseLocale
  types/                   localops, pharmacy, imports, finance, reports, integrations, tasks
  supabase/
    migrations/            0001_init.sql, 0002_rls.sql
    seed.sql               minimal local seed
  data/sample-imports/     CSV files for testing the import flow
  docs/                    architecture + compliance notes
```

## Defaults that make the demo feel real

- The demo dataset is **deterministic** (mulberry32 seeded at 19891204) so
  KPIs render the same on every reload.
- Reference date is fixed at **2026-05-09** so monthly trends look natural.
- 12 months of sales × 7 product families = 84 sales summaries.
- 30 purchase invoices, ~120 lines, 80 stock rows, 20 expenses, 8 tasks,
  5 reports, 5 import batches.
- Suppliers are explicitly fictional Spanish-style names (Cooperativa
  Farmacéutica Demo, Distribuidor Sanitario Demo, Dermocosmética Norte
  Demo, Parafarmacia Global Demo, Suministros Farmacia Demo, Genérico
  Pharma Demo). Tax IDs use the reserved `B0000…` testing range, emails
  use the `.test` TLD, phones use the `+34 9XX 00 XX XX` documentation
  reserve. No real company data anywhere in the demo.
