import type { BaseEntity } from "./core";

export type DocumentType = "estimate" | "invoice" | "report" | "consent_placeholder" | "purchase_order" | "summary" | "contract_placeholder";
export type DocumentStatus = "draft" | "generated" | "sent" | "viewed" | "accepted" | "rejected" | "archived";

export interface Document extends BaseEntity {
  type: DocumentType;
  status: DocumentStatus;
  title: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  fileUrl?: string;
  templateId?: string;
}

export interface DocumentTemplate extends BaseEntity {
  type: DocumentType;
  name: string;
  description: string;
  body: string;
  variables: string[];
}

export interface DocumentVersion extends BaseEntity {
  documentId: string;
  version: number;
  snapshot: Record<string, unknown>;
}
