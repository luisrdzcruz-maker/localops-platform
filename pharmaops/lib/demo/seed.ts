/**
 * Demo data seed generator.
 *
 * Produces a deterministic, realistic dataset for a single Spanish pharmacy.
 * No patient-level data, no prescription identifiers — only operational and
 * business numbers a pharmacy owner would want to analyse.
 *
 * Counts (per master prompt):
 *   - 12 months × 7 families = 84 sales summary rows
 *   - 30 purchase invoices
 *   - ~120 purchase invoice lines
 *   - 80 stock rows
 *   - 20 expenses
 *   - 8 tasks
 *   - 5 report metadata rows
 */

import { addDays, addMonths, format, startOfMonth, subDays } from "date-fns";
import { createRng } from "./rng";
import { DEMO_PHARMACY, DEMO_USER } from "./session";
import type {
  AccountingCategory,
  Expense,
  PurchaseInvoice,
  PurchaseInvoiceLine,
  VatRate,
} from "@/types/finance";
import type {
  PaymentMethod,
  ProductFamily,
  SalesSummary,
  StockSnapshot,
  Supplier,
} from "@/types/pharmacy";
import type { ImportBatch } from "@/types/imports";
import type { Report } from "@/types/reports";
import type { Task } from "@/types/tasks";
import type { AuditLogEntry } from "@/types/localops";
import type { DocumentRecord } from "@/types/documents";

const SEED = 19891204;

/**
 * Fictional Spanish-style pharmacy suppliers used by the demo dataset.
 *
 * IMPORTANT: do not replace these with real company names, real tax IDs,
 * real emails or real phone numbers. The demo must remain unambiguously
 * fictional so screenshots / videos cannot be mistaken for real partners.
 * Tax IDs use the reserved-for-testing prefix "B0000…", phone numbers use
 * the documentation reserve range +34 9XX 00 XX XX, emails use the .test
 * TLD (RFC 2606) which is permanently unassignable.
 */
const DEMO_SUPPLIERS: Array<Pick<Supplier, "name" | "taxId" | "email" | "phone" | "contactPerson" | "paymentTermsDays" | "preferred" | "notes" | "status">> = [
  {
    name: "Cooperativa Farmacéutica Demo",
    taxId: "B00000001",
    email: "atencion@coopfarma.demo.test",
    phone: "+34 900 00 00 01",
    contactPerson: "Comercial Centro",
    paymentTermsDays: 30,
    preferred: true,
    notes: "Cooperativa ficticia: distribuidor principal de medicamento.",
    status: "active",
  },
  {
    name: "Distribuidor Sanitario Demo",
    taxId: "B00000002",
    email: "comercial@distrisanitario.demo.test",
    phone: "+34 900 00 00 02",
    contactPerson: "Cuenta Demo",
    paymentTermsDays: 30,
    preferred: false,
    notes: "Distribuidor ficticio: refuerzo en medicamento y parafarmacia.",
    status: "active",
  },
  {
    name: "Dermocosmética Norte Demo",
    taxId: "B00000003",
    email: "pedidos@dermonorte.demo.test",
    phone: "+34 900 00 00 03",
    contactPerson: "Asesora demo",
    paymentTermsDays: 45,
    preferred: false,
    notes: "Proveedor ficticio: dermocosmética con promociones estacionales.",
    status: "active",
  },
  {
    name: "Parafarmacia Global Demo",
    taxId: "B00000004",
    email: "info@parafarmaciaglobal.demo.test",
    phone: "+34 900 00 00 04",
    contactPerson: null,
    paymentTermsDays: 30,
    preferred: false,
    notes: "Proveedor ficticio: parafarmacia, infantil y ortopedia.",
    status: "active",
  },
  {
    name: "Suministros Farmacia Demo",
    taxId: "B00000005",
    email: "ventas@suministrosfarmacia.demo.test",
    phone: "+34 900 00 00 05",
    contactPerson: "Visitador demo",
    paymentTermsDays: 60,
    preferred: false,
    notes: "Proveedor ficticio: línea de medicamentos genéricos.",
    status: "active",
  },
  {
    name: "Genérico Pharma Demo",
    taxId: "B00000006",
    email: "atencion@genericopharma.demo.test",
    phone: "+34 900 00 00 06",
    contactPerson: null,
    paymentTermsDays: 30,
    preferred: false,
    notes: "Proveedor ficticio: surtido general de medicamento.",
    status: "active",
  },
];

interface DemoProduct {
  productCode: string;
  cnCode: string;
  name: string;
  family: ProductFamily;
  unitCost: number;
  pvp: number;
}

