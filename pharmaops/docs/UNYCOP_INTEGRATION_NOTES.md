# Unycop integration notes

PharmaOps does **not** connect directly to Unycop. The MVP integration is
**file-based**: a pharmacy operator exports an Excel/CSV from Unycop, and
PharmaOps normalises the file into its canonical pharmacy model.

## What we ship today

- A `unycopAdapter` (in `lib/integrations/unycop/adapter.ts`) that:
  - matches files by filename hints (e.g. `unycop_compras_*`).
  - matches files by header signature when filename hints are missing.
  - parses the file via the shared SheetJS-based parser.
  - applies the same auto-mapping + Zod validation pipeline as every adapter.
- The integrations centre lists the adapter with status
  `Solo importación por fichero` (`file_based_only`).
- A downloadable Excel template with the canonical column layout.

## What we don't ship (yet)

- No direct API call to Unycop services. The Unycop public API (where it
  exists) requires per-pharmacy credentials and IT provider authorisation.
- No direct database read against the Unycop SQL backend. That requires
  pharmacy IT collaboration and is **never** to be enabled without explicit
  written authorisation from the pharmacy and the IT provider.
- No automatic export trigger inside Unycop. Operators must export the file
  themselves.

## What an operator needs to know

1. Open Unycop and navigate to the export they want (compras, ventas, stock).
2. Export the data as Excel/CSV.
3. Drop the file into PharmaOps `Importaciones` page.
4. Review the auto-mapping. The Unycop adapter recognises the standard
   column names with high confidence.
5. Confirm the import. PharmaOps records the batch and applies the rows to
   the relevant business tables.

## When real Unycop integration becomes possible

If/when a pharmacy gives PharmaOps explicit authorisation **and** the IT
provider provides documented API or DB access, we can:

- Replace `unycopAdapter.parseFile` with a network call.
- Add a sync schedule (cron job or webhook).
- Bump the adapter status from `file_based_only` to `beta` or `active`.

Until then: file-based only. The UI copy reflects this honestly.

## Avoid these claims

When demoing or marketing the integration:

- ❌ "Conectado a Unycop"
- ❌ "Sincronización en tiempo real con Unycop"
- ❌ "Sustituye a Unycop"
- ✅ "Importa exportaciones de Unycop"
- ✅ "Capa de gestión sobre tus datos exportados de Unycop"
- ✅ "Preparado para integración directa cuando tu proveedor IT lo autorice"
