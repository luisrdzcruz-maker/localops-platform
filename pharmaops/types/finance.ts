/**
 * Finance types — purchase invoices, expenses, VAT, cash flow, accountant pack.
 *
 * Design rules:
 * - All amounts are in EUR, stored as plain numbers at 2-decimal precision.
 *   Aggregations stay safe at MVP volumes (<100k rows). When this grows,
 *   migrate to integer cents.
 * - This is *management* accounting — not double-entry. The shape is built so
 *   double-entry can be added later without rewriting the read models.
 */

import type { PharmacyId, ProductFamily, SupplierId } from "./pharmacy";
import type { ImportBatchId } from "./imports";

export type PurchaseInvoiceId = string;
export type PurchaseInvoiceLineId = string;
export type ExpenseId = string;
export type AccountingMovementId = string;

export type PaymentStatus = "pending" | "partial" | "paid" | "overdue";

export const PAYMENT_STATUSES: PaymentStatus[] = [
  "pending",
  "partial",
  "paid",
  "overdue",
];

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: "Pendiente",
  partial: "Parcial",
  paid: "Pagada",
  overdue: "Vencida",
};

/** Spanish accounting category buckets used in expenses + accountant pack. */
export type AccountingCategory =
  | "purchases"
  | "rent"
  | "payroll"
  | "utilities"
  | "insurance"
  | "professional_services"
  | "software"
  | "marketing"
  | "financing"
  | "taxes"
  | "other";

export const ACCOUNTING_CATEGORIES: AccountingCategory[] = [
  "purchases",
  "rent",
  "payroll",
  "utilities",
  "insurance",
  "professional_services",
  "software",
  "marketing",
  "financing",
  "taxes",
  "other",
];

export const ACCOUNTING_CATEGORY_LABELS: Record<AccountingCategory, string> = {
  purchases: "Compras",
  rent: "Alquiler",
  payroll: "Nóminas",
  utilities: "Suministros",
  insurance: "Seguros",
  professional_services: "Servicios profesionales",
  software: "Software",
  marketing: "Marketing",
  financing: "Financiación",
  taxes: "Impuestos",
  other: "Otros",
};

/**
 * Spanish IVA rates we routinely encounter in pharmacy purchases.
 * Pharmacy-specific reduced rates apply to medicines (4%) and many
 * parapharmacy items (10%). Office supplies / services hit 21%.
 */
export type VatRate = 0 | 4 | 10 | 21;

export const VAT_RATES: VatRate[] = [0, 4, 10, 21];

export interface PurchaseInvoice {
  id: PurchaseInvoiceId;
  pharmacyId: PharmacyId;
  supplierId: SupplierId | null;
  importBatchId: ImportBatchId | null;
  invoiceNumber: string;
  supplierName: string;
  supplierTaxId: string | null;
  invoiceDate: string;
  dueDate: string | null;
  netAmount: number;
  vatAmount: number;
  grossAmount: number;
  paymentStatus: PaymentStatus;
  category: AccountingCategory;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PurchaseInvoiceLine {
  id: PurchaseInvoiceLineId;
  pharmacyId: PharmacyId;
  purchaseInvoiceId: PurchaseInvoiceId | null;
  importBatchId: ImportBatchId | null;
  invoiceNumber: string;
  productCode: string | null;
  cnCode: string | null;
  productName: string;
  family: ProductFamily;
  quantity: number;
  unitCost: number;
  vatRate: VatRate;
  discount: number;
  totalCost: number;
  createdAt: string;
}

export interface Expense {
  id: ExpenseId;
  pharmacyId: PharmacyId;
  date: string;
  vendor: string;
  category: AccountingCategory;
  description: string;
  netAmount: number;
  vatAmount: number;
  grossAmount: number;
  paymentMethod: string | null;
  paymentStatus: PaymentStatus;
  attachmentUrl: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * Generic accounting movement — used when the source system gives us a flat
 * journal-like export that doesn't cleanly fit invoice/expense.
 */
export interface AccountingMovement {
  id: AccountingMovementId;
  pharmacyId: PharmacyId;
  importBatchId: ImportBatchId | null;
  date: string;
  description: string;
  category: AccountingCategory;
  debit: number;
  credit: number;
  counterparty: string | null;
  notes: string | null;
  createdAt: string;
}

/* -------------------------------- Read models ------------------------------ */

/** VAT estimate for a period — *management aid*, not a fiscal declaration. */
export interface VatPeriodSummary {
  periodStart: string;
  periodEnd: string;
  outputVat: number;
  inputVat: number;
  netVat: number;
  byRate: Array<{
    rate: VatRate;
    outputVat: number;
    inputVat: number;
  }>;
  /** UI must surface this — VeriFactu / AEAT submission is not in scope. */
  disclaimer: string;
}

export interface CashFlowEstimate {
  periodStart: string;
  periodEnd: string;
  estimatedInflow: number;
  estimatedOutflow: number;
  estimatedNet: number;
  pendingSupplierInvoices: number;
  recurringExpenses: number;
  disclaimer: string;
}

export interface AccountantPackEntry {
  category: AccountingCategory;
  count: number;
  totalNet: number;
  totalVat: number;
  totalGross: number;
}

export interface AccountantPack {
  pharmacyId: PharmacyId;
  periodStart: string;
  periodEnd: string;
  generatedAt: string;
  entries: AccountantPackEntry[];
  totals: {
    totalNet: number;
    totalVat: number;
    totalGross: number;
  };
  disclaimer: string;
}
