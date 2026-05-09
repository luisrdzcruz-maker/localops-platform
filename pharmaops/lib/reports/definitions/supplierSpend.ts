/**
 * Supplier Spend Report — total spend, pending, overdue per supplier.
 */

import {
  bytesToBlobPart,
  createPdfContext,
  drawFooter,
  drawHeader,
  drawSectionTitle,
  drawTable,
  renderPdf,
} from "@/lib/reports/pdfBuilder";
import { buildExcelWorkbook } from "@/lib/reports/excelBuilder";
import { computeAllSupplierMetrics } from "@/lib/pharmaops/suppliers";
import { formatDate, formatEur } from "@/lib/utils/format";
import type { ReportDefinition, ReportRenderInput } from "@/types/reports";

const FOOTER =
  "PharmaOps · Gasto por proveedor · Cifras agregadas a partir de las facturas importadas. Revisa con tu gestoría antes de ajustar pagos.";

export const supplierSpendDefinition: ReportDefinition = {
  id: "supplier_spend",
  title: "Informe de gasto por proveedor",
  description:
    "Gasto acumulado, facturas pendientes y plazo medio de pago por proveedor.",
  requiredData: ["purchase_invoices", "suppliers"],
  formats: ["pdf", "xlsx"],
  async generatePdf(input) {
    const blob = await buildPdf(input);
    return {
      filename: `gasto-proveedores-${input.periodEnd}.pdf`,
      mimeType: "application/pdf",
      blob,
    };
  },
  async generateExcel(input) {
    const blob = buildExcel(input);
    return {
      filename: `gasto-proveedores-${input.periodEnd}.xlsx`,
      mimeType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      blob,
    };
  },
};

async function buildPdf(input: ReportRenderInput): Promise<Blob> {
  const ctx = await createPdfContext();
  const metrics = computeAllSupplierMetrics(
    input.data.suppliers,
    input.data.purchaseInvoices
  );

  drawHeader(ctx, {
    pharmacyName: input.pharmacyName,
    eyebrow: "Proveedores",
    title: "Gasto por proveedor",
    period: `${formatDate(input.periodStart)} – ${formatDate(input.periodEnd)}`,
    subtitle:
      "Resumen agregado para revisión interna y negociación de condiciones.",
  });

  drawSectionTitle(ctx, "Resumen");
  drawTable(
    ctx,
    [
      { header: "Proveedor", width: 200 },
      { header: "Facturas", width: 70, align: "right" },
      { header: "Gasto bruto", width: 110, align: "right" },
      { header: "Pendiente", width: 90, align: "right" },
      { header: "Plazo medio (d)", width: 80, align: "right" },
    ],
    metrics.map((m) => [
      m.supplier.name,
      m.invoiceCount.toString(),
      formatEur(m.totalSpend),
      formatEur(m.pendingAmount),
      m.averagePaymentTermsDays !== null
        ? m.averagePaymentTermsDays.toString()
        : "—",
    ])
  );

  drawFooter(ctx, input.footerText ?? FOOTER);
  const bytes = await renderPdf(ctx);
  return new Blob([bytesToBlobPart(bytes)], { type: "application/pdf" });
}

function buildExcel(input: ReportRenderInput): Blob {
  const metrics = computeAllSupplierMetrics(
    input.data.suppliers,
    input.data.purchaseInvoices
  );
  const bytes = buildExcelWorkbook([
    {
      name: "Proveedores",
      headers: [
        "Proveedor",
        "NIF",
        "Facturas",
        "Gasto bruto",
        "Pendiente",
        "Vencido",
        "Plazo medio (d)",
        "Última factura",
      ],
      rows: metrics.map((m) => [
        m.supplier.name,
        m.supplier.taxId ?? "",
        m.invoiceCount,
        m.totalSpend,
        m.pendingAmount,
        m.overdueAmount,
        m.averagePaymentTermsDays ?? "",
        m.lastInvoiceDate ?? "",
      ]),
    },
  ]);
  return new Blob([bytesToBlobPart(bytes)], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}
