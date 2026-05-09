import type { BaseEntity } from "./core";

export interface PharmacyProduct extends BaseEntity {
  sku: string;
  name: string;
  category: string;
  supplierId?: string;
  stockOnHand: number;
  reorderPoint: number;
  unitCost: number;
  retailPrice: number;
  expiryDate?: string;
}
export interface PharmacySupplier extends BaseEntity { name: string; email?: string; phone?: string; leadTimeDays: number; }
export interface PharmacyStockSnapshot extends BaseEntity { productId: string; quantity: number; capturedAt: string; source: "manual" | "csv" | "integration"; }
export interface PharmacySalesImport extends BaseEntity { fileName: string; importedAt: string; rows: number; totalSales: number; status: "completed" | "failed" | "processing"; }
export interface PharmacySalesImportRow extends BaseEntity { importId: string; productSku: string; quantity: number; revenue: number; soldAt: string; }
export interface PharmacyPurchaseOrder extends BaseEntity { supplierId: string; status: "draft" | "sent" | "received" | "cancelled"; total: number; }
export interface PharmacyPurchaseOrderItem extends BaseEntity { purchaseOrderId: string; productId: string; quantity: number; unitCost: number; }
export interface PharmacyExpiryAlert extends BaseEntity { productId: string; expiryDate: string; severity: "low" | "medium" | "high"; }
