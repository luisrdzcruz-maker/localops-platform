export function formatMoney(value: number, currency = "EUR") {
  return new Intl.NumberFormat("en-IE", { style: "currency", currency }).format(value);
}

export function formatEUR(value: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
}

export function formatEURPrecise(value: number) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);
}

export function formatPercent(ratio: number) {
  return new Intl.NumberFormat("es-ES", { style: "percent", minimumFractionDigits: 0, maximumFractionDigits: 1 }).format(ratio);
}
