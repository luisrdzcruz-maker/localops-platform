export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

export function getCurrentDemoMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

export function formatDemoMonthLabel(): string {
  const now = new Date();
  const month = new Intl.DateTimeFormat("es-ES", { month: "long" }).format(now);
  const year = now.getFullYear();
  return `${month.charAt(0).toUpperCase() + month.slice(1)} ${year}`;
}
