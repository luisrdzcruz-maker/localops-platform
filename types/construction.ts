import type { BaseEntity } from "./core";

export type ConstructionProjectStatus = "lead" | "quoted" | "active" | "waiting" | "completed" | "archived";
export type ConstructionEstimateStatus = "draft" | "sent" | "accepted" | "rejected" | "expired";

export interface ConstructionProject extends BaseEntity {
  contactId: string;
  name: string;
  address?: string;
  status: ConstructionProjectStatus;
  budget?: number;
  presupuestoTotal?: number;
  presupuestoVatRate?: number;
  estimatedMaterialCost?: number;
  estimatedLaborCost?: number;
  actualMaterialCost?: number;
  actualLaborCost?: number;
  startDate?: string;
  endDate?: string;
  obraType?: string;
  notes?: string;
}
export interface ConstructionEstimate extends BaseEntity { projectId: string; number: string; status: ConstructionEstimateStatus; subtotal: number; vatRate: number; total: number; materialCost: number; laborCost: number; marginPercent: number; }
export interface ConstructionEstimateItem extends BaseEntity { estimateId: string; description: string; category: "material" | "labor" | "service" | "other"; quantity: number; unitPrice: number; unitCost: number; }
export interface ConstructionMaterial extends BaseEntity { name: string; unit: string; defaultCost: number; supplier?: string; }
export interface ConstructionInvoice extends BaseEntity { projectId: string; estimateId?: string; status: "draft" | "sent" | "paid" | "overdue"; total: number; dueAt?: string; }
export interface ConstructionPayment extends BaseEntity { invoiceId?: string; projectId: string; amount: number; paidAt?: string; dueAt?: string; phase?: string; method?: ConstructionPaymentMethod; status: "pending" | "paid" | "overdue"; }
export type ConstructionPaymentMethod = "transfer" | "cash" | "card" | "bizum" | "other";

export type ConstructionExpenseCategory = "material" | "labor" | "subcontract" | "tool" | "transport" | "other";
export type ConstructionExpenseStatus = "confirmed" | "pending_review" | "rejected";
export type ConstructionExpenseSource = "manual" | "ticket" | "voice";

export interface ConstructionExpense extends BaseEntity {
  projectId: string;
  category: ConstructionExpenseCategory;
  provider?: string;
  description: string;
  amount: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  date: string;
  status: ConstructionExpenseStatus;
  source: ConstructionExpenseSource;
  ticketId?: string;
  notes?: string;
}

export type ConstructionTicketStatus = "pending_review" | "linked" | "rejected";

export interface ConstructionTicketExtractedFields {
  provider?: { value: string; confidence: number };
  date?: { value: string; confidence: number };
  amount?: { value: number; confidence: number };
  vatAmount?: { value: number; confidence: number };
}

export interface ConstructionTicket extends BaseEntity {
  projectId?: string;
  suggestedProjectId?: string;
  provider?: string;
  date: string;
  amount: number;
  vatAmount: number;
  imageUrl?: string;
  thumbnailHue?: number;
  status: ConstructionTicketStatus;
  extractedFields?: ConstructionTicketExtractedFields;
  notes?: string;
}
export interface ConstructionPhoto extends BaseEntity { projectId: string; url: string; caption?: string; tag?: string; }
export interface ConstructionSiteVisit extends BaseEntity { projectId: string; scheduledAt: string; notes?: string; status: "scheduled" | "completed" | "cancelled"; }

export type ConstructionExtraStatus = "proposed" | "approved" | "rejected" | "invoiced" | "paid";

export interface ConstructionExtra extends BaseEntity {
  projectId: string;
  title: string;
  description?: string;
  amount: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  status: ConstructionExtraStatus;
  notes?: string;
}

export type IssuedInvoiceStatus = "draft" | "issued" | "sent" | "paid" | "overdue" | "cancelled";

export interface IssuedInvoice extends BaseEntity {
  projectId: string;
  contactId: string;
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  status: IssuedInvoiceStatus;
  concept: string;
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  total: number;
  paidAmount: number;
  notes?: string;
}
