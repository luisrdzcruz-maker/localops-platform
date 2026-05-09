import { buildAdapter } from "@/lib/integrations/common/baseAdapter";
import type { ImportType } from "@/types/imports";
import type { PharmacySystemAdapter } from "@/types/integrations";

const FILENAME_HINTS: Array<{ regex: RegExp; importType: ImportType; reason: string }> = [
  { regex: /farmatic.*compra/i, importType: "purchase_invoices", reason: "Filename hint: farmatic + compra" },
  { regex: /farmatic.*venta/i, importType: "sales_summary", reason: "Filename hint: farmatic + venta" },
  { regex: /farmatic.*stock/i, importType: "stock_snapshot", reason: "Filename hint: farmatic + stock" },
  { regex: /farmatic.*linea/i, importType: "purchase_invoice_lines", reason: "Filename hint: farmatic + linea" },
];

export const farmaticAdapter: PharmacySystemAdapter = buildAdapter({
  id: "farmatic",
  name: "Farmatic",
  sourceSystem: "farmatic",
  status: "file_based_only",
  capabilities: [
    "import_purchase_invoices",
    "import_purchase_invoice_lines",
    "import_sales_summary",
    "import_stock_snapshot",
  ],
  tagline:
    "Importa exportaciones de Farmatic. La conexión directa requiere validación con tu proveedor IT.",
  disclaimer:
    "PharmaOps no se conecta directamente a Farmatic en esta versión. Importación por fichero exportado desde Farmatic.",
  detect({ filename }) {
    for (const hint of FILENAME_HINTS) {
      if (hint.regex.test(filename)) {
        return {
          importType: hint.importType,
          confidence: 0.8,
          reasoning: hint.reason,
        };
      }
    }
    return null;
  },
});
