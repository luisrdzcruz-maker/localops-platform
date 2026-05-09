import type { VerticalConfig } from "./types";

export const constructionVertical: VerticalConfig = {
  key: "construction",
  name: "Construction/Reformas",
  commercialName: "ReformOps",
  description: "Admin copilot for renovation businesses: estimates, projects, margins, payments and follow-ups.",
  primaryContactLabel: "Client",
  primaryContactPluralLabel: "Clients",
  icon: "hammer",
  accent: "amber",
  enabledModules: ["dashboard", "contacts", "tasks", "calendar", "documents", "automations", "integrations", "ai", "reports", "billing", "settings"],
  primaryEntities: ["projects", "estimates", "materials", "invoices", "payments", "site_visits"],
  dashboardWidgets: ["construction_open_estimates", "construction_active_projects", "construction_pending_payments", "construction_margin_warnings", "tasks_due", "ai_usage"],
  terminology: { contact: "Client", project: "Project", estimate: "Estimate", margin: "Margin" },
  navigation: [
    { label: "Dashboard", href: "/verticals/construction", icon: "dashboard" },
    { label: "Projects", href: "/verticals/construction/projects", icon: "folder" },
    { label: "Estimates", href: "/verticals/construction/estimates", icon: "calculator" },
    { label: "Estimate Builder", href: "/verticals/construction/estimate-builder", icon: "wand" },
    { label: "Materials", href: "/verticals/construction/materials", icon: "box" },
    { label: "Invoices", href: "/verticals/construction/invoices", icon: "file" },
    { label: "Payments", href: "/verticals/construction/payments", icon: "card" },
    { label: "Photos", href: "/verticals/construction/photos", icon: "image" }
  ],
  aiActions: ["generate_estimate_from_notes", "improve_estimate_text", "summarize_site_visit", "extract_invoice_data", "classify_project_photo"],
  permissions: ["vertical.construction.access"],
  onboardingSteps: ["Add first client", "Create first project", "Build an estimate", "Send follow-up task"],
  emptyStates: { projects: "Create your first renovation project.", estimates: "Generate a professional estimate from notes or line items." }
};
