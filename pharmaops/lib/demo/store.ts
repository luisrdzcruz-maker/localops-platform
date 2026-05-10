/**
 * In-memory demo store.
 *
 * Holds the canonical PharmaOps state when the app runs in demo mode. This is
 * a module-level singleton — fine for local dev / single-instance demos. When
 * Supabase wiring goes live, callers will switch from getDemoStore() to the
 * Supabase repos, but the read shapes stay identical.
 *
 * The store seeds itself on first access so the dashboard has data on the
 * very first request without requiring a bootstrap step.
 */

import type {
  AccountingMovement,
  Expense,
  PurchaseInvoice,
  PurchaseInvoiceLine,
} from "@/types/finance";
import type {
  Pharmacy,
  PharmacyMember,
  SalesSummary,
  StockSnapshot,
  Supplier,
} from "@/types/pharmacy";
import type {
  ImportBatch,
  ImportRow,
  MappingTemplate,
} from "@/types/imports";
import type { Report } from "@/types/reports";
import type { Task } from "@/types/tasks";
import type { AuditLogEntry, UserProfile } from "@/types/localops";
import type { DocumentRecord } from "@/types/documents";
import type {
  DeliveryNote,
  DeliveryNoteLine,
  DeliveryNoteStatus,
} from "@/types/delivery-notes";
import type {
  ExtractionStatus,
  InvoiceExtractionProposal,
} from "@/lib/ocr/types";
import {
  DEMO_MEMBERSHIP,
  DEMO_PHARMACY,
  DEMO_USER,
} from "./session";
import { generateDemoSeed } from "./seed";

export interface DemoStoreState {
  loaded: boolean;
  user: UserProfile;
  pharmacy: Pharmacy;
  members: PharmacyMember[];
  suppliers: Supplier[];
  importBatches: ImportBatch[];
  importRows: ImportRow[];
  mappingTemplates: MappingTemplate[];
  purchaseInvoices: PurchaseInvoice[];
  purchaseInvoiceLines: PurchaseInvoiceLine[];
  salesSummaries: SalesSummary[];
  stockSnapshots: StockSnapshot[];
  expenses: Expense[];
  accountingMovements: AccountingMovement[];
  reports: Report[];
  tasks: Task[];
  auditLogs: AuditLogEntry[];
  documents: DocumentRecord[];
  documentExtractions: InvoiceExtractionProposal[];
  deliveryNotes: DeliveryNote[];
  deliveryNoteLines: DeliveryNoteLine[];
}

