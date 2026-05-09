import clsx, { type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge conditional Tailwind class names safely.
 *
 * Combines clsx (handles arrays/objects/conditionals) with tailwind-merge
 * (resolves conflicts like "px-4 px-6" -> "px-6").
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
