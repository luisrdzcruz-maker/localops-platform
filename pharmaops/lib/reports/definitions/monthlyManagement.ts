/**
 * Monthly Management Report — owner-facing summary of the period.
 */

import {
  bytesToBlobPart,
  createPdfContext,
  drawFooter,
  drawHeader,
  drawKpiGrid,
  drawParagraph,
  drawSectionTitle,
  drawTable,
  renderPdf,
} from "@/lib/reports/pdfBuilder";
import { buildExcelWorkbook } from "@/lib/reports/excelBuilder";
import { computeDashboardKpis } from "@/lib/analytics/kpis";
import {
  buildSalesVsPurchasesSeries,
  buildSupplierSpendSeries,
} from "@/lib/analytics/timeseries";
import { formatDate, formatEur, formatPercent } from "@/lib/utils/format";
import type { ReportDefinition, ReportRenderInput } from "@/types/reports";
import type { DemoStoreState } from "@/lib/demo/store";

const COMPLIANCE_FOOTER =
  "PharmaOps · Informe de gestión · Cifras estimadas a partir de los datos importados. No sustituye los informes oficiales de tu sistema de farmacia ni la contabilidad de tu gestoría.";

export const monthlyManagementDefinition: ReportDefinition = {
  id: "monthly_management",
  title: "Informe mensual de gestión",
  description:
    "Resumen ejecutivo: ventas, compras, margen, top proveedores y estado de tareas.",
  requiredData: ["sales_summaries", "purchase_invoices"],
  formats: ["pdf", "xlsx"],
  async generatePdf(input) {
    const blob = await buildMonthlyManagementPdf(input);
    return {
      filename: `informe-gestion-${input.periodEnd}.pdf`,
      mimeType: "application/pdf",
      blob,
    };
  },
  async generateExcel(input) {
    const blob = buildMonthlyManagementExcel(input);
    return {
      filename: `informe-gestion-${input.periodEnd}.xlsx`,
      mimeType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      blob,
    };
  },
};

async function buildMonthlyManagementPdf(input: ReportRenderInput): Promise<Blob> {
  const ctx = await createPdfContext();
  const state = pseudoState(input);
  const kpis = computeDashboardKpis(state);
  const series = buildSalesVsPurchasesSeries(state, { months: 6 });
  const suppliers = buildSupplierSpendSeries(state, { months: 3 }).slice(0, 5);

  drawHeader(ctx, {
    pharmacyName: input.pharmacyName,
    eyebrow: "Informe mensual",
    title: "Informe mensual de gestión",
    period: `${formatDate(input.periodStart)} – ${formatDate(input.periodEnd)}`,
    subtitle:
      "Resumen ejecutivo de ventas, compras y márgenes. Las cifras son una herramienta de gestión y deben revisarse con tu gestoría.",
  });

  drawSectionTitle(ctx, "Indicadores clave");
  drawKpiGrid(ctx, [
    {
      label: "Ventas mes",
      value: formatEur(kpis.revenueThisMonth.current),
      hint:
        kpis.revenueThisMonth.previous !== null
          ? `Mes anterior: ${formatEur(kpis.revenueThisMonth.previous)}`
          : "",
    },
    {
      label: "Compras mes",
      value: formatEur(kpis.purchasesThisMonth.current),
      hint:
        kpis.purchasesThisMonth.previous !== null
          ? `Mes anterior: ${formatEur(kpis.purchasesThisMonth.previous)}`
          : "",
    },
    {
      label: "Margen bruto",
      value:
        kpis.grossMargin.current === null
          ? "No disponible"
          : formatPercent(kpis.grossMargin.current),
      hint: "Estimación operativa",
    },
    {
      label: "Pendiente proveedores",
      value: formatEur(kpis.pendingSupplierInvoicesAmount),
      hint: `${kpis.pendingSupplierInvoicesCount} facturas`,
    },
  ]);

  drawSectionTitle(ctx, "Ventas vs compras (últimos 6 meses)");
  drawTable(
    ctx,
    [
      { header: "Mes", width: 80 },
      { header: "Ventas (neto)", width: 130, align: "right" },
      { header: "Compras (neto)", width: 130, align: "right" },
      { header: "Margen", width: 80, align: "right" },
    ],
    series.map((s) => [
      s.label,
      formatEur(s.sales),
      formatEur(s.purchases),
      s.margin === null ? "—" : formatPercent(s.margin),
    ])
  );

  drawSectionTitle(ctx, "Top proveedores (últimos 3 meses)");
  if (suppliers.length === 0) {
    drawParagraph(ctx, "Sin facturas en este periodo.");
  } else {
    drawTable(
      ctx,
      [
        { header: "Proveedor", width: 240 },
        { header: "Facturas", width: 90, align: "right" },
        { header: "Importe bruto", width: 140, align: "right" },
      ],
      suppliers.map((s) => [
        s.supplier,
        s.invoiceCount.toString(),
        formatEur(s.amount),
      ])
    );
  }

  drawFooter(ctx, input.footerText ?? COMPLIANCE_FOOTER);
  const bytes = await renderPdf(ctx);
  return new Blob([bytesToBlobPart(bytes)], { type: "application/pdf" });
}