const DEMO_PRODUCTS: DemoProduct[] = [
  // medicamentos
  { productCode: "PARA500", cnCode: "651234", name: "Paracetamol 500 mg 20 comp", family: "medicamentos", unitCost: 1.6, pvp: 2.4 },
  { productCode: "IBUP400", cnCode: "651235", name: "Ibuprofeno 400 mg 30 comp", family: "medicamentos", unitCost: 1.9, pvp: 2.9 },
  { productCode: "AMOX500", cnCode: "651236", name: "Amoxicilina 500 mg 12 caps", family: "medicamentos", unitCost: 3.4, pvp: 5.1 },
  { productCode: "OMEP20", cnCode: "651237", name: "Omeprazol 20 mg 28 caps", family: "medicamentos", unitCost: 2.8, pvp: 4.3 },
  { productCode: "LORAT10", cnCode: "651238", name: "Loratadina 10 mg 30 comp", family: "medicamentos", unitCost: 2.2, pvp: 3.6 },
  // parafarmacia
  { productCode: "TER001", cnCode: "881001", name: "Termómetro digital", family: "parafarmacia", unitCost: 5.5, pvp: 9.95 },
  { productCode: "TENS001", cnCode: "881002", name: "Tensiómetro brazo", family: "parafarmacia", unitCost: 28, pvp: 49 },
  { productCode: "MASC001", cnCode: "881003", name: "Mascarilla quirúrgica 50 ud", family: "parafarmacia", unitCost: 4.2, pvp: 7.5 },
  // dermocosmética
  { productCode: "DERM001", cnCode: "991001", name: "Crema hidratante facial 50 ml", family: "dermocosmetica", unitCost: 9, pvp: 17.9 },
  { productCode: "DERM002", cnCode: "991002", name: "Protector solar SPF 50 200 ml", family: "dermocosmetica", unitCost: 11, pvp: 21.5 },
  { productCode: "DERM003", cnCode: "991003", name: "Champú anticaída 200 ml", family: "dermocosmetica", unitCost: 8.5, pvp: 16.9 },
  { productCode: "DERM004", cnCode: "991004", name: "Sérum vitamina C 30 ml", family: "dermocosmetica", unitCost: 14, pvp: 27.5 },
  // infantil
  { productCode: "INF001", cnCode: "771001", name: "Pañales talla 3 (paquete)", family: "infantil", unitCost: 6, pvp: 11 },
  { productCode: "INF002", cnCode: "771002", name: "Leche infantil 800 g", family: "infantil", unitCost: 14, pvp: 24.9 },
  { productCode: "INF003", cnCode: "771003", name: "Toallitas húmedas 80 ud", family: "infantil", unitCost: 1.8, pvp: 3.5 },
  // ortopedia
  { productCode: "ORT001", cnCode: "661001", name: "Muñequera elástica", family: "ortopedia", unitCost: 6.5, pvp: 13.5 },
  { productCode: "ORT002", cnCode: "661002", name: "Plantillas viscoelásticas", family: "ortopedia", unitCost: 9, pvp: 18.9 },
  // servicios
  { productCode: "SRV001", cnCode: "111001", name: "Tensión arterial - servicio", family: "servicios", unitCost: 0, pvp: 5 },
  { productCode: "SRV002", cnCode: "111002", name: "Glucosa capilar - servicio", family: "servicios", unitCost: 0.4, pvp: 6 },
  // otros
  { productCode: "OTR001", cnCode: "999001", name: "Bolsa farmacia", family: "otros", unitCost: 0.05, pvp: 0.15 },
];

const FAMILIES: ProductFamily[] = [
  "medicamentos",
  "parafarmacia",
  "dermocosmetica",
  "infantil",
  "ortopedia",
  "servicios",
  "otros",
];

const FAMILY_VAT: Record<ProductFamily, VatRate> = {
  medicamentos: 4,
  parafarmacia: 10,
  dermocosmetica: 21,
  infantil: 10,
  ortopedia: 10,
  servicios: 21,
  otros: 21,
};

const FAMILY_BASE_MONTHLY_REVENUE: Record<ProductFamily, number> = {
  medicamentos: 24000,
  parafarmacia: 6500,
  dermocosmetica: 5400,
  infantil: 3200,
  ortopedia: 1800,
  servicios: 900,
  otros: 600,
};

const FAMILY_MARGIN_RANGE: Record<ProductFamily, [number, number]> = {
  medicamentos: [0.21, 0.27],
  parafarmacia: [0.32, 0.4],
  dermocosmetica: [0.38, 0.48],
  infantil: [0.22, 0.32],
  ortopedia: [0.3, 0.42],
  servicios: [0.6, 0.85],
  otros: [0.25, 0.35],
};

const PAYMENT_METHODS: PaymentMethod[] = ["cash", "card", "transfer"];

const ACCOUNTING_CATEGORIES_FOR_EXPENSES: AccountingCategory[] = [
  "rent",
  "payroll",
  "utilities",
  "insurance",
  "professional_services",
  "software",
  "marketing",
  "financing",
  "taxes",
  "other",
];

function uuid(prefix: string, n: number): string {
  // Stable readable IDs for the demo. Not real UUIDs — fine for the in-memory
  // store, which never speaks to Postgres in demo mode.
  return `${prefix}-${n.toString().padStart(6, "0")}`;
}

function isoDate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

function isoTimestamp(date: Date): string {
  return date.toISOString();
}

interface SeedReferenceDate {
  /** "Today" for the demo. Defaults to a fixed point so output is deterministic. */
  today: Date;
}

export interface DemoSeedData {
  suppliers: Supplier[];
  purchaseInvoices: PurchaseInvoice[];
  purchaseInvoiceLines: PurchaseInvoiceLine[];
  salesSummaries: SalesSummary[];
  stockSnapshots: StockSnapshot[];
  expenses: Expense[];
  tasks: Task[];
  reports: Report[];
  importBatches: ImportBatch[];
  auditLogs: AuditLogEntry[];
  documents: DocumentRecord[];
}

