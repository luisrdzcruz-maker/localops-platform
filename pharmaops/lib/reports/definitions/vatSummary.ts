/**
 * VAT Summary Report — repercutido vs soportado per period.
 */

import {
  bytesToBlobPart,
  createPdfContext,
  drawFooter,
  drawHeader,
  drawKpiGrid,
  drawSectionTitle,
  drawTable,
  renderPdf,
} from "@/lib/reports/pdfBuilder";
import { computeVatSummary } from "@/lib/pharmaops/finance";
import { formatDate, formatEur } from "@/lib/utils/format";
import type { ReportDefinition, ReportRenderInput } from "@/types/reports";

const FOOTER =
  "PharmaOps · Resumen de IVA · Estimación a partir de datos importados. Esta versión MVP NO certifica VeriFactu ni el cumplimiento fiscal — tu gestoría debe validar y presentar la declaración oficial.";

export const vatSummaryDefinition: ReportDefinition = {
  id: "vat_summary",
  title: "Resumen de IVA",
  description:
    "IVA repercutido (ventas) y soportado (compras y gastos) por tipo, con neto estimado.",
  requiredData: ["sales_summaries", "purchase_invoices"],
  formats: ["pdf"],
  async generatePdf(input) {
    const blob = await buildPdf(input);
    return {
      filename: `iva-resumen-${input.periodEnd}.pdf`,
      mimeType: "application/pdf",
      blob,
    };
  },
};

async function buildPdf(input: ReportRenderInput): Promise<Blob> {
  const ctx = await createPdfContext();
  const summary = computeVatSummary(
    input.data.purchaseInvoices,
    input.data.salesSummaries,
    {
      periodStart: new Date(input.periodStart),
      periodEnd: new Date(input.periodEnd),
    }
  );

  drawHeader(ctx, {
    pharmacyName: input.pharmacyName,
    eyebrow: "Fiscalidad",
    title: "Resumen de IVA estimado",
    period: `${formatDate(summary.periodStart)} – ${formatDate(summary.periodEnd)}`,
    subtitle: summary.disclaimer,
  });

  drawKpiGrid(ctx, [
    {
      label: "IVA repercutido",
      value: formatEur(summary.outputVat),
      hint: "Ventas",
    },
    {
      label: "IVA soportado",
      value: formatEur(summary.inputVat),
      hint: "Compras y gastos",
    },
    {
      label: "Neto estimado",
      value: formatEur(summary.netVat),
      hint: "Saldo del periodo",
    },
  ]);

  drawSectionTitle(ctx, "Por tipo de IVA");
  drawTable(
    ctx,
    [
      { header: "Tipo", width: 80, align: "right" },
      { header: "Repercutido", width: 130, align: "right" },
      { header: "Soportado", width: 130, align: "right" },
      { header: "Neto", width: 130, align: "right" },
    ],
    summary.byRate.map((r) => [
      `${r.rate}%`,
      formatEur(r.outputVat),
      formatEur(r.inputVat),
      formatEur(r.outputVat - r.inputVat),
    ])
  );

  drawFooter(ctx, input.footerText ?? FOOTER);
  const bytes = await renderPdf(ctx);
  return new Blob([bytesToBlobPart(bytes)], { type: "application/pdf" });
}
