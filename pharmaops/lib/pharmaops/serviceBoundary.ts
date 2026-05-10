/**
 * Service boundary registry.
 *
 * One place to ask: "what is the current connection state of every external
 * service PharmaOps would talk to in production?". Used by Settings and the
 * Integrations page to keep the UI honest — no fake "connected" claims, no
 * silent fall-throughs.
 *
 * The registry is computed at call time from environment variables only. It
 * never actually reaches out to a service. The point is to *declare* what is
 * configured, not to verify that it works end-to-end.
 *
 * If you add a new external service later, register it here so it shows up
 * in Settings → "Servicios externos" automatically.
 */

import { getRuntimeMode, type RuntimeMode } from "./runtimeMode";

export type ServiceStatus =
  | "connected" // configured and intended for live use
  | "demo" // running off in-memory deterministic data
  | "mock" // deterministic stub response (e.g. mock OCR proposal)
  | "not_connected" // expected for production, no credentials in env
  | "planned" // future work, no code path yet
  | "not_certified"; // explicitly out of scope (VeriFactu, AEAT, ...)

export type ServiceCategory =
  | "data" // primary data persistence
  | "auth" // authentication
  | "storage" // file storage for documents
  | "ocr" // invoice extraction
  | "messaging" // email / WhatsApp / SMS
  | "pharmacy_system" // Unycop / Farmatic / Nixfarma
  | "fiscal"; // VeriFactu / AEAT / e-invoicing

export interface ServiceStatusEntry {
  id: string;
  label: string;
  category: ServiceCategory;
  description: string;
  status: ServiceStatus;
  /** Short Spanish hint that explains the current status to the user. */
  hint: string;
}

const ENV = process.env;

function envNonEmpty(name: string): boolean {
  const v = ENV[name];
  return typeof v === "string" && v.trim() !== "";
}

function envFlagTrue(name: string): boolean {
  return (ENV[name] ?? "").trim().toLowerCase() === "true";
}

