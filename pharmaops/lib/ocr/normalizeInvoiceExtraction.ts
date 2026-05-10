/**
 * Provider-agnostic helpers used by every OCR provider before returning a
 * proposal. Coerces dates to ISO YYYY-MM-DD, rounds money to 2 decimals,
 * and infers the closest standard Spanish VAT rate when the provider didn't
 * report one explicitly.
 */

import { parseSpanishDate, parseSpanishNumber } from "@/lib/utils/parseLocale";

export function normalizeDate(input: unknown): string | null {
  if (input === null || input === undefined) return null;
  if (input instanceof Date) {
    if (Number.isNaN(input.getTime())) return null;
    return input.toISOString().slice(0, 10);
  }
  if (typeof input === "string") return parseSpanishDate(input);
  return null;
}

export function normalizeAmount(input: unknown): number | null {
  if (input === null || input === undefined || input === "") return null;
  if (typeof input === "number") {
    return Number.isFinite(input) ? round2(input) : null;
  }
  const parsed = parseSpanishNumber(String(input));
  return parsed === null ? null : round2(parsed);
}

export function normalizeCurrency(input: unknown): string {
  if (typeof input !== "string") return "EUR";
  const upper = input.trim().toUpperCase();
  if (!upper) return "EUR";
  return upper;
}

/**
 * Snap a possibly-noisy VAT rate to the closest standard Spanish rate
 * (4, 10, 21). Returns null if the input isn't recognisable. Tolerates
 * fractional input ("0.21") as well as percent input ("21").
 */
export function inferStandardVatRate(input: unknown): 0 | 4 | 10 | 21 | null {
  const value = normalizeAmount(input);
  if (value === null) return null;
  // Fractional input (e.g. 0.21) → percent.
  const pct = value > 0 && value < 1 ? value * 100 : value;
  if (Math.abs(pct - 0) < 0.5) return 0;
  if (Math.abs(pct - 4) < 1) return 4;
  if (Math.abs(pct - 10) < 1.5) return 10;
  if (Math.abs(pct - 21) < 1.5) return 21;
  return null;
}

/**
 * Derive an effective VAT rate from base + vat amounts. Used as a fallback
 * when the provider didn't report a vatRate field.
 */
export function deriveVatRate(
  net: number | null,
  vat: number | null
): number | null {
  if (net === null || vat === null) return null;
  if (net <= 0) return null;
  return round2((vat / net) * 100);
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
