# Vertical Modules

## PharmaOps

Auxiliary operations dashboard for product catalog, stock, sales imports, suppliers, purchase orders, expiry alerts and reports. Unycop is modeled as a passive import placeholder only.

## ReformOps

Business admin copilot for small renovation companies. Initial expansion target: projects, estimates, line items, margin, PDF preview, payments, site visits and project photos.

## DentalOps

Dental clinic admin CRM for patient contacts, appointments, reminders, no-shows, recall campaigns, review requests and templates. Not a clinical records system.

## Adding a vertical

1. Add `types/<vertical>.ts`.
2. Add `lib/verticals/<vertical>.ts`.
3. Register it in `lib/verticals/registry.ts`.
4. Add optional mock data.
5. Add vertical pages/components only where generic modules are insufficient.