function supabaseStatus(mode: RuntimeMode): ServiceStatus {
  const hasUrl = envNonEmpty("NEXT_PUBLIC_SUPABASE_URL");
  const hasAnon = envNonEmpty("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (mode === "demo") return "demo";
  if (hasUrl && hasAnon) return "connected";
  return "not_connected";
}

function storageStatus(mode: RuntimeMode): ServiceStatus {
  if (mode === "demo") return "demo";
  if (envNonEmpty("AWS_S3_DOCUMENTS_BUCKET")) return "connected";
  return "not_connected";
}

function ocrStatus(): ServiceStatus {
  const provider = (ENV.OCR_PROVIDER ?? "mock").trim().toLowerCase();
  if (provider === "mock") return "mock";
  if (provider === "azure") {
    const ok =
      envNonEmpty("AZURE_DOCUMENT_INTELLIGENCE_ENDPOINT") &&
      envNonEmpty("AZURE_DOCUMENT_INTELLIGENCE_KEY");
    return ok ? "connected" : "not_connected";
  }
  if (provider === "aws") {
    return envFlagTrue("AWS_TEXTRACT_ENABLED") &&
      envNonEmpty("AWS_REGION") &&
      envNonEmpty("AWS_ACCESS_KEY_ID")
      ? "connected"
      : "not_connected";
  }
  if (provider === "google") return "not_connected";
  return "mock";
}

/**
 * Snapshot of every service the UI may display. Order matters — Settings
 * renders the list in this order.
 */
export function getServiceBoundary(): ServiceStatusEntry[] {
  const mode = getRuntimeMode();
  const supabase = supabaseStatus(mode);
  const storage = storageStatus(mode);
  const ocr = ocrStatus();

  return [
    {
      id: "supabase",
      label: "Persistencia (Supabase)",
      category: "data",
      description:
        "Base de datos del workspace, importaciones, finanzas, tareas y auditoría.",
      status: supabase,
      hint:
        supabase === "demo"
          ? "Estás en modo demo: los datos viven en memoria y se reinician al recargar."
          : supabase === "connected"
          ? "URL y clave anónima configuradas. Verificación end-to-end no realizada por esta vista."
          : "Faltan NEXT_PUBLIC_SUPABASE_URL y/o NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    },
    {
      id: "supabase_auth",
      label: "Autenticación (Supabase Auth)",
      category: "auth",
      description:
        "Inicio de sesión, invitaciones de personal y aplicación de roles.",
      status: supabase === "connected" ? "connected" : mode === "demo" ? "demo" : "not_connected",
      hint:
        mode === "demo"
          ? "Sesión simulada con el usuario demo. No hay autenticación real."
          : supabase === "connected"
          ? "Heredado de la conexión Supabase. No se ha verificado la política RLS desde aquí."
          : "Pendiente de conexión con Supabase Auth.",
    },
    {
      id: "documents_storage",
      label: "Almacenamiento de documentos",
      category: "storage",
      description:
        "Ficheros originales subidos en /documentos (PDF, imágenes de facturas).",
      status: storage,
      hint:
        storage === "demo"
          ? "Sólo se conserva metadata (nombre, tipo, fecha). Los ficheros no salen de tu equipo."
          : storage === "connected"
          ? "Bucket S3 configurado. Aún no se ha activado el upload real en esta versión."
          : "Pendiente de configurar Supabase Storage o un bucket S3.",
    },
    {
      id: "ocr",
      label: "OCR de facturas",
      category: "ocr",
      description:
        "Propuesta de extracción de proveedor, fecha, total e IVA a partir de la imagen del documento.",
      status: ocr,
      hint:
        ocr === "mock"
          ? "Se usa el proveedor mock determinista. Las propuestas son ilustrativas y deben revisarse a mano."
          : ocr === "connected"
          ? "Proveedor real configurado. La extracción aún requiere revisión humana."
          : "Proveedor seleccionado pero credenciales incompletas. La app cae a mock automáticamente.",
    },
    {
      id: "email",
      label: "Email transaccional",
      category: "messaging",
      description:
        "Envíos automáticos a la gestoría, recordatorios y alertas operativas.",
      status: "planned",
      hint: "No se envía ningún email en esta versión. Las notificaciones permanecen dentro de la app.",
    },
    {
      id: "whatsapp",
      label: "WhatsApp / SMS",
      category: "messaging",
      description: "Recordatorios o avisos al equipo de la farmacia.",
      status: "planned",
      hint: "Fuera de alcance de la MVP. Requiere proveedor verificado (Meta Cloud API u operador).",
    },
    {
      id: "pharmacy_systems",
      label: "Unycop · Farmatic · Nixfarma (API directa)",
      category: "pharmacy_system",
      description:
        "Lectura directa desde el sistema oficial sin pasar por exportación manual.",
      status: "planned",
      hint:
        "MVP file-based. La conexión directa requiere validación con tu proveedor IT y consentimiento legal.",
    },
    {
      id: "verifactu",
      label: "VeriFactu / facturación certificada",
      category: "fiscal",
      description:
        "Emisión y registro fiscal certificado de facturas según la normativa AEAT.",
      status: "not_certified",
      hint:
        "PharmaOps no certifica VeriFactu ni sustituye un software de facturación homologado.",
    },
  ];
}

/**
 * UI helpers — Spanish labels + Badge tone per status.
 */
export const SERVICE_STATUS_LABELS: Record<ServiceStatus, string> = {
  connected: "Conectado",
  demo: "Demo",
  mock: "Mock",
  not_connected: "No conectado",
  planned: "Próximamente",
  not_certified: "No certificado",
};

export const SERVICE_STATUS_TONES: Record<
  ServiceStatus,
  "ok" | "info" | "warn" | "danger" | "neutral"
> = {
  connected: "ok",
  demo: "info",
  mock: "info",
  not_connected: "warn",
  planned: "neutral",
  not_certified: "danger",
};

export const SERVICE_CATEGORY_LABELS: Record<ServiceCategory, string> = {
  data: "Datos",
  auth: "Autenticación",
  storage: "Almacenamiento",
  ocr: "OCR",
  messaging: "Mensajería",
  pharmacy_system: "Sistema de farmacia",
  fiscal: "Fiscal",
};
