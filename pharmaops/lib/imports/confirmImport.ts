/**
 * Apply normalized + validated rows into the demo store.
 *
 * Each ImportType has its own mapper from NormalizedImportRow → business
 * entity. Rows that failed validation are skipped here (they should already
 * have been blocked by the UI before the user confirmed).
 */

import { format } from "date-fns";
import {
  appendImportBatch,
  applyNormalizedImport,
} from "@/lib/demo/store";
import { DEMO_PHARMACY, DEMO_USER } from "@/lib/demo/session";
import type {
  ColumnMapping,
  ImportBatch,
  ImportRow,
  ImportType,
  NormalizedImportRow,
  RawRow,
  SourceSystem,
} from "@/types/imports";
import type {
  Expense,
  PurchaseInvoice,
  PurchaseInvoiceLine,
  VatRate,
} from "@/types/finance";
import type {
  ProductFamily,
  SalesSummary,
  StockSnapshot,
  Supplier,
} from "@/types/pharmacy";

interface ConfirmInput {
  importType: ImportType;
  sourceSystem: SourceSystem;
  filename: string;
  mapping: ColumnMapping;
  rows: RawRow[];
  normalizedRows: NormalizedImportRow[];
  validIndexes: Set<number>;
  metadata?: Record<string, unknown>;
}

export interface ConfirmResult {
  batch: ImportBatch;
  appliedCount: number;
}

