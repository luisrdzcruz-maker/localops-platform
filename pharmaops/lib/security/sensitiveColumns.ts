/**
 * Detect column headers that might carry personal / clinical data so the
 * import UI can warn the user and exclude them by default.
 *
 * PharmaOps does not store patient-level data in the MVP. If an import file
 * contains anything that looks like patient or prescription data, the UI
 * surfaces a warning and the user must explicitly opt-in to mapping it.
 */

import { normalizeColumnName } from "@/lib/imports/parser";

const SENSITIVE_PATTERNS: Array<{ regex: RegExp; reason: string }> = [
  { regex: /\b(dni|nif paciente|nss|tarjeta sanitaria|cip)\b/i, reason: "Identificador personal." },
  { regex: /\b(paciente|usuario|titular receta|nombre receta)\b/i, reason: "Posible identificador de paciente." },
  { regex: /\b(receta|prescripcion|prescripción|medico|médico|colegiado)\b/i, reason: "Datos de prescripción / receta." },
  { regex: /\b(diagnostico|diagnóstico|patologia|patología|alergias|hist clinica|historia clínica)\b/i, reason: "Datos clínicos." },
  { regex: /\b(nacimiento|fecha nac|edad|sexo|genero|género)\b/i, reason: "Datos demográficos sensibles." },
  { regex: /\b(direccion paciente|domicilio paciente|telefono paciente)\b/i, reason: "Contacto del paciente." },
];

export interface SensitiveColumn {
  column: string;
  reason: string;
}

export function findSensitiveColumns(columns: string[]): SensitiveColumn[] {
  const out: SensitiveColumn[] = [];
  for (const col of columns) {
    const normalised = normalizeColumnName(col);
    for (const sig of SENSITIVE_PATTERNS) {
      if (sig.regex.test(normalised) || sig.regex.test(col)) {
        out.push({ column: col, reason: sig.reason });
        break;
      }
    }
  }
  return out;
}
