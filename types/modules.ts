export type VerticalKey = "pharma" | "construction" | "dental";
export type CoreModuleKey =
  | "dashboard"
  | "contacts"
  | "tasks"
  | "calendar"
  | "documents"
  | "automations"
  | "integrations"
  | "ai"
  | "reports"
  | "billing"
  | "settings";

export type ModuleStatus = "active" | "planned" | "restricted";

export interface CoreModuleConfig {
  key: CoreModuleKey;
  label: string;
  description: string;
  icon: string;
  requiredPermissions: string[];
  navPath: string;
  status: ModuleStatus;
}

export type DashboardWidgetKey =
  | "tasks_due"
  | "recent_contacts"
  | "recent_activity"
  | "ai_usage"
  | "active_automations"
  | "connected_integrations"
  | "pharma_low_stock"
  | "pharma_expiring_soon"
  | "pharma_sales_trend"
  | "construction_open_estimates"
  | "construction_active_projects"
  | "construction_pending_payments"
  | "construction_margin_warnings"
  | "dental_today_appointments"
  | "dental_no_shows"
  | "dental_recall_opportunities"
  | "dental_review_requests";

export interface VerticalNavigationItem {
  label: string;
  href: string;
  icon: string;
  module?: CoreModuleKey;
}
