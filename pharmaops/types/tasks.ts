/**
 * Operational tasks — pharmacy reminders, supplier follow-ups, monthly
 * accountant prep, etc. Tasks can be linked to other entities (an import
 * batch with errors, a supplier with overdue invoices) so the UI can
 * deep-link from the task list back into the relevant module.
 */

import type { PharmacyId } from "./pharmacy";
import type { UserId } from "./localops";

export type TaskId = string;

export type TaskStatus = "open" | "in_progress" | "done" | "skipped";

export const TASK_STATUSES: TaskStatus[] = [
  "open",
  "in_progress",
  "done",
  "skipped",
];

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  open: "Pendiente",
  in_progress: "En curso",
  done: "Hecha",
  skipped: "Descartada",
};

export type TaskPriority = "low" | "normal" | "high" | "urgent";

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Baja",
  normal: "Normal",
  high: "Alta",
  urgent: "Urgente",
};

export type TaskCategory =
  | "supplier_payment"
  | "stock_review"
  | "accountant"
  | "import"
  | "document"
  | "compliance"
  | "general";

export const TASK_CATEGORY_LABELS: Record<TaskCategory, string> = {
  supplier_payment: "Pago a proveedor",
  stock_review: "Revisión de stock",
  accountant: "Gestoría",
  import: "Importación",
  document: "Documento",
  compliance: "Cumplimiento",
  general: "General",
};

export type TaskRelatedEntityType =
  | "supplier"
  | "purchase_invoice"
  | "import_batch"
  | "report"
  | "expense"
  | "stock_snapshot";

export interface Task {
  id: TaskId;
  pharmacyId: PharmacyId;
  title: string;
  description: string | null;
  category: TaskCategory;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string | null;
  assignedTo: UserId | null;
  relatedEntityType: TaskRelatedEntityType | null;
  relatedEntityId: string | null;
  /** Mark tasks the system suggested vs. ones the user created manually. */
  autoSuggested: boolean;
  createdAt: string;
  updatedAt: string;
}
