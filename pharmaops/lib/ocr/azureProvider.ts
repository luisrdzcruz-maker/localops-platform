/**
 * Azure AI Document Intelligence provider — typed adapter skeleton.
 *
 * Status: NOT WIRED.
 *   - The Azure SDK (@azure/ai-form-recognizer or
 *     @azure-rest/ai-document-intelligence) is intentionally NOT installed in
 *     this repo yet, so this provider's `isConfigured()` returns false unless
 *     the env vars are set AND a real file buffer is supplied. The Server
 *     Action falls back to the mock provider in that case.
 *
 * To activate Azure for real extraction:
 *   1. Approve the install of an Azure Document Intelligence client
 *      (e.g. `@azure-rest/ai-document-intelligence`).
 *   2. Set the env vars:
 *        AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT
 *        AZURE_DOCUMENT_INTELLIGENCE_KEY
 *        AZURE_DOCUMENT_INTELLIGENCE_MODEL  (default: "prebuilt-invoice")
 *      Also flip OCR_PROVIDER=azure.
 *   3. Wire Supabase Storage so the document upload produces a real file
 *      buffer that this adapter can stream to Azure.
 *   4. Implement `runRealExtraction()` below — call the SDK with the buffer,
 *      then map the response to InvoiceExtractionProposal via the shared
 *      normalisation helpers.
 *
 * Important: never import client-side. The Azure key is server-only.
 */

import "server-only";
import {
  inferStandardVatRate,
  normalizeAmount,
  normalizeCurrency,
  normalizeDate,
} from "./normalizeInvoiceExtraction";
import { applyExtractionWarnings } from "./validateExtraction";
import type {
  InvoiceExtractionField,
  InvoiceExtractionProposal,
  OcrExtractInvoiceInput,
  OcrProvider,
} from "./types";

interface AzureEnv {
  endpoint: string;
  key: string;
  model: string;
}

function readAzureEnv(): AzureEnv | null {
  const endpoint = process.env.AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT;
  const key = process.env.AZURE_DOCUMENT_INTELLIGENCE_KEY;
  if (!endpoint || !key) return null;
  return {
    endpoint,
    key,
    model:
      process.env.AZURE_DOCUMENT_INTELLIGENCE_MODEL ?? "prebuilt-invoice",
  };
}

export const azureOcrProvider: OcrProvider = {
  id: "azure",
  name: "Azure Document Intelligence",

  isConfigured() {
    // Real activation needs both: (a) env vars present, (b) a real Azure
    // SDK installed. (b) is enforced at call time because we can't probe
    // the SDK at module load without importing it.
    return readAzureEnv() !== null;
  },

  async extractInvoice(
    input: OcrExtractInvoiceInput
  ): Promise<InvoiceExtractionProposal> {
    const env = readAzureEnv();
    if (!env) {
      throw new AzureNotConfiguredError(
        "Azure Document Intelligence no está configurado. Faltan AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT / AZURE_DOCUMENT_INTELLIGENCE_KEY."
      );
    }
    if (!input.fileBuffer && !input.fileBase64) {
      throw new AzureNotConfiguredError(
        "Azure Document Intelligence requiere el contenido del fichero. " +
          "PharmaOps todavía no almacena los ficheros, así que en esta fase usa el proveedor mock."
      );
    }

    // SDK call goes here once the package is installed and approved.
    // The expected mapping shape, kept inline so Step 4 of the activation
    // checklist has a copy-paste target:
    //
    //   const client = DocumentIntelligence(env.endpoint, env.key);
    //   const poller = await client.path("/documentModels/{modelId}:analyze",
    //     env.model).post({ contentType: input.mimeType ?? "application/pdf",
    //       body: input.fileBuffer });
    //   const result = await poller.body;
    //   return mapAzureResponse(input.documentId, result);
    throw new AzureNotConfiguredError(
      "El cliente del SDK de Azure no está instalado en este build. " +
        "Aprueba la instalación de @azure-rest/ai-document-intelligence para activar la extracción real."
    );
  },
};

