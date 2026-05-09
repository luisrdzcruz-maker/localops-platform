/**
 * Report engine — orchestrates: pick a definition, gather store data, run
 * the format-specific generator, return the blob.
 */

import { addMonths, format, startOfMonth, subDays } from "date-fns";
import { getDemoState } from "@/lib/demo/store";
import { DEMO_USER } from "@/lib/demo/session";
import { getReportDefinition } from "./registry";
import type {
  ReportFormat,
  ReportInput,
  ReportOutput,
  ReportRenderInput,
  ReportType,
} from "@/types/reports";

interface RunOptions {
  periodStart?: string;
  periodEnd?: string;
}

export async function runReport(
  reportType: ReportType,
  format: ReportFormat,
  options: RunOptions = {}
): Promise<ReportOutput> {
  const def = getReportDefinition(reportType);
  if (!def) throw new Error(`Tipo de informe desconocido: ${reportType}`);
  if (!def.formats.includes(format)) {
    throw new Error(
      `El informe "${def.title}" no soporta el formato ${format.toUpperCase()}.`
    );
  }
  const state = getDemoState();
  const today = new Date();
  const start =
    options.periodStart ?? startOfMonth(addMonths(today, -1)).toISOString().slice(0, 10);
  const end =
    options.periodEnd ?? subDays(startOfMonth(today), 1).toISOString().slice(0, 10);

  const baseInput: ReportInput = {
    pharmacyId: state.pharmacy.id,
    pharmacyName: state.pharmacy.name,
    periodStart: start,
    periodEnd: end,
    generatedAt: today.toISOString(),
    generatedBy: DEMO_USER.fullName,
  };

  const renderInput: ReportRenderInput = {
    ...baseInput,
    data: {
      purchaseInvoices: state.purchaseInvoices,
      purchaseInvoiceLines: state.purchaseInvoiceLines,
      salesSummaries: state.salesSummaries,
      stockSnapshots: state.stockSnapshots,
      expenses: state.expenses,
      suppliers: state.suppliers,
      importBatches: state.importBatches,
    },
  };

  switch (format) {
    case "pdf":
      if (!def.generatePdf) throw new Error("PDF no soportado por esta definición.");
      return def.generatePdf(renderInput);
    case "xlsx":
      if (!def.generateExcel) throw new Error("Excel no soportado por esta definición.");
      return def.generateExcel(renderInput);
    case "csv":
      if (!def.generateCsv) throw new Error("CSV no soportado por esta definición.");
      return def.generateCsv(renderInput);
    default:
      throw new Error(`Formato no soportado: ${format}`);
  }
}

export function defaultPeriod(): { start: string; end: string } {
  const today = new Date();
  return {
    start: format(startOfMonth(addMonths(today, -1)), "yyyy-MM-dd"),
    end: format(subDays(startOfMonth(today), 1), "yyyy-MM-dd"),
  };
}
