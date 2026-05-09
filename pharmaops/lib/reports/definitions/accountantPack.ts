/**
 * Accountant Pack — by-category aggregate of invoices + expenses for the
 * pharmacy's gestoría.
 */

import {
  bytesToBlobPart,
  createPdfContext,
  drawFooter,
  drawHeader,
  drawParagraph,
  drawSectionTitle,
  drawTable,
  renderPdf,
} from "@/lib/reports/pdfBuilder";
import { buildCsv, buildExcelWorkbook } from "@/lib/reports/excelBuilder";
import { computeAccountantPack } from "@/lib/pharmaops/finance";
import { formatDate, formatEur } from "@/lib/utils/format";
import {
  ACCOUNTING_CATEGORY_LABELS,
  type AccountingCategory,
} from "@/types/finance";
import type { ReportDefinition, ReportRenderInput } from "@/types/reports";

const FOOTER =
  "PharmaOps · Paquete para gestoría · Resumen de gestión, no constituye declaración fiscal. Tu gestoría debe validar las cifras antes de cualquier presentación.";

export const accountantPackDefinition: ReportDefinition = {
  id: "accountant_pack",
  title: "Paquete para gestoría",
  description:
    "Compras, gastos e IVA agregados por categoría — formato pensado para enviar a la gestoría mensualmente.",
  requiredData: ["purchase_invoices", "expenses"],
  formats: ["pdf", "xlsx", "csv"],
  async generatePdf(input) {
    const blob = await buildPdf(input);
    return {
      filename: `paquete-gestoria-${input.periodEnd}.pdf`,
      mimeType: "application/pdf",
      blob,
    };
  },
  async generateExcel(input) {
    const blob = buildExcel(input);
    return {
      filename: `paquete-gestoria-${input.periodEnd}.xlsx`,
      mimeType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      blob,
    };
  },
  async generateCsv(input) {
    const blob = buildCsvOutput(input);
    return {
      filename: `paquete-gestoria-${input.periodEnd}.csv`,
      mimeType: "text/csv;charset=utf-8",
      blob,
    };
  },
};

async function buildPdf(input: ReportRenderInput): Promise<Blob> {
  const ctx = await createPdfContext();
  const pack = computeAccountantPack(
    input.pharmacyId,
    input.data.purchaseInvoices,
    input.data.expenses,
    {
      periodStart: new Date(input.periodStart),
      periodEnd: new Date(input.periodEnd),
    }
  );

  drawHeader(ctx, {
    pharmacyName: input.pharmacyName,
    eyebrow: "Gestoría",
    title: "Paquete mensual para gestoría",
    period: `${formatDate(input.periodStart)} – ${formatDate(input.periodEnd)}`,
    subtitle: pack.disclaimer,
  });

  drawSectionTitle(ctx, "Resumen por categoría");
  if (pack.entries.length === 0) {
    drawParagraph(ctx, "Sin movimientos en el periodo seleccionado.");
  } else {
    drawTable(
      ctx,
      [
        { header: "Categoría", width: 180 },
        { header: "Movimientos", width: 90, align: "right" },
        { header: "Base", width: 90, align: "right" },
        { header: "IVA", width: 80, align: "right" },
        { header: "Total", width: 100, align: "right" },
      ],
      [
        ...pack.entries.map((e) => [
          ACCOUNTING_CATEGORY_LABELS[e.category as AccountingCategory] ?? e.category,
          e.count.toString(),
          formatEur(e.totalNet),
          formatEur(e.totalVat),
          formatEur(e.totalGross),
        ]),
        [
          "TOTAL",
          "—",
          formatEur(pack.totals.totalNet),
          formatEur(pack.totals.totalVat),
          formatEur(pack.totals.totalGross),
        ],
      ]
    );
  }

  drawFooter(ctx, input.footerText ?? FOOTER);
  const bytes = await renderPdf(ctx);
  return new Blob([bytesToBlobPart(bytes)], { type: "application/pdf" });
}

function buildExcel(input: ReportRenderInput): Blob {
  const pack = computeAccountantPack(
    input.pharmacyId,
    input.data.purchaseInvoices,
    input.data.expenses,
    {
      periodStart: new Date(input.periodStart),
      periodEnd: new Date(input.periodEnd),
    }
  );
  const bytes = buildExcelWorkbook([
    {
      name: "Resumen",
      headers: ["Categoría", "Movimientos", "Base", "IVA", "Total"],
      rows: [
        ...pack.entries.map((e) => [
          ACCOUNTING_CATEGORY_LABELS[e.category as AccountingCategory] ?? e.category,
          e.count,
          e.totalNet,
          e.totalVat,
          e.totalGross,
        ]),
        [
          "TOTAL",
          null,
          pack.totals.totalNet,
          pack.totals.totalVat,
          pack.totals.totalGross,
        ],
      ],
    },
    {
      name: "Compras",
      headers: [
        "Nº Factura",
        "Proveedor",
        "NIF",
        "Fecha",
        "Vencimiento",
        "Base",
        "IVA",
        "Total",
        "Estado",
      ],
      rows: input.data.purchaseInvoices.map((i) => [
        i.invoiceNumber,
        i.supplierName,
        i.supplierTaxId ?? "",
        i.invoiceDate,
        i.dueDate ?? "",
        i.netAmount,
        i.vatAmount,
        i.grossAmount,
        i.paymentStatus,
      ]),
    },
    {
      name: "Gastos",
      headers: [
        "Fecha",
        "Emisor",
        "Concepto",
        "Categoría",
        "Base",
        "IVA",
        "Total",
        "Forma de pago",
        "Estado",
      ],
      rows: input.data.expenses.map((e) => [
        e.date,
        e.vendor,
        e.description,
        e.category,
        e.netAmount,
        e.vatAmount,
        e.grossAmount,
        e.paymentMethod ?? "",
        e.paymentStatus,
      ]),
    },
  ]);
  return new Blob([bytesToBlobPart(bytes)], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

function buildCsvOutput(input: ReportRenderInput): Blob {
  const pack = computeAccountantPack(
    input.pharmacyId,
    input.data.purchaseInvoices,
    input.data.expenses,
    {
      periodStart: new Date(input.periodStart),
      periodEnd: new Date(input.periodEnd),
    }
  );
  const bytes = buildCsv({
    name: "Resumen",
    headers: ["Categoría", "Movimientos", "Base", "IVA", "Total"],
    rows: pack.entries.map((e) => [
      ACCOUNTING_CATEGORY_LABELS[e.category as AccountingCategory] ?? e.category,
      e.count,
      e.totalNet,
      e.totalVat,
      e.totalGross,
    ]),
  });
  return new Blob([bytesToBlobPart(bytes)], { type: "text/csv;charset=utf-8" });
}
