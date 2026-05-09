-- LocalOps Platform schema draft
-- This is a starting point. Review, migrate and test before production.
-- Enable RLS on all tenant-owned tables and enforce organization membership policies.

create table if not exists organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  primary_vertical text not null check (primary_vertical in ('pharma','construction','dental')),
  active_verticals text[] not null default '{}',
  plan text not null default 'trial',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists user_profiles (
  id uuid primary key,
  full_name text not null,
  email text unique not null,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid not null references user_profiles(id) on delete cascade,
  role text not null check (role in ('owner','admin','manager','staff','viewer','external')),
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, user_id)
);

create table if not exists contacts (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  type text not null,
  name text not null,
  email text,
  phone text,
  company_name text,
  notes text,
  tags text[] not null default '{}',
  status text not null default 'active',
  created_by uuid,
  updated_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists contacts_org_idx on contacts(organization_id);

create table if not exists tasks (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  title text not null,
  description text,
  status text not null default 'todo',
  priority text not null default 'medium',
  due_at timestamptz,
  assigned_to uuid,
  related_contact_id uuid references contacts(id),
  related_entity_type text,
  related_entity_id uuid,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists tasks_org_due_idx on tasks(organization_id, due_at);

create table if not exists calendar_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  title text not null,
  description text,
  start_at timestamptz not null,
  end_at timestamptz not null,
  location text,
  related_contact_id uuid references contacts(id),
  source text not null default 'manual',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists documents (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  type text not null,
  status text not null default 'draft',
  title text not null,
  related_entity_type text,
  related_entity_id uuid,
  file_url text,
  template_id uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists document_templates (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  type text not null,
  name text not null,
  description text,
  body text not null,
  variables text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists automation_rules (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  name text not null,
  description text,
  trigger text not null,
  conditions jsonb not null default '[]'::jsonb,
  actions jsonb not null default '[]'::jsonb,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists automation_runs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  rule_id uuid references automation_rules(id) on delete set null,
  status text not null,
  error text,
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists integration_connections (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  provider text not null,
  status text not null default 'not_connected',
  display_name text not null,
  metadata jsonb not null default '{}'::jsonb,
  last_sync_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists ai_usage_events (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  user_id uuid,
  action_key text not null,
  provider text not null,
  model text not null,
  credits_used int not null default 0,
  input_tokens int,
  output_tokens int,
  file_count int,
  file_size_mb numeric,
  estimated_cost_eur numeric,
  status text not null,
  blocked_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists ai_usage_org_created_idx on ai_usage_events(organization_id, created_at);

create table if not exists organization_ai_limits (
  organization_id uuid primary key references organizations(id) on delete cascade,
  plan text not null default 'trial',
  monthly_credit_limit int not null default 25,
  daily_credit_limit int not null default 10,
  max_file_size_mb int not null default 5,
  max_batch_size int not null default 5,
  bulk_processing_enabled boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists activity_logs (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  actor_id uuid,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  summary text not null,
  created_at timestamptz not null default now()
);

-- Pharma
create table if not exists pharmacy_products (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references organizations(id) on delete cascade,
  sku text not null,
  name text not null,
  category text not null,
  supplier_id uuid,
  stock_on_hand int not null default 0,
  reorder_point int not null default 0,
  unit_cost numeric not null default 0,
  retail_price numeric not null default 0,
  expiry_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (organization_id, sku)
);
create table if not exists pharmacy_suppliers (id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations(id) on delete cascade, name text not null, email text, phone text, lead_time_days int not null default 3, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists pharmacy_sales_imports (id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations(id) on delete cascade, file_name text not null, imported_at timestamptz, rows int not null default 0, total_sales numeric not null default 0, status text not null default 'processing', created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists pharmacy_purchase_orders (id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations(id) on delete cascade, supplier_id uuid, status text not null default 'draft', total numeric not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists pharmacy_expiry_alerts (id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations(id) on delete cascade, product_id uuid references pharmacy_products(id), expiry_date date not null, severity text not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now());

-- Construction
create table if not exists construction_projects (id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations(id) on delete cascade, contact_id uuid references contacts(id), name text not null, address text, status text not null default 'lead', budget numeric, start_date date, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists construction_estimates (id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations(id) on delete cascade, project_id uuid references construction_projects(id), number text not null, status text not null default 'draft', subtotal numeric not null default 0, vat_rate numeric not null default 0.21, total numeric not null default 0, material_cost numeric not null default 0, labor_cost numeric not null default 0, margin_percent numeric not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists construction_estimate_items (id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations(id) on delete cascade, estimate_id uuid references construction_estimates(id) on delete cascade, description text not null, category text not null, quantity numeric not null default 1, unit_price numeric not null default 0, unit_cost numeric not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists construction_invoices (id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations(id) on delete cascade, project_id uuid references construction_projects(id), estimate_id uuid references construction_estimates(id), status text not null default 'draft', total numeric not null default 0, due_at date, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists construction_payments (id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations(id) on delete cascade, project_id uuid references construction_projects(id), invoice_id uuid references construction_invoices(id), amount numeric not null, paid_at date, status text not null default 'pending', created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists construction_site_visits (id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations(id) on delete cascade, project_id uuid references construction_projects(id), scheduled_at timestamptz not null, notes text, status text not null default 'scheduled', created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists construction_photos (id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations(id) on delete cascade, project_id uuid references construction_projects(id), url text not null, caption text, tag text, created_at timestamptz not null default now(), updated_at timestamptz not null default now());

-- Dental
create table if not exists dental_patient_profiles (id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations(id) on delete cascade, contact_id uuid references contacts(id), last_visit_at date, next_recall_at date, inactive boolean not null default false, preferred_channel text not null default 'sms', created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists dental_appointments (id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations(id) on delete cascade, patient_contact_id uuid references contacts(id), starts_at timestamptz not null, ends_at timestamptz not null, status text not null default 'scheduled', appointment_type text not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists dental_recall_campaigns (id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations(id) on delete cascade, name text not null, status text not null default 'draft', audience text not null, sent_count int not null default 0, booked_count int not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists dental_no_show_events (id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations(id) on delete cascade, appointment_id uuid references dental_appointments(id), patient_contact_id uuid references contacts(id), reason text, recovered boolean not null default false, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists dental_review_requests (id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations(id) on delete cascade, patient_contact_id uuid references contacts(id), status text not null default 'pending', sent_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now());
create table if not exists dental_communication_templates (id uuid primary key default gen_random_uuid(), organization_id uuid not null references organizations(id) on delete cascade, name text not null, channel text not null, body text not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now());

-- RLS must be enabled before production. Example pattern:
-- alter table contacts enable row level security;
-- create policy "members can read org contacts" on contacts for select using (
--   organization_id in (select organization_id from organization_members where user_id = auth.uid() and status = 'active')
-- );
