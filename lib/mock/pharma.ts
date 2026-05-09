import type { PharmacyExpiryAlert, PharmacyProduct, PharmacySalesImport, PharmacySupplier } from "@/types/pharma";

export const pharmacySuppliers: PharmacySupplier[] = [
  { id: "supplier-1", organizationId: "org-demo", name: "Nordic Pharma Supply", email: "orders@nordic.example", leadTimeDays: 3, createdAt: "2026-05-01", updatedAt: "2026-05-01" },
  { id: "supplier-2", organizationId: "org-demo", name: "Medline Wholesale", leadTimeDays: 5, createdAt: "2026-05-01", updatedAt: "2026-05-01" },
  { id: "supplier-3", organizationId: "org-demo", name: "Care Products Oy", leadTimeDays: 2, createdAt: "2026-05-01", updatedAt: "2026-05-01" }
];

export const pharmacyProducts: PharmacyProduct[] = [
  { id: "prod-1", organizationId: "org-demo", sku: "VIT-D-100", name: "Vitamin D 100 tabs", category: "Vitamins", supplierId: "supplier-1", stockOnHand: 8, reorderPoint: 20, unitCost: 4.1, retailPrice: 9.9, expiryDate: "2026-08-01", createdAt: "2026-05-01", updatedAt: "2026-05-01" },
  { id: "prod-2", organizationId: "org-demo", sku: "SUN-50", name: "Sunscreen SPF 50", category: "Seasonal", supplierId: "supplier-3", stockOnHand: 55, reorderPoint: 25, unitCost: 7.5, retailPrice: 18.5, createdAt: "2026-05-01", updatedAt: "2026-05-01" },
  { id: "prod-3", organizationId: "org-demo", sku: "BABY-CR", name: "Baby care cream", category: "Family", supplierId: "supplier-2", stockOnHand: 12, reorderPoint: 15, unitCost: 3.8, retailPrice: 8.2, expiryDate: "2026-07-15", createdAt: "2026-05-01", updatedAt: "2026-05-01" },
  { id: "prod-4", organizationId: "org-demo", sku: "PAIN-GEL", name: "Pain relief gel", category: "OTC", supplierId: "supplier-1", stockOnHand: 44, reorderPoint: 18, unitCost: 5.2, retailPrice: 12.9, createdAt: "2026-05-01", updatedAt: "2026-05-01" },
  { id: "prod-5", organizationId: "org-demo", sku: "ALLERGY", name: "Allergy relief pack", category: "Seasonal", supplierId: "supplier-2", stockOnHand: 6, reorderPoint: 30, unitCost: 6.9, retailPrice: 15.9, createdAt: "2026-05-01", updatedAt: "2026-05-01" }
];

export const expiryAlerts: PharmacyExpiryAlert[] = [
  { id: "exp-1", organizationId: "org-demo", productId: "prod-3", expiryDate: "2026-07-15", severity: "high", createdAt: "2026-05-01", updatedAt: "2026-05-01" },
  { id: "exp-2", organizationId: "org-demo", productId: "prod-1", expiryDate: "2026-08-01", severity: "medium", createdAt: "2026-05-01", updatedAt: "2026-05-01" }
];

export const salesImports: PharmacySalesImport[] = [
  { id: "import-1", organizationId: "org-demo", fileName: "weekly-sales.csv", importedAt: "2026-05-08", rows: 248, totalSales: 8420, status: "completed", createdAt: "2026-05-08", updatedAt: "2026-05-08" }
];

export const pharmaMetrics = { lowStock: 3, expiringSoon: 2, weeklySales: 8420, supplierOrders: 4 };
