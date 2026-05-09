/**
 * Supplier analytics — derived from purchase_invoices.
 *
 * Pure functions over the demo store snapshot. The same shapes will work
 * unchanged when Supabase wiring lands; we'll just swap the input source.
 */

import {
  addMonths,
  differenceInCalendarDays,
  parseISO,
  startOfMonth,
} from "date-fns";
import type { PurchaseInvoice } from "@/types/finance";
import type { Supplier } from "@/types/pharmacy";

export interface SupplierMetrics {
  supplier: Supplier;
  totalSpend: number;
  invoiceCount: number;
  pendingAmount: number;
  pendingCount: number;
  overdueAmount: number;
  overdueCount: number;
  /** YYYY-MM-DD of the most recent invoice, or null. */
  lastInvoiceDate: string | null;
  /** Average days between invoice_date and due_date for this supplier. */
  averagePaymentTermsDays: number | null;
  /**
   * Spend per month for the chart window. Always emits exactly
   * `monthsForChart` entries (default 6) ending at `referenceDate`,
   * zero-filled for months without invoices so the chart looks balanced.
   */
  spendByMonth: Array<{ month: string; label: string; amount: number }>;
  /** Sum of spendByMonth.amount — total over the chart window. */
  chartTotal: number;
  /** chartTotal / monthsForChart — average monthly spend in the window. */
  chartAverage: number;
}

interface ComputeOptions {
  monthsForChart?: number;
  /** "Today" for the chart window. Defaults to the demo reference date. */
  referenceDate?: Date;
}

/** Demo reference date — keeps chart output deterministic in demo mode. */
const DEFAULT_REFERENCE = new Date("2026-05-09T10:00:00.000Z");

const MONTH_LABEL = new Intl.DateTimeFormat("es-ES", {
  month: "short",
  year: "2-digit",
});
function monthLabel(date: Date): string {
  return MONTH_LABEL.format(date).replace(".", "");
}

export function computeSupplierMetrics(
  supplier: Supplier,
  invoices: PurchaseInvoice[],
  options: ComputeOptions = {}
): SupplierMetrics {
  const owned = invoices.filter(
    (i) => i.supplierId === supplier.id || i.supplierName === supplier.name
  );

  let totalSpend = 0;
  let pendingAmount = 0;
  let pendingCount = 0;
  let overdueAmount = 0;
  let overdueCount = 0;
  let lastInvoiceDate: string | null = null;

  let termsSum = 0;
  let termsCount = 0;
  const spendByMonthMap: Record<string, number> = {};

  for (const inv of owned) {
    totalSpend += inv.grossAmount;
    if (inv.paymentStatus === "pending" || inv.paymentStatus === "partial") {
      pendingAmount += inv.grossAmount;
      pendingCount += 1;
    }
    if (inv.paymentStatus === "overdue") {
      overdueAmount += inv.grossAmount;
      overdueCount += 1;
    }
    if (!lastInvoiceDate || inv.invoiceDate > lastInvoiceDate) {
      lastInvoiceDate = inv.invoiceDate;
    }
    if (inv.dueDate) {
      const days = differenceInCalendarDays(
        parseISO(inv.dueDate),
        parseISO(inv.invoiceDate)
      );
      if (Number.isFinite(days) && days >= 0) {
        termsSum += days;
        termsCount += 1;
      }
    }
    const monthKey = inv.invoiceDate.slice(0, 7);
    spendByMonthMap[monthKey] = (spendByMonthMap[monthKey] ?? 0) + inv.grossAmount;
  }

  const monthsLimit = options.monthsForChart ?? 6;
  const reference = options.referenceDate ?? DEFAULT_REFERENCE;

  // Always emit `monthsLimit` consecutive months ending at the reference,
  // zero-filled where there is no spend so the chart never looks empty.
  const spendByMonth: SupplierMetrics["spendByMonth"] = [];
  for (let i = monthsLimit - 1; i >= 0; i--) {
    const d = startOfMonth(addMonths(reference, -i));
    const key = `${d.getUTCFullYear()}-${(d.getUTCMonth() + 1).toString().padStart(2, "0")}`;
    spendByMonth.push({
      month: key,
      label: monthLabel(d),
      amount: round2(spendByMonthMap[key] ?? 0),
    });
  }
  const chartTotal = round2(
    spendByMonth.reduce((acc, p) => acc + p.amount, 0)
  );
  const chartAverage = round2(chartTotal / Math.max(1, monthsLimit));

  return {
    supplier,
    totalSpend: round2(totalSpend),
    invoiceCount: owned.length,
    pendingAmount: round2(pendingAmount),
    pendingCount,
    overdueAmount: round2(overdueAmount),
    overdueCount,
    lastInvoiceDate,
    averagePaymentTermsDays:
      termsCount > 0 ? Math.round(termsSum / termsCount) : null,
    spendByMonth,
    chartTotal,
    chartAverage,
  };
}

export function computeAllSupplierMetrics(
  suppliers: Supplier[],
  invoices: PurchaseInvoice[]
): SupplierMetrics[] {
  return suppliers
    .map((s) => computeSupplierMetrics(s, invoices))
    .sort((a, b) => b.totalSpend - a.totalSpend);
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
