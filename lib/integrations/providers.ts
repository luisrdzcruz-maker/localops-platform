import type { IntegrationProvider } from "@/types/integrations";
export const integrationProviders: { key: IntegrationProvider; label: string; description: string }[] = [
  { key: "google_calendar", label: "Google Calendar", description: "Calendar sync placeholder." },
  { key: "gmail", label: "Gmail", description: "Email integration placeholder." },
  { key: "whatsapp_placeholder", label: "WhatsApp", description: "Future WhatsApp Business integration." },
  { key: "stripe", label: "Stripe", description: "Billing and payments placeholder." },
  { key: "csv_import", label: "CSV Import", description: "Import operational data from CSV files." },
  { key: "excel_import", label: "Excel Import", description: "Import spreadsheets." },
  { key: "unycop_passive_import", label: "Unycop Passive Import", description: "Pharmacy import placeholder; no write integration." },
  { key: "google_reviews_placeholder", label: "Google Reviews", description: "Future review request/reporting integration." }
];
