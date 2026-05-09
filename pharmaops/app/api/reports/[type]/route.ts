import { NextResponse, type NextRequest } from "next/server";
import { runReport } from "@/lib/reports/engine";
import { appendReport } from "@/lib/demo/store";
import { DEMO_USER } from "@/lib/demo/session";
import { getReportDefinition } from "@/lib/reports/registry";
import type { ReportFormat, ReportType } from "@/types/reports";

const VALID_FORMATS: ReportFormat[] = ["pdf", "xlsx", "csv"];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  const { type } = await params;
  const reportType = type as ReportType;
  const def = getReportDefinition(reportType);
  if (!def) {
    return NextResponse.json(
      { error: `Tipo de informe desconocido: ${reportType}` },
      { status: 404 }
    );
  }

  const url = new URL(request.url);
  const formatParam = (url.searchParams.get("format") ?? "pdf").toLowerCase();
  if (!VALID_FORMATS.includes(formatParam as ReportFormat)) {
    return NextResponse.json(
      { error: `Formato no soportado: ${formatParam}` },
      { status: 400 }
    );
  }
  const format = formatParam as ReportFormat;

  const periodStart = url.searchParams.get("periodStart") ?? undefined;
  const periodEnd = url.searchParams.get("periodEnd") ?? undefined;

  let output;
  try {
    output = await runReport(reportType, format, { periodStart, periodEnd });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Error generando el informe." },
      { status: 500 }
    );
  }

  // Record metadata so the reports list reflects the download.
  appendReport({
    id: `rep-${Date.now()}`,
    pharmacyId: "demo",
    userId: DEMO_USER.id,
    reportType,
    periodStart: periodStart ?? new Date().toISOString().slice(0, 10),
    periodEnd: periodEnd ?? new Date().toISOString().slice(0, 10),
    format,
    status: "ready",
    filename: output.filename,
    metadata: {},
    createdAt: new Date().toISOString(),
  });

  const arrayBuffer = await output.blob.arrayBuffer();
  const body = new Uint8Array(arrayBuffer);
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": output.mimeType,
      "Content-Disposition": `attachment; filename="${output.filename}"`,
      "Content-Length": String(body.length),
      "Cache-Control": "no-store",
    },
  });
}
