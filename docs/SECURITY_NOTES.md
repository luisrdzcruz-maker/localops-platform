# Security Notes

This workspace is an MVP architecture foundation. It is **not production-certified** and does not yet implement real auth, RLS, legal compliance workflows or healthcare-grade controls.

## Required before production

- Supabase project in an EU region for EU customers
- Supabase Auth with MFA for admins
- Row Level Security on every tenant-owned table
- Server-side permission checks using the shared permission model
- No service role key exposure in frontend code
- Private storage buckets with signed URLs
- Audit logs for critical actions
- Data export/delete workflows for GDPR readiness
- DPA and privacy documentation
- Analytics/logging configured to avoid sensitive data capture

## Pharmacy and dental boundaries

The MVP should avoid:

- electronic prescriptions
- clinical diagnosis
- medical imaging
- patient medication history
- sensitive health records
- AI medical recommendations

Pharma should begin as an auxiliary operations dashboard using stock, sales, suppliers and imports. Dental should focus on appointments, reminders, no-shows, recalls and reviews.
