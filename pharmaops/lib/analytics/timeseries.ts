/**
 * Time-series helpers — month-by-month aggregations for dashboard charts.
 *
 * All functions return arrays sorted oldest → newest so Recharts renders
 * the X-axis in the natural reading direction.
 */

import { addMonths, format, parseISO, startOfMonth } from "date-fns";
import type { DemoStoreState } from "@/lib/demo/store";
import {
  PRODUCT_FAMILY_LABELS,
  type ProductFamily,
} from "@/types/pharmacy";
import { ACCOUNTING_CATEGORY_LABELS, type AccountingCategory } from "@/types/finance";

export interface MonthBucket {
  /** ISO month start, e.g. "2026-04-01". */
  date: string;
  /** "abr 26" — short Spanish label for chart axes. */
  label: string;
}

export interface SalesPurchasesPoint extends MonthBucket {
  sales: number;
  purchases: number;
  margin: number | null;
  /**
   * True when this bucket is the *current* month at render time, i.e. it
   * may only contain a partial month of data. The chart should style this
   * point differently so it doesn't read as a real drop.
   */
  partial: boolean;
}

const MONTH_LABEL = new Intl.DateTimeFormat("es-ES", {
  month: "short",
  year: "2-digit",
});

function monthLabel(date: Date): string {
  return MONTH_LABEL.format(date).replace(".", "");
}

function lastNMonthBuckets(today: Date, n: number): MonthBucket[] {
  const buckets: MonthBucket[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = startOfMonth(addMonths(today, -i));
    buckets.push({
      date: format(d, "yyyy-MM-dd"),
      label: monthLabel(d),
    });
  }
  return buckets;
}

interface BuildOptions {
  referenceDate?: Date;
  months?: number;
}

const DEFAULT_TODAY = new Date("2026-05-09T10:00:00.000Z");

export function buildSalesVsPurchasesSeries(
  state: DemoStoreState,
  options: BuildOptions = {}
): SalesPurchasesPoint[] {
  const today = options.referenceDate ?? DEFAULT_TODAY;
  const buckets = lastNMonthBuckets(today, options.months ?? 12);

  const salesByMonth = aggregateByMonth(
    state.salesSummaries,
    (s) => s.date,
    (s) => s.netSales
  );
  const grossSalesByMonth = aggregateByMonth(
    state.salesSummaries,
    (s) => s.date,
    (s) => s.grossSales
  );
  const marginByMonth = aggregateByMonth(
    state.salesSummaries,
    (s) => s.date,
    (s) => s.marginAmount ?? 0
  );
  const purchasesByMonth = aggregateByMonth(
    state.purchaseInvoices,
    (p) => p.invoiceDate,
    (p) => p.netAmount
  );

  const currentMonthKey = `${today.getUTCFullYear()}-${(today.getUTCMonth() + 1)
    .toString()
    .padStart(2, "0")}`;

  return buckets.map((bucket) => {
    const key = bucket.date.slice(0, 7);
    const sales = salesByMonth[key] ?? 0;
    const purchases = purchasesByMonth[key] ?? 0;
    const grossSales = grossSalesByMonth[key] ?? 0;
    const margin = marginByMonth[key];
    const marginRatio = grossSales > 0 && margin !== undefined
      ? Math.round((margin / grossSales) * 1000) / 1000
      : null;
    const partial = key === currentMonthKey;
    return {
      ...bucket,
      label: partial ? `${bucket.label} (parcial)` : bucket.label,
      sales: Math.round(sales * 100) / 100,
      purchases: Math.round(purchases * 100) / 100,
      margin: marginRatio,
      partial,
    };
  });
}

export interface SupplierSpendPoint {
  supplier: string;
  amount: number;
  invoiceCount: number;
}

export function buildSupplierSpendSeries(
  state: DemoStoreState,
  options: BuildOptions = {}
): SupplierSpendPoint[] {
  const today = options.referenceDate ?? DEFAULT_TODAY;
  const sinceMonths = options.months ?? 3;
  const since = startOfMonth(addMonths(today, -(sinceMonths - 1)));

  const totals: Record<string, { amount: number; count: number }> = {};
  for (const inv of state.purchaseInvoices) {
    const date = parseISO(inv.invoiceDate);
    if (date < since) continue;
    const cur = totals[inv.supplierName] ?? { amount: 0, count: 0 };
    cur.amount += inv.grossAmount;
    cur.count += 1;
    totals[inv.supplierName] = cur;
  }
  return Object.entries(totals)
    .map(([supplier, agg]) => ({
      supplier,
      amount: Math.round(agg.amount * 100) / 100,
      invoiceCount: agg.count,
    }))
    .sort((a, b) => b.amount - a.amount);
}

export interface FamilyRevenuePoint {
  family: ProductFamily;
  label: string;
  netSales: number;
  grossSales: number;
  margin: number | null;
}

export function buildFamilyRevenueSeries(
  state: DemoStoreState,
  options: BuildOptions = {}
): FamilyRevenuePoint[] {
  const today = options.referenceDate ?? DEFAULT_TODAY;
  const sinceMonths = options.months ?? 3;
  const since = startOfMonth(addMonths(today, -(sinceMonths - 1)));

  const totals: Record<string, { net: number; gross: number; margin: number; hasMargin: boolean }> = {};
  for (const s of state.salesSummaries) {
    const date = parseISO(s.date);
    if (date < since) continue;
    const cur = totals[s.family] ?? { net: 0, gross: 0, margin: 0, hasMargin: false };
    cur.net += s.netSales;
    cur.gross += s.grossSales;
    if (s.marginAmount !== null) {
      cur.margin += s.marginAmount;
      cur.hasMargin = true;
    }
    totals[s.family] = cur;
  }
  return Object.entries(totals)
    .map(([family, agg]) => ({
      family: family as ProductFamily,
      label: PRODUCT_FAMILY_LABELS[family as ProductFamily] ?? family,
      netSales: Math.round(agg.net * 100) / 100,
      grossSales: Math.round(agg.gross * 100) / 100,
      margin:
        agg.hasMargin && agg.gross > 0
          ? Math.round((agg.margin / agg.gross) * 1000) / 1000
          : null,
    }))
    .sort((a, b) => b.grossSales - a.grossSales);
}

export interface ExpenseCategoryPoint {
  category: AccountingCategory;
  label: string;
  amount: number;
}

export function buildExpenseCategorySeries(
  state: DemoStoreState
): ExpenseCategoryPoint[] {
  const totals: Record<string, number> = {};
  for (const e of state.expenses) {
    totals[e.category] = (totals[e.category] ?? 0) + e.grossAmount;
  }
  return Object.entries(totals)
    .map(([category, amount]) => ({
      category: category as AccountingCategory,
      label:
        ACCOUNTING_CATEGORY_LABELS[category as AccountingCategory] ?? category,
      amount: Math.round(amount * 100) / 100,
    }))
    .sort((a, b) => b.amount - a.amount);
}

function aggregateByMonth<T>(
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
  return out;
}
