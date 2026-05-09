-- PharmaOps MVP — initial schema
--
-- This migration defines the canonical PharmaOps data model. It mirrors the
-- TypeScript types in pharmaops/types/. Keep them in sync.
--
-- Conventions:
--   - All money columns are numeric(14, 2) — euros at 2-decimal precision.
--   - All foreign keys cascade on delete only when the child has no value
--     outside the parent (e.g. import_rows -> import_batches).
--   - Multi-tenancy is enforced via RLS in 0002_rls.sql.

-- Required extensions ---------------------------------------------------------

create extension if not exists "uuid-ossp";

-- Profiles --------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  created_at timestamptz not null default now()
);

-- Pharmacies (workspaces) -----------------------------------------------------

create table if not exists public.pharmacies (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  tax_id text,
  address text,
  province text,
  autonomous_community text,
  accountant_email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pharmacy_members (
  id uuid primary key default uuid_generate_v4(),
  pharmacy_id uuid not null references public.pharmacies(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role text not null check (role in ('owner', 'manager', 'staff', 'accountant')),
  created_at timestamptz not null default now(),
  unique (pharmacy_id, user_id)
);

create index if not exists pharmacy_members_pharmacy_idx
  on public.pharmacy_members (pharmacy_id);
create index if not exists pharmacy_members_user_idx
  on public.pharmacy_members (user_id);

-- Suppliers -------------------------------------------------------------------

create table if not exists public.suppliers (
  id uuid primary key default uuid_generate_v4(),
  pharmacy_id uuid not null references public.pharmacies(id) on delete cascade,
  name text not null,
  tax_id text,
  email text,
  phone text,
  contact_person text,
  payment_terms_days int,
  notes text,
  status text not null default 'active'
    check (status in ('active', 'inactive', 'blocked')),
  preferred boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists suppliers_pharmacy_idx
  on public.suppliers (pharmacy_id);

-- Imports ---------------------------------------------------------------------

create table if not exists public.import_batches (
  id uuid primary key default uuid_generate_v4(),
  pharmacy_id uuid not null references public.pharmacies(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  source_system text not null
    check (source_system in ('unycop', 'farmatic', 'nixfarma', 'generic', 'manual')),
  import_type text not null,
  original_filename text not null,
  status text not null default 'uploaded'
    check (status in ('uploaded', 'detected', 'mapping', 'validated', 'confirmed', 'failed')),
  row_count int not null default 0,
  valid_row_count int not null default 0,
  error_row_count int not null default 0,
  warning_row_count int not null default 0,
  mapping jsonb not null default '{}'::jsonb,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists import_batches_pharmacy_idx
  on public.import_batches (pharmacy_id, created_at desc);

create table if not exists public.import_rows (
  id uuid primary key default uuid_generate_v4(),
  batch_id uuid not null references public.import_batches(id) on delete cascade,
  row_index int not null,
  raw_data jsonb not null,
  normalized_data jsonb,
  validation_status text not null default 'pending'
    check (validation_status in ('valid', 'warning', 'error', 'pending')),
  validation_errors jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists import_rows_batch_idx
  on public.import_rows (batch_id, row_index);

create table if not exists public.mapping_templates (
  id uuid primary key default uuid_generate_v4(),
  pharmacy_id uuid not null references public.pharmacies(id) on delete cascade,
  source_system text not null,
  import_type text not null,
  name text not null,
  mapping jsonb not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (pharmacy_id, source_system, import_type, name)
);

-- Purchases -------------------------------------------------------------------

create table if not exists public.purchase_invoices (
  id uuid primary key default uuid_generate_v4(),
  pharmacy_id uuid not null references public.pharmacies(id) on delete cascade,
  supplier_id uuid references public.suppliers(id) on delete set null,
  import_batch_id uuid references public.import_batches(id) on delete set null,
  invoice_number text not null,
  supplier_name text not null,
  supplier_tax_id text,
  invoice_date date not null,
  due_date date,
  net_amount numeric(14, 2) not null default 0,
  vat_amount numeric(14, 2) not null default 0,
  gross_amount numeric(14, 2) not null default 0,
  payment_status text not null default 'pending'
    check (payment_status in ('pending', 'partial', 'paid', 'overdue')),
  category text not null default 'purchases',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (pharmacy_id, supplier_name, invoice_number)
);

create index if not exists purchase_invoices_pharmacy_idx
  on public.purchase_invoices (pharmacy_id, invoice_date desc);

create table if not exists public.purchase_invoice_lines (
  id uuid primary key default uuid_generate_v4(),
  pharmacy_id uuid not null references public.pharmacies(id) on delete cascade,
  purchase_invoice_id uuid references public.purchase_invoices(id) on delete cascade,
  import_batch_id uuid references public.import_batches(id) on delete set null,
  invoice_number text not null,
  product_code text,
  cn_code text,
  product_name text not null,
  family text not null default 'otros',
  quantity numeric(14, 2) not null default 0,
  unit_cost numeric(14, 4) not null default 0,
  vat_rate numeric(5, 2) not null default 0,
  discount numeric(14, 4) not null default 0,
  total_cost numeric(14, 2) not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists purchase_invoice_lines_pharmacy_idx
  on public.purchase_invoice_lines (pharmacy_id);
create index if not exists purchase_invoice_lines_invoice_idx
  on public.purchase_invoice_lines (purchase_invoice_id);

-- Sales summaries -------------------------------------------------------------

create table if not exists public.sales_summaries (
  id uuid primary key default uuid_generate_v4(),
  pharmacy_id uuid not null references public.pharmacies(id) on delete cascade,
  import_batch_id uuid references public.import_batches(id) on delete set null,
  date date not null,
  family text not null default 'otros',
  gross_sales numeric(14, 2) not null default 0,
  net_sales numeric(14, 2) not null default 0,
  vat_amount numeric(14, 2) not null default 0,
  units numeric(14, 2) not null default 0,
  payment_method text,
  margin_amount numeric(14, 2),
  margin_percent numeric(7, 4),
  created_at timestamptz not null default now()
);

create index if not exists sales_summaries_pharmacy_idx
  on public.sales_summaries (pharmacy_id, date desc);

-- Stock snapshots -------------------------------------------------------------

create table if not exists public.stock_snapshots (
  id uuid primary key default uuid_generate_v4(),
  pharmacy_id uuid not null references public.pharmacies(id) on delete cascade,
  import_batch_id uuid references public.import_batches(id) on delete set null,
  snapshot_date date not null,
  product_code text,
  cn_code text,
  product_name text not null,
  family text not null default 'otros',
  quantity_on_hand numeric(14, 2) not null default 0,
  unit_cost numeric(14, 4),
  pvp numeric(14, 2),
  expiry_date date,
  supplier_name text,
  reorder_point numeric(14, 2),
  created_at timestamptz not null default now()
);

create index if not exists stock_snapshots_pharmacy_idx
  on public.stock_snapshots (pharmacy_id, snapshot_date desc);

-- Expenses --------------------------------------------------------------------

create table if not exists public.expenses (
  id uuid primary key default uuid_generate_v4(),
  pharmacy_id uuid not null references public.pharmacies(id) on delete cascade,
  date date not null,
  vendor text not null,
  category text not null default 'other',
  description text not null,
  net_amount numeric(14, 2) not null default 0,
  vat_amount numeric(14, 2) not null default 0,
  gross_amount numeric(14, 2) not null default 0,
  payment_method text,
  payment_status text not null default 'paid'
    check (payment_status in ('pending', 'partial', 'paid', 'overdue')),
  attachment_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists expenses_pharmacy_idx
  on public.expenses (pharmacy_id, date desc);

-- Accounting movements (generic ledger import target) ------------------------

create table if not exists public.accounting_movements (
  id uuid primary key default uuid_generate_v4(),
  pharmacy_id uuid not null references public.pharmacies(id) on delete cascade,
  import_batch_id uuid references public.import_batches(id) on delete set null,
  date date not null,
  description text not null,
  category text not null default 'other',
  debit numeric(14, 2) not null default 0,
  credit numeric(14, 2) not null default 0,
  counterparty text,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists accounting_movements_pharmacy_idx
  on public.accounting_movements (pharmacy_id, date desc);

-- Reports ---------------------------------------------------------------------

create table if not exists public.reports (
  id uuid primary key default uuid_generate_v4(),
  pharmacy_id uuid not null references public.pharmacies(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  report_type text not null,
  period_start date not null,
  period_end date not null,
  format text not null default 'pdf',
  status text not null default 'queued'
    check (status in ('queued', 'generating', 'ready', 'failed')),
  filename text not null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists reports_pharmacy_idx
  on public.reports (pharmacy_id, created_at desc);

-- Tasks -----------------------------------------------------------------------

create table if not exists public.tasks (
  id uuid primary key default uuid_generate_v4(),
  pharmacy_id uuid not null references public.pharmacies(id) on delete cascade,
  title text not null,
  description text,
  category text not null default 'general',
  priority text not null default 'normal'
    check (priority in ('low', 'normal', 'high', 'urgent')),
  status text not null default 'open'
    check (status in ('open', 'in_progress', 'done', 'skipped')),
  due_date date,
  assigned_to uuid references public.profiles(id) on delete set null,
  related_entity_type text,
  related_entity_id uuid,
  auto_suggested boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tasks_pharmacy_idx
  on public.tasks (pharmacy_id, due_date);

-- Audit log -------------------------------------------------------------------

create table if not exists public.audit_logs (
  id uuid primary key default uuid_generate_v4(),
  pharmacy_id uuid not null references public.pharmacies(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists audit_logs_pharmacy_idx
  on public.audit_logs (pharmacy_id, created_at desc);

-- updated_at trigger ----------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at := now();
  return new;
end;
$$ language plpgsql;

do $$
declare
  t text;
  tables text[] := array[
    'pharmacies', 'suppliers', 'purchase_invoices', 'expenses',
    'tasks', 'mapping_templates'
  ];
begin
  foreach t in array tables loop
    execute format(
      'drop trigger if exists set_updated_at on public.%I; '
      'create trigger set_updated_at before update on public.%I '
      'for each row execute function public.set_updated_at();',
      t, t
    );
  end loop;
end $$;
