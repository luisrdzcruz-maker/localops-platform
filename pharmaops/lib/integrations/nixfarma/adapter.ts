import { buildAdapter } from "@/lib/integrations/common/baseAdapter";
import type { ImportType } from "@/types/imports";
import type { PharmacySystemAdapter } from "@/types/integrations";

const FILENAME_HINTS: Array<{ regex: RegExp; importType: ImportType; reason: string }> = [
  { regex: /nixfarma.*compra/i, importType: "purchase_invoices", reason: "Filename hint: nixfarma + compra" },
  { regex: /nixfarma.*venta/i, importType: "sales_summary", reason: "Filename hint: nixfarma + venta" },
  { regex: /nixfarma.*stock/i, importType: "stock_snapshot", reason: "Filename hint: nixfarma + stock" },
];

export const nixfarmaAdapter: PharmacySystemAdapter = buildAdapter({
  id: "nixfarma",
  name: "Nixfarma",
  sourceSystem: "nixfarma",
  status: "planned",
  capabilities: ["import_purchase_invoices", "import_sales_summary", "import_stock_snapshot"],
  tagline:
    "Adaptador planificado. La integración real con Nixfarma requiere validación técnica con el proveedor.",
  disclaimer:
    "PharmaOps no se conecta a Nixfarma en esta versión. La importación por fichero está prevista; la conexión directa requiere validación técnica.",
  detect({ filename }) {
    for (const hint of FILENAME_HINTS) {
      if (hint.regex.test(filename)) {
        return {
          importType: hint.importType,
          confidence: 0.7,
          reasoning: hint.reason,
        };
      }
    }
    return null;
  },
});
