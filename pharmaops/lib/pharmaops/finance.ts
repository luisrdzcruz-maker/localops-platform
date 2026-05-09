/**
 * Finance read models — VAT, cash flow, accountant pack.
 *
 * These are *management* aggregates, not fiscal declarations. The UI must
 * accompany every output with the disclaimer that these figures are aids
 * for the pharmacy owner and the accountant, not certified tax outputs.
 */

import { addDays, addMonths, parseISO, startOfMonth } from "date-fns";
import {
  ACCOUNTING_CATEGORIES,
  type AccountantPack,
  type AccountantPackEntry,
  type AccountingCategory,
  type CashFlowEstimate,
  type Expense,
  type PurchaseInvoice,
  type VatPeriodSummary,
  type VatRate,
} from "@/types/finance";
import type { SalesSummary } from "@/types/pharmacy";

const VAT_DISCLAIMER =
  "Cifras estimadas a partir de los datos importados. No sustituyen la declaración fiscal preparada por tu gestoría.";

const CASHFLOW_DISCLAIMER =
  "Estimación basada en pagos pendientes y gastos recurrentes recientes. Requiere validación manual.";

interface PeriodOptions {
  /** Defaults to the current month start. */
  periodStart?: Date;
  /** Defaults to today. */
  periodEnd?: Date;
}

const DEFAULT_TODAY = new Date("2026-05-09T10:00:00.000Z");

export function computeVatSummary(
  invoices: PurchaseInvoice[],
  sales: SalesSummary[],
  options: PeriodOptions = {}
): VatPeriodSummary {
  const today = options.periodEnd ?? DEFAULT_TODAY;
  const start = options.periodStart ?? startOfMonth(addMonths(today, -2));

  let outputVat = 0;
  let inputVat = 0;
  const byRate: Record<VatRate, { outputVat: number; inputVat: number }> = {
    0: { outputVat: 0, inputVat: 0 },
    4: { outputVat: 0, inputVat: 0 },
    10: { outputVat: 0, inputVat: 0 },
    21: { outputVat: 0, inputVat: 0 },
  };

  for (const inv of invoices) {
    const d = parseISO(inv.invoiceDate);
    if (d < start || d > today) continue;
    inputVat += inv.vatAmount;
    const rateGuess = guessRateFromAmounts(inv.netAmount, inv.vatAmount);
    if (rateGuess !== null) {
      byRate[rateGuess].inputVat += inv.vatAmount;
    }
  }

  for (const s of sales) {
    const d = parseISO(s.date);
    if (d < start || d > today) continue;
    outputVat += s.vatAmount;
    const rateGuess = guessRateFromAmounts(s.netSales, s.vatAmount);
    if (rateGuess !== null) {
      byRate[rateGuess].outputVat += s.vatAmount;
    }
  }

  return {
    periodStart: start.toISOString().slice(0, 10),
    periodEnd: today.toISOString().slice(0, 10),
    outputVat: round2(outputVat),
    inputVat: round2(inputVat),
    netVat: round2(outputVat - inputVat),
    byRate: ([0, 4, 10, 21] as const).map((rate) => ({
      rate: rate as VatRate,
      outputVat: round2(byRate[rate].outputVat),
      inputVat: round2(byRate[rate].inputVat),
    })),
    disclaimer: VAT_DISCLAIMER,
  };
}