function emptyState(): DemoStoreState {
  return {
    loaded: false,
    user: DEMO_USER,
    pharmacy: DEMO_PHARMACY,
    members: [DEMO_MEMBERSHIP],
    suppliers: [],
    importBatches: [],
    importRows: [],
    mappingTemplates: [],
    purchaseInvoices: [],
    purchaseInvoiceLines: [],
    salesSummaries: [],
    stockSnapshots: [],
    expenses: [],
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

function seededState(): DemoStoreState {
  const seed = generateDemoSeed();
  return {
    loaded: true,
    user: DEMO_USER,
    pharmacy: DEMO_PHARMACY,
    members: [DEMO_MEMBERSHIP],
    suppliers: seed.suppliers,
    importBatches: seed.importBatches,
    importRows: [],
    mappingTemplates: [],
    purchaseInvoices: seed.purchaseInvoices,
    purchaseInvoiceLines: seed.purchaseInvoiceLines,
    salesSummaries: seed.salesSummaries,
    stockSnapshots: seed.stockSnapshots,
    expenses: seed.expenses,
    accountingMovements: [],
    reports: seed.reports,
    tasks: seed.tasks,
    auditLogs: seed.auditLogs,
    documents: seed.documents,
    documentExtractions: [],
    deliveryNotes: seed.deliveryNotes,
    deliveryNoteLines: seed.deliveryNoteLines,
  };
}

// Survive across HMR reloads in dev so demo edits aren't lost on every save.
declare global {
  // eslint-disable-next-line no-var
  var __pharmaopsDemoState: DemoStoreState | undefined;
}

function getState(): DemoStoreState {
  if (!globalThis.__pharmaopsDemoState) {
    globalThis.__pharmaopsDemoState = seededState();
  }
  return globalThis.__pharmaopsDemoState;
}

function setState(updater: (state: DemoStoreState) => DemoStoreState): void {
  globalThis.__pharmaopsDemoState = updater(getState());
}

/* --------------------------------- Public API ----------------------------- */

export function getDemoState(): DemoStoreState {
  return getState();
}

export function loadDemoData(): DemoStoreState {
  globalThis.__pharmaopsDemoState = seededState();
  return globalThis.__pharmaopsDemoState;
}

export function clearDemoData(): DemoStoreState {
  globalThis.__pharmaopsDemoState = emptyState();
  return globalThis.__pharmaopsDemoState;
}

/** Append a single import batch (used by the imports center). */
export function appendImportBatch(batch: ImportBatch, rows: ImportRow[]): void {
  setState((s) => ({
    ...s,
    importBatches: [batch, ...s.importBatches],
    importRows: [...s.importRows, ...rows],
    auditLogs: [
      {
        id: `aud-${Date.now()}`,
        workspaceId: s.pharmacy.id,
        userId: s.user.id,
        action: `import.${batch.status}`,
        entityType: "import_batch",
        entityId: batch.id,
        metadata: {
          rowCount: batch.rowCount,
          importType: batch.importType,
        },
        createdAt: batch.createdAt,
      },
      ...s.auditLogs,
    ],
  }));
}

/** Bulk insert helper used by import confirm flow to apply normalized data. */
export function applyNormalizedImport(payload: {
  purchaseInvoices?: PurchaseInvoice[];
  purchaseInvoiceLines?: PurchaseInvoiceLine[];
  salesSummaries?: SalesSummary[];
  stockSnapshots?: StockSnapshot[];
  suppliers?: Supplier[];
  expenses?: Expense[];
  accountingMovements?: AccountingMovement[];
}): void {
  setState((s) => ({
    ...s,
    purchaseInvoices: [
      ...(payload.purchaseInvoices ?? []),
      ...s.purchaseInvoices,
    ],
    purchaseInvoiceLines: [
      ...(payload.purchaseInvoiceLines ?? []),
      ...s.purchaseInvoiceLines,
    ],
    salesSummaries: [
      ...(payload.salesSummaries ?? []),
      ...s.salesSummaries,
    ],
    stockSnapshots: [
      ...(payload.stockSnapshots ?? []),
      ...s.stockSnapshots,
    ],
    suppliers: dedupeBy(
      [...(payload.suppliers ?? []), ...s.suppliers],
      (sup) => sup.name.toLowerCase()
    ),
    expenses: [...(payload.expenses ?? []), ...s.expenses],
    accountingMovements: [
      ...(payload.accountingMovements ?? []),
      ...s.accountingMovements,
    ],
  }));
}

/** Append a generated report's metadata to the store. */
export function appendReport(report: Report): void {
  setState((s) => ({
    ...s,
    reports: [report, ...s.reports],
    auditLogs: [
      {
        id: `aud-${Date.now()}`,
        workspaceId: s.pharmacy.id,
        userId: s.user.id,
        action: "report.generated",
        entityType: "report",
        entityId: report.id,
        metadata: {
          reportType: report.reportType,
          format: report.format,
        },
        createdAt: report.createdAt,
      },
      ...s.auditLogs,
    ],
  }));
}

/** Insert / update a task. */
export function upsertTask(task: Task): void {
  setState((s) => {
    const existing = s.tasks.findIndex((t) => t.id === task.id);
    if (existing === -1) return { ...s, tasks: [task, ...s.tasks] };
    const next = [...s.tasks];
    next[existing] = task;
    return { ...s, tasks: next };
  });
}

/** Insert / update a supplier. */
export function upsertSupplier(supplier: Supplier): void {
  setState((s) => {
    const existing = s.suppliers.findIndex((sup) => sup.id === supplier.id);
    if (existing === -1)
      return { ...s, suppliers: [supplier, ...s.suppliers] };
    const next = [...s.suppliers];
    next[existing] = supplier;
    return { ...s, suppliers: next };
  });
}

/** Insert an expense. */
export function appendExpense(expense: Expense): void {
  setState((s) => ({ ...s, expenses: [expense, ...s.expenses] }));
}

/** Insert a new document record (only metadata — no file blob is stored). */
export function appendDocument(document: DocumentRecord): void {
  setState((s) => ({
    ...s,
    documents: [document, ...s.documents],
    auditLogs: [
      {
        id: `aud-${Date.now()}`,
        workspaceId: s.pharmacy.id,
        userId: s.user.id,
        action: "document.uploaded",
        entityType: "document",
        entityId: document.id,
        metadata: {
          type: document.type,
          source: document.source,
          fileName: document.fileName,
        },
        createdAt: document.createdAt,
      },
      ...s.auditLogs,
    ],
  }));
}

/** Update a document's status. */
export function updateDocumentStatus(
  id: DocumentRecord["id"],
  status: DocumentRecord["status"]
): void {
  setState((s) => {
    const idx = s.documents.findIndex((d) => d.id === id);
    if (idx === -1) return s;
    const next = [...s.documents];
    next[idx] = { ...next[idx]!, status };
    return { ...s, documents: next };
  });
}

/* --------------------- OCR extraction proposals --------------------------- */

/** Look up the extraction proposal for a given documentId, if any. */
export function getDocumentExtraction(
  documentId: string
): InvoiceExtractionProposal | null {
  const state = getState();
  return (
    state.documentExtractions.find((e) => e.documentId === documentId) ?? null
  );
}

/**
 * Save (insert or replace) an extraction proposal. There is at most one
 * proposal per document — a re-run replaces the previous one.
 */
export function saveDocumentExtraction(
  proposal: InvoiceExtractionProposal
): void {
  setState((s) => {
    const others = s.documentExtractions.filter(
      (e) => e.documentId !== proposal.documentId
    );
    return {
      ...s,
      documentExtractions: [proposal, ...others],
      auditLogs: [
        {
          id: `aud-${Date.now()}`,
          workspaceId: s.pharmacy.id,
          userId: s.user.id,
          action: "document.extraction.saved",
          entityType: "document",
          entityId: proposal.documentId,
          metadata: {
            provider: proposal.provider,
            status: proposal.status,
            warnings: proposal.warnings.length,
          },
          createdAt: proposal.extractedAt,
        },
        ...s.auditLogs,
      ],
    };
  });
}

/* ----------------------------- Delivery notes ----------------------------- */

/** Append a delivery note. Used by the manual "Registrar albarán" flow. */
export function appendDeliveryNote(
  note: DeliveryNote,
  lines: DeliveryNoteLine[] = []
): void {
  setState((s) => ({
    ...s,
    deliveryNotes: [note, ...s.deliveryNotes],
    deliveryNoteLines: [...lines, ...s.deliveryNoteLines],
    auditLogs: [
      {
        id: `aud-${Date.now()}`,
        workspaceId: s.pharmacy.id,
        userId: s.user.id,
        action: "delivery_note.registered",
        entityType: "delivery_note",
        entityId: note.id,
        metadata: {
          supplierName: note.supplierName,
          deliveryNoteNumber: note.deliveryNoteNumber,
          status: note.status,
        },
        createdAt: note.registeredAt,
      },
      ...s.auditLogs,
    ],
  }));
}

/** Update only the workflow status of an existing delivery note. */
export function updateDeliveryNoteStatus(
  id: DeliveryNote["id"],
  status: DeliveryNoteStatus
): void {
  setState((s) => {
    const idx = s.deliveryNotes.findIndex((n) => n.id === id);
    if (idx === -1) return s;
    const next = [...s.deliveryNotes];
    next[idx] = { ...next[idx]!, status };
    return { ...s, deliveryNotes: next };
  });
}

/** Update only the status of an existing proposal. */
export function updateDocumentExtractionStatus(
  documentId: string,
  status: ExtractionStatus
): void {
  setState((s) => {
    const idx = s.documentExtractions.findIndex(
      (e) => e.documentId === documentId
    );
    if (idx === -1) return s;
    const next = [...s.documentExtractions];
    next[idx] = { ...next[idx]!, status };
    return { ...s, documentExtractions: next };
  });
}

function dedupeBy<T>(items: T[], keyOf: (item: T) => string): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of items) {
    const key = keyOf(item);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}
