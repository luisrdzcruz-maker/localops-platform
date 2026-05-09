# LocalOps Architecture (PharmaOps perspective)

PharmaOps is the first vertical to ship on the LocalOps modular platform.
This document explains how PharmaOps maps onto the LocalOps primitives so a
later vertical (e.g. DentalOps, ReformaOps) can re-use the same mental model.

## Layers

```
+------------------------------------------------------------------+
|                       PharmaOps (vertical)                       |
|                                                                  |
|  Dashboard · Imports · Suppliers · Finance · Reports · Tasks     |
|              Integrations · Settings · Demo seed                 |
+------------------------------------------------------------------+
|                       LocalOps core concepts                     |
|                                                                  |
|  Workspace · UserProfile · Role · Permission · AuditLog          |
|     ImportPipeline · ReportEngine · IntegrationAdapters          |
+------------------------------------------------------------------+
|                  Infrastructure (per project)                    |
|                                                                  |
|       Next.js  ·  Supabase (Auth + Postgres + RLS)               |
+------------------------------------------------------------------+
```

The PharmaOps app (`pharmaops/`) is deliberately self-contained: own
`package.json`, own Tailwind config, own Supabase migrations. Each vertical
will live in its own folder so we can iterate without coupling.

What stays *shared* across verticals (today as conventions, tomorrow as a
package):

- The `Workspace + UserProfile + Role` triad.
- The import pipeline contract (`PharmacySystemAdapter` for Pharma,
  `JobSiteAdapter` for ObraRentable, etc. — all share the same shape:
  detect → parse → normalize → validate → confirm).
- The report engine: `ReportDefinition` + `ReportRenderInput` + format-
  specific generators.
- Audit log shape (one schema works for every vertical).
- Permission keys are vertical-specific but follow the same naming pattern.

## Why a standalone Next.js app per vertical

Trade-off vs. a shared monorepo app:

- **Pros**: each vertical can ship independently, has its own brand palette,
  can drop or change dependencies without affecting other verticals, is
  easier to mentally separate from the other production line.
- **Cons**: code duplication of UI primitives until we extract a shared
  package; each vertical has its own deploy.

The MVP accepts the duplication. When two verticals are running in parallel
we'll lift the shared primitives into `@localops/core` and `@localops/ui`.

## Data model boundary

PharmaOps owns:

- `pharmacies` (= LocalOps `workspaces` for the pharma vertical)
- `pharmacy_members` (= LocalOps `workspace_memberships`)
- pharma-specific tables: `suppliers`, `purchase_invoices`,
  `purchase_invoice_lines`, `sales_summaries`, `stock_snapshots`, `expenses`,
  `accounting_movements`, `mapping_templates`
- `import_batches`, `import_rows` (LocalOps shape, vertical agnostic)
- `reports`, `tasks`, `audit_logs` (LocalOps shape, vertical agnostic)
- `profiles` (LocalOps shape)

The cross-cutting tables (`profiles`, `import_batches`, `import_rows`,
`reports`, `tasks`, `audit_logs`) will be promoted to a shared `localops`
schema once a second vertical lands.