export function computeCashFlowEstimate(
  invoices: PurchaseInvoice[],
  expenses: Expense[],
  options: PeriodOptions = {}
): CashFlowEstimate {
  const today = options.periodEnd ?? DEFAULT_TODAY;
  const start = options.periodStart ?? today;
  const end = addDays(today, 30);

  const pending = invoices
    .filter(
      (i) => i.paymentStatus === "pending" || i.paymentStatus === "partial"
    )
    .reduce((acc, i) => acc + i.grossAmount, 0);

  // Estimate inflow from supplier-paid invoices reversed: typical pharmacy
  // doesn't have AR data in MVP. We approximate as 1.4x outflow (rough
  // pharmacy benchmark — flagged as estimate via disclaimer).
  const recurring =
    expenses
      .filter((e) => {
        const d = parseISO(e.date);
        return d >= addMonths(today, -1) && d <= today;
      })
      .reduce((acc, e) => acc + e.grossAmount, 0) || 0;

  const estimatedOutflow = round2(pending + recurring);
  const estimatedInflow = round2(estimatedOutflow * 1.4);

  return {
    periodStart: start.toISOString().slice(0, 10),
    periodEnd: end.toISOString().slice(0, 10),
    estimatedInflow,
    estimatedOutflow,
    estimatedNet: round2(estimatedInflow - estimatedOutflow),
    pendingSupplierInvoices: round2(pending),
    recurringExpenses: round2(recurring),
    disclaimer: CASHFLOW_DISCLAIMER,
  };
}

export function computeAccountantPack(
  pharmacyId: string,
  invoices: PurchaseInvoice[],
  expenses: Expense[],
  options: PeriodOptions = {}
): AccountantPack {
  const today = options.periodEnd ?? DEFAULT_TODAY;
  const start = options.periodStart ?? startOfMonth(addMonths(today, -1));

  const buckets: Record<AccountingCategory, AccountantPackEntry> = {} as never;
  for (const cat of ACCOUNTING_CATEGORIES) {
    buckets[cat] = {
      category: cat,
      count: 0,
      totalNet: 0,
      totalVat: 0,
      totalGross: 0,
    };
  }

  for (const inv of invoices) {
    const d = parseISO(inv.invoiceDate);
    if (d < start || d > today) continue;
    const cat = (inv.category as AccountingCategory) || "purchases";
    if (!buckets[cat]) {
      buckets[cat] = {
        category: cat,
        count: 0,
        totalNet: 0,
        totalVat: 0,
        totalGross: 0,
      };
    }
    buckets[cat].count += 1;
    buckets[cat].totalNet += inv.netAmount;
    buckets[cat].totalVat += inv.vatAmount;
    buckets[cat].totalGross += inv.grossAmount;
  }

  for (const e of expenses) {
    const d = parseISO(e.date);
    if (d < start || d > today) continue;
    const cat = e.category;
    if (!buckets[cat]) {
      buckets[cat] = {
        category: cat,
        count: 0,
        totalNet: 0,
        totalVat: 0,
        totalGross: 0,
      };
    }
    buckets[cat].count += 1;
    buckets[cat].totalNet += e.netAmount;
    buckets[cat].totalVat += e.vatAmount;
    buckets[cat].totalGross += e.grossAmount;
  }

  const entries = Object.values(buckets)
    .filter((b) => b.count > 0)
    .map((b) => ({
      ...b,
      totalNet: round2(b.totalNet),
      totalVat: round2(b.totalVat),
      totalGross: round2(b.totalGross),
    }))
    .sort((a, b) => b.totalGross - a.totalGross);

  const totals = entries.reduce(
    (acc, b) => ({
      totalNet: acc.totalNet + b.totalNet,
      totalVat: acc.totalVat + b.totalVat,
      totalGross: acc.totalGross + b.totalGross,
    }),
    { totalNet: 0, totalVat: 0, totalGross: 0 }
  );

  return {
    pharmacyId,
    periodStart: start.toISOString().slice(0, 10),
    periodEnd: today.toISOString().slice(0, 10),
    generatedAt: new Date().toISOString(),
    entries,
    totals: {
      totalNet: round2(totals.totalNet),
      totalVat: round2(totals.totalVat),
      totalGross: round2(totals.totalGross),
    },
    disclaimer:
      "Resumen agregado para gestoría. Revisa los importes con tu asesor antes de presentar declaraciones.",
  };
}

function guessRateFromAmounts(
  net: number,
  vat: number
): VatRate | null {
  if (!net) return null;
  const ratio = vat / net;
  if (Math.abs(ratio - 0.04) < 0.01) return 4;
  if (Math.abs(ratio - 0.1) < 0.015) return 10;
  if (Math.abs(ratio - 0.21) < 0.02) return 21;
  if (ratio < 0.005) return 0;
  return null;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
