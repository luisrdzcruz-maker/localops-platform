/**
 * Locale-tolerant parsers for Spanish-formatted spreadsheets.
 *
 * - parseSpanishNumber: handles "1.234,56", "1234,56", "1,234.56", "1234.56".
 * - parseSpanishDate:   handles "dd/mm/yyyy", "yyyy-mm-dd", "dd-mm-yyyy".
 *
 * Returns null for unparseable input so the validator can surface a clean
 * error instead of NaN propagating into business logic.
 */

export function parseSpanishNumber(input: string): number | null {
  if (input === "" || input === null || input === undefined) return null;
  const trimmed = String(input).trim();
  if (!trimmed) return null;

  // Strip currency symbols and spaces
  let s = trimmed.replace(/[€\s]/g, "");

  const hasComma = s.includes(",");
  const hasDot = s.includes(".");
  if (hasComma && hasDot) {
    // Whichever appears later is the decimal separator.
    const lastComma = s.lastIndexOf(",");
    const lastDot = s.lastIndexOf(".");
    if (lastComma > lastDot) {
      // Spanish: "." thousands, "," decimal.
      s = s.replace(/\./g, "").replace(",", ".");
    } else {
      // English: "," thousands, "." decimal.
      s = s.replace(/,/g, "");
    }
  } else if (hasComma) {
    // Only comma → assume Spanish decimal.
    s = s.replace(",", ".");
  } else {
    // Only dot or none → assume English number.
  }

  const num = Number(s);
  return Number.isFinite(num) ? num : null;
}

export function parseSpanishDate(input: string): string | null {
  const s = String(input).trim();
  if (!s) return null;

  // ISO yyyy-mm-dd or yyyy/mm/dd
  const iso = /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/.exec(s);
  if (iso) {
    const [, y, m, d] = iso;
    return formatYmd(Number(y), Number(m), Number(d));
  }
  // dd/mm/yyyy or dd-mm-yyyy or dd.mm.yyyy
  const dmy = /^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})/.exec(s);
  if (dmy) {
    const [, d, m, yRaw] = dmy;
    let y = Number(yRaw);
    if (y < 100) y += y >= 70 ? 1900 : 2000;
    return formatYmd(y, Number(m), Number(d));
  }

  // Last resort: native Date parse.
  const dt = new Date(s);
  if (!Number.isNaN(dt.getTime())) {
    return dt.toISOString().slice(0, 10);
  }
  return null;
}

function formatYmd(y: number, m: number, d: number): string | null {
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d))
    return null;
  if (m < 1 || m > 12) return null;
  if (d < 1 || d > 31) return null;
  return `${y.toString().padStart(4, "0")}-${m
    .toString()
    .padStart(2, "0")}-${d.toString().padStart(2, "0")}`;
}
