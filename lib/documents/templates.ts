import type { DocumentTemplate } from "@/types/documents";
export const documentTemplates: DocumentTemplate[] = [
  { id: "tpl-estimate", organizationId: "org-demo", type: "estimate", name: "Professional renovation estimate", description: "PDF-ready estimate template.", body: "Estimate for {{clientName}}", variables: ["clientName", "projectName", "total"], createdAt: "2026-05-01", updatedAt: "2026-05-01" },
  { id: "tpl-po", organizationId: "org-demo", type: "purchase_order", name: "Pharmacy purchase order", description: "Supplier purchase order template.", body: "Purchase order for {{supplierName}}", variables: ["supplierName", "items", "total"], createdAt: "2026-05-01", updatedAt: "2026-05-01" }
];
