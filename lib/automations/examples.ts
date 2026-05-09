import type { AutomationRule } from "@/types/automations";

export const exampleAutomationRules: AutomationRule[] = [
  { id: "auto-1", organizationId: "org-demo", name: "Follow up stale estimates", trigger: "estimate.not_accepted_after_days", conditions: [{ field: "days", operator: "greater_than", value: 7 }], actions: [{ key: "create_task", label: "Create follow-up task", config: { priority: "high" } }], enabled: true, createdAt: "2026-05-01", updatedAt: "2026-05-01" },
  { id: "auto-2", organizationId: "org-demo", name: "Tomorrow appointment reminders", trigger: "appointment.tomorrow", conditions: [], actions: [{ key: "send_sms_placeholder", label: "Send reminder", config: { template: "appointment_reminder" } }], enabled: true, createdAt: "2026-05-01", updatedAt: "2026-05-01" },
  { id: "auto-3", organizationId: "org-demo", name: "Low stock alert", trigger: "stock.low", conditions: [], actions: [{ key: "notify_user", label: "Notify manager", config: { channel: "in_app" } }], enabled: true, createdAt: "2026-05-01", updatedAt: "2026-05-01" }
];