export function generateDemoSeed(reference?: Partial<SeedReferenceDate>): DemoSeedData {
  // Use a fixed reference date so the demo is deterministic regardless of
  // when you reload the page.
  const today = reference?.today ?? new Date("2026-05-09T10:00:00.000Z");
  const rng = createRng(SEED);

  const suppliers = generateSuppliers(today);
  const importBatches = generateImportBatches(today, rng, suppliers);
  const { invoices: purchaseInvoices, ratesById } = generatePurchaseInvoices(
    today,
    rng,
    suppliers,
    importBatches
  );
  const purchaseInvoiceLines = generatePurchaseInvoiceLines(
    rng,
    purchaseInvoices,
    ratesById,
    importBatches
  );
  const salesSummaries = generateSalesSummaries(today, rng, importBatches);
  const stockSnapshots = generateStockSnapshots(today, rng, importBatches);
  const expenses = generateExpenses(today, rng);
  const tasks = generateTasks(today, suppliers);
  const reports = generateReports(today);
  const auditLogs = generateAuditLogs(today, importBatches, reports);
  const documents = generateDocuments(today, suppliers);

  return {
    suppliers,
    purchaseInvoices,
    purchaseInvoiceLines,
    salesSummaries,
    stockSnapshots,
    expenses,
    tasks,
    reports,
    importBatches,
    auditLogs,
    documents,
  };
}

function generateSuppliers(today: Date): Supplier[] {
  return DEMO_SUPPLIERS.map((s, i) => ({
    id: uuid("sup", i + 1),
    pharmacyId: DEMO_PHARMACY.id,
    name: s.name,
    taxId: s.taxId,
    email: s.email,
    phone: s.phone,
    contactPerson: s.contactPerson,
    paymentTermsDays: s.paymentTermsDays,
    notes: s.notes,
    status: s.status,
    preferred: s.preferred,
    createdAt: isoTimestamp(addMonths(today, -10)),
    updatedAt: isoTimestamp(addMonths(today, -1)),
  }));
}

function generateImportBatches(
  today: Date,
  rng: ReturnType<typeof createRng>,
  suppliers: Supplier[]
): ImportBatch[] {
  const batches: ImportBatch[] = [];

  // 1 large purchase invoice import 30 days ago
  batches.push({
    id: uuid("imp", 1),
    pharmacyId: DEMO_PHARMACY.id,
    userId: DEMO_USER.id,
    sourceSystem: "unycop",
    importType: "purchase_invoices",
    originalFilename: "unycop_facturas_compra_abril.xlsx",
    status: "confirmed",
    rowCount: 30,
    validRowCount: 30,
    errorRowCount: 0,
    warningRowCount: 0,
    mapping: {},
    metadata: { adapterId: "unycop", confidence: 0.92 },
    createdAt: isoTimestamp(subDays(today, 30)),
  });

  // 1 sales summary import 7 days ago
  batches.push({
    id: uuid("imp", 2),
    pharmacyId: DEMO_PHARMACY.id,
    userId: DEMO_USER.id,
    sourceSystem: "unycop",
    importType: "sales_summary",
    originalFilename: "unycop_ventas_diarias.xlsx",
    status: "confirmed",
    rowCount: 84,
    validRowCount: 84,
    errorRowCount: 0,
    warningRowCount: 0,
    mapping: {},
    metadata: { adapterId: "unycop", confidence: 0.88 },
    createdAt: isoTimestamp(subDays(today, 7)),
  });

  // 1 stock snapshot import 3 days ago
  batches.push({
    id: uuid("imp", 3),
    pharmacyId: DEMO_PHARMACY.id,
    userId: DEMO_USER.id,
    sourceSystem: "unycop",
    importType: "stock_snapshot",
    originalFilename: "unycop_stock_actual.xlsx",
    status: "confirmed",
    rowCount: 80,
    validRowCount: 78,
    errorRowCount: 0,
    warningRowCount: 2,
    mapping: {},
    metadata: { adapterId: "unycop", confidence: 0.85 },
    createdAt: isoTimestamp(subDays(today, 3)),
  });

  // 1 generic expenses import 2 days ago
  batches.push({
    id: uuid("imp", 4),
    pharmacyId: DEMO_PHARMACY.id,
    userId: DEMO_USER.id,
    sourceSystem: "generic",
    importType: "expenses",
    originalFilename: "gastos_marzo_abril.csv",
    status: "confirmed",
    rowCount: 20,
    validRowCount: 20,
    errorRowCount: 0,
    warningRowCount: 0,
    mapping: {},
    metadata: { adapterId: "generic" },
    createdAt: isoTimestamp(subDays(today, 2)),
  });

  // 1 failed-ish import yesterday — for "import health" KPI
  batches.push({
    id: uuid("imp", 5),
    pharmacyId: DEMO_PHARMACY.id,
    userId: DEMO_USER.id,
    sourceSystem: "farmatic",
    importType: "purchase_invoice_lines",
    originalFilename: "farmatic_lineas_factura_demo.xlsx",
    status: "validated",
    rowCount: 42,
    validRowCount: 36,
    errorRowCount: 4,
    warningRowCount: 2,
    mapping: {},
    metadata: { adapterId: "farmatic", confidence: 0.71 },
    createdAt: isoTimestamp(subDays(today, 1)),
  });

  void rng;
  void suppliers;
  return batches;
}

