import type { AiActionCost } from "@/types/ai";

export const aiActionCosts: AiActionCost[] = [
  { key: "generate_estimate_from_notes", label: "Generate estimate from notes", vertical: "construction", credits: 3, model: "fast_text", allowsFiles: false },
  { key: "improve_estimate_text", label: "Improve estimate text", vertical: "construction", credits: 1, model: "fast_text", allowsFiles: false },
  { key: "summarize_site_visit", label: "Summarize site visit", vertical: "construction", credits: 2, model: "fast_text", allowsFiles: false },
  { key: "extract_invoice_data", label: "Extract invoice data", vertical: "construction", credits: 4, model: "vision", allowsFiles: true, maxFiles: 1, maxFileMb: 5 },
  { key: "classify_project_photo", label: "Classify project photo", vertical: "construction", credits: 5, model: "vision", allowsFiles: true, maxFiles: 1, maxFileMb: 5 },
  { key: "generate_patient_reminder", label: "Generate patient reminder", vertical: "dental", credits: 1, model: "fast_text", allowsFiles: false },
  { key: "generate_recall_campaign", label: "Generate recall campaign", vertical: "dental", credits: 3, model: "fast_text", allowsFiles: false },
  { key: "classify_cancellation_reason", label: "Classify cancellation reason", vertical: "dental", credits: 1, model: "fast_text", allowsFiles: false },
  { key: "draft_review_reply", label: "Draft review reply", vertical: "dental", credits: 1, model: "fast_text", allowsFiles: false },
  { key: "summarize_sales_import", label: "Summarize sales import", vertical: "pharma", credits: 3, model: "fast_text", allowsFiles: false },
  { key: "detect_stock_anomalies", label: "Detect stock anomalies", vertical: "pharma", credits: 5, model: "reasoning", allowsFiles: false },
  { key: "explain_margin_report", label: "Explain margin report", vertical: "pharma", credits: 3, model: "fast_text", allowsFiles: false },
  { key: "generate_purchase_suggestions", label: "Generate purchase suggestions", vertical: "pharma", credits: 5, model: "reasoning", allowsFiles: false }
];
