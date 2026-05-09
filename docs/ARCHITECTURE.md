# Architecture

LocalOps Platform is designed as **one modular multi-tenant SaaS core** plus vertical modules. Pharma, Construction/Reformas and Dental are not separate applications; they are configuration-driven verticals on top of shared infrastructure.

## Core layers

- `types/`: domain contracts
- `lib/verticals/`: vertical registry and configuration
- `lib/modules/`: shared core module configuration
- `lib/permissions/`: role and permission contracts/helpers
- `lib/ai/`: AI action costs, usage limits and preflight checks
- `lib/automations/`: trigger/action definitions and examples
- `components/`: shared shell, UI, core patterns and vertical components
- `app/`: route skeletons
- `supabase/schema.sql`: future PostgreSQL schema draft

## Config-driven verticals

Adding a vertical should require adding a config file, types/entities, optional components and navigation entries. Generic components should not hardcode vertical-specific terminology.

## Multi-tenancy

Every business entity must include `organization_id` / `organizationId`. The app is structured so future server-side checks and Supabase RLS can enforce organization isolation.

## Future scaling path

1. Connect Supabase Auth and organization membership.
2. Implement database migrations and RLS policies.
3. Replace mock data with repository functions.
4. Implement Construction/Reformas MVP.
5. Add Dental communication workflows.
6. Add Pharma passive import pipeline.
