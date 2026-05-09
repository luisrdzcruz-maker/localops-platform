/**
 * Reports — PDF and Excel/CSV exports.
 *
 * The MVP ships a small set of report types. Each is implemented as a
 * ReportDefinition (lib/reports/) so adding a new report is a matter of
 * registering one more definition + describing required data.
 */

import type { PharmacyId } from "./pharmacy";
import type { UserId } from "./localops";

export type ReportId = string;

export type ReportType =
  | "monthly_management"
  | "supplier_spend"
  | "purchase_margin"
  | "vat_summary"
  | "stock_risk"
  | "import_validation"
  | "accountant_pack";

export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  monthly_management: "Informe mensual de gestión",
  supplier_spend: "Gasto por proveedor",
  purchase_margin: "Margen de compras",
  vat_summary: "Resumen de IVA",
  stock_risk: "Riesgo de stock",
  import_validation: "Validación de importación",
  accountant_pack: "Paquete para gestoría",
};

export type ReportFormat = "pdf" | "xlsx" | "csv";

export type ReportStatus = "queued" | "generating" | "ready" | "failed";

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  queued: "En cola",
  generating: "Generando",
  ready: "Listo",
  failed: "Error",
};

export interface Report {
  id: ReportId;
  pharmacyId: PharmacyId;
  userId: UserId | null;
  reportType: ReportType;
  periodStart: string;
  periodEnd: string;
  format: ReportFormat;
  status: ReportStatus;
  /** Free-form metadata: KPI snapshot, filter selections, file size. */
  metadata: Record<string, unknown>;
  /** Filename for the on-demand download. The MVP does not persist files. */
  filename: string;
  createdAt: string;
}

export interface ReportInput {
  pharmacyId: PharmacyId;
  pharmacyName: string;
  periodStart: string;
  periodEnd: string;
  /** Optional pharmacy logo (data URL or file path). */
  logoDataUrl?: string;
  /** Footer text override; falls back to compliance disclaimer. */
  footerText?: string;
  generatedAt: string;
  generatedBy?: string;
}

export interface ReportOutput {
  filename: string;
  mimeType: string;
  /** Browser-friendly. Server engines convert via Buffer.from(arrayBuffer). */
  blob: Blob;
}

/**
 * A self-describing report. The engine resolves required data from the demo
 * store (or Supabase, when wired) and hands it to generatePdf / generateExcel.
 */
export interface ReportDefinition {
  id: ReportType;
  title: string;
  description: string;
  /**
   * Domain entities this report needs. Used to detect "no data" empty states
   * and surface helpful CTAs (e.g. "Importa proveedores antes de generar").
   */
  requiredData: ReportDataKey[];
  formats: ReportFormat[];
  generatePdf?(input: ReportRenderInput): Promise<ReportOutput>;
  generateExcel?(input: ReportRenderInput): Promise<ReportOutput>;
  generateCsv?(input: ReportRenderInput): Promise<ReportOutput>;
}

export type ReportDataKey =
  | "purchase_invoices"
  | "purchase_invoice_lines"
  | "sales_summaries"
  | "stock_snapshots"
  | "expenses"
  | "suppliers"
  | "import_batches";

/** Concrete data injected by the report engine right before rendering. */
export interface ReportRenderInput extends ReportInput {
  data: ReportRenderData;
}

import type {
  Expense,
  PurchaseInvoice,
  PurchaseInvoiceLine,
} from "./finance";
import type {
  SalesSummary,
  StockSnapshot,
  Supplier,
} from "./pharmacy";
import type { ImportBatch } from "./imports";

export interface ReportRenderData {
  purchaseInvoices: PurchaseInvoice[];
  purchaseInvoiceLines: PurchaseInvoiceLine[];
  salesSummaries: SalesSummary[];
  stockSnapshots: StockSnapshot[];
  expenses: Expense[];
  suppliers: Supplier[];
  importBatches: ImportBatch[];
}
