"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { upsertTask } from "@/lib/demo/store";
import { DEMO_PHARMACY } from "@/lib/demo/session";
import {
  TASK_PRIORITY_LABELS,
  TASK_STATUSES,
  TASK_STATUS_LABELS,
  type Task,
} from "@/types/tasks";

const taskSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(2, "El título es obligatorio"),
  description: z.string().nullable(),
  category: z.enum([
    "supplier_payment",
    "stock_review",
    "accountant",
    "import",
    "document",
    "compliance",
    "general",
  ]),
  priority: z.enum(["low", "normal", "high", "urgent"]),
  status: z.enum(TASK_STATUSES as unknown as [string, ...string[]]),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
});

export async function upsertTaskAction(input: unknown): Promise<{ ok: true; id: string }> {
  const parsed = taskSchema.parse(input);
  const id = parsed.id ?? `tsk-manual-${Date.now()}`;
  const now = new Date().toISOString();
  const task: Task = {
    id,
    pharmacyId: DEMO_PHARMACY.id,
    title: parsed.title,
    description: parsed.description,
    category: parsed.category as Task["category"],
    priority: parsed.priority as Task["priority"],
    status: parsed.status as Task["status"],
    dueDate: parsed.dueDate,
    assignedTo: null,
    relatedEntityType: null,
    relatedEntityId: null,
    autoSuggested: false,
    createdAt: now,
    updatedAt: now,
  };
  upsertTask(task);
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  return { ok: true, id };
}

export const TASK_LABELS = {
  status: TASK_STATUS_LABELS,
  priority: TASK_PRIORITY_LABELS,
};
