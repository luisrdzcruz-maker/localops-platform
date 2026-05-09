import type { VerticalConfig } from "./types";

export const dentalVertical: VerticalConfig = {
  key: "dental",
  name: "Dental Clinic Operations",
  commercialName: "DentalOps",
  description: "Dental admin CRM for appointments, reminders, no-shows, recalls and review requests. No clinical record system.",
  primaryContactLabel: "Patient",
  primaryContactPluralLabel: "Patients",
  icon: "tooth",
  accent: "cyan",
  enabledModules: ["dashboard", "contacts", "tasks", "calendar", "documents", "automations", "integrations", "ai", "reports", "settings"],
  primaryEntities: ["patients", "appointments", "no_shows", "recall_campaigns", "review_requests"],
  dashboardWidgets: ["dental_today_appointments", "dental_no_shows", "dental_recall_opportunities", "dental_review_requests", "tasks_due", "ai_usage"],
  terminology: { contact: "Patient", event: "Appointment", campaign: "Recall campaign", review: "Review request" },
  navigation: [
    { label: "Dashboard", href: "/verticals/dental", icon: "dashboard" },
    { label: "Patients", href: "/verticals/dental/patients", icon: "users" },
    { label: "Appointments", href: "/verticals/dental/appointments", icon: "calendar" },
    { label: "No-shows", href: "/verticals/dental/no-shows", icon: "alert" },
    { label: "Recall", href: "/verticals/dental/recall", icon: "repeat" },
    { label: "Reviews", href: "/verticals/dental/reviews", icon: "star" },
    { label: "Templates", href: "/verticals/dental/templates", icon: "message" }
  ],
  aiActions: ["generate_patient_reminder", "generate_recall_campaign", "classify_cancellation_reason", "draft_review_reply"],
  permissions: ["vertical.dental.access"],
  onboardingSteps: ["Import patient contacts", "Connect calendar placeholder", "Create reminder template", "Start recall campaign"],
  emptyStates: { patients: "Add or import patient contacts.", recall: "Create your first recall campaign." }
};
