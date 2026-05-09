import type { BaseEntity } from "./core";

export type IntegrationProvider =
  | "google_calendar"
  | "gmail"
  | "whatsapp_placeholder"
  | "stripe"
  | "supabase_storage"
  | "csv_import"
  | "excel_import"
  | "unycop_passive_import"
  | "accounting_export_placeholder"
  | "google_reviews_placeholder";

export type IntegrationStatus = "not_connected" | "connected" | "error" | "syncing" | "disabled" | "requires_attention";

export interface IntegrationConnection extends BaseEntity {
  provider: IntegrationProvider;
  status: IntegrationStatus;
  displayName: string;
  lastSyncAt?: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface IntegrationSyncLog extends BaseEntity {
  provider: IntegrationProvider;
  status: "started" | "completed" | "failed";
  message: string;
}

export interface IntegrationImportJob extends BaseEntity {
  provider: IntegrationProvider;
  fileName: string;
  status: "pending" | "processing" | "completed" | "failed";
  rowsTotal?: number;
  rowsImported?: number;
  error?: string;
}