export class AzureNotConfiguredError extends Error {
  readonly code = "azure_not_configured";
}

/* ----------------------- skeleton response mapper ------------------------- */

/**
 * Map a hypothetical Azure prebuilt-invoice response to our internal shape.
 * Kept exported so a future PR can land the SDK call + mapping in one
 * place. The Azure response keys below match Microsoft's documented schema
 * for `prebuilt-invoice`.
 */
export function mapAzureResponseToProposal(
  documentId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  azureResult: any
): InvoiceExtractionProposal {
  const doc = azureResult?.documents?.[0];
  const f = doc?.fields ?? {};

  const proposal: InvoiceExtractionProposal = {
    documentId,
    provider: "azure",
    status: "needs_review",
    extractedAt: new Date().toISOString(),
    supplierName: stringField(f.VendorName),
    supplierTaxId: stringField(f.VendorTaxId),
    invoiceNumber: stringField(f.InvoiceId),
    invoiceDate: dateField(f.InvoiceDate),
    dueDate: dateField(f.DueDate),
    netAmount: amountField(f.SubTotal),
    vatAmount: amountField(f.TotalTax),
    grossAmount: amountField(f.InvoiceTotal),
    currency: currencyField(f.InvoiceTotal?.valueCurrency?.currencyCode),
    lineItems: Array.isArray(f.Items?.valueArray)
      ? f.Items.valueArray.map(mapLineItem)
      : undefined,
    warnings: [],
    rawProviderResponse: azureResult,
  };

  return applyExtractionWarnings(proposal);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function stringField(f: any): InvoiceExtractionField<string> | undefined {
  if (!f || (f.valueString === undefined && f.content === undefined)) {
    return undefined;
  }
  const value = (f.valueString ?? f.content ?? "").trim();
  if (!value) return undefined;
  return {
    value,
    confidence: typeof f.confidence === "number" ? f.confidence : undefined,
    rawText: typeof f.content === "string" ? f.content : undefined,
    source: "azure",
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function dateField(f: any): InvoiceExtractionField<string> | undefined {
  if (!f) return undefined;
  const iso = normalizeDate(f.valueDate ?? f.valueString ?? f.content);
  if (!iso) return undefined;
  return {
    value: iso,
    confidence: typeof f.confidence === "number" ? f.confidence : undefined,
    source: "azure",
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function amountField(f: any): InvoiceExtractionField<number> | undefined {
  if (!f) return undefined;
  const numeric =
    typeof f.valueCurrency?.amount === "number"
      ? f.valueCurrency.amount
      : normalizeAmount(f.valueNumber ?? f.valueString ?? f.content);
  if (numeric === null || numeric === undefined) return undefined;
  return {
    value: numeric as number,
    confidence: typeof f.confidence === "number" ? f.confidence : undefined,
    source: "azure",
  };
}

function currencyField(
  input: unknown
): InvoiceExtractionField<string> | undefined {
  const code = normalizeCurrency(input);
  return { value: code, source: "azure" };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapLineItem(item: any) {
  const fields = item?.valueObject ?? {};
  const net = normalizeAmount(fields.Amount?.valueCurrency?.amount);
  const vatRate = inferStandardVatRate(fields.TaxRate?.valueNumber);
  const grossField = fields.AmountTotal?.valueCurrency?.amount;
  const gross = normalizeAmount(grossField);
  const vatAmount =
    net !== null && vatRate !== null
      ? Math.round((net * vatRate) / 100 * 100) / 100
      : null;
  return {
    description:
      fields.Description?.valueString ?? fields.Description?.content,
    quantity: normalizeAmount(fields.Quantity?.valueNumber) ?? undefined,
    unitPrice: normalizeAmount(fields.UnitPrice?.valueCurrency?.amount) ?? undefined,
    netAmount: net ?? undefined,
    vatRate: vatRate ?? undefined,
    vatAmount: vatAmount ?? undefined,
    grossAmount: gross ?? undefined,
    confidence:
      typeof item?.confidence === "number" ? item.confidence : undefined,
  };
}
