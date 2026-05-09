/**
 * Lightweight PDF builder on top of pdf-lib.
 *
 * Avoids dragging in a templating engine — instead, exposes a small block-
 * level API (heading, paragraph, KPI grid, table, footer) that the report
 * definitions compose. Layout is intentionally simple: A4, generous margins,
 * Helvetica, no images beyond an optional logo data URL.
 */

import {
  PDFDocument,
  PDFFont,
  PDFPage,
  StandardFonts,
  rgb,
} from "pdf-lib";

export const A4 = { width: 595.28, height: 841.89 };

export interface PdfTheme {
  marginX: number;
  marginY: number;
  textColor: ReturnType<typeof rgb>;
  mutedColor: ReturnType<typeof rgb>;
  brandColor: ReturnType<typeof rgb>;
  borderColor: ReturnType<typeof rgb>;
  rowAlt: ReturnType<typeof rgb>;
}

export const DEFAULT_THEME: PdfTheme = {
  marginX: 48,
  marginY: 48,
  textColor: rgb(0.06, 0.09, 0.16),
  mutedColor: rgb(0.4, 0.45, 0.55),
  brandColor: rgb(0.16, 0.36, 0.3),
  borderColor: rgb(0.86, 0.89, 0.92),
  rowAlt: rgb(0.97, 0.98, 0.98),
};

export interface PdfContext {
  doc: PDFDocument;
  page: PDFPage;
  font: PDFFont;
  bold: PDFFont;
  theme: PdfTheme;
  /** Current Y position from the top of the page. */
  y: number;
}

export async function createPdfContext(): Promise<PdfContext> {
  const doc = await PDFDocument.create();
  doc.setTitle("PharmaOps");
  doc.setProducer("PharmaOps MVP");
  doc.setCreator("PharmaOps");
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const page = doc.addPage([A4.width, A4.height]);
  return {
    doc,
    page,
    font,
    bold,
    theme: DEFAULT_THEME,
    y: A4.height - DEFAULT_THEME.marginY,
  };
}

export function ensureSpace(ctx: PdfContext, needed: number): void {
  if (ctx.y - needed < ctx.theme.marginY) {
    ctx.page = ctx.doc.addPage([A4.width, A4.height]);
    ctx.y = A4.height - ctx.theme.marginY;
  }
}

export function drawHeader(
  ctx: PdfContext,
  options: {
    pharmacyName: string;
    eyebrow?: string;
    title: string;
    subtitle?: string;
    period?: string;
  }
): void {
  ensureSpace(ctx, 90);
  const { theme } = ctx;
  if (options.eyebrow) {
    ctx.page.drawText(options.eyebrow.toUpperCase(), {
      x: theme.marginX,
      y: ctx.y,
      size: 9,
      font: ctx.bold,
      color: theme.brandColor,
    });
    ctx.y -= 14;
  }
  ctx.page.drawText(options.title, {
    x: theme.marginX,
    y: ctx.y,
    size: 22,
    font: ctx.bold,
    color: theme.textColor,
  });
  ctx.y -= 24;
  ctx.page.drawText(options.pharmacyName, {
    x: theme.marginX,
    y: ctx.y,
    size: 11,
    font: ctx.font,
    color: theme.mutedColor,
  });
  ctx.y -= 14;
  if (options.period) {
    ctx.page.drawText(options.period, {
      x: theme.marginX,
      y: ctx.y,
      size: 10,
      font: ctx.font,
      color: theme.mutedColor,
    });
    ctx.y -= 12;
  }
  if (options.subtitle) {
    ctx.y -= 6;
    drawParagraph(ctx, options.subtitle, { size: 10, color: theme.mutedColor });
  }
  ctx.y -= 12;
  drawHorizontalRule(ctx);
  ctx.y -= 10;
}

export function drawSectionTitle(ctx: PdfContext, label: string): void {
  ensureSpace(ctx, 30);
  ctx.page.drawText(label, {
    x: ctx.theme.marginX,
    y: ctx.y,
    size: 14,
    font: ctx.bold,
    color: ctx.theme.textColor,
  });
  ctx.y -= 18;
}

export function drawParagraph(
  ctx: PdfContext,
  text: string,
  options: { size?: number; color?: ReturnType<typeof rgb> } = {}
): void {
  const size = options.size ?? 10;
  const color = options.color ?? ctx.theme.textColor;
  const maxWidth = A4.width - ctx.theme.marginX * 2;
  const words = text.split(/\s+/);
  let line = "";
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (ctx.font.widthOfTextAtSize(candidate, size) > maxWidth) {
      ensureSpace(ctx, size + 4);
      ctx.page.drawText(line, {
        x: ctx.theme.marginX,
        y: ctx.y,
        size,
        font: ctx.font,
        color,
      });
      ctx.y -= size + 2;
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) {
    ensureSpace(ctx, size + 4);
    ctx.page.drawText(line, {
      x: ctx.theme.marginX,
      y: ctx.y,
      size,
      font: ctx.font,
      color,
    });
    ctx.y -= size + 4;
  }
}

export interface KpiCell {
  label: string;
  value: string;
  hint?: string;
}

