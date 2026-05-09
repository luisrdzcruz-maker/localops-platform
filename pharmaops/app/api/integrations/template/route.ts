import { NextResponse, type NextRequest } from "next/server";
import { buildTemplate } from "@/lib/integrations/templates";
import type { ImportType } from "@/types/imports";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const type = (url.searchParams.get("type") ?? "") as ImportType;
  const out = buildTemplate(type);
  if (!out) {
    return NextResponse.json(
      { error: `Plantilla no disponible para "${type}".` },
      { status: 404 }
    );
  }
  // Copy into a fresh ArrayBuffer-backed Uint8Array for the response body
  // type checker.
  const body = new ArrayBuffer(out.bytes.byteLength);
  new Uint8Array(body).set(out.bytes);
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": out.mimeType,
      "Content-Disposition": `attachment; filename="${out.filename}"`,
      "Content-Length": String(out.bytes.length),
      "Cache-Control": "no-store",
    },
  });
}
