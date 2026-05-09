# Database Schema

See `supabase/schema.sql` for the draft. The schema is multi-tenant-ready with `organization_id` on tenant-owned tables.

## Required RLS principle

Every tenant table must restrict access to rows where `organization_id` belongs to the authenticated user's memberships.

## Core tables

- organizations
- user_profiles
- organization_members
- contacts
- tasks
- calendar_events
- documents
- document_templates
- automation_rules
- automation_runs
- integration_connections
- integration_sync_logs
- ai_usage_events
- organization_ai_limits
- activity_logs

## Vertical tables

- pharma products, suppliers, imports, purchase orders, expiry alerts
- construction projects, estimates, estimate items, invoices, payments, site visits, photos
- dental patient profiles, appointments, recall campaigns, no-show events, review requests, templates
