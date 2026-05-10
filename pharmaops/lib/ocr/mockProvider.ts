/**
 * Mock OCR provider — produces a realistic Spanish invoice extraction
 * deterministically from the document's existing demo metadata. Used when
 *   - OCR_PROVIDER is missing or set to "mock", OR
 *   - the configured real provider has no file buffer to process
 *     (current MVP intake is metadata-only).
 *
 * The proposal is clearly tagged `provider: "mock"` and carries an explicit
 * warning so the UI never confuses a demo extraction for a real one.
 */

import {
  inferStandardVatRate,
  normalizeDate,
  round2,
} from "./normalizeInvoiceExtraction";
import { applyExtractionWarnings } from "./validateExtraction";
import type {
  InvoiceExtractionField,
  InvoiceExtractionProposal,
  OcrExtractInvoiceInput,
  OcrProvider,
} from "./types";

const FALLBACK_SUPPLIERS = [
  "Cooperativa Farmacéutica Demo",
  "Distribuidor Sanitario Demo",
  "Dermocosmética Norte Demo",
  "Parafarmacia Global Demo",
];

export const mockOcrProvider: OcrProvider = {
  id: "mock",
  name: "Demo OCR",
  isConfigured() {
    return true;
  },
  async extractInvoice(
    input: OcrExtractInvoiceInput
  ): Promise<InvoiceExtractionProposal> {
    const meta = input.demoMetadata ?? {};
    const seed = hashSeed(`${input.documentId}|${input.fileName ?? ""}`);
    const rng = createRng(seed);

    // Net amount: respect any prior estimatedAmount on the document so the
    // extraction looks coherent with the existing row, otherwise a sensible
    // demo number.
    const priorEstimate = numericMeta(meta.estimatedAmount);
    const net =
      priorEstimate !== null
        ? priorEstimate
        : round2(180 + rng() * 4500);

    const vatRate = (
      [4, 10, 21] as const
    )[Math.floor(rng() * 3)] as 4 | 10 | 21;
    const vat = round2((net * vatRate) / 100);
    const gross = round2(net + vat);

    const supplierName =
      stringMeta(meta.supplierName) ??
      FALLBACK_SUPPLIERS[Math.floor(rng() * FALLBACK_SUPPLIERS.length)]!;

    const supplierIndex = FALLBACK_SUPPLIERS.indexOf(supplierName);
    const supplierTaxId = `B0000000${
      supplierIndex >= 0 ? supplierIndex + 1 : Math.floor(rng() * 9) + 1
    }`;

    const invoiceDate =
      normalizeDate(stringMeta(meta.date)) ??
      new Date(Date.now() - Math.floor(rng() * 30) * 86_400_000)
        .toISOString()
        .slice(0, 10);
    const dueDate = addDaysIso(invoiceDate, 30);

    const invoiceNumberSeed = String(seed).padStart(6, "0").slice(-6);
    const invoiceNumber = `${supplierName.slice(0, 3).toUpperCase()}-${invoiceDate.replace(
      /-/g,
      ""
    )}-${invoiceNumberSeed.slice(-3)}`;

    // Generate 1–3 line items that roughly tie out to net.
    const lineCount = 1 + Math.floor(rng() * 3);
    const lineItems = [];
    let allocatedNet = 0;
    for (let i = 0; i < lineCount; i++) {
      const isLast = i === lineCount - 1;
      const target = isLast
        ? round2(net - allocatedNet)
        : round2(net * (0.2 + rng() * 0.5));
      allocatedNet = round2(allocatedNet + target);
      const quantity = 1 + Math.floor(rng() * 6);
      const unitPrice = round2(target / quantity);
      const lineVat = round2((target * vatRate) / 100);
      lineItems.push({
        description: `Línea ${i + 1} — concepto demo`,
        quantity,
        unitPrice,
        netAmount: target,
        vatRate,
        vatAmount: lineVat,
        grossAmount: round2(target + lineVat),
        confidence: 0.6 + rng() * 0.3,
      });
    }

    const proposal: InvoiceExtractionProposal = {
      documentId: input.documentId,
      provider: "mock",
      status: "needs_review",
      extractedAt: new Date().toISOString(),
      supplierName: field(supplierName, 0.78 + rng() * 0.15),
      supplierTaxId: field(supplierTaxId, 0.7 + rng() * 0.15),
      invoiceNumber: field(invoiceNumber, 0.75 + rng() * 0.15),
      invoiceDate: field(invoiceDate, 0.82 + rng() * 0.12),
      dueDate: field(dueDate, 0.7 + rng() * 0.15),
      netAmount: field(net, 0.82 + rng() * 0.12),
      vatAmount: field(vat, 0.82 + rng() * 0.12),
      grossAmount: field(gross, 0.85 + rng() * 0.1),
      currency: field("EUR", 0.95),
      lineItems,
      warnings: [
        "Extracción demo generada sin procesar el archivo real.",
      ],
      rawProviderResponse: { provider: "mock", seed },
    };

    // Confidence sanity check: if our random draw happened to make the
    // total mismatch, surface a warning via the shared validator.
    const inferred = inferStandardVatRate(vatRate);
    if (inferred === null) {
      proposal.warnings.push(
        "El IVA detectado no encaja con 4%, 10% ni 21%."
      );
    }

    return applyExtractionWarnings(proposal);
  },
};

/* ------------------------------ helpers ----------------------------------- */

function field<T>(value: T, confidence: number): InvoiceExtractionField<T> {
  return {
    value,
    confidence: Math.min(0.99, Math.max(0, round2(confidence))),
    source: "mock",
  };
}

function stringMeta(input: unknown): string | null {
  if (typeof input !== "string") return null;
  const trimmed = input.trim();
  return trimmed === "" ? null : trimmed;
}

function numericMeta(input: unknown): number | null {
  if (typeof input === "number" && Number.isFinite(input)) return input;
  if (typeof input === "string") {
    const n = Number(input);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function addDaysIso(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Tiny string → seed hash. Stable across processes. */
function hashSeed(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function createRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