/**
 * Generate purchase invoices with coherent VAT.
 *
 * Rules baked in:
 *   - vatRate ∈ {4, 10, 21} weighted by realistic pharmacy supplier mix.
 *   - vat = round2(net × rate / 100)
 *   - gross = round2(net + vat)
 *   - The chosen rate is returned in `ratesById` so the lines step picks
 *     compatible product families and keeps line.vatRate in sync with the
 *     invoice. This is what fixes the "VAT > base" demo data bug.
 */
interface PurchaseInvoiceGenResult {
  invoices: PurchaseInvoice[];
  ratesById: Map<string, VatRate>;
}

function generatePurchaseInvoices(
  today: Date,
  rng: ReturnType<typeof createRng>,
  suppliers: Supplier[],
  batches: ImportBatch[]
): PurchaseInvoiceGenResult {
  const invoices: PurchaseInvoice[] = [];
  const ratesById = new Map<string, VatRate>();
  const supplierWeights: Array<readonly [Supplier, number]> = [
    [suppliers[0]!, 6], // Dominant cooperativa
    [suppliers[1]!, 3],
    [suppliers[2]!, 3],
    [suppliers[3]!, 2],
    [suppliers[4]!, 1.5],
    [suppliers[5]!, 1],
  ];
  const importBatch = batches.find((b) => b.importType === "purchase_invoices");

  for (let i = 0; i < 30; i++) {
    const supplier = rng.weighted(supplierWeights);
    const invoiceDate = subDays(today, rng.int(2, 90));
    const dueDate = addDays(invoiceDate, supplier.paymentTermsDays ?? 30);
    const net = Math.round(rng.float(380, 5400) * 100) / 100;
    const vatRate = rng.weighted([
      [4, 5],
      [10, 3],
      [21, 2],
    ] as const);
    const vat = Math.round((net * vatRate) / 100 * 100) / 100;
    const gross = Math.round((net + vat) * 100) / 100;
    const overdue = dueDate < today;
    const paymentStatus: PurchaseInvoice["paymentStatus"] = overdue
      ? rng.weighted([
          ["paid", 7],
          ["overdue", 2],
          ["pending", 1],
        ] as const)
      : rng.weighted([
          ["pending", 5],
          ["partial", 1],
          ["paid", 4],
        ] as const);

    const id = uuid("pi", i + 1);
    invoices.push({
      id,
      pharmacyId: DEMO_PHARMACY.id,
      supplierId: supplier.id,
      importBatchId: importBatch?.id ?? null,
      invoiceNumber: `${supplier.name.slice(0, 3).toUpperCase()}-${format(
        invoiceDate,
        "yyyyMMdd"
      )}-${(i + 1).toString().padStart(3, "0")}`,
      supplierName: supplier.name,
      supplierTaxId: supplier.taxId,
      invoiceDate: isoDate(invoiceDate),
      dueDate: isoDate(dueDate),
      netAmount: net,
      vatAmount: vat,
      grossAmount: gross,
      paymentStatus,
      category: "purchases",
      notes: null,
      createdAt: isoTimestamp(invoiceDate),
      updatedAt: isoTimestamp(invoiceDate),
    });
    ratesById.set(id, vatRate as VatRate);
  }
  invoices.sort((a, b) => (a.invoiceDate < b.invoiceDate ? 1 : -1));
  return { invoices, ratesById };
}

/**
 * Generate purchase invoice lines that:
 *   - Use only products whose family matches the invoice's VAT rate, so
 *     line.vatRate is always consistent with the invoice's vatRate.
 *   - Sum to exactly invoice.netAmount (proportional scaling, last-line
 *     absorbs the rounding remainder), so totals tie out cleanly.
 *   - Never mutate invoice.netAmount / vatAmount / grossAmount — the
 *     invoice is authoritative and stays VAT-coherent.
 */
function generatePurchaseInvoiceLines(
  rng: ReturnType<typeof createRng>,
  invoices: PurchaseInvoice[],
  ratesById: Map<string, VatRate>,
  batches: ImportBatch[]
): PurchaseInvoiceLine[] {
  const lines: PurchaseInvoiceLine[] = [];
  const importBatch = batches.find((b) => b.importType === "purchase_invoices");
  const productsByRate: Record<VatRate, DemoProduct[]> = {
    0: [],
    4: [],
    10: [],
    21: [],
  };
  for (const p of DEMO_PRODUCTS) {
    productsByRate[FAMILY_VAT[p.family]].push(p);
  }

  let counter = 0;
  for (const invoice of invoices) {
    const rate = ratesById.get(invoice.id) ?? 21;
    const compatibleProducts =
      productsByRate[rate].length > 0
        ? productsByRate[rate]
        : DEMO_PRODUCTS;

    const lineCount = rng.int(2, 6);
    interface RawLine {
      product: DemoProduct;
      quantity: number;
      unitCost: number;
      rawTotal: number;
    }
    const raw: RawLine[] = [];
    let rawSum = 0;
    for (let i = 0; i < lineCount; i++) {
      const product = rng.pick(compatibleProducts);
      const quantity = rng.int(2, 30);
      const unitCost = product.unitCost * rng.float(0.95, 1.08);
      const rawTotal = quantity * unitCost;
      rawSum += rawTotal;
      raw.push({ product, quantity, unitCost, rawTotal });
    }

    const scale = rawSum > 0 ? invoice.netAmount / rawSum : 0;
    let allocated = 0;
    for (let i = 0; i < raw.length; i++) {
      const r = raw[i]!;
      const isLast = i === raw.length - 1;
      // Last line absorbs the rounding remainder so the lines sum exactly
      // matches invoice.netAmount.
      const totalCost = isLast
        ? Math.round((invoice.netAmount - allocated) * 100) / 100
        : Math.round(r.rawTotal * scale * 100) / 100;
      allocated += totalCost;
      const unitCost = r.quantity > 0 ? totalCost / r.quantity : 0;
      lines.push({
        id: uuid("pil", ++counter),
        pharmacyId: DEMO_PHARMACY.id,
        purchaseInvoiceId: invoice.id,
        importBatchId: importBatch?.id ?? null,
        invoiceNumber: invoice.invoiceNumber,
        productCode: r.product.productCode,
        cnCode: r.product.cnCode,
        productName: r.product.name,
        family: r.product.family,
        quantity: r.quantity,
        unitCost: Math.round(unitCost * 10000) / 10000,
        vatRate: rate,
        discount: 0,
        totalCost,
        createdAt: invoice.createdAt,
      });
    }
  }
  return lines;
}

