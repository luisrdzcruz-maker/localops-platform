/**
 * Pharmacy domain — the canonical model for PharmaOps. Files imported from
 * Unycop/Farmatic/Nixfarma/Excel are normalized into these shapes before they
 * reach the business modules (dashboard, suppliers, finance, reports).
 */

import type { UserId, WorkspaceId, WorkspaceRole } from "./localops";

export type PharmacyId = WorkspaceId;
export type SupplierId = string;
export type ProductCode = string;
export type SalesSummaryId = string;
export type StockSnapshotId = string;

export interface Pharmacy {
  id: PharmacyId;
  name: string;
  taxId: string | null;
  address: string | null;
  province: string | null;
  autonomousCommunity: string | null;
  accountantEmail: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PharmacyMember {
  id: string;
  pharmacyId: PharmacyId;
  userId: UserId;
  role: WorkspaceRole;
  createdAt: string;
}

export type SupplierStatus = "active" | "inactive" | "blocked";

export interface Supplier {
  id: SupplierId;
  pharmacyId: PharmacyId;
  name: string;
  taxId: string | null;
  email: string | null;
  phone: string | null;
  contactPerson: string | null;
  paymentTermsDays: number | null;
  notes: string | null;
  status: SupplierStatus;
  preferred: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Spanish pharmacy product families used across imports, stock, sales and
 * margin analytics. Keep this list deliberately small — pharmacy operators
 * recognise these labels.
 */
export type ProductFamily =
  | "medicamentos"
  | "parafarmacia"
  | "dermocosmetica"
  | "infantil"
  | "ortopedia"
  | "servicios"
  | "otros";

export const PRODUCT_FAMILIES: ProductFamily[] = [
  "medicamentos",
  "parafarmacia",
  "dermocosmetica",
  "infantil",
  "ortopedia",
  "servicios",
  "otros",
];

export const PRODUCT_FAMILY_LABELS: Record<ProductFamily, string> = {
  medicamentos: "Medicamentos",
  parafarmacia: "Parafarmacia",
  dermocosmetica: "Dermocosmética",
  infantil: "Infantil",
  ortopedia: "Ortopedia",
  servicios: "Servicios",
  otros: "Otros",
};

/** A lightweight product reference. PharmaOps does not own a product master
 *  in the MVP — products are derived from imported lines. */
export interface ProductLite {
  productCode: ProductCode | null;
  cnCode: string | null;
  name: string;
  family: ProductFamily;
}

export type PaymentMethod =
  | "cash"
  | "card"
  | "transfer"
  | "financing"
  | "other";

export const PAYMENT_METHODS: PaymentMethod[] = [
  "cash",
  "card",
  "transfer",
  "financing",
  "other",
];

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: "Efectivo",
  card: "Tarjeta",
  transfer: "Transferencia",
  financing: "Financiación",
  other: "Otro",
};

/** Daily/weekly/monthly sales rollup. PharmaOps stores summaries, not
 *  per-prescription sales (compliance: no patient-level data). */
export interface SalesSummary {
  id: SalesSummaryId;
  pharmacyId: PharmacyId;
  importBatchId: string | null;
  date: string;
  family: ProductFamily;
  grossSales: number;
  netSales: number;
  vatAmount: number;
  units: number;
  paymentMethod: PaymentMethod | null;
  marginAmount: number | null;
  marginPercent: number | null;
  createdAt: string;
}

export interface StockSnapshot {
  id: StockSnapshotId;
  pharmacyId: PharmacyId;
  importBatchId: string | null;
  snapshotDate: string;
  productCode: ProductCode | null;
  cnCode: string | null;
  productName: string;
  family: ProductFamily;
  quantityOnHand: number;
  unitCost: number | null;
  pvp: number | null;
  expiryDate: string | null;
  supplierName: string | null;
  reorderPoint: number | null;
  createdAt: string;
}