function buildMonthlyManagementExcel(input: ReportRenderInput): Blob {
  const state = pseudoState(input);
  const kpis = computeDashboardKpis(state);
  const series = buildSalesVsPurchasesSeries(state, { months: 6 });
  const bytes = buildExcelWorkbook([
    {
      name: "KPIs",
      headers: ["Indicador", "Valor", "Mes anterior"],
      rows: [
        ["Ventas mes", formatEur(kpis.revenueThisMonth.current), formatEur(kpis.revenueThisMonth.previous)],
        ["Compras mes", formatEur(kpis.purchasesThisMonth.current), formatEur(kpis.purchasesThisMonth.previous)],
        ["Margen bruto", kpis.grossMargin.current === null ? "No disponible" : formatPercent(kpis.grossMargin.current), kpis.grossMargin.previous === null ? "—" : formatPercent(kpis.grossMargin.previous)],
        ["Pendiente proveedores", formatEur(kpis.pendingSupplierInvoicesAmount), `${kpis.pendingSupplierInvoicesCount} facturas`],
      ],
    },
    {
      name: "Series",
      headers: ["Mes", "Ventas (neto)", "Compras (neto)", "Margen"],
      rows: series.map((s) => [
        s.label,
        s.sales,
        s.purchases,
        s.margin === null ? "—" : `${(s.margin * 100).toFixed(1)} %`,
      ]),
    },
  ]);
  return new Blob([bytesToBlobPart(bytes)], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

function pseudoState(input: ReportRenderInput): DemoStoreState {
  // Glue: the report input carries data; build a thin DemoStoreState shape
  // so the analytics helpers (which expect a state) work unchanged.
  return {
    loaded: true,
    user: { id: "", fullName: "", email: "", createdAt: new Date().toISOString() },
    pharmacy: {
      id: input.pharmacyId,
      name: input.pharmacyName,
      taxId: null,
      address: null,
      province: null,
      autonomousCommunity: null,
      accountantEmail: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    members: [],
    suppliers: input.data.suppliers,
    importBatches: input.data.importBatches,
    importRows: [],
    mappingTemplates: [],
    purchaseInvoices: input.data.purchaseInvoices,
    purchaseInvoiceLines: input.data.purchaseInvoiceLines,
    salesSummaries: input.data.salesSummaries,
    stockSnapshots: input.data.stockSnapshots,
    expenses: input.data.expenses,
    accountingMovements: [],
    reports: [],
    tasks: [],
    auditLogs: [],
    documents: [],
    documentExtractions: [],
    deliveryNotes: [],
    deliveryNoteLines: [],
  };
}
