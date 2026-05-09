/**
 * Row validation per ImportType using Zod schemas.
 *
 * Validation runs against NormalizedImportRow (already coerced). The errors
 * carry rowIndex + field so the UI can highlight exactly where the user
 * needs to fix things.
 */

import { z } from "zod";
import type {
  ImportRowValidationIssue,
  ImportType,
  ImportValidationResult,
  NormalizedImportRow,
} from "@/types/imports";

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "fecha-invalida");

const positiveNumber = z.number().nonnegative("valor-negativo");

const supplierRow = z.object({
  name: z.string().min(2, "campo-vacio"),
  taxId: z.string().nullable().optional(),
  email: z
    .string()
    .email("email-invalido")
    .nullable()
    .optional()
    .or(z.null())
    .or(z.undefined()),
  phone: z.string().nullable().optional(),
  contactPerson: z.string().nullable().optional(),
  paymentTermsDays: z.number().int().nonnegative().nullable().optional(),
  notes: z.string().nullable().optional(),
});

const purchaseInvoiceRow = z
  .object({
    invoiceNumber: z.string().min(1, "campo-vacio"),
    supplierName: z.string().min(2, "campo-vacio"),
    invoiceDate: isoDate,
    netAmount: positiveNumber,
    vatAmount: positiveNumber,
    grossAmount: positiveNumber,
    supplierTaxId: z.string().nullable().optional(),
    dueDate: isoDate.nullable().optional(),
    paymentStatus: z
      .enum([
        "pending",
        "partial",
        "paid",
        "overdue",
        "pendiente",
        "parcial",
        "pagada",
        "vencida",
      ])
      .nullable()
      .optional(),
    category: z.string().nullable().optional(),
    notes: z.string().nullable().optional(),
  })
  .superRefine((data, ctx) => {
    const sum = data.netAmount + data.vatAmount;
    if (Math.abs(sum - data.grossAmount) > Math.max(0.05, sum * 0.005)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "totales-incoherentes",
        path: ["grossAmount"],
      });
    }
  });

const purchaseInvoiceLineRow = z.object({
  invoiceNumber: z.string().min(1, "campo-vacio"),
  productName: z.string().min(1, "campo-vacio"),
  quantity: z.number(),
  unitCost: z.number(),
  totalCost: z.number(),
  productCode: z.string().nullable().optional(),
  cnCode: z.string().nullable().optional(),
  family: z.string().nullable().optional(),
  vatRate: z.number().nullable().optional(),
  discount: z.number().nullable().optional(),
});

const salesSummaryRow = z.object({
  date: isoDate,
  family: z.string().min(1, "campo-vacio"),
  grossSales: z.number(),
  netSales: z.number(),
  vatAmount: z.number().nullable().optional(),
  units: z.number().nullable().optional(),
  paymentMethod: z.string().nullable().optional(),
  marginAmount: z.number().nullable().optional(),
  marginPercent: z.number().nullable().optional(),
});

const stockSnapshotRow = z.object({
  snapshotDate: isoDate,
  productName: z.string().min(1, "campo-vacio"),
  quantityOnHand: z.number(),
  productCode: z.string().nullable().optional(),
  cnCode: z.string().nullable().optional(),
  family: z.string().nullable().optional(),
  unitCost: z.number().nullable().optional(),
  pvp: z.number().nullable().optional(),
  expiryDate: isoDate.nullable().optional(),
  supplierName: z.string().nullable().optional(),
  reorderPoint: z.number().nullable().optional(),
});

const expensesRow = z.object({
  date: isoDate,
  vendor: z.string().min(1, "campo-vacio"),
  description: z.string().min(1, "campo-vacio"),
  grossAmount: z.number(),
  category: z.string().nullable().optional(),
  netAmount: z.number().nullable().optional(),
  vatAmount: z.number().nullable().optional(),
  paymentMethod: z.string().nullable().optional(),
  paymentStatus: z
    .enum(["pending", "partial", "paid", "overdue"])
    .nullable()
    .optional(),
  notes: z.string().nullable().optional(),
});

const accountingMovementsRow = z.object({
  date: isoDate,
  description: z.string().min(1, "campo-vacio"),
  category: z.string().nullable().optional(),
  debit: z.number().nullable().optional(),
  credit: z.number().nullable().optional(),
  counterparty: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

const SCHEMAS: Partial<Record<ImportType, z.ZodTypeAny>> = {
  suppliers: supplierRow,
  purchase_invoices: purchaseInvoiceRow,
  purchase_invoice_lines: purchaseInvoiceLineRow,
  sales_summary: salesSummaryRow,
  stock_snapshot: stockSnapshotRow,
  expenses: expensesRow,
  accounting_movements: accountingMovementsRow,
};

/**
 * Validate normalized rows against the importType's Zod schema.
 *
 * Generic and unycop_export types skip validation — callers must classify
 * those into a concrete type first.
 */
export function validateRows(
  importType: ImportType,
  rows: NormalizedImportRow[]
): ImportValidationResult {
  const schema = SCHEMAS[importType];
  if (!schema) {
    return {
      valid: true,
      totalRows: rows.length,
      validRows: rows.length,
      errorRows: 0,
      warningRows: 0,
      issues: [],
    };
  }

  const issues: ImportRowValidationIssue[] = [];
  let validRows = 0;
  let errorRows = 0;
  const seenInvoiceNumbers = new Set<string>();

  for (const row of rows) {
    const result = schema.safeParse(row);
    if (!result.success) {
      errorRows += 1;
      for (const err of result.error.issues) {
        issues.push({
          rowIndex: row.__rowIndex,
          field: err.path[0] !== undefined ? String(err.path[0]) : null,
          severity: "error",
          code: err.message,
          message: humaniseIssue(err.message, err.path[0]),
        });
      }
      continue;
    }
    validRows += 1;

    // Lightweight cross-row warnings: duplicate invoice numbers (purchase_invoices).
    if (importType === "purchase_invoices") {
      const inv = result.data as { invoiceNumber: string };
      if (seenInvoiceNumbers.has(inv.invoiceNumber)) {
        issues.push({
          rowIndex: row.__rowIndex,
          field: "invoiceNumber",
          severity: "warning",
          code: "duplicado",
          message: "Número de factura ya visto en este lote.",
        });
      }
      seenInvoiceNumbers.add(inv.invoiceNumber);
    }
  }

  const warningRows = new Set(
    issues.filter((i) => i.severity === "warning").map((i) => i.rowIndex)
  ).size;

  return {
    valid: errorRows === 0,
    totalRows: rows.length,
    validRows,
    errorRows,
    warningRows,
    issues,
  };
}

function humaniseIssue(code: string, field: unknown): string {
  switch (code) {
    case "campo-vacio":
      return `Campo obligatorio vacío${field ? ` (${field})` : ""}.`;
    case "fecha-invalida":
      return "Fecha no reconocida.";
    case "valor-negativo":
      return "Valor negativo donde se esperaba positivo.";
    case "totales-incoherentes":
      return "El total no cuadra con base + IVA.";
    case "email-invalido":
      return "Email no válido.";
    case "duplicado":
      return "Valor duplicado.";
    default:
      return code;
  }
}
