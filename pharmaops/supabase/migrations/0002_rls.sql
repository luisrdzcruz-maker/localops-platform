-- PharmaOps MVP — Row Level Security policies
--
-- Multi-tenancy rule: users see only the pharmacies they are members of.
-- Roles (owner/manager/staff/accountant) are interpreted by the application
-- layer (lib/security/permissions.ts). RLS only enforces tenant isolation —
-- finer-grained role checks happen above this layer for now.

-- Enable RLS ------------------------------------------------------------------

alter table public.profiles            enable row level security;
alter table public.pharmacies          enable row level security;
alter table public.pharmacy_members    enable row level security;
alter table public.suppliers           enable row level security;
alter table public.import_batches      enable row level security;
alter table public.import_rows         enable row level security;
alter table public.mapping_templates   enable row level security;
alter table public.purchase_invoices   enable row level security;
alter table public.purchase_invoice_lines enable row level security;
alter table public.sales_summaries     enable row level security;
alter table public.stock_snapshots     enable row level security;
alter table public.expenses            enable row level security;
alter table public.accounting_movements enable row level security;
alter table public.reports             enable row level security;
alter table public.tasks               enable row level security;
alter table public.audit_logs          enable row level security;

-- Helper: is_pharmacy_member --------------------------------------------------
-- Returns true when the calling auth.uid() has a row in pharmacy_members for
-- the given pharmacy.

create or replace function public.is_pharmacy_member(p_pharmacy_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.pharmacy_members pm
    where pm.pharmacy_id = p_pharmacy_id
      and pm.user_id = auth.uid()
  );
$$;

-- Profiles --------------------------------------------------------------------

drop policy if exists "profiles self read"   on public.profiles;
drop policy if exists "profiles self insert" on public.profiles;
drop policy if exists "profiles self update" on public.profiles;

create policy "profiles self read"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles self insert"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles self update"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Pharmacies ------------------------------------------------------------------

drop policy if exists "pharmacies member read"   on public.pharmacies;
drop policy if exists "pharmacies owner write"   on public.pharmacies;

create policy "pharmacies member read"
  on public.pharmacies for select
  using (public.is_pharmacy_member(id));

create policy "pharmacies owner write"
  on public.pharmacies for all
  using (
    exists (
      select 1 from public.pharmacy_members pm
      where pm.pharmacy_id = pharmacies.id
        and pm.user_id = auth.uid()
        and pm.role = 'owner'
    )
  )
  with check (
    exists (
      select 1 from public.pharmacy_members pm
      where pm.pharmacy_id = pharmacies.id
        and pm.user_id = auth.uid()
        and pm.role = 'owner'
    )
  );

-- Pharmacy members ------------------------------------------------------------

drop policy if exists "pharmacy_members member read" on public.pharmacy_members;
drop policy if exists "pharmacy_members owner write" on public.pharmacy_members;

create policy "pharmacy_members member read"
  on public.pharmacy_members for select
  using (public.is_pharmacy_member(pharmacy_id));

create policy "pharmacy_members owner write"
  on public.pharmacy_members for all
  using (
    exists (
      select 1 from public.pharmacy_members pm
      where pm.pharmacy_id = pharmacy_members.pharmacy_id
        and pm.user_id = auth.uid()
        and pm.role = 'owner'
    )
  )
  with check (
    exists (
      select 1 from public.pharmacy_members pm
      where pm.pharmacy_id = pharmacy_members.pharmacy_id
        and pm.user_id = auth.uid()
        and pm.role = 'owner'
    )
  );

-- Generic per-pharmacy policies ----------------------------------------------
-- Same shape: select = member; insert/update/delete = member. Role-level
-- restrictions live in the app layer.

do $$
declare
  t text;
  tables text[] := array[
    'suppliers',
    'import_batches',
    'mapping_templates',
    'purchase_invoices',
    'purchase_invoice_lines',
    'sales_summaries',
    'stock_snapshots',
    'expenses',
    'accounting_movements',
    'reports',
    'tasks',
    'audit_logs'
  ];
begin
  foreach t in array tables loop
    execute format('drop policy if exists "%I member read"  on public.%I;', t, t);
    execute format('drop policy if exists "%I member write" on public.%I;', t, t);
    execute format(
      'create policy "%I member read" on public.%I for select '
      'using (public.is_pharmacy_member(pharmacy_id));',
      t, t
    );
    execute format(
      'create policy "%I member write" on public.%I for all '
      'using (public.is_pharmacy_member(pharmacy_id)) '
      'with check (public.is_pharmacy_member(pharmacy_id));',
      t, t
    );
  end loop;
end $$;

-- import_rows: parent batch's pharmacy gates access --------------------------

drop policy if exists "import_rows member read"  on public.import_rows;
drop policy if exists "import_rows member write" on public.import_rows;

create policy "import_rows member read"
  on public.import_rows for select
  using (
    exists (
      select 1 from public.import_batches b
      where b.id = import_rows.batch_id
        and public.is_pharmacy_member(b.pharmacy_id)
    )
  );

create policy "import_rows member write"
  on public.import_rows for all
  using (
    exists (
      select 1 from public.import_batches b
      where b.id = import_rows.batch_id
        and public.is_pharmacy_member(b.pharmacy_id)
    )
  )
  with check (
    exists (
      select 1 from public.import_batches b
      where b.id = import_rows.batch_id
        and public.is_pharmacy_member(b.pharmacy_id)
    )
  );
