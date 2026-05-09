import type { BaseEntity, ID, ISODate } from "./core";
import type { VerticalKey } from "./modules";

export type AiProvider = "openai" | "anthropic" | "local" | "mock";
export type AiModel = "fast_text" | "reasoning" | "vision" | "transcription" | "mock";
export type VerticalAiActionKey =
  | "generate_estimate_from_notes"
  | "improve_estimate_text"
  | "summarize_site_visit"
  | "extract_invoice_data"
  | "classify_project_photo"
  | "generate_patient_reminder"
  | "generate_recall_campaign"
  | "classify_cancellation_reason"
  | "draft_review_reply"
  | "summarize_sales_import"
  | "detect_stock_anomalies"
  | "explain_margin_report"
  | "generate_purchase_suggestions";

export interface AiActionCost {
  key: VerticalAiActionKey;
  label: string;
  vertical: VerticalKey;
  credits: number;
  model: AiModel;
  allowsFiles: boolean;
  maxFiles?: number;
  maxFileMb?: number;
}

export interface OrganizationAiLimits {
  organizationId: ID;
  plan: "trial" | "basic" | "pro" | "enterprise";
  monthlyCreditLimit: number;
  dailyCreditLimit: number;
  maxFileSizeMb: number;
  maxBatchSize: number;
  bulkProcessingEnabled: boolean;
}

export interface AiCreditBalance {
  organizationId: ID;
  monthlyLimit: number;
  usedThisMonth: number;
  resetAt: ISODate;
}

export interface AiUsageEvent extends BaseEntity {
  actionKey: VerticalAiActionKey;
  provider: AiProvider;
  model: AiModel;
  creditsUsed: number;
  inputTokens?: number;
  outputTokens?: number;
  fileCount?: number;
  fileSizeMb?: number;
  estimatedCostEur?: number;
  status: "allowed" | "blocked" | "completed" | "failed";
  blockedReason?: string;
}