function generateSalesSummaries(
  today: Date,
  rng: ReturnType<typeof createRng>,
  batches: ImportBatch[]
): SalesSummary[] {
  const summaries: SalesSummary[] = [];
  const importBatch = batches.find((b) => b.importType === "sales_summary");
  let counter = 0;

  // Days elapsed in the current month — used to scale the latest bucket so
  // it reflects only the partial month, matching how purchase invoices are
  // distributed (today-2 .. today-90).
  const daysInCurrentMonth = new Date(
    Date.UTC(today.getUTCFullYear(), today.getUTCMonth() + 1, 0)
  ).getUTCDate();
  const partialFactor = Math.max(
    0.05,
    today.getUTCDate() / daysInCurrentMonth
  );

  for (let monthOffset = 11; monthOffset >= 0; monthOffset--) {
    const monthDate = startOfMonth(addMonths(today, -monthOffset));
    // Slight upward seasonal trend
    const trend = 1 + (11 - monthOffset) * 0.01;
    const isCurrentMonth = monthOffset === 0;
    const partialScale = isCurrentMonth ? partialFactor : 1;
    for (const family of FAMILIES) {
      const base = FAMILY_BASE_MONTHLY_REVENUE[family];
      const noise = rng.float(0.85, 1.15);
      const grossMonthly =
        Math.round(base * trend * noise * partialScale * 100) / 100;
      const vatRate = FAMILY_VAT[family];
      const vatAmount =
        Math.round((grossMonthly * vatRate) / (100 + vatRate) * 100) / 100;
      const netSales = Math.round((grossMonthly - vatAmount) * 100) / 100;
      const [marginLow, marginHigh] = FAMILY_MARGIN_RANGE[family];
      const marginPercent = rng.float(marginLow, marginHigh);
      const marginAmount = Math.round(netSales * marginPercent * 100) / 100;

      summaries.push({
        id: uuid("sales", ++counter),
        pharmacyId: DEMO_PHARMACY.id,
        importBatchId: importBatch?.id ?? null,
        date: isoDate(monthDate),
        family,
        grossSales: grossMonthly,
        netSales,
        vatAmount,
        units: Math.round(grossMonthly / rng.float(8, 22)),
        paymentMethod: rng.pick(PAYMENT_METHODS),
        marginAmount,
        marginPercent: Math.round(marginPercent * 10000) / 10000,
        createdAt: isoTimestamp(monthDate),
      });
    }
  }
  return summaries;
}

function generateStockSnapshots(
  today: Date,
  rng: ReturnType<typeof createRng>,
  batches: ImportBatch[]
): StockSnapshot[] {
  const snapshots: StockSnapshot[] = [];
  const importBatch = batches.find((b) => b.importType === "stock_snapshot");
  const snapshotDate = subDays(today, 3);

  // 80 rows: ensure all DEMO_PRODUCTS appear, plus extras with variations.
  let counter = 0;
  for (let i = 0; i < 80; i++) {
    const product = DEMO_PRODUCTS[i % DEMO_PRODUCTS.length]!;
    const variance = i >= DEMO_PRODUCTS.length ? rng.float(0.4, 1.2) : 1;
    const quantity = Math.round(rng.float(0, 60) * variance);
    const reorderPoint = rng.int(5, 20);
    // Some near-expiry items for the stock-risk KPI.
    const expiryRoll = rng.next();
    const expiry =
      expiryRoll < 0.08
        ? addDays(today, rng.int(15, 60)) // near expiry
        : expiryRoll < 0.7
        ? addDays(today, rng.int(180, 540))
        : null;

    snapshots.push({
      id: uuid("stk", ++counter),
      pharmacyId: DEMO_PHARMACY.id,
      importBatchId: importBatch?.id ?? null,
      snapshotDate: isoDate(snapshotDate),
      productCode: product.productCode,
      cnCode: product.cnCode,
      productName: product.name,
      family: product.family,
      quantityOnHand: quantity,
      unitCost: Math.round(product.unitCost * 10000) / 10000,
      pvp: Math.round(product.pvp * 100) / 100,
      expiryDate: expiry ? isoDate(expiry) : null,
      supplierName: rng.pick(DEMO_SUPPLIERS).name,
      reorderPoint,
      createdAt: isoTimestamp(snapshotDate),
    });
  }
  return snapshots;
}

