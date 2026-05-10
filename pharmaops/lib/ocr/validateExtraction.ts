/**
 * Post-extraction validation rules. The provider runs OCR and gives us a
 * proposal; this helper returns Spanish-language warnings that the UI shows
 * so the human reviewer knows what to double-check before confirming.
 *
 * We intentionally do NOT reject the proposal on warnings — extraction is
 * always treated as a draft until a human confirms.
 */

import type {
  InvoiceExtractionField,
  InvoiceExtractionProposal,
} from "./types";
import { deriveVatRate, inferStandardVatRate } from "./normalizeInvoiceExtraction";

const MISSING_INVOICE_NUMBER = "No se ha detectado el número de factura.";
const MISSING_SUPPLIER = "No se ha detectado el nombre del proveedor.";
const MISSING_TOTAL = "No se ha detectado el importe total.";
const TOTAL_MISMATCH =
  "El total no coincide con base + IVA. Revisa antes de confirmar.";
const NON_STANDARD_VAT =
  "El IVA detectado no encaja con 4%, 10% ni 21%. Revisa antes de confirmar.";
const LOW_CONFIDENCE = (field: string) =>
  `Baja confianza en ${field}. Revisa antes de confirmar.`;

/**
 * Append validation warnings to a freshly produced proposal. Returns the
 * same object (mutates in place) for ergonomic chaining.
 */
export function applyExtractionWarnings(
  proposal: InvoiceExtractionProposal
): InvoiceExtractionProposal {
  const warnings: string[] = [...proposal.warnings];

  if (!proposal.invoiceNumber || !valueOf(proposal.invoiceNumber)) {
    warnings.push(MISSING_INVOICE_NUMBER);
  }
  if (!proposal.supplierName || !valueOf(proposal.supplierName)) {
    warnings.push(MISSING_SUPPLIER);
  }

  const net = numberOf(proposal.netAmount);
  const vat = numberOf(proposal.vatAmount);
  const gross = numberOf(proposal.grossAmount);

  if (gross === null) {
    warnings.push(MISSING_TOTAL);
  } else if (net !== null && vat !== null) {
    const expected = net + vat;
    const tolerance = Math.max(0.05, expected * 0.005);
    if (Math.abs(expected - gross) > tolerance) {
      warnings.push(TOTAL_MISMATCH);
    }
  }

  if (net !== null && vat !== null) {
    const derived = deriveVatRate(net, vat);
    const standard = inferStandardVatRate(derived);
    if (standard === null) {
      warnings.push(NON_STANDARD_VAT);
    }
  }

  for (const [label, field] of [
    ["proveedor", proposal.supplierName],
    ["número de factura", proposal.invoiceNumber],
    ["total", proposal.grossAmount],
  ] as const) {
    if (!field) continue;
    const c = field.confidence;
    if (typeof c === "number" && c < 0.55) {
      warnings.push(LOW_CONFIDENCE(label));
    }
  }

  proposal.warnings = dedupe(warnings);
  return proposal;
}

function valueOf<T>(field: InvoiceExtractionField<T>): T | undefined {
  return field?.value === undefined || field.value === null
    ? undefined
    : field.value;
}

function numberOf(
  field: InvoiceExtractionField<number> | undefined
): number | null {
  if (!field) return null;
  if (field.value === null || field.value === undefined) return null;
  return Number.isFinite(field.value) ? (field.value as number) : null;
}

function dedupe(items: string[]): string[] {
  return Array.from(new Set(items));
}
