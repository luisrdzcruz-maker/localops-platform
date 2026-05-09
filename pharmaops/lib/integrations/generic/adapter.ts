import { buildAdapter } from "@/lib/integrations/common/baseAdapter";
import { normalizeColumnName } from "@/lib/imports/parser";
import type { ImportType } from "@/types/imports";
import type { PharmacySystemAdapter } from "@/types/integrations";

const HEADER_SIGNATURES: Array<{
  required: string[];
  importType: ImportType;
  reason: string;
}> = [
  {
    required: ["nombre"],
    importType: "suppliers",
    reason: "Cabecera 'nombre' detectada — probablemente proveedores.",
  },
  {
    required: ["fecha", "importe", "concepto"],
    importType: "expenses",
    reason: "Cabeceras 'fecha + importe + concepto' detectadas.",
  },
  {
    required: ["factura", "proveedor", "fecha"],
    importType: "purchase_invoices",
    reason: "Cabeceras de factura de compra detectadas.",
  },
];

export const genericAdapter: PharmacySystemAdapter = buildAdapter({
  id: "generic",
  name: "Excel/CSV genérico",
  sourceSystem: "generic",
  status: "active",
  capabilities: [
    "import_purchase_invoices",
    "import_purchase_invoice_lines",
    "import_sales_summary",
    "import_stock_snapshot",
    "import_suppliers",
    "import_expenses",
    "import_accounting_movements",
  ],
  tagline:
    "Importa cualquier Excel/CSV. Tú eliges el tipo y mapeas las columnas.",
  disclaimer:
    "Adaptador genérico. La detección automática es 'best effort' — revisa siempre el mapeo antes de confirmar.",
  detect(_metadata, headers) {
    const normalised = new Set(headers.map((h) => normalizeColumnName(h)));
    for (const sig of HEADER_SIGNATURES) {
      const matches = sig.required.filter((h) =>
        Array.from(normalised).some((n) => n.includes(h))
      ).length;
      if (matches >= sig.required.length) {
        return {
          importType: sig.importType,
          confidence: 0.55,
          reasoning: sig.reason,
        };
      }
    }
    return {
      importType: "generic",
      confidence: 0.2,
      reasoning: "Sin coincidencias claras. Selecciona manualmente el tipo de importación.",
    };
  },
});
