# LocalOps Platform — Modular Micro-PME CRM Foundation

Version 0.1 starter workspace for a modular, multi-tenant CRM / Operations OS that can adapt to Pharma, Construction/Reformas, Dental and future micro-SME verticals.

## What is included

- Next.js App Router skeleton
- TypeScript domain contracts
- Vertical registry for Pharma, Construction and Dental
- Core module configuration
- Role/permission helpers
- AI usage and credit-control contracts
- Automation, document and integration placeholders
- Mock data for all three verticals
- Shared UI shell and skeleton screens
- Supabase schema draft with RLS notes
- Architecture, security, product strategy and MVP documentation

## Run locally

```bash
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Important limitations

This is not production-ready. Auth, payments, WhatsApp, Unycop, email sending and real Supabase RLS are intentionally not connected yet. Pharmacy and dental scopes avoid clinical/prescription workflows by design.

## Recommended next phase

Implement the Construction/Reformas MVP first: projects, estimates, estimate builder, margin summary, PDF preview, payments and site visits.
