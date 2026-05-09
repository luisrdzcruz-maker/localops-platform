/**
 * Dashboard KPI helpers — pure, no side effects, easy to unit-test.
 *
 * Defensive principle: when underlying data is missing or sparse, return
 * `null` for the KPI value rather than fabricating numbers. The UI renders
 * "No disponible" for null, which matches the master prompt's compliance
 * posture ("Use defensive calculations… show 'No disponible' instead of
 * fake precision").
 */

import { addMonths, isAfter, isWithinInterval, parseISO, startOfMonth, subDays } from "date-fns";
import type { DemoStoreState } from "@/lib/demo/store";
import type { ImportBatch } from "@/types/imports";

export interface MonthlyKpi {
  current: number | null;
  previous: number | null;
  /**
   * -1..1 ratio change. null when previous is 0, undefined, or when the
   * current month is still partial (the comparison would be misleading).
   */
  changeRatio: number | null;
  /**
   * True when the current bucket is the in-progress month. The UI uses this
   * to suppress the trend badge and add a "parcial" hint instead of showing
   * a comparison that's guaranteed to look like a drop.
   */
  currentIsPartial: boolean;
}

export interface DashboardKpis {
  revenueThisMonth: MonthlyKpi;
  purchasesThisMonth: MonthlyKpi;
  grossMargin: MonthlyKpi;
  pendingSupplierInvoicesCount: number;
  pendingSupplierInvoicesAmount: number;
  overdueSupplierInvoicesCount: number;
  topSupplierName: string | null;
  topSupplierAmount: number | null;
  stockRiskItems: number;
  stockValue: number;
  importHealthValid: number;
  importHealthErrors: number;
  importHealthWarnings: number;
  tasksDueThisWeek: number;
  reportsLast30Days: number;
}

interface ComputeOptions {
  /** "Today" — defaults to the demo reference date for deterministic output. */
  referenceDate?: Date;
}

const DEFAULT_TODAY = new Date("2026-05-09T10:00:00.000Z");

export function computeDashboardKpis(
  state: DemoStoreState,
  options: ComputeOptions = {}
): DashboardKpis {
  const today = options.referenceDate ?? DEFAULT_TODAY;
  const monthStart = startOfMonth(today);
  const previousMonthStart = startOfMonth(addMonths(today, -1));
  const previousMonthEnd = subDays(monthStart, 1);

  // Revenue / purchases / margin from sales summaries (monthly buckets).
  const salesByMonth = bucketByMonth(
    state.salesSummaries,
    (s) => s.date,
    (s) => s.netSales
  );
  const grossSalesByMonth = bucketByMonth(
    state.salesSummaries,
    (s) => s.date,
    (s) => s.grossSales
  );
  const marginAmountByMonth = bucketByMonth(
    state.salesSummaries,
    (s) => s.date,
    (s) => s.marginAmount ?? 0
  );

  const purchasesByMonth = bucketByMonth(
    state.purchaseInvoices,
    (p) => p.invoiceDate,
    (p) => p.netAmount
  );

  const monthKey = (d: Date) => `${d.getUTCFullYear()}-${(d.getUTCMonth() + 1).toString().padStart(2, "0")}`;
  const currentKey = monthKey(monthStart);
  const previousKey = monthKey(previousMonthStart);

  const revenueCurrent = salesByMonth[currentKey] ?? 0;
  const revenuePrevious = salesByMonth[previousKey] ?? 0;
  const purchasesCurrent = purchasesByMonth[currentKey] ?? 0;
  const purchasesPrevious = purchasesByMonth[previousKey] ?? 0;
  const grossSalesCurrent = grossSalesByMonth[currentKey] ?? 0;
  const grossSalesPrevious = grossSalesByMonth[previousKey] ?? 0;
  const marginCurrent = marginAmountByMonth[currentKey] ?? 0;
  const marginPrevious = marginAmountByMonth[previousKey] ?? 0;

  const pending = state.purchaseInvoices.filter(
    (i) => i.paymentStatus === "pending" || i.paymentStatus === "partial"
  );
  const overdue = state.purchaseInvoices.filter(
    (i) => i.paymentStatus === "overdue"
  );

  const supplierSpend = topSupplierByGrossSpend(state.purchaseInvoices);

  const stockRisk = state.stockSnapshots.filter((s) => isStockRisk(s, today));
  const stockValue = state.stockSnapshots.reduce(
    (acc, s) => acc + (s.unitCost ?? 0) * s.quantityOnHand,
    0
  );

  const importHealth = state.importBatches.reduce(
    (acc, b: ImportBatch) => ({
      valid: acc.valid + b.validRowCount,
      errors: acc.errors + b.errorRowCount,
      warnings: acc.warnings + b.warningRowCount,
    }),
    { valid: 0, errors: 0, warnings: 0 }
  );

  const tasksDueThisWeek = state.tasks.filter((t) => {
    if (t.status === "done" || t.status === "skipped") return false;
    if (!t.dueDate) return false;
    const d = parseISO(t.dueDate);
    return isWithinInterval(d, { start: subDays(today, 0), end: addDaysSafe(today, 7) });
  }).length;

  const reportsLast30Days = state.reports.filter((r) =>
    isAfter(parseISO(r.createdAt), subDays(today, 30))
  ).length;

  // The current bucket is partial whenever today is not the last day of the
  // month. We pass the flag to makeKpi so the trend badge can be suppressed.
  const daysInCurrentMonth = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 0)
  ).getUTCDate();
  const currentIsPartial = today.getUTCDate() < daysInCurrentMonth;

  return {
    revenueThisMonth: makeKpi(revenueCurrent, revenuePrevious, currentIsPartial),
    purchasesThisMonth: makeKpi(
      purchasesCurrent,
      purchasesPrevious,
      currentIsPartial
    ),
    grossMargin: makeKpi(
      ratio(marginCurrent, grossSalesCurrent),
      ratio(marginPrevious, grossSalesPrevious),
      currentIsPartial
    ),
    pendingSupplierInvoicesCount: pending.length,
    pendingSupplierInvoicesAmount: round2(
      pending.reduce((acc, p) => acc + p.grossAmount, 0)
    ),
    overdueSupplierInvoicesCount: overdue.length,
    topSupplierName: supplierSpend?.name ?? null,
    topSupplierAmount: supplierSpend?.amount ?? null,
    stockRiskItems: stockRisk.length,
    stockValue: round2(stockValue),
    importHealthValid: importHealth.valid,
    importHealthErrors: importHealth.errors,
    importHealthWarnings: importHealth.warnings,
    tasksDueThisWeek,
    reportsLast30Days,
  };
}

