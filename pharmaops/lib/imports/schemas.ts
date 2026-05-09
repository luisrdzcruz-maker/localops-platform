/**
 * Canonical field descriptors per ImportType.
 *
 * Each ImportType has a list of required + optional fields with hints used
 * by the auto-mapper. Adding a new field is the single place a new column
 * has to be wired — autoMap, normalize and validate all read from here.
 */

import type {
  ImportFieldDescriptor,
  ImportType,
  ImportTypeSchema,
} from "@/types/imports";

const supplierSchema: ImportTypeSchema = {
  importType: "suppliers",
  required: [
    {
      key: "name",
      label: "Nombre proveedor",
      hints: ["nombre", "proveedor", "supplier", "razon", "razón"],
      type: "string",
    },
  ],
  optional: [
    { key: "taxId", label: "NIF/CIF", hints: ["nif", "cif", "tax", "vat"], type: "string" },
    { key: "email", label: "Email", hints: ["email", "correo", "mail"], type: "string" },
    { key: "phone", label: "Teléfono", hints: ["telefono", "teléfono", "phone", "tel"], type: "string" },
    { key: "contactPerson", label: "Persona de contacto", hints: ["contacto", "contact", "persona"], type: "string" },
    { key: "paymentTermsDays", label: "Plazo de pago (días)", hints: ["plazo", "dias", "días", "payment", "term"], type: "number" },
    { key: "notes", label: "Notas", hints: ["notas", "observaciones", "comentarios", "notes"], type: "string" },
  ],
};

const purchaseInvoiceSchema: ImportTypeSchema = {
  importType: "purchase_invoices",
  required: [
    { key: "invoiceNumber", label: "Nº factura", hints: ["numero", "número", "factura", "invoice", "n.factura"], type: "string" },
    { key: "supplierName", label: "Proveedor", hints: ["proveedor", "supplier", "razon"], type: "string" },
    { key: "invoiceDate", label: "Fecha factura", hints: ["fecha", "date", "emision", "emisión"], type: "date" },
    { key: "netAmount", label: "Base imponible", hints: ["base", "neto", "net", "imponible"], type: "number" },
    { key: "vatAmount", label: "IVA", hints: ["iva", "vat", "tax"], type: "number" },
    { key: "grossAmount", label: "Total factura", hints: ["total", "bruto", "gross", "importe"], type: "number" },
  ],
  optional: [
    { key: "supplierTaxId", label: "NIF proveedor", hints: ["nif", "cif", "tax"], type: "string" },
    { key: "dueDate", label: "Fecha vencimiento", hints: ["vencimiento", "vto", "due"], type: "date" },
    {
      key: "paymentStatus",
      label: "Estado pago",
      hints: ["estado", "status", "pago", "payment"],
      type: "enum",
      enumValues: ["pending", "partial", "paid", "overdue", "pendiente", "parcial", "pagada", "vencida"],
    },
    { key: "category", label: "Categoría", hints: ["categoria", "categoría", "category"], type: "string" },
    { key: "notes", label: "Notas", hints: ["notas", "observaciones", "notes"], type: "string" },
  ],
};

const purchaseInvoiceLineSchema: ImportTypeSchema = {
  importType: "purchase_invoice_lines",
  required: [
    { key: "invoiceNumber", label: "Nº factura", hints: ["numero", "número", "factura", "invoice"], type: "string" },
    { key: "productName", label: "Producto", hints: ["producto", "articulo", "artículo", "descripcion", "descripción", "product"], type: "string" },
    { key: "quantity", label: "Cantidad", hints: ["cantidad", "qty", "uds", "unidades"], type: "number" },
    { key: "unitCost", label: "Precio unitario", hints: ["precio", "coste", "pvl", "unit"], type: "number" },
    { key: "totalCost", label: "Total línea", hints: ["total", "importe", "subtotal"], type: "number" },
  ],
  optional: [
    { key: "productCode", label: "Código producto", hints: ["codigo", "código", "code", "ref"], type: "string" },
    { key: "cnCode", label: "CN", hints: ["cn", "nacional"], type: "string" },
    { key: "family", label: "Familia", hints: ["familia", "family", "categoria", "categoría"], type: "string" },
    { key: "vatRate", label: "Tipo IVA", hints: ["iva", "vat", "rate", "tipo"], type: "number" },
    { key: "discount", label: "Descuento", hints: ["descuento", "discount", "dto"], type: "number" },
  ],
};

const salesSummarySchema: ImportTypeSchema = {
  importType: "sales_summary",
  required: [
    { key: "date", label: "Fecha", hints: ["fecha", "date", "periodo", "período"], type: "date" },
    { key: "family", label: "Familia", hints: ["familia", "categoria", "categoría", "family"], type: "string" },
    { key: "grossSales", label: "Ventas brutas", hints: ["bruto", "gross", "total"], type: "number" },
    { key: "netSales", label: "Ventas netas", hints: ["neto", "net"], type: "number" },
  ],
  optional: [
    { key: "vatAmount", label: "IVA", hints: ["iva", "vat"], type: "number" },
    { key: "units", label: "Unidades", hints: ["unidades", "uds", "units"], type: "number" },
    { key: "paymentMethod", label: "Forma de pago", hints: ["pago", "metodo", "método", "payment"], type: "string" },
    { key: "marginAmount", label: "Margen €", hints: ["margen", "margin", "beneficio"], type: "number" },
    { key: "marginPercent", label: "Margen %", hints: ["margen", "margin", "porcentaje", "%"], type: "number" },
  ],
};

