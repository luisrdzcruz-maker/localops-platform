"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { appendExpense } from "@/lib/demo/store";
import { DEMO_PHARMACY } from "@/lib/demo/session";
import {
  ACCOUNTING_CATEGORIES,
  PAYMENT_STATUSES,
  type Expense,
} from "@/types/finance";

const expenseSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Fecha no válida"),
  vendor: z.string().min(2, "El emisor es obligatorio"),
  description: z.string().min(2, "La descripción es obligatoria"),
  category: z.enum(ACCOUNTING_CATEGORIES as unknown as [string, ...string[]]),
  netAmount: z.number().nonnegative(),
  vatAmount: z.number().nonnegative(),
  grossAmount: z.number().nonnegative(),
  paymentMethod: z.string().nullable(),
  paymentStatus: z.enum(PAYMENT_STATUSES as unknown as [string, ...string[]]),
  notes: z.string().nullable(),
});

export interface AddExpenseResult {
  ok: true;
  id: string;
}

export async function addExpenseAction(
  input: unknown
): Promise<AddExpenseResult> {
  const parsed = expenseSchema.parse(input);
  const now = new Date().toISOString();
  const expense: Expense = {
    id: `exp-manual-${Date.now()}`,
    pharmacyId: DEMO_PHARMACY.id,
    date: parsed.date,
    vendor: parsed.vendor,
    category: parsed.category as Expense["category"],
    description: parsed.description,
    netAmount: parsed.netAmount,
    vatAmount: parsed.vatAmount,
    grossAmount: parsed.grossAmount,
    paymentMethod: parsed.paymentMethod,
    paymentStatus: parsed.paymentStatus as Expense["paymentStatus"],
    attachmentUrl: null,
    notes: parsed.notes,
    createdAt: now,
    updatedAt: now,
  };
  appendExpense(expense);
  revalidatePath("/finance");
  revalidatePath("/dashboard");
  return { ok: true, id: expense.id };
}
