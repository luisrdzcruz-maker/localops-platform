/**
 * Spanish-locale formatting helpers used across PharmaOps UI.
 *
 * Centralised so the dashboard, reports and exports all show numbers, dates
 * and percentages the same way.
 */

const EUR_FORMATTER = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 2,
});

const COMPACT_EUR_FORMATTER = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  notation: "compact",
  maximumFractionDigits: 1,
});

const NUMBER_FORMATTER = new Intl.NumberFormat("es-ES", {
  maximumFractionDigits: 2,
});

const PERCENT_FORMATTER = new Intl.NumberFormat("es-ES", {
  style: "percent",
  maximumFractionDigits: 1,
});

const DATE_FORMATTER = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "short",
  year: "numeric",
});

const DATE_LONG_FORMATTER = new Intl.DateTimeFormat("es-ES", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

export function formatEur(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return EUR_FORMATTER.format(value);
}

export function formatEurCompact(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return COMPACT_EUR_FORMATTER.format(value);
}

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return NUMBER_FORMATTER.format(value);
}

/** Accepts a 0..1 ratio (e.g. 0.234 → "23,4 %"). */
export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return PERCENT_FORMATTER.format(value);
}

/** Accepts a date string (YYYY-MM-DD or ISO timestamp). */
export function formatDate(value: string | Date | null | undefined): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return DATE_FORMATTER.format(date);
}

export function formatDateLong(
  value: string | Date | null | undefined
): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  return DATE_LONG_FORMATTER.format(date);
}

/** "hace 3 días" / "en 2 días" — relative phrasing for the task list. */
const RELATIVE_FORMATTER = new Intl.RelativeTimeFormat("es-ES", {
  numeric: "auto",
});

export function formatRelative(
  value: string | Date | null | undefined,
  reference: Date = new Date()
): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "—";
  const diffMs = date.getTime() - reference.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
  if (Math.abs(diffDays) >= 14) {
    return RELATIVE_FORMATTER.format(Math.round(diffDays / 7), "week");
  }
  if (Math.abs(diffDays) >= 1) {
    return RELATIVE_FORMATTER.format(diffDays, "day");
  }
  const diffHours = Math.round(diffMs / (1000 * 60 * 60));
  return RELATIVE_FORMATTER.format(diffHours, "hour");
}