const stockSnapshotSchema: ImportTypeSchema = {
  importType: "stock_snapshot",
  required: [
    { key: "snapshotDate", label: "Fecha inventario", hints: ["fecha", "date", "inventario"], type: "date" },
    { key: "productName", label: "Producto", hints: ["producto", "articulo", "artículo", "descripcion", "descripción", "product"], type: "string" },
    { key: "quantityOnHand", label: "Stock actual", hints: ["stock", "cantidad", "existencias", "qty"], type: "number" },
  ],
  optional: [
    { key: "productCode", label: "Código producto", hints: ["codigo", "código", "code", "ref"], type: "string" },
    { key: "cnCode", label: "CN", hints: ["cn", "nacional"], type: "string" },
    { key: "family", label: "Familia", hints: ["familia", "family", "categoria", "categoría"], type: "string" },
    { key: "unitCost", label: "Coste unitario", hints: ["coste", "pvl", "unit"], type: "number" },
    { key: "pvp", label: "PVP", hints: ["pvp", "venta"], type: "number" },
    { key: "expiryDate", label: "Caducidad", hints: ["caducidad", "expiry", "exp"], type: "date" },
    { key: "supplierName", label: "Proveedor", hints: ["proveedor", "supplier"], type: "string" },
    { key: "reorderPoint", label: "Punto de pedido", hints: ["pedido", "reorder", "minimo", "mínimo"], type: "number" },
  ],
};

const expensesSchema: ImportTypeSchema = {
  importType: "expenses",
  required: [
    { key: "date", label: "Fecha", hints: ["fecha", "date"], type: "date" },
    { key: "vendor", label: "Proveedor / emisor", hints: ["vendor", "proveedor", "emisor", "razon"], type: "string" },
    { key: "description", label: "Descripción", hints: ["descripcion", "descripción", "concepto", "description"], type: "string" },
    { key: "grossAmount", label: "Total", hints: ["total", "importe", "bruto", "gross"], type: "number" },
  ],
  optional: [
    { key: "category", label: "Categoría", hints: ["categoria", "categoría", "category"], type: "string" },
    { key: "netAmount", label: "Base imponible", hints: ["base", "neto", "net"], type: "number" },
    { key: "vatAmount", label: "IVA", hints: ["iva", "vat"], type: "number" },
    { key: "paymentMethod", label: "Forma de pago", hints: ["pago", "metodo", "método"], type: "string" },
    {
      key: "paymentStatus",
      label: "Estado pago",
      hints: ["estado", "status"],
      type: "enum",
      enumValues: ["pending", "partial", "paid", "overdue"],
    },
    { key: "notes", label: "Notas", hints: ["notas", "notes"], type: "string" },
  ],
};

const accountingMovementsSchema: ImportTypeSchema = {
  importType: "accounting_movements",
  required: [
    { key: "date", label: "Fecha", hints: ["fecha", "date"], type: "date" },
    { key: "description", label: "Descripción", hints: ["descripcion", "descripción", "concepto"], type: "string" },
  ],
  optional: [
    { key: "category", label: "Categoría", hints: ["categoria", "categoría"], type: "string" },
    { key: "debit", label: "Debe", hints: ["debe", "debit"], type: "number" },
    { key: "credit", label: "Haber", hints: ["haber", "credit"], type: "number" },
    { key: "counterparty", label: "Contraparte", hints: ["contraparte", "counterparty"], type: "string" },
    { key: "notes", label: "Notas", hints: ["notas", "notes"], type: "string" },
  ],
};

const unycopExportSchema: ImportTypeSchema = {
  importType: "unycop_export",
  required: [],
  optional: [],
};

const genericSchema: ImportTypeSchema = {
  importType: "generic",
  required: [],
  optional: [],
};

const SCHEMAS: Record<ImportType, ImportTypeSchema> = {
  suppliers: supplierSchema,
  purchase_invoices: purchaseInvoiceSchema,
  purchase_invoice_lines: purchaseInvoiceLineSchema,
  sales_summary: salesSummarySchema,
  stock_snapshot: stockSnapshotSchema,
  expenses: expensesSchema,
  accounting_movements: accountingMovementsSchema,
  unycop_export: unycopExportSchema,
  generic: genericSchema,
};

export function getImportTypeSchema(type: ImportType): ImportTypeSchema {
  return SCHEMAS[type];
}

export function listAllFields(type: ImportType): ImportFieldDescriptor[] {
  const schema = getImportTypeSchema(type);
  return [...schema.required, ...schema.optional];
}