function generateExpenses(
  today: Date,
  rng: ReturnType<typeof createRng>
): Expense[] {
  const expenses: Expense[] = [];
  // Fictional vendors only — do not introduce real Spanish company names
  // here. Mirrors the rule applied to DEMO_SUPPLIERS at the top of the file.
  const recurring: Array<Pick<Expense, "vendor" | "category" | "description"> & {
    base: number;
  }> = [
    { vendor: "Inmobiliaria Demo SL", category: "rent", description: "Alquiler local", base: 1450 },
    { vendor: "Gestoría Demo", category: "professional_services", description: "Asesoría mensual", base: 280 },
    { vendor: "Suministros Eléctricos Demo", category: "utilities", description: "Suministro eléctrico", base: 320 },
    { vendor: "Telecom Empresas Demo", category: "utilities", description: "Telefonía + internet", base: 95 },
    { vendor: "Aseguradora Demo", category: "insurance", description: "Seguro responsabilidad civil", base: 110 },
    { vendor: "Software Farmacia Demo", category: "software", description: "Licencia mensual", base: 175 },
  ];

  // Recurring monthly for 3 months
  let counter = 0;
  for (let monthOffset = 2; monthOffset >= 0; monthOffset--) {
    const date = addDays(addMonths(today, -monthOffset), 5);
    for (const r of recurring) {
      const net = Math.round(r.base * rng.float(0.97, 1.03) * 100) / 100;
      const vat = Math.round(net * 0.21 * 100) / 100;
      expenses.push({
        id: uuid("exp", ++counter),
        pharmacyId: DEMO_PHARMACY.id,
        date: isoDate(date),
        vendor: r.vendor,
        category: r.category,
        description: r.description,
        netAmount: net,
        vatAmount: vat,
        grossAmount: Math.round((net + vat) * 100) / 100,
        paymentMethod: "transfer",
        paymentStatus: "paid",
        attachmentUrl: null,
        notes: null,
        createdAt: isoTimestamp(date),
        updatedAt: isoTimestamp(date),
      });
      if (counter >= 18) break;
    }
    if (counter >= 18) break;
  }
  // Two extra ad-hoc expenses for variety
  const adHoc: Array<Omit<Expense, "id" | "pharmacyId" | "createdAt" | "updatedAt">> = [
    {
      date: isoDate(subDays(today, 12)),
      vendor: "Marketing Farmacia Demo",
      category: "marketing",
      description: "Campaña dermocosmética primavera",
      netAmount: 480,
      vatAmount: 100.8,
      grossAmount: 580.8,
      paymentMethod: "card",
      paymentStatus: "paid",
      attachmentUrl: null,
      notes: null,
    },
    {
      date: isoDate(subDays(today, 4)),
      vendor: "Mantenimiento Demo SL",
      category: "other",
      description: "Reparación climatización",
      netAmount: 240,
      vatAmount: 50.4,
      grossAmount: 290.4,
      paymentMethod: "transfer",
      paymentStatus: "pending",
      attachmentUrl: null,
      notes: "Esperando factura definitiva",
    },
  ];
  for (const ah of adHoc) {
    expenses.push({
      id: uuid("exp", ++counter),
      pharmacyId: DEMO_PHARMACY.id,
      ...ah,
      createdAt: isoTimestamp(new Date(ah.date)),
      updatedAt: isoTimestamp(new Date(ah.date)),
    });
  }
  void ACCOUNTING_CATEGORIES_FOR_EXPENSES;
  return expenses.sort((a, b) => (a.date < b.date ? 1 : -1));
}

