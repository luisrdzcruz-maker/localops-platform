/**
 * OCR provider abstraction — types only.
 *
 * The contract is deliberately provider-agnostic: a provider takes a
 * document (file buffer or, for the current metadata-only MVP, demo
 * metadata) and returns a structured InvoiceExtractionProposal. The UI
 * never imports a specific provider implementation; it goes through the
 * registry in lib/ocr/provider.ts.
 *
 * Important rules baked into the contract:
 *   - Extraction is a *proposal*, never an automatic write to finance.
 *   - Every numeric field carries a confidence so the UI can flag low ones.
 *   - The mock provider must clearly tag itself in the proposal so the UI
 *     can render the "Demo OCR" badge instead of "Azure Document Intelligence".
 */

export type OcrProviderId = "mock" | "azure" | "google" | "aws";

export type ExtractionStatus =
  | "not_started"
  | "processing"
  | "needs_review"
  | "failed"
  | "confirmed";

export interface InvoiceExtractionField<T = string | number | null> {
  value: T;
  /** 0..1 confidence reported by the provider. */
  confidence?: number;
  /** Original raw text snippet on the page, when available. */
  rawText?: string;
  /** Free-form provider-side hint about where this came from. */
  source?: string;
}

export interface InvoiceLineExtraction {
  description?: string;
  quantity?: number;
  unitPrice?: number;
  netAmount?: number;
  vatRate?: number;
  vatAmount?: number;
  grossAmount?: number;
  confidence?: number;
}

export interface InvoiceExtractionProposal {
  documentId: string;
  provider: OcrProviderId;
  status: ExtractionStatus;
  /** ISO timestamp when extraction returned. */
  extractedAt: string;
  supplierName?: InvoiceExtractionField<string>;
  supplierTaxId?: InvoiceExtractionField<string>;
  invoiceNumber?: InvoiceExtractionField<string>;
  invoiceDate?: InvoiceExtractionField<string>;
  dueDate?: InvoiceExtractionField<string>;
  netAmount?: InvoiceExtractionField<number>;
  vatAmount?: InvoiceExtractionField<number>;
  grossAmount?: InvoiceExtractionField<number>;
  currency?: InvoiceExtractionField<string>;
  lineItems?: InvoiceLineExtraction[];
  /** Human-readable warnings produced by validateExtraction. */
  warnings: string[];
  /** Untyped raw payload for debugging — never shown directly in UI. */
  rawProviderResponse?: unknown;
}

export interface OcrExtractInvoiceInput {
  documentId: string;
  fileName?: string;
  mimeType?: string;
  /** Real file bytes — only available once Supabase Storage is wired. */
  fileBuffer?: Buffer;
  /** Browser-encoded payload, alternative to fileBuffer. */
  fileBase64?: string;
  /**
   * Document metadata available in the demo store. Mock provider uses this
   * to produce coherent fictional output keyed off the document's existing
   * supplier/file/date fields.
   */
  demoMetadata?: Record<string, unknown>;
}

export interface OcrProvider {
  id: OcrProviderId;
  /** Display name for the UI badge. */
  name: string;
  /** True when the provider has everything it needs to run a real call. */
  isConfigured(): boolean;
  /** Run extraction. Throws on provider error; never auto-writes anything. */
  extractInvoice(
    input: OcrExtractInvoiceInput
  ): Promise<InvoiceExtractionProposal>;
}
