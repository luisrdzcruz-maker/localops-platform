# ObraRentable OS — Supabase Implementation Plan

> Plan only. **No migrations executed. No code wired to Supabase.** Pairs with `docs/OBRARENTABLE_PRODUCT_SPEC.md` and `supabase/schema.sql` (existing draft). Names are English-first per `.cursor/rules/04-english-architecture.mdc`.

## 1. Current session-store state

The MVP runs entirely on a client-side singleton in `lib/store/sessionStore.tsx`:

- **State shape:** `{ contacts, projects, expenses, payments, tickets }` *(invoices/extras/reports added in upcoming slices follow same pattern)*.
- **Persistence:** `sessionStorage` keyed by `obrarentable.session.v1` *(version bumped on schema change)*. Tab-scoped only.
- **Hydration:** mocks at module load → optional rehydrate from `sessionStorage` after mount.
- **Mutations:** `createContact`, `createProject`, `createExpense`, `createPayment`, `updateTicketStatus` *(plus `createInvoice` and others as new slices land)*.
- **Reads:** `useSyncExternalStore`-backed hooks (`useProjects`, `useExpensesByProject`, etc.).

Limitations:

- Tab-scoped. New tab / new browser → empty.
- No auth. Hardcoded `org-demo`.
- No conflict resolution between devices.
- No audit trail.
- Pretty rapid to reset (`reset()` action exposed via `DemoResetCard`).

## 2. When to move from session store to Supabase

**Triggers** that justify the migration:

1. ✅ At least **3 paying pilots** confirming product-market fit on the current flows.
2. ✅ Pilots reporting **data loss frustration** ("perdí mis datos al cerrar el navegador").
3. ✅ Demand for **multi-device** ("me gustaría meter gastos desde el móvil de mi pareja").
4. ✅ The **gestor add-on** starts being requested seriously (multi-user implied).
5. ✅ At least **2 weeks of consistent usage** by the same pilot.

**Anti-triggers** (do **not** migrate yet):

- Only built it because "feels professional". Premature.
- One demo client asked for it. Single point of feedback.
- Pressure from internal aesthetics ("local sessionStorage looks fake"). Fix UX copy first.

The migration takes **3–4 weeks** of focused work. Don't burn it on hype.

## 3. Tables needed

English-first column naming. All money stored as `numeric(12,2)` or `bigint` cents (decision below).

### Foundation (already in `supabase/schema.sql` draft)

- `organizations`
- `user_profiles`
- `organization_members`
- `contacts`
- `tasks` *(generic, not used by ObraRentable cockpit yet)*
- `calendar_events` *(generic)*
- `documents` *(generic)*
- `automation_rules`, `automation_runs`
- `integration_connections`, `integration_sync_logs`
- `ai_usage_events`, `organization_ai_limits`
- `activity_logs`

These stay roughly as drafted — they are the LocalOps foundation tables.

### Construction-specific (new tables for ObraRentable)

| Table | Purpose | Key columns |
|---|---|---|
| `construction_projects` | Trabajos / obras | `id`, `organization_id`, `contact_id`, `name`, `address`, `status`, `budget_total`, `budget_vat_rate`, `estimated_material_cost`, `estimated_labor_cost`, `actual_material_cost`, `actual_labor_cost`, `start_date`, `end_date`, `project_type`, `notes`, audit fields |
| `construction_expenses` | Gastos | `id`, `organization_id`, `project_id`, `category`, `provider`, `description`, `amount`, `vat_rate`, `vat_amount`, `total`, `incurred_at`, `status`, `source`, `ticket_id` (FK), `notes`, audit fields |
| `construction_payments` | Cobros | `id`, `organization_id`, `project_id`, `invoice_id` (FK, nullable), `amount`, `phase`, `method`, `status`, `paid_at`, `due_at`, `notes`, audit fields |
| `construction_tickets` | Tickets/facturas proveedor | `id`, `organization_id`, `project_id` (nullable), `suggested_project_id` (nullable), `provider`, `incurred_at`, `amount`, `vat_amount`, `image_url`, `thumbnail_hue`, `status`, `extracted_fields` (jsonb), `notes`, audit fields |
| `issued_invoices` | Facturas emitidas | `id`, `organization_id`, `project_id`, `contact_id`, `invoice_number` (unique per org), `issue_date`, `due_date`, `status`, `concept`, `subtotal`, `vat_rate`, `vat_amount`, `total`, `paid_amount`, `notes`, audit fields |
| `project_extras` | Extras fuera de presupuesto | `id`, `organization_id`, `project_id`, `title`, `description`, `amount`, `vat_rate`, `vat_amount`, `total`, `status`, `notes`, audit fields |
| `monthly_reports` | Reports mensuales generados | `id`, `organization_id`, `period` (`YYYY-MM`), `payload` (jsonb), `generated_at`, `generated_by`. **Optional**: this can be a generated view. |
| `accountant_export_packages` | Paquetes para gestor | `id`, `organization_id`, `period`, `status`, `included_invoices_count`, `included_expenses_count`, `included_tickets_count`, `included_payments_count`, `csv_invoices_url`, `csv_expenses_url`, `csv_payments_url`, `summary_pdf_url`, `notes`, `generated_at`, audit fields |