function generateTasks(today: Date, suppliers: Supplier[]): Task[] {
  const tasks: Task[] = [
    {
      id: uuid("tsk", 1),
      pharmacyId: DEMO_PHARMACY.id,
      title: `Revisar facturas pendientes de ${suppliers[0]!.name}`,
      description: "Confirmar pago antes de fin de mes para evitar recargos.",
      category: "supplier_payment",
      priority: "high",
      status: "open",
      dueDate: isoDate(addDays(today, 3)),
      assignedTo: null,
      relatedEntityType: "supplier",
      relatedEntityId: suppliers[0]!.id,
      autoSuggested: true,
      createdAt: isoTimestamp(subDays(today, 1)),
      updatedAt: isoTimestamp(subDays(today, 1)),
    },
    {
      id: uuid("tsk", 2),
      pharmacyId: DEMO_PHARMACY.id,
      title: "Preparar paquete mensual para gestoría",
      description: "Generar PDF de gestión + Excel de gastos del mes.",
      category: "accountant",
      priority: "normal",
      status: "open",
      dueDate: isoDate(addDays(today, 5)),
      assignedTo: null,
      relatedEntityType: null,
      relatedEntityId: null,
      autoSuggested: true,
      createdAt: isoTimestamp(today),
      updatedAt: isoTimestamp(today),
    },
    {
      id: uuid("tsk", 3),
      pharmacyId: DEMO_PHARMACY.id,
      title: "Revisar productos próximos a caducar",
      description:
        "Hay 6 referencias con caducidad en menos de 60 días según el último inventario.",
      category: "stock_review",
      priority: "high",
      status: "open",
      dueDate: isoDate(addDays(today, 2)),
      assignedTo: null,
      relatedEntityType: null,
      relatedEntityId: null,
      autoSuggested: true,
      createdAt: isoTimestamp(today),
      updatedAt: isoTimestamp(today),
    },
    {
      id: uuid("tsk", 4),
      pharmacyId: DEMO_PHARMACY.id,
      title: "Validar importación Farmatic con errores",
      description: "4 filas con errores y 2 con avisos en el último import.",
      category: "import",
      priority: "urgent",
      status: "in_progress",
      dueDate: isoDate(today),
      assignedTo: null,
      relatedEntityType: "import_batch",
      relatedEntityId: uuid("imp", 5),
      autoSuggested: true,
      createdAt: isoTimestamp(subDays(today, 1)),
      updatedAt: isoTimestamp(today),
    },
    {
      id: uuid("tsk", 5),
      pharmacyId: DEMO_PHARMACY.id,
      title: "Actualizar plantilla de mapeo Unycop",
      description: "Aplicar el nuevo mapping con la columna 'PVL' renombrada.",
      category: "import",
      priority: "low",
      status: "open",
      dueDate: isoDate(addDays(today, 14)),
      assignedTo: null,
      relatedEntityType: null,
      relatedEntityId: null,
      autoSuggested: false,
      createdAt: isoTimestamp(subDays(today, 4)),
      updatedAt: isoTimestamp(subDays(today, 4)),
    },
    {
      id: uuid("tsk", 6),
      pharmacyId: DEMO_PHARMACY.id,
      title: `Negociar condiciones con ${suppliers[2]!.name}`,
      description: "Renegociar plazo de pago a 60 días.",
      category: "supplier_payment",
      priority: "normal",
      status: "open",
      dueDate: isoDate(addDays(today, 21)),
      assignedTo: null,
      relatedEntityType: "supplier",
      relatedEntityId: suppliers[2]!.id,
      autoSuggested: false,
      createdAt: isoTimestamp(subDays(today, 6)),
      updatedAt: isoTimestamp(subDays(today, 6)),
    },
    {
      id: uuid("tsk", 7),
      pharmacyId: DEMO_PHARMACY.id,
      title: "Revisar campaña dermocosmética abril",
      description: "Comparar margen contra previsión de campaña.",
      category: "general",
      priority: "low",
      status: "done",
      dueDate: isoDate(subDays(today, 5)),
      assignedTo: null,
      relatedEntityType: null,
      relatedEntityId: null,
      autoSuggested: false,
      createdAt: isoTimestamp(subDays(today, 14)),
      updatedAt: isoTimestamp(subDays(today, 5)),
    },
    {
      id: uuid("tsk", 8),
      pharmacyId: DEMO_PHARMACY.id,
      title: "Documentar política de privacidad de importaciones",
      description:
        "Anotar columnas sensibles que el equipo debe excluir por defecto.",
      category: "compliance",
      priority: "normal",
      status: "open",
      dueDate: isoDate(addDays(today, 30)),
      assignedTo: null,
      relatedEntityType: null,
      relatedEntityId: null,
      autoSuggested: false,
      createdAt: isoTimestamp(subDays(today, 9)),
      updatedAt: isoTimestamp(subDays(today, 9)),
    },
  ];
  return tasks;
}

function generateReports(today: Date): Report[] {
  return [
    {
      id: uuid("rep", 1),
      pharmacyId: DEMO_PHARMACY.id,
      userId: DEMO_USER.id,
      reportType: "monthly_management",
      periodStart: isoDate(startOfMonth(addMonths(today, -1))),
      periodEnd: isoDate(subDays(startOfMonth(today), 1)),
      format: "pdf",
      status: "ready",
      filename: "informe-gestion-abril-2026.pdf",
      metadata: { kpis: { revenue: 41200, purchases: 28900 } },
      createdAt: isoTimestamp(subDays(today, 6)),
    },
    {
      id: uuid("rep", 2),
      pharmacyId: DEMO_PHARMACY.id,
      userId: DEMO_USER.id,
      reportType: "supplier_spend",
      periodStart: isoDate(startOfMonth(addMonths(today, -2))),
      periodEnd: isoDate(subDays(startOfMonth(today), 1)),
      format: "xlsx",
      status: "ready",
      filename: "gasto-proveedores-marzo-abril-2026.xlsx",
      metadata: {},
      createdAt: isoTimestamp(subDays(today, 5)),
    },
    {
      id: uuid("rep", 3),
      pharmacyId: DEMO_PHARMACY.id,
      userId: DEMO_USER.id,
      reportType: "vat_summary",
      periodStart: isoDate(startOfMonth(addMonths(today, -3))),
      periodEnd: isoDate(subDays(startOfMonth(today), 1)),
      format: "pdf",
      status: "ready",
      filename: "iva-estimado-q1-2026.pdf",
      metadata: {},
      createdAt: isoTimestamp(subDays(today, 14)),
    },
    {
      id: uuid("rep", 4),
      pharmacyId: DEMO_PHARMACY.id,
      userId: DEMO_USER.id,
      reportType: "stock_risk",
      periodStart: isoDate(subDays(today, 3)),
      periodEnd: isoDate(subDays(today, 3)),
      format: "csv",
      status: "ready",
      filename: "riesgo-stock-mayo-2026.csv",
      metadata: {},
      createdAt: isoTimestamp(subDays(today, 3)),
    },
    {
      id: uuid("rep", 5),
      pharmacyId: DEMO_PHARMACY.id,
      userId: DEMO_USER.id,
      reportType: "accountant_pack",
      periodStart: isoDate(startOfMonth(addMonths(today, -1))),
      periodEnd: isoDate(subDays(startOfMonth(today), 1)),
      format: "xlsx",
      status: "ready",
      filename: "paquete-gestoria-abril-2026.xlsx",
      metadata: {},
      createdAt: isoTimestamp(subDays(today, 4)),
    },
  ];
}

