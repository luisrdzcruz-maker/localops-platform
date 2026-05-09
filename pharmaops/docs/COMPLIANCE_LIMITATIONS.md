# Compliance limitations

PharmaOps MVP is a **management** layer — not a regulated product. This file
lists every claim PharmaOps does **not** make, so that anyone shipping or
demoing the app stays honest with pharmacy owners and regulators.

## What PharmaOps MVP **does not** do

- It does **not** replace Unycop, Farmatic, Nixfarma, or any other certified
  pharmacy management software. The pharmacy's official system of record
  stays the source of truth for dispensing, prescriptions, POS, and stock.
- It does **not** connect to public electronic prescription systems
  (Receta Electrónica del Sistema Nacional de Salud, Receta XXI, etc.).
- It does **not** store or process patient-level data, prescription
  identifiers, or any health information. Imported files that contain such
  columns are flagged as sensitive and excluded from mapping by default.
- It does **not** certify VeriFactu / e-invoicing compliance. Generated
  invoices and exports are management aids only.
- It does **not** submit any data to AEAT, social security, or any other
  public administration.
- It does **not** replace your gestoría or accountant. Reports are starting
  points for review — not declarations.
- It does **not** process payments, charge customers, or move money.

## What PharmaOps MVP **does** do

- Reads spreadsheets exported from your pharmacy software or accountant.
- Normalises rows into a canonical pharmacy data model.
- Computes management KPIs and supplier / family / cash-flow analytics.
- Generates PDF and Excel reports for owner review and gestoría hand-off.
- Tracks operational tasks (supplier payments, stock review, accountant
  pack preparation) with auto-suggested reminders.
- Provides an architecture for future direct integrations once authorised
  by the pharmacy's IT provider.

## UI surfaces with required disclaimers

Every page below already shows a compliance disclaimer. Do not remove these
without security/legal review.

- The persistent `ComplianceFooter` shown on every protected page.
- The login page (demo banner).
- The dashboard page ("Cifras estimadas" alert).
- The finance page ("Datos estimados" alert).
- The reports page ("Cifras de gestión" alert).
- The integrations page ("Solo importación por fichero" alert).
- The PDF footer of every generated report.

## Roadmap to remove these limitations

(All require explicit user / legal approval before being implemented.)

1. Real Supabase Auth + RLS verification against a live project.
2. Direct Unycop / Farmatic / Nixfarma adapters once the IT provider grants
   read-only credentials.
3. VeriFactu compatibility: invoice metadata model, immutable audit trail,
   certified provider integration.
4. Receta electrónica: explicitly **out of scope**. Will not be added — it's
   handled by the pharmacy's primary software.
5. Banking / payments: needs a regulated provider (Stripe, Redsys) and a
   reconciliation flow.
6. AEAT / Modelo 303 / Modelo 390: requires accountant-grade certification.

When any of these items is approved, update this doc to reflect the
reduced limitation surface.