### Notes on schema decisions

- **Money:** prefer `numeric(12,2)` over `bigint` cents for readability and direct EUR output. Tradeoff: floating-point math in app code must round correctly. Standardize on a `formatEUR` boundary.
- **Dates:** ISO `date` for `incurred_at`/`issue_date`/`due_date`. `timestamptz` for `created_at`/`updated_at`.
- **Status enums:** keep as `text check (...)` constraints rather than Postgres `ENUM` — easier to migrate when statuses evolve.
- **`monthly_reports`:** start as a **generated view**, not a table. Persist only when the user "closes" the month (snapshot pattern). Avoids stale data and write amplification.
- **`accountant_export_packages`:** persist record + signed URLs. Files in Supabase Storage bucket `org-{id}/exports/{period}/{filename}` with private access.

## 4. Multi-tenant requirements

Every table that holds tenant data MUST include:

- `organization_id uuid not null references organizations(id) on delete cascade`
- `created_by uuid references user_profiles(id) on delete set null`
- `updated_by uuid references user_profiles(id) on delete set null`
- `created_at timestamptz not null default now()`
- `updated_at timestamptz not null default now()`

Indexes:

- `(organization_id)` on every tenant table.
- `(organization_id, project_id)` on entities scoped to a project.
- `(organization_id, period)` on reports/exports.
- `(organization_id, status)` on tables filtered by status (invoices, payments, tickets).
- Unique `(organization_id, invoice_number)` on `issued_invoices`.

## 5. Suggested RLS policies

**Default deny.** Enable RLS on every tenant table.

### Helper function

```sql
create or replace function auth_org_ids() returns uuid[]
language sql stable as $$
  select coalesce(array_agg(organization_id), '{}')
  from organization_members
  where user_id = auth.uid() and status = 'active'
$$;
```

### Standard policy template (per table)

```sql
alter table construction_projects enable row level security;

create policy "members can read"
  on construction_projects for select
  using (organization_id = any (auth_org_ids()));

create policy "members can insert"
  on construction_projects for insert
  with check (organization_id = any (auth_org_ids()));

create policy "members can update"
  on construction_projects for update
  using (organization_id = any (auth_org_ids()))
  with check (organization_id = any (auth_org_ids()));

create policy "owners can delete"
  on construction_projects for delete
  using (
    organization_id = any (auth_org_ids())
    and exists (
      select 1 from organization_members
      where user_id = auth.uid()
        and organization_id = construction_projects.organization_id
        and role in ('owner','admin')
    )
  );
```

Apply the same template to every tenant table listed in §3 with role-aware deletes where relevant (e.g. only owner can delete invoices; staff can only mark cancelled).

### Special cases

- **`organization_members`:** users can read their own membership and their org's other members. Insert/update restricted to owners/admins.
- **`ai_usage_events`:** insert from server only (service role) when an AI action runs. Read by org members.
- **`activity_logs`:** insert by triggers/service role. Read by org members.

### What never goes through RLS

- Service role key. Only server-side functions. **Never** in client code or env vars exposed to the browser.
- File uploads to private buckets — use signed URLs minted server-side.

## 6. Auth flow

Use Supabase Auth with email/password + magic link as fallback.

### Onboarding sequence