function generateAuditLogs(
  today: Date,
  batches: ImportBatch[],
  reports: Report[]
): AuditLogEntry[] {
  const entries: AuditLogEntry[] = [];
  let counter = 0;
  for (const batch of batches) {
    entries.push({
      id: uuid("aud", ++counter),
      workspaceId: DEMO_PHARMACY.id,
      userId: DEMO_USER.id,
      action: `import.${batch.status}`,
      entityType: "import_batch",
      entityId: batch.id,
      metadata: { rowCount: batch.rowCount, importType: batch.importType },
      createdAt: batch.createdAt,
    });
  }
  for (const report of reports) {
    entries.push({
      id: uuid("aud", ++counter),
      workspaceId: DEMO_PHARMACY.id,
      userId: DEMO_USER.id,
      action: "report.generated",
      entityType: "report",
      entityId: report.id,
      metadata: { reportType: report.reportType, format: report.format },
      createdAt: report.createdAt,
    });
  }
  void today;
  return entries.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

/* --------------------------------- Documents ----------------------------- */

/**
 * Demo documents — a small fixed list so the Documentos page never feels
 * empty. No real files; only metadata. The "demo_seed" source flags these
 * as preloaded so a real upload on top of them stands out.
 */
function generateDocuments(today: Date, suppliers: Supplier[]): DocumentRecord[] {
  const list: Array<Omit<DocumentRecord, "id" | "pharmacyId" | "createdAt">> = [
    {
      date: isoDate(subDays(today, 1)),
      type: "factura_proveedor",
      supplierName: suppliers[0]!.name,
      category: "Compras",
      status: "pendiente_revisar",
      estimatedAmount: 1245.5,
      source: "demo_seed",
      fileName: "factura-cooperativa-202604-001.pdf",
      fileSize: 184_320,
      mimeType: "application/pdf",
      notes: null,
    },
    {
      date: isoDate(subDays(today, 2)),
      type: "factura_proveedor",
      supplierName: suppliers[1]!.name,
      category: "Compras",
      status: "revisado",
      estimatedAmount: 532.4,
      source: "demo_seed",
      fileName: "factura-distribuidor-202604-003.pdf",
      fileSize: 142_080,
      mimeType: "application/pdf",
      notes: "Cuadrar con albarán adjunto.",
    },
    {
      date: isoDate(subDays(today, 3)),
      type: "albaran",
      supplierName: suppliers[1]!.name,
      category: "Compras",
      status: "asociado_gasto",
      estimatedAmount: null,
      source: "demo_seed",
      fileName: "albaran-distribuidor-202604.pdf",
      fileSize: 98_240,
      mimeType: "application/pdf",
      notes: null,
    },
    {
      date: isoDate(subDays(today, 5)),
      type: "ticket_gasto",
      supplierName: "Suministros Eléctricos Demo",
      category: "Suministros",
      status: "pendiente_revisar",
      estimatedAmount: 32.15,
      source: "demo_seed",
      fileName: "ticket-suministros-202605-05.jpg",
      fileSize: 412_672,
      mimeType: "image/jpeg",
      notes: null,
    },
    {
      date: isoDate(subDays(today, 7)),
      type: "factura_proveedor",
      supplierName: suppliers[2]!.name,
      category: "Compras",
      status: "listo_gestoria",
      estimatedAmount: 1140.8,
      source: "demo_seed",
      fileName: "factura-dermo-202604-014.pdf",
      fileSize: 156_672,
      mimeType: "application/pdf",
      notes: null,
    },
    {
      date: isoDate(subDays(today, 8)),
      type: "documento_gestoria",
      supplierName: null,
      category: "Gestoría",
      status: "listo_gestoria",
      estimatedAmount: null,
      source: "demo_seed",
      fileName: "paquete-gestoria-marzo-2026.xlsx",
      fileSize: 64_000,
      mimeType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      notes: "Generado desde Informes → Paquete para gestoría.",
    },
    {
      date: isoDate(subDays(today, 11)),
      type: "ticket_gasto",
      supplierName: "Telecom Empresas Demo",
      category: "Suministros",
      status: "asociado_gasto",
      estimatedAmount: 99.95,
      source: "demo_seed",
      fileName: "ticket-telecom-abril.pdf",
      fileSize: 88_064,
      mimeType: "application/pdf",
      notes: null,
    },
    {
      date: isoDate(subDays(today, 14)),
      type: "factura_proveedor",
      supplierName: suppliers[3]!.name,
      category: "Compras",
      status: "revisado",
      estimatedAmount: 738.2,
      source: "demo_seed",
      fileName: "factura-parafarmacia-202604-008.pdf",
      fileSize: 132_096,
      mimeType: "application/pdf",
      notes: null,
    },
  ];

  return list.map((doc, i) => ({
    id: uuid("doc", i + 1),
    pharmacyId: DEMO_PHARMACY.id,
    createdAt: isoTimestamp(new Date(doc.date)),
    ...doc,
  }));
}