export function confirmImport(input: ConfirmInput): ConfirmResult {
  const id = `imp-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const batch: ImportBatch = {
    id,
    pharmacyId: DEMO_PHARMACY.id,
    userId: DEMO_USER.id,
    sourceSystem: input.sourceSystem,
    importType: input.importType,
    originalFilename: input.filename,
    status: input.validIndexes.size === input.rows.length ? "confirmed" : "validated",
    rowCount: input.rows.length,
    validRowCount: input.validIndexes.size,
    errorRowCount: input.rows.length - input.validIndexes.size,
    warningRowCount: 0,
    mapping: input.mapping,
    metadata: input.metadata ?? {},
    createdAt: new Date().toISOString(),
  };

  const importRows: ImportRow[] = input.rows.map((raw, idx) => ({
    id: `${id}-r${idx}`,
    batchId: id,
    rowIndex: idx,
    rawData: raw,
    normalizedData: input.normalizedRows[idx] ?? null,
    validationStatus: input.validIndexes.has(idx) ? "valid" : "error",
    validationErrors: [],
    createdAt: batch.createdAt,
  }));

  appendImportBatch(batch, importRows);

  let appliedCount = 0;
  switch (input.importType) {
    case "suppliers":
      appliedCount = applySuppliers(input, batch.id);
      break;
    case "purchase_invoices":
      appliedCount = applyPurchaseInvoices(input, batch.id);
      break;
    case "purchase_invoice_lines":
      appliedCount = applyPurchaseInvoiceLines(input, batch.id);
      break;
    case "sales_summary":
      appliedCount = applySalesSummaries(input, batch.id);
      break;
    case "stock_snapshot":
      appliedCount = applyStockSnapshots(input, batch.id);
      break;
    case "expenses":
      appliedCount = applyExpenses(input);
      break;
    default:
      // accounting_movements / unycop_export / generic — recorded as a batch
      // but no business-table inserts for the MVP.
      break;
  }

  return { batch, appliedCount };
}

/* ----------------------------- per-type mappers --------------------------- */

function applySuppliers(input: ConfirmInput, _batchId: string): number {
  const now = new Date().toISOString();
  const newSuppliers: Supplier[] = [];
  for (let i = 0; i < input.normalizedRows.length; i++) {
    if (!input.validIndexes.has(i)) continue;
    const r = input.normalizedRows[i] as Record<string, unknown>;
    const name = String(r.name ?? "").trim();
    if (!name) continue;
    newSuppliers.push({
      id: `sup-imp-${Date.now()}-${i}`,
      pharmacyId: DEMO_PHARMACY.id,
      name,
      taxId: optStr(r.taxId),
      email: optStr(r.email),
      phone: optStr(r.phone),
      contactPerson: optStr(r.contactPerson),
      paymentTermsDays: optNum(r.paymentTermsDays),
      notes: optStr(r.notes),
      status: "active",
      preferred: false,
      createdAt: now,
      updatedAt: now,
    });
  }
  applyNormalizedImport({ suppliers: newSuppliers });
  return newSuppliers.length;
}

function applyPurchaseInvoices(input: ConfirmInput, batchId: string): number {
  const now = new Date().toISOString();
  const invoices: PurchaseInvoice[] = [];
  for (let i = 0; i < input.normalizedRows.length; i++) {
    if (!input.validIndexes.has(i)) continue;
    const r = input.normalizedRows[i] as Record<string, unknown>;
    invoices.push({
      id: `pi-imp-${Date.now()}-${i}`,
      pharmacyId: DEMO_PHARMACY.id,
      supplierId: null,
      importBatchId: batchId,
      invoiceNumber: String(r.invoiceNumber ?? "").trim(),
      supplierName: String(r.supplierName ?? "").trim(),
      supplierTaxId: optStr(r.supplierTaxId),
      invoiceDate: String(r.invoiceDate ?? ""),
      dueDate: optStr(r.dueDate),
      netAmount: Number(r.netAmount ?? 0),
      vatAmount: Number(r.vatAmount ?? 0),
      grossAmount: Number(r.grossAmount ?? 0),
      paymentStatus: normalisePaymentStatus(r.paymentStatus) ?? "pending",
      category: (optStr(r.category) as PurchaseInvoice["category"]) ?? "purchases",
      notes: optStr(r.notes),
      createdAt: now,
      updatedAt: now,
    });
  }
  applyNormalizedImport({ purchaseInvoices: invoices });
  return invoices.length;
}

function applyPurchaseInvoiceLines(input: ConfirmInput, batchId: string): number {
  const now = new Date().toISOString();
  const lines: PurchaseInvoiceLine[] = [];
  for (let i = 0; i < input.normalizedRows.length; i++) {
    if (!input.validIndexes.has(i)) continue;
    const r = input.normalizedRows[i] as Record<string, unknown>;
    lines.push({
      id: `pil-imp-${Date.now()}-${i}`,
      pharmacyId: DEMO_PHARMACY.id,
      purchaseInvoiceId: null,
      importBatchId: batchId,
      invoiceNumber: String(r.invoiceNumber ?? "").trim(),
      productCode: optStr(r.productCode),
      cnCode: optStr(r.cnCode),
      productName: String(r.productName ?? "").trim(),
      family: normaliseFamily(r.family) ?? "otros",
      quantity: Number(r.quantity ?? 0),
      unitCost: Number(r.unitCost ?? 0),
      vatRate: normaliseVatRate(r.vatRate) ?? 0,
      discount: Number(r.discount ?? 0),
      totalCost: Number(r.totalCost ?? 0),
      createdAt: now,
    });
  }
  applyNormalizedImport({ purchaseInvoiceLines: lines });
  return lines.length;
}

function applySalesSummaries(input: ConfirmInput, batchId: string): number {
  const now = new Date().toISOString();
  const summaries: SalesSummary[] = [];
  for (let i = 0; i < input.normalizedRows.length; i++) {
    if (!input.validIndexes.has(i)) continue;
    const r = input.normalizedRows[i] as Record<string, unknown>;
    summaries.push({
      id: `sales-imp-${Date.now()}-${i}`,
      pharmacyId: DEMO_PHARMACY.id,
      importBatchId: batchId,
      date: String(r.date ?? ""),
      family: normaliseFamily(r.family) ?? "otros",
      grossSales: Number(r.grossSales ?? 0),
      netSales: Number(r.netSales ?? 0),
      vatAmount: Number(r.vatAmount ?? 0),
      units: Number(r.units ?? 0),
      paymentMethod: optStr(r.paymentMethod) as never,
      marginAmount: optNum(r.marginAmount),
      marginPercent: optNum(r.marginPercent),
      createdAt: now,
    });
  }
  applyNormalizedImport({ salesSummaries: summaries });
  return summaries.length;
}

function applyStockSnapshots(input: ConfirmInput, batchId: string): number {
  const now = new Date().toISOString();
  const snapshots: StockSnapshot[] = [];
  for (let i = 0; i < input.normalizedRows.length; i++) {
    if (!input.validIndexes.has(i)) continue;
    const r = input.normalizedRows[i] as Record<string, unknown>;
    snapshots.push({
      id: `stk-imp-${Date.now()}-${i}`,
      pharmacyId: DEMO_PHARMACY.id,
      importBatchId: batchId,
      snapshotDate:
        String(r.snapshotDate ?? format(new Date(), "yyyy-MM-dd")),
      productCode: optStr(r.productCode),
      cnCode: optStr(r.cnCode),
      productName: String(r.productName ?? "").trim(),
      family: normaliseFamily(r.family) ?? "otros",
      quantityOnHand: Number(r.quantityOnHand ?? 0),
      unitCost: optNum(r.unitCost),
      pvp: optNum(r.pvp),
      expiryDate: optStr(r.expiryDate),
      supplierName: optStr(r.supplierName),
      reorderPoint: optNum(r.reorderPoint),
      createdAt: now,
    });
  }
  applyNormalizedImport({ stockSnapshots: snapshots });
  return snapshots.length;
}

function applyExpenses(input: ConfirmInput): number {
  const now = new Date().toISOString();
  const expenses: Expense[] = [];
  for (let i = 0; i < input.normalizedRows.length; i++) {
    if (!input.validIndexes.has(i)) continue;
    const r = input.normalizedRows[i] as Record<string, unknown>;
    const gross = Number(r.grossAmount ?? 0);
    const vat = Number(r.vatAmount ?? 0);
    const net = optNum(r.netAmount) ?? Math.round((gross - vat) * 100) / 100;
    expenses.push({
      id: `exp-imp-${Date.now()}-${i}`,
      pharmacyId: DEMO_PHARMACY.id,
      date: String(r.date ?? ""),
      vendor: String(r.vendor ?? "").trim(),
      category: (optStr(r.category) ?? "other") as Expense["category"],
      description: String(r.description ?? "").trim(),
      netAmount: net,
      vatAmount: vat,
      grossAmount: gross,
      paymentMethod: optStr(r.paymentMethod),
      paymentStatus: normalisePaymentStatus(r.paymentStatus) ?? "paid",
      attachmentUrl: null,
      notes: optStr(r.notes),
      createdAt: now,
      updatedAt: now,
    });
  }
  applyNormalizedImport({ expenses });
  return expenses.length;
}

/* ------------------------------ small utils ------------------------------- */

function optStr(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const s = String(value).trim();
  return s === "" ? null : s;
}

function optNum(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function normalisePaymentStatus(
  value: unknown
): PurchaseInvoice["paymentStatus"] | null {
  const s = optStr(value)?.toLowerCase();
  if (!s) return null;
  switch (s) {
    case "pending":
    case "pendiente":
      return "pending";
    case "partial":
    case "parcial":
      return "partial";
    case "paid":
    case "pagada":
    case "pagado":
      return "paid";
    case "overdue":
    case "vencida":
    case "vencido":
      return "overdue";
    default:
      return null;
  }
}

const FAMILY_ALIASES: Record<string, ProductFamily> = {
  medicamentos: "medicamentos",
  medicamento: "medicamentos",
  parafarmacia: "parafarmacia",
  para: "parafarmacia",
  dermocosmetica: "dermocosmetica",
  dermocosmética: "dermocosmetica",
  cosmetica: "dermocosmetica",
  cosmética: "dermocosmetica",
  infantil: "infantil",
  bebe: "infantil",
  bebé: "infantil",
  ortopedia: "ortopedia",
  servicios: "servicios",
  otros: "otros",
};

function normaliseFamily(value: unknown): ProductFamily | null {
  const s = optStr(value)?.toLowerCase();
  if (!s) return null;
  return FAMILY_ALIASES[s] ?? null;
}

function normaliseVatRate(value: unknown): VatRate | null {
  const n = optNum(value);
  if (n === null) return null;
  if (n === 0 || n === 4 || n === 10 || n === 21) return n as VatRate;
  // Common alternates (e.g. 0.04, 0.1, 0.21)
  if (n === 0.04) return 4;
  if (n === 0.1) return 10;
  if (n === 0.21) return 21;
  return null;
}
