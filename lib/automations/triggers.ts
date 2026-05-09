import type { AutomationTriggerKey } from "@/types/automations";
export const automationTriggers: AutomationTriggerKey[] = ["contact.created", "task.due_soon", "document.sent", "estimate.sent", "estimate.not_accepted_after_days", "appointment.tomorrow", "appointment.no_show", "stock.low", "import.completed", "payment.overdue"];
