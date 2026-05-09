-- PharmaOps MVP — minimal Supabase seed
--
-- The app's rich demo dataset lives in lib/demo/ and runs in-memory. This file
-- exists so a fresh local Supabase project has a coherent starting workspace
-- for QA against the real database. Do not run this against a remote project
-- without explicit approval.

insert into public.profiles (id, full_name, email)
values
  ('00000000-0000-0000-0000-000000000001', 'Owner Demo', 'owner@pharmaops.test')
on conflict (id) do nothing;

insert into public.pharmacies (
  id, name, tax_id, address, province, autonomous_community, accountant_email
) values (
  '00000000-0000-0000-0000-0000000000aa',
  'Farmacia Demo Centro',
  'B00000000',
  'Calle Mayor 1',
  'Madrid',
  'Comunidad de Madrid',
  'gestoria@pharmaops.test'
) on conflict (id) do nothing;

insert into public.pharmacy_members (pharmacy_id, user_id, role)
values (
  '00000000-0000-0000-0000-0000000000aa',
  '00000000-0000-0000-0000-000000000001',
  'owner'
) on conflict (pharmacy_id, user_id) do nothing;