function makeKpi(
  current: number | null,
  previous: number | null,
  currentIsPartial = false
): MonthlyKpi {
  const c = current ?? 0;
  const p = previous ?? 0;
  return {
    current: current === null ? null : round2(c),
    previous: previous === null ? null : round2(p),
    // Suppress the change ratio when comparing a partial month vs a full
    // month — it's guaranteed to look misleadingly negative.
    changeRatio: !p || currentIsPartial ? null : round4((c - p) / p),
    currentIsPartial,
  };
}

function ratio(numerator: number, denominator: number): number | null {
  if (!denominator) return null;
  return numerator / denominator;
}

function bucketByMonth<T>(
  items: T[],
  dateOf: (item: T) => string,
  valueOf: (item: T) => number
): Record<string, number> {
  const out: Record<string, number> = {};
  for (const item of items) {
    const d = parseISO(dateOf(item));
    const key = `${d.getUTCFullYear()}-${(d.getUTCMonth() + 1).toString().padStart(2, "0")}`;
    out[key] = (out[key] ?? 0) + valueOf(item);
  }
  for (const key of Object.keys(out)) {
    out[key] = round2(out[key]!);
  }
  return out;
}

function topSupplierByGrossSpend(
  invoices: ReadonlyArray<{ supplierName: string; grossAmount: number }>
): { name: string; amount: number } | null {
  if (invoices.length === 0) return null;
  const totals: Record<string, number> = {};
  for (const i of invoices) {
    totals[i.supplierName] = (totals[i.supplierName] ?? 0) + i.grossAmount;
  }
  let best: [string, number] | null = null;
  for (const [name, amount] of Object.entries(totals)) {
    if (!best || amount > best[1]) best = [name, amount];
  }
  return best ? { name: best[0], amount: round2(best[1]) } : null;
}

function isStockRisk(
  snapshot: { quantityOnHand: number; reorderPoint: number | null; expiryDate: string | null },
  today: Date
): boolean {
  if (snapshot.reorderPoint && snapshot.quantityOnHand < snapshot.reorderPoint) {
    return true;
  }
  if (snapshot.expiryDate) {
    const expiry = parseISO(snapshot.expiryDate);
    const days = (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24);
    if (days < 90) return true;
  }
  return false;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
function round4(n: number): number {
  return Math.round(n * 10000) / 10000;
}
function addDaysSafe(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}
