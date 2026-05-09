import type { BaseEntity } from "./core";

export type AutomationTriggerKey =
  | "contact.created"
  | "task.due_soon"
  | "document.sent"
  | "estimate.sent"
  | "estimate.not_accepted_after_days"
  | "appointment.tomorrow"
  | "appointment.no_show"
  | "stock.low"
  | "import.completed"
  | "payment.overdue";

export type AutomationActionKey =
  | "create_task"
  | "send_email"
  | "send_sms_placeholder"
  | "send_whatsapp_placeholder"
  | "generate_document"
  | "notify_user"
  | "add_tag"
  | "update_status"
  | "create_ai_summary";

export interface AutomationCondition {
  field: string;
  operator: "equals" | "not_equals" | "contains" | "greater_than" | "less_than" | "older_than_days";
  value: string | number | boolean;
}

export interface AutomationAction {
  key: AutomationActionKey;
  label: string;
  config: Record<string, string | number | boolean>;
}

export interface AutomationRule extends BaseEntity {
  name: string;
  description?: string;
  trigger: AutomationTriggerKey;
  conditions: AutomationCondition[];
  actions: AutomationAction[];
  enabled: boolean;
}

export interface AutomationRun extends BaseEntity {
  ruleId: string;
  status: "queued" | "running" | "completed" | "failed" | "skipped";
  startedAt?: string;
  finishedAt?: string;
  error?: string;
}
