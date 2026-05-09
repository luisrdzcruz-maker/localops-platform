/**
 * Stock Risk Report — items below reorder point or near expiry.
 */

import { differenceInCalendarDays, parseISO } from "date-fns";
import {
  bytesToBlobPart,
  createPdfContext,
  drawFooter,
  drawHeader,
  drawSectionTitle,
  drawTable,
  renderPdf,
} from "@/lib/reports/pdfBuilder";
import { buildCsv } from "@/lib/reports/excelBuilder";
import { formatDate, formatEur } from "@/lib/utils/format";
import {
  PRODUCT_FAMILY_LABELS,
  type ProductFamily,
  type StockSnapshot,
} from "@/types/pharmacy";
import type { ReportDefinition, ReportRenderInput } from "@/types/reports";

const FOOTER =
  "PharmaOps · Riesgo de stock · Detección operativa basada en el último inventario importado. La gestión real de stock se hace en tu sistema de farmacia.";

export const stockRiskDefinition: ReportDefinition = {
  id: "stock_risk",
  title: "Informe de riesgo de stock",
  description: "Productos por debajo del punto de pedido o próximos a caducar.",
  requiredData: ["stock_snapshots"],
  formats: ["pdf", "csv"],
  async generatePdf(input) {
    const blob = await buildPdf(input);
    return {
      filename: `riesgo-stock-${input.periodEnd}.pdf`,
      mimeType: "application/pdf",
      blob,
    };
  },
  async generateCsv(input) {
    const blob = buildCsvOutput(input);
    return {
      filename: `riesgo-stock-${input.periodEnd}.csv`,
      mimeType: "text/csv;charset=utf-8",
      blob,
    };
  },
};

interface RiskRow {
  productCode: string;
  productName: string;
  family: string;
  quantityOnHand: number;
  reorderPoint: number | null;
  expiryDate: string | null;
  daysToExpiry: number | null;
  unitCost: number | null;
  reasons: string[];
}

function computeRisk(snapshots: StockSnapshot[], today: Date): RiskRow[] {
  const out: RiskRow[] = [];
  for (const s of snapshots) {
    const reasons: string[] = [];
    let daysToExpiry: number | null = null;
    if (s.reorderPoint !== null && s.quantityOnHand < s.reorderPoint) {
      reasons.push("Bajo punto de pedido");
    }
    if (s.expiryDate) {
      daysToExpiry = differenceInCalendarDays(parseISO(s.expiryDate), today);
      if (daysToExpiry !== null && daysToExpiry < 90) {
        reasons.push(`Caduca en ${daysToExpiry} días`);
      }
    }
    if (reasons.length === 0) continue;
    out.push({
      productCode: s.productCode ?? "",
      productName: s.productName,
      family: PRODUCT_FAMILY_LABELS[s.family as ProductFamily] ?? s.family,
      quantityOnHand: s.quantityOnHand,
      reorderPoint: s.reorderPoint,
      expiryDate: s.expiryDate,
      daysToExpiry,
      unitCost: s.unitCost,
      reasons,
    });
  }
  return out.sort((a, b) => {
    const aExp = a.daysToExpiry ?? 9999;
    const bExp = b.daysToExpiry ?? 9999;
    return aExp - bExp;
  });
}

async function buildPdf(input: ReportRenderInput): Promise<Blob> {
  const ctx = await createPdfContext();
  const today = new Date(input.periodEnd);
  const rows = computeRisk(input.data.stockSnapshots, today);

  drawHeader(ctx, {
    pharmacyName: input.pharmacyName,
    eyebrow: "Stock",
    title: "Productos en riesgo",
    period: `Inventario ${formatDate(input.periodEnd)}`,
    subtitle: `Detectados ${rows.length} productos con riesgo (bajo punto de pedido o caducidad próxima).`,
  });

  drawSectionTitle(ctx, "Listado");
  drawTable(
    ctx,
    [
      { header: "Producto", width: 200 },
      { header: "Familia", width: 90 },
      { header: "Stock", width: 60, align: "right" },
      { header: "P. pedido", width: 70, align: "right" },
      { header: "Caducidad", width: 90 },
      { header: "Motivo", width: 120 },
    ],
    rows.slice(0, 80).map((r) => [
      r.productName,
      r.family,
      r.quantityOnHand.toString(),
      r.reorderPoint !== null ? r.reorderPoint.toString() : "—",
      r.expiryDate ?? "—",
      r.reasons.join("; "),
    ])
  );

  drawFooter(ctx, input.footerText ?? FOOTER);
  const bytes = await renderPdf(ctx);
  return new Blob([bytesToBlobPart(bytes)], { type: "application/pdf" });
}

function buildCsvOutput(input: ReportRenderInput): Blob {
  const today = new Date(input.periodEnd);
  const rows = computeRisk(input.data.stockSnapshots, today);
  const bytes = buildCsv({
    name: "Stock en riesgo",
    headers: [
      "Código",
      "Producto",
      "Familia",
      "Stock",
      "Punto de pedido",
      "Caducidad",
      "Días a caducidad",
      "Coste unitario",
      "Motivo",
    ],
    rows: rows.map((r) => [
      r.productCode,
      r.productName,
      r.family,
      r.quantityOnHand,
      r.reorderPoint ?? "",
      r.expiryDate ?? "",
      r.daysToExpiry ?? "",
      r.unitCost !== null ? formatEur(r.unitCost) : "",
      r.reasons.join("; "),
    ]),
  });
  return new Blob([bytesToBlobPart(bytes)], { type: "text/csv;charset=utf-8" });
}
