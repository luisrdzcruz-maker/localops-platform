import type { CoreModuleConfig } from "@/types/modules";

export const coreModules: CoreModuleConfig[] = [
  { key: "dashboard", label: "Dashboard", description: "Operational command center.", icon: "dashboard", requiredPermissions: [], navPath: "/dashboard", status: "active" },
  { key: "contacts", label: "Contacts", description: "Clients, patients, suppliers and leads.", icon: "users", requiredPermissions: ["contacts.read"], navPath: "/contacts", status: "active" },
  { key: "tasks", label: "Tasks", description: "Follow-ups and internal work.", icon: "check", requiredPermissions: ["tasks.read"], navPath: "/tasks", status: "active" },
  { key: "calendar", label: "Calendar", description: "Appointments, visits and events.", icon: "calendar", requiredPermissions: [], navPath: "/calendar", status: "active" },
  { key: "documents", label: "Documents", description: "Estimates, invoices, reports and templates.", icon: "file", requiredPermissions: ["documents.read"], navPath: "/documents", status: "active" },
  { key: "automations", label: "Automations", description: "Rules that turn events into actions.", icon: "zap", requiredPermissions: ["automations.manage"], navPath: "/automations", status: "active" },
  { key: "integrations", label: "Integrations", description: "Calendar, email, CSV, Stripe and future connectors.", icon: "plug", requiredPermissions: ["integrations.manage"], navPath: "/integrations", status: "active" },
  { key: "ai", label: "AI Usage", description: "AI actions, credits and cost control.", icon: "sparkles", requiredPermissions: ["ai.use"], navPath: "/ai-usage", status: "active" },
  { key: "reports", label: "Reports", description: "Operational analytics.", icon: "chart", requiredPermissions: ["reports.read"], navPath: "/reports", status: "active" },
  { key: "billing", label: "Billing", description: "Plans, limits and future Stripe integration.", icon: "card", requiredPermissions: ["billing.manage"], navPath: "/settings", status: "planned" },
  { key: "settings", label: "Settings", description: "Organization, team and preferences.", icon: "settings", requiredPermissions: [], navPath: "/settings", status: "active" }
];
