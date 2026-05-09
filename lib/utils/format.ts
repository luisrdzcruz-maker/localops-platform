export function titleCase(value: string) { return value.replace(/[_-]/g, " ").replace(/\b\w/g, c => c.toUpperCase()); }
