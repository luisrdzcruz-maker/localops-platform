/**
 * Integration adapter contract.
 *
 * Each pharmacy IT system (Unycop, Farmatic, Nixfarma) plugs in as an adapter
 * implementing PharmacySystemAdapter. The MVP ships file-based adapters only
 * (CSV/XLSX). Direct API/DB integration is out of scope until pharmacy IT
 * provider access is granted.
 *
 * IMPORTANT: Adapters must never claim official certification or live API
 * connectivity unless real credentials/docs exist. UI copy for these adapters
 * lives in components/integrations/ and is reviewed alongside the adapter.
 */

import type {
  AdapterParseInput,
  AdapterParseResult,
  DetectedImportType,
  ImportType,
  ImportValidationResult,
  ImportedFileMetadata,
  NormalizedImportRow,
  RawRow,
  SourceSystem,
} from "./imports";

export type PharmacySystemCapability =
  | "import_purchase_invoices"
  | "import_purchase_invoice_lines"
  | "import_sales_summary"
  | "import_stock_snapshot"
  | "import_suppliers"
  | "import_expenses"
  | "import_accounting_movements"
  | "export_template"
  | "direct_api"
  | "direct_db";

export const PHARMACY_SYSTEM_CAPABILITY_LABELS: Record<
  PharmacySystemCapability,
  string
> = {
  import_purchase_invoices: "Importar facturas de compra",
  import_purchase_invoice_lines: "Importar líneas de factura",
  import_sales_summary: "Importar resumen de ventas",
  import_stock_snapshot: "Importar inventario",
  import_suppliers: "Importar proveedores",
  import_expenses: "Importar gastos",
  import_accounting_movements: "Importar movimientos contables",
  export_template: "Plantilla descargable",
  direct_api: "Conexión directa por API",
  direct_db: "Conexión directa a base de datos",
};

export type AdapterStatus =
  | "active"
  | "beta"
  | "file_based_only"
  | "planned"
  | "blocked";

export const ADAPTER_STATUS_LABELS: Record<AdapterStatus, string> = {
  active: "Activo",
  beta: "Beta",
  file_based_only: "Importación por fichero",
  planned: "Requiere validación",
  blocked: "Bloqueado",
};

export interface AdapterDiagnostics {
  adapterId: string;
  status: AdapterStatus;
  /** Last successful operation timestamp (ISO). null if never used. */
  lastSuccessAt: string | null;
  /** Last failure timestamp (ISO). null if no failures. */
  lastFailureAt: string | null;
  /** Free-form notes for the integrations diagnostic panel. */
  notes: string[];
}

export interface PharmacySystemAdapter {
  /** Stable adapter id, e.g. "unycop", "farmatic", "generic". */
  id: string;
  /** Human-readable name shown in the integrations UI. */
  name: string;
  sourceSystem: SourceSystem;
  status: AdapterStatus;
  capabilities: PharmacySystemCapability[];
  /** Short Spanish-language tagline shown on the integration card. */
  tagline: string;
  /** Compliance / honesty disclaimer for this adapter. */
  disclaimer: string;
  /**
   * Probe a file's metadata (filename, header row hints once parsed) and
   * decide whether this adapter is a good match. Adapters return null when
   * they don't recognise the file.
   */
  detectFileType(
    metadata: ImportedFileMetadata,
    headers: string[]
  ): Promise<DetectedImportType | null>;
  /** Parse the file into raw rows + columns. */
  parseFile(input: AdapterParseInput): Promise<AdapterParseResult>;
  /**
   * Coerce raw rows + chosen mapping into NormalizedImportRow. The mapping
   * argument is optional — when absent, adapters use their default mapping.
   */
  normalizeRows(
    rows: RawRow[],
    importType: ImportType,
    mapping: Record<string, string | null> | null
  ): Promise<NormalizedImportRow[]>;
  validateRows(
    rows: NormalizedImportRow[],
    importType: ImportType
  ): Promise<ImportValidationResult>;
  /**
   * Optional template — adapter can ship a downloadable Excel/CSV that the
   * user can fill in manually. Returns null when no template is shipped.
   */
  getTemplate?(importType: ImportType): Promise<{
    filename: string;
    mimeType: string;
    blob: Blob;
  } | null>;
}
