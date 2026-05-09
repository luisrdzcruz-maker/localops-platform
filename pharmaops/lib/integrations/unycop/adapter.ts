import { buildAdapter } from "@/lib/integrations/common/baseAdapter";
import { normalizeColumnName } from "@/lib/imports/parser";
import type { ImportType } from "@/types/imports";
import type { PharmacySystemAdapter } from "@/types/integrations";

const FILENAME_HINTS: Array<{ regex: RegExp; importType: ImportType; reason: string }> = [
  { regex: /unycop.*compra/i, importType: "purchase_invoices", reason: "Filename hint: unycop + compra" },
  { regex: /unycop.*venta/i, importType: "sales_summary", reason: "Filename hint: unycop + venta" },
  { regex: /unycop.*stock/i, importType: "stock_snapshot", reason: "Filename hint: unycop + stock" },
  { regex: /unycop.*proveedor/i, importType: "suppliers", reason: "Filename hint: unycop + proveedor" },
  { regex: /unycop.*linea/i, importType: "purchase_invoice_lines", reason: "Filename hint: unycop + linea" },
];

const HEADER_SIGNATURES: Array<{ headers: string[]; importType: ImportType; reason: string }> = [
  {
    headers: ["nfactura", "proveedor", "fechafactura", "base", "iva", "total"],
    importType: "purchase_invoices",
    reason: "Cabeceras típicas de Unycop facturas de compra",
  },
  {
    headers: ["fecha", "familia", "importe", "iva"],
    importType: "sales_summary",
    reason: "Cabeceras típicas de Unycop resumen de ventas",
  },
  {
    headers: ["codigo", "producto", "stock", "pvp", "pvl"],
    importType: "stock_snapshot",
    reason: "Cabeceras típicas de Unycop stock",
  },
];

export const unycopAdapter: PharmacySystemAdapter = buildAdapter({
  id: "unycop",
  name: "Unycop",
  sourceSystem: "unycop",
  status: "file_based_only",
  capabilities: [
    "import_purchase_invoices",
    "import_purchase_invoice_lines",
    "import_sales_summary",
    "import_stock_snapshot",
    "import_suppliers",
    "export_template",
  ],
  tagline:
    "Importa exportaciones de Unycop sin sustituir tu sistema de farmacia.",
  disclaimer:
    "PharmaOps no se conecta directamente a Unycop. La integración es file-based: subes un Excel/CSV exportado desde Unycop y PharmaOps lo normaliza.",
  detect({ filename }, headers) {
    for (const hint of FILENAME_HINTS) {
      if (hint.regex.test(filename)) {
        return {
          importType: hint.importType,
          confidence: 0.85,
          reasoning: hint.reason,
        };
      }
    }
    const normalised = headers.map((h) => normalizeColumnName(h).replace(/\s+/g, ""));
    for (const sig of HEADER_SIGNATURES) {
      const matches = sig.headers.filter((h) => normalised.includes(h)).length;
      if (matches >= Math.ceil(sig.headers.length * 0.6)) {
        return {
          importType: sig.importType,
          confidence: 0.7,
          reasoning: sig.reason,
        };
      }
    }
    return null;
  },
});