1. User signs up with email + password.
2. Server-side trigger creates a `user_profile` row from `auth.users`.
3. First-time landing: `/onboarding` flow asks for:
   - Datos del autónomo (nombre comercial, CIF/NIE, dirección fiscal).
   - Tipo de oficio (electricista / fontanero / pintor / etc.).
   - IVA por defecto (21% por defecto).
   - Numeración de facturas (default `YYYY/NNN`).
4. Backend creates an `organization` and an `organization_members` row with role `owner`.
5. Optional: invite gestor as `external` member with read-only access to monthly reports + export package.

### Session handling

- Supabase JS client manages session in HTTP-only cookies (recommended) or localStorage for the SPA case.
- Use server-side rendering with `@supabase/ssr` for App Router routes that need data on first paint (most ObraRentable surfaces).
- Sessionless public routes: `/`, `/login`, `/onboarding/start`.

### Roles

| Role | Capabilities |
|---|---|
| `owner` | Everything. Cannot be removed except by another owner. |
| `admin` | Everything except billing/subscription changes. |
| `staff` | CRUD on projects/expenses/payments/tickets; cannot delete invoices or manage members. |
| `viewer` | Read-only. Useful for accountants. |
| `external` (gestor) | Read-only access scoped to monthly reports and accountant export packages. |

## 7. Migration sequence

Suggested order. Each step is a **PR with rollback**.

### Step 1 — Wire Supabase client + Auth
- Add `@supabase/supabase-js` and `@supabase/ssr`.
- Create `lib/supabase/{client,server}.ts`.
- Add `/login` and `/signup` routes.
- Protect ObraRentable routes with auth middleware.
- Keep session store as fallback for un-migrated entities.

### Step 2 — Migrate `organizations` + `organization_members` + `contacts`
- Create tables with RLS.
- Replace `org-demo` reads with real auth context.
- Migrate `useContacts()` to fetch from Supabase, fall back to mocks if no rows.

### Step 3 — Migrate `construction_projects`
- Create table.
- Repository layer: `lib/repos/projectsRepo.ts` exposing the same shape as the session store hooks.
- Update store to read from repo; keep optimistic UI.
- Test: create obra, refresh, see it persist across browser/device.

### Step 4 — Migrate `construction_expenses` + `construction_payments`
- Same pattern. Add audit trail (`created_by`).
- Wire margin recalculations server-side as a view: `project_margins_view`.

### Step 5 — Migrate `construction_tickets` + add Storage bucket
- `org-{id}/tickets/` private bucket.
- Signed upload URLs minted server-side.
- Keep OCR mocked for now (reuse `extracted_fields` jsonb column).

### Step 6 — Migrate `issued_invoices` + `project_extras`
- Add unique constraint on `(organization_id, invoice_number)`.
- Server-side `next_invoice_number(organization_id)` function for safe numbering.
- PDF generation **stays mocked** until a separate slice.

### Step 7 — Migrate `monthly_reports` + `accountant_export_packages`
- Reports as generated views; snapshots persisted on close-month action.
- Export packages: server-side function generates CSVs, uploads to private bucket, mints signed URLs.

### Step 8 — Real OCR/AI behind credits
- Wire `lib/ai/usage.ts` to log `ai_usage_events`.
- Add edge function for OCR call (Mistral / Vision API / etc.) gated on credits.
- Trial limits enforced server-side.

### Step 9 — Real email + accountant integration *(separate roadmap)*
- Email recordatorios via Resend / Postmark.
- Sage/A3/Holded export adapters as paid add-ons.

## 8. Risks

### Schema risks
- Migrating from `numeric(12,2)` to `bigint` cents later is painful. **Decide once and stick.**
- Status enums as `text check` — easier to evolve but easier to break with typos. Add migration tests.
- `invoice_number` uniqueness conflicts when migrating session-store mocks. Strategy: keep session-store invoice numbers as `MOCK-001` style; real invoices start fresh on first migration.

### RLS risks
- Forgetting RLS on a single table = full tenant breach. Add a CI check that fails when a tenant table has `rls_enabled = false`.
- `auth.uid()` returning null in service role contexts. Always use `service_role` only from server.
- Cross-org leakage via joins. Verify each join with a test that creates two orgs and ensures isolation.