export function drawKpiGrid(ctx: PdfContext, cells: KpiCell[]): void {
  if (cells.length === 0) return;
  const cols = Math.min(4, cells.length);
  const padding = 8;
  const totalWidth = A4.width - ctx.theme.marginX * 2;
  const cellWidth = (totalWidth - padding * (cols - 1)) / cols;
  const cellHeight = 60;
  ensureSpace(ctx, cellHeight + 10);
  let x = ctx.theme.marginX;
  let y = ctx.y;
  let i = 0;
  for (const cell of cells) {
    const col = i % cols;
    if (col === 0 && i > 0) {
      y -= cellHeight + padding;
      x = ctx.theme.marginX;
      ensureSpace(ctx, cellHeight + 10);
      y = ctx.y;
    }
    ctx.page.drawRectangle({
      x,
      y: y - cellHeight,
      width: cellWidth,
      height: cellHeight,
      borderColor: ctx.theme.borderColor,
      borderWidth: 0.5,
      color: ctx.theme.rowAlt,
    });
    ctx.page.drawText(cell.label.toUpperCase(), {
      x: x + 10,
      y: y - 18,
      size: 8,
      font: ctx.bold,
      color: ctx.theme.mutedColor,
    });
    ctx.page.drawText(cell.value, {
      x: x + 10,
      y: y - 36,
      size: 14,
      font: ctx.bold,
      color: ctx.theme.textColor,
    });
    if (cell.hint) {
      ctx.page.drawText(cell.hint, {
        x: x + 10,
        y: y - 50,
        size: 8,
        font: ctx.font,
        color: ctx.theme.mutedColor,
      });
    }
    x += cellWidth + padding;
    i += 1;
  }
  // Advance Y past the grid.
  const rows = Math.ceil(cells.length / cols);
  ctx.y -= rows * cellHeight + (rows - 1) * padding + 12;
}

export interface PdfTableColumn {
  header: string;
  width: number;
  align?: "left" | "right";
}

export function drawTable(
  ctx: PdfContext,
  columns: PdfTableColumn[],
  rows: string[][]
): void {
  const headerHeight = 22;
  const rowHeight = 18;
  const padding = 8;
  ensureSpace(ctx, headerHeight + rowHeight);
  const startX = ctx.theme.marginX;

  // Header
  let x = startX;
  ctx.page.drawRectangle({
    x: startX,
    y: ctx.y - headerHeight,
    width: columns.reduce((a, c) => a + c.width, 0),
    height: headerHeight,
    color: ctx.theme.rowAlt,
  });
  for (const c of columns) {
    const align = c.align ?? "left";
    const textWidth = ctx.bold.widthOfTextAtSize(c.header, 9);
    const tx =
      align === "right" ? x + c.width - padding - textWidth : x + padding;
    ctx.page.drawText(c.header, {
      x: tx,
      y: ctx.y - 14,
      size: 9,
      font: ctx.bold,
      color: ctx.theme.mutedColor,
    });
    x += c.width;
  }
  ctx.y -= headerHeight;

  for (let r = 0; r < rows.length; r++) {
    ensureSpace(ctx, rowHeight + 2);
    let cx = startX;
    if (r % 2 === 1) {
      ctx.page.drawRectangle({
        x: startX,
        y: ctx.y - rowHeight,
        width: columns.reduce((a, c) => a + c.width, 0),
        height: rowHeight,
        color: rgb(0.99, 0.99, 0.99),
      });
    }
    for (let i = 0; i < columns.length; i++) {
      const c = columns[i]!;
      const cell = rows[r]![i] ?? "";
      const align = c.align ?? "left";
      const textWidth = ctx.font.widthOfTextAtSize(cell, 9);
      const tx =
        align === "right" ? cx + c.width - padding - textWidth : cx + padding;
      ctx.page.drawText(cell, {
        x: tx,
        y: ctx.y - 12,
        size: 9,
        font: ctx.font,
        color: ctx.theme.textColor,
      });
      cx += c.width;
    }
    ctx.y -= rowHeight;
  }
  // Border around the table.
  ctx.page.drawRectangle({
    x: startX,
    y: ctx.y,
    width: columns.reduce((a, c) => a + c.width, 0),
    height: headerHeight + rows.length * rowHeight,
    borderColor: ctx.theme.borderColor,
    borderWidth: 0.5,
  });
  ctx.y -= 10;
}

export function drawHorizontalRule(ctx: PdfContext): void {
  ctx.page.drawLine({
    start: { x: ctx.theme.marginX, y: ctx.y },
    end: { x: A4.width - ctx.theme.marginX, y: ctx.y },
    thickness: 0.5,
    color: ctx.theme.borderColor,
  });
}

export function drawFooter(ctx: PdfContext, text: string): void {
  const pages = ctx.doc.getPages();
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i]!;
    page.drawLine({
      start: { x: ctx.theme.marginX, y: ctx.theme.marginY + 18 },
      end: { x: A4.width - ctx.theme.marginX, y: ctx.theme.marginY + 18 },
      thickness: 0.5,
      color: ctx.theme.borderColor,
    });
    page.drawText(text, {
      x: ctx.theme.marginX,
      y: ctx.theme.marginY,
      size: 8,
      font: ctx.font,
      color: ctx.theme.mutedColor,
      maxWidth: A4.width - ctx.theme.marginX * 2,
    });
    page.drawText(`${i + 1} / ${pages.length}`, {
      x: A4.width - ctx.theme.marginX - 30,
      y: ctx.theme.marginY,
      size: 8,
      font: ctx.font,
      color: ctx.theme.mutedColor,
    });
  }
}

export async function renderPdf(ctx: PdfContext): Promise<Uint8Array> {
  return ctx.doc.save();
}

/**
 * Copy bytes into a fresh, contiguous ArrayBuffer so Blob() accepts them
 * under strict TypeScript settings (which distinguish ArrayBuffer from
 * SharedArrayBuffer-backed Uint8Arrays).
 */
export function bytesToBlobPart(bytes: Uint8Array): ArrayBuffer {
  const out = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(out).set(bytes);
  return out;
}