### Cost risks
- Supabase project on EU region (Frankfurt) for ICP compliance.
- Storage cost: ticket images can grow fast. Compress on upload (client-side resize to 1600px max), store WebP if practical.
- Realtime: not needed for v1. Avoid enabling unless a feature requires it.
- AI/OCR: hard caps per organization (`organization_ai_limits`). Block the action **before** the API call, not after.

### Security risks
- Service role key in env files. Use Supabase Vault or a secrets manager.
- Signed URLs with long expiry → leakage. Use short-lived (5–10 min) URLs, regenerate on demand.
- Public read on Storage buckets by mistake. Default deny + audit script.

### Data risks
- Migrating session-store data into Supabase: **don't**. Treat the migration as a fresh start. Pilots accept this in exchange for persistence.
- Backups: enable Supabase point-in-time recovery before opening to paying users.
- GDPR: data export + delete user flow before charging anyone in EU.

## 9. What to keep mocked until after pilot

Even after Supabase lands:

- **OCR/AI real** → after Step 8, gated by credits. Until then, mocks with realistic delays.
- **PDF generation** → mock CSV/PDF blobs in client. Real PDF rendering after pilot validates the format.
- **Email/WhatsApp** → cero hasta que un piloto lo pida explícitamente y se cierre el coste.
- **Conciliación bancaria** → cero. Si un piloto la pide y paga, evaluar.
- **Accountant integration directa** → CSV/PDF only. Sage/A3/Holded adapters como add-on de pago en fase posterior.
- **E-invoicing legal** (Verifactu / TicketBAI / FacturaE) → cero hasta que un piloto lo pague. Es trabajo legal, no producto.
- **Tax filing** → cero, siempre. No es nuestro producto.

## 10. How to migrate session-store concepts into repositories

Pattern: **same hook signatures, different backend**.

### Repository layer

```ts
// lib/repos/projectsRepo.ts
import { supabase } from "@/lib/supabase/client";
import type { ConstructionProject } from "@/types/construction";
import type { CreateProjectInput } from "@/lib/store/sessionStore";

export async function listProjects(): Promise<ConstructionProject[]> { ... }
export async function getProject(id: string): Promise<ConstructionProject | null> { ... }
export async function createProject(input: CreateProjectInput): Promise<ConstructionProject> { ... }
export async function updateProject(id: string, patch: Partial<ConstructionProject>): Promise<void> { ... }
```

### Hook layer

```ts
// lib/store/projectsStore.ts (was: part of sessionStore.tsx)
export function useProjects(): ConstructionProject[] {
  // SWR or React Query against listProjects(); fall back to []
}
```

The cockpit/UI components do not need to change — they keep importing `useProjects()`, `useProject(id)`, etc.

### Strategy: **strangler pattern**

1. New repo + hook implementations live alongside session store.
2. Per route, switch the import (one PR per route).
3. Session store stays as the demo path (e.g. for marketing site / public preview).
4. Once all routes are switched, retire session store actions for write paths but keep hooks shaped identically.

### Optimistic updates

Most mutations should:
1. Apply the change locally (queue invalidation key).
2. Call repo write.
3. On success, swap to server data.
4. On failure, roll back and surface error.

The session store already enforces immutable state updates → migration is mostly mechanical.

### Server-side data on first paint

For SEO / mobile-first speed, ObraRentable surfaces should ideally render with org data on first paint. After auth wiring:
- Use `@supabase/ssr` server client in route handlers / server components.
- Pass initial data down to client components.
- Client hooks rehydrate / subscribe.

This is the most impactful UX win after the migration — beats sessionStorage on perceived speed for known projects.

## 11. Summary checklist (when you decide to start)

- [ ] Confirm trigger criteria from §2 are met.
- [ ] Spin up Supabase project in EU region.
- [ ] Lock schema decisions: money (`numeric(12,2)`), date types, status as `text check`.
- [ ] Implement Step 1 (auth wiring).
- [ ] Migrate one table end-to-end (Step 2/3) before doing the rest — confirms repo pattern.
- [ ] CI check for RLS on every tenant table.
- [ ] Backup + PITR enabled before public users.
- [ ] GDPR export/delete flow live before charging EU users.
- [ ] Migration plan reviewed with pilots ("perderás los datos demo, empezarás de cero — ¿OK?").

Until then: **keep the session store**. It is the right tool for the current stage.
