import type {
  ConstructionExpense,
  ConstructionExpenseCategory,
  ConstructionExtra,
  ConstructionPayment,
  ConstructionProject,
  ConstructionTicket,
  IssuedInvoice,
  IssuedInvoiceStatus
} from "@/types/construction";

export const MARGIN_HEALTHY_THRESHOLD = 0.2;
export const MARGIN_WARNING_THRESHOLD = 0.05;

export type MarginStatus = "healthy" | "warning" | "loss";

export function marginStatus(percent: number): MarginStatus {
  if (percent < MARGIN_WARNING_THRESHOLD) return "loss";
  if (percent < MARGIN_HEALTHY_THRESHOLD) return "warning";
  return "healthy";
}

export interface ObraMargin {
  presupuestoTotal: number;
  estimatedCost: number;
  estimatedMaterialCost: number;
  estimatedLaborCost: number;
  actualMaterialCost: number;
  actualLaborCost: number;
  actualCost: number;
  costToDate: number;
  marginAmountEstimated: number;
  marginPercentEstimated: number;
  marginAmountActual: number;
  marginPercentActual: number;
  status: MarginStatus;
  hasPresupuesto: boolean;
  costSource: "expenses" | "project" | "estimate";
}

export function computeObraMargin(project: ConstructionProject, expenses?: ConstructionExpense[]): ObraMargin {
  const presupuestoTotal = project.presupuestoTotal ?? project.budget ?? 0;
  const estimatedMaterialCost = project.estimatedMaterialCost ?? 0;
  const estimatedLaborCost = project.estimatedLaborCost ?? 0;
  const estimatedCost = estimatedMaterialCost + estimatedLaborCost;

  let actualMaterialCost = project.actualMaterialCost ?? 0;
  let actualLaborCost = project.actualLaborCost ?? 0;
  let costSource: ObraMargin["costSource"] = "project";

  if (expenses && expenses.length > 0) {
    const projectExpenses = expenses.filter(e => e.projectId === project.id && e.status !== "rejected");
    if (projectExpenses.length > 0) {
      let derivedMaterial = 0;
      let derivedLabor = 0;
      for (const e of projectExpenses) {
        if (e.category === "labor" || e.category === "subcontract") derivedLabor += e.amount;
        else derivedMaterial += e.amount;
      }
      actualMaterialCost = derivedMaterial;
      actualLaborCost = derivedLabor;
      costSource = "expenses";
    }
  }

  const actualCost = actualMaterialCost + actualLaborCost;
  const costToDate = actualCost > 0 ? actualCost : estimatedCost;
  if (costSource === "project" && actualCost === 0) costSource = "estimate";

  const marginAmountEstimated = presupuestoTotal - estimatedCost;
  const marginPercentEstimated = presupuestoTotal > 0 ? marginAmountEstimated / presupuestoTotal : 0;
  const marginAmountActual = presupuestoTotal - costToDate;
  const marginPercentActual = presupuestoTotal > 0 ? marginAmountActual / presupuestoTotal : 0;

  return {
    presupuestoTotal,
    estimatedCost,
    estimatedMaterialCost,
    estimatedLaborCost,
    actualMaterialCost,
    actualLaborCost,
    actualCost,
    costToDate,
    marginAmountEstimated,
    marginPercentEstimated,
    marginAmountActual,
    marginPercentActual,
    status: marginStatus(marginPercentActual),
    hasPresupuesto: presupuestoTotal > 0,
    costSource
  };
}

export interface ObraProgress {
  presupuestoTotal: number;
  paid: number;
  pending: number;
  overdue: number;
  collectedPercent: number;
  remaining: number;
}

export function computeObraProgress(project: ConstructionProject, payments: ConstructionPayment[]): ObraProgress {
  const presupuestoTotal = project.presupuestoTotal ?? project.budget ?? 0;
  const projectPayments = payments.filter(p => p.projectId === project.id);
  const paid = sumByStatus(projectPayments, "paid");
  const pending = sumByStatus(projectPayments, "pending");
  const overdue = sumByStatus(projectPayments, "overdue");
  const collectedPercent = presupuestoTotal > 0 ? paid / presupuestoTotal : 0;
  const remaining = Math.max(presupuestoTotal - paid, 0);
  return { presupuestoTotal, paid, pending, overdue, collectedPercent, remaining };
}

function sumByStatus(payments: ConstructionPayment[], status: ConstructionPayment["status"]): number {
  return payments.filter(p => p.status === status).reduce((acc, p) => acc + p.amount, 0);
}

export interface ExpenseTotals {
  count: number;
  total: number;
  vatTotal: number;
  byCategory: Record<ConstructionExpenseCategory, number>;
  materialBucket: number;
  laborBucket: number;
}

const emptyByCategory = (): Record<ConstructionExpenseCategory, number> => ({
  material: 0,
  labor: 0,
  subcontract: 0,
  tool: 0,
  transport: 0,
  other: 0
});

export function expenseTotalsByProject(projectId: string, expenses: ConstructionExpense[]): ExpenseTotals {
  const byCategory = emptyByCategory();
  let count = 0;
  let total = 0;
  let vatTotal = 0;
  for (const e of expenses) {
    if (e.projectId !== projectId || e.status === "rejected") continue;
    byCategory[e.category] += e.amount;
    total += e.amount;
    vatTotal += e.vatAmount;
    count += 1;
  }
  const laborBucket = byCategory.labor + byCategory.subcontract;
  const materialBucket = total - laborBucket;
  return { count, total, vatTotal, byCategory, materialBucket, laborBucket };
}

export interface TicketTotals {
  count: number;
  total: number;
  pending: number;
  linked: number;
  rejected: number;
}

export function ticketTotalsByProject(projectId: string, tickets: ConstructionTicket[]): TicketTotals {
  let count = 0;
  let total = 0;
  let pending = 0;
  let linked = 0;
  let rejected = 0;
  for (const t of tickets) {
    if (t.projectId !== projectId && t.suggestedProjectId !== projectId) continue;
    count += 1;
    total += t.amount;
    if (t.status === "pending_review") pending += 1;
    else if (t.status === "linked") linked += 1;
    else rejected += 1;
  }
  return { count, total, pending, linked, rejected };
}

export function pendingTicketsCount(tickets: ConstructionTicket[]): number {
  let count = 0;
  for (const t of tickets) if (t.status === "pending_review") count += 1;
  return count;
}

export interface OverduePaymentSummary {
  count: number;
  total: number;
  items: ConstructionPayment[];
}

export function overduePaymentsByProject(payments: ConstructionPayment[]): Record<string, OverduePaymentSummary> {
  const byProject: Record<string, OverduePaymentSummary> = {};
  for (const p of payments) {
    if (p.status !== "overdue") continue;
    const entry = byProject[p.projectId] ?? { count: 0, total: 0, items: [] };
    entry.count += 1;
    entry.total += p.amount;
    entry.items.push(p);
    byProject[p.projectId] = entry;
  }
  return byProject;
}

export interface InvoiceTotals {
  count: number;
  totalIssued: number;
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
  vatTotal: number;
  vatCollected: number;
  byStatus: Record<IssuedInvoiceStatus, number>;
}

const emptyInvoiceByStatus = (): Record<IssuedInvoiceStatus, number> => ({
  draft: 0,
  issued: 0,
  sent: 0,
  paid: 0,
  overdue: 0,
  cancelled: 0
});

function accumulateInvoice(acc: InvoiceTotals, invoice: IssuedInvoice) {
  acc.byStatus[invoice.status] += 1;
  acc.count += 1;
  if (invoice.status === "cancelled") return;
  if (invoice.status !== "draft") {
    acc.totalIssued += invoice.total;
    acc.vatTotal += invoice.vatAmount;
  }
  acc.totalPaid += invoice.paidAmount;
  if (invoice.status === "paid") {
    acc.vatCollected += invoice.vatAmount;
  } else if (invoice.status === "issued" || invoice.status === "sent" || invoice.status === "overdue") {
    acc.totalPending += invoice.total - invoice.paidAmount;
    if (invoice.status === "overdue") {
      acc.totalOverdue += invoice.total - invoice.paidAmount;
    }
  }
}

export function invoiceTotalsByProject(projectId: string, invoices: IssuedInvoice[]): InvoiceTotals {
  const acc: InvoiceTotals = {
    count: 0,
    totalIssued: 0,
    totalPaid: 0,
    totalPending: 0,
    totalOverdue: 0,
    vatTotal: 0,
    vatCollected: 0,
    byStatus: emptyInvoiceByStatus()
  };
  for (const invoice of invoices) {
    if (invoice.projectId !== projectId) continue;
    accumulateInvoice(acc, invoice);
  }
  return acc;
}

export function invoiceTotalsAll(invoices: IssuedInvoice[]): InvoiceTotals {
  const acc: InvoiceTotals = {
    count: 0,
    totalIssued: 0,
    totalPaid: 0,
    totalPending: 0,
    totalOverdue: 0,
    vatTotal: 0,
    vatCollected: 0,
    byStatus: emptyInvoiceByStatus()
  };
  for (const invoice of invoices) {
    accumulateInvoice(acc, invoice);
  }
  return acc;
}

export interface MonthlyInvoiceSummary {
  month: string;
  count: number;
  total: number;
  paid: number;
  vatTotal: number;
}

function monthKey(isoDate: string): string {
  return isoDate.slice(0, 7);
}

export function monthlyInvoiceTotals(invoices: IssuedInvoice[]): MonthlyInvoiceSummary[] {
  const map = new Map<string, MonthlyInvoiceSummary>();
  for (const invoice of invoices) {
    if (invoice.status === "cancelled" || invoice.status === "draft") continue;
    const month = monthKey(invoice.issueDate);
    const entry = map.get(month) ?? { month, count: 0, total: 0, paid: 0, vatTotal: 0 };
    entry.count += 1;
    entry.total += invoice.total;
    entry.paid += invoice.paidAmount;
    entry.vatTotal += invoice.vatAmount;
    map.set(month, entry);
  }
  return Array.from(map.values()).sort((a, b) => b.month.localeCompare(a.month));
}

export function vatCollectedFromInvoices(invoices: IssuedInvoice[], sinceISO?: string): number {
  let total = 0;
  for (const invoice of invoices) {
    if (invoice.status !== "paid") continue;
    if (sinceISO && invoice.issueDate < sinceISO) continue;
    total += invoice.vatAmount;
  }
  return total;
}

export function unpaidInvoicesTotal(invoices: IssuedInvoice[]): { count: number; total: number } {
  let count = 0;
  let total = 0;
  for (const invoice of invoices) {
    if (invoice.status !== "issued" && invoice.status !== "sent" && invoice.status !== "overdue") continue;
    count += 1;
    total += invoice.total - invoice.paidAmount;
  }
  return { count, total };
}

export function overdueInvoicesTotal(invoices: IssuedInvoice[]): { count: number; total: number } {
  let count = 0;
  let total = 0;
  for (const invoice of invoices) {
    if (invoice.status !== "overdue") continue;
    count += 1;
    total += invoice.total - invoice.paidAmount;
  }
  return { count, total };
}

// ── Monthly report ────────────────────────────────────────────────────────────

export interface ProjectReportSummary {
  projectId: string;
  name: string;
  clientName: string;
  budget: number;
  expenses: number;
  marginAmount: number;
  marginPercent: number;
  marginStatus: MarginStatus;
}

export interface AdminWarning {
  type: "overdue_invoices" | "overdue_payments" | "pending_tickets" | "low_margin";
  tone: "risk" | "warning";
  label: string;
  description: string;
  count: number;
  amount?: number;
  href: string;
}

export interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
}

export interface MonthlyFinancialReport {
  month: string;
  facturado: number;
  cobrado: number;
  gastos: number;
  pendienteDeCobro: { count: number; total: number };
  vat: { collected: number; paid: number; due: number };
  margin: { amount: number; percent: number };
  projectSummaries: ProjectReportSummary[];
  warnings: AdminWarning[];
  checklist: ChecklistItem[];
}

export function calculateVatCollected(invoices: IssuedInvoice[], month: string): number {
  let total = 0;
  for (const inv of invoices) {
    if (inv.status !== "paid") continue;
    if (!inv.issueDate.startsWith(month)) continue;
    total += inv.vatAmount;
  }
  return total;
}

export function calculateVatPaid(expenses: ConstructionExpense[], month: string): number {
  let total = 0;
  for (const exp of expenses) {
    if (exp.status === "rejected") continue;
    if (!exp.date.startsWith(month)) continue;
    total += exp.vatAmount;
  }
  return total;
}

export function calculateEstimatedVatDue(vatCollected: number, vatPaid: number): number {
  return Math.max(vatCollected - vatPaid, 0);
}

export function calculateMonthlyGrossMargin(facturado: number, gastos: number): { amount: number; percent: number } {
  const amount = facturado - gastos;
  const percent = facturado > 0 ? amount / facturado : 0;
  return { amount, percent };
}

export function getMonthlyAdminWarnings(
  projects: ConstructionProject[],
  expenses: ConstructionExpense[],
  payments: ConstructionPayment[],
  tickets: ConstructionTicket[],
  invoices: IssuedInvoice[]
): AdminWarning[] {
  const warnings: AdminWarning[] = [];

  const overdueInv = overdueInvoicesTotal(invoices);
  if (overdueInv.count > 0) {
    const s = overdueInv.count !== 1;
    warnings.push({
      type: "overdue_invoices",
      tone: "risk",
      label: "Facturas vencidas",
      description: `${overdueInv.count} factura${s ? "s" : ""} sin cobrar pasada${s ? "s" : ""} de fecha`,
      count: overdueInv.count,
      amount: overdueInv.total,
      href: "/verticals/construction/invoices"
    });
  }

  const overduePaymentsItems = payments.filter(p => p.status === "overdue");
  if (overduePaymentsItems.length > 0) {
    const n = overduePaymentsItems.length;
    const s = n !== 1;
    warnings.push({
      type: "overdue_payments",
      tone: "risk",
      label: "Cobros vencidos",
      description: `${n} cobro${s ? "s" : ""} pasado${s ? "s" : ""} de fecha`,
      count: n,
      amount: overduePaymentsItems.reduce((acc, p) => acc + p.amount, 0),
      href: "/verticals/construction/payments"
    });
  }

  const pendingT = pendingTicketsCount(tickets);
  if (pendingT > 0) {
    const s = pendingT !== 1;
    warnings.push({
      type: "pending_tickets",
      tone: "warning",
      label: "Tickets sin revisar",
      description: `${pendingT} ticket${s ? "s" : ""} pendiente${s ? "s" : ""} de clasificar`,
      count: pendingT,
      href: "/verticals/construction/tickets"
    });
  }

  const lowMarginCount = projects.filter(p => {
    if (p.status === "archived" || p.status === "lead") return false;
    const m = computeObraMargin(p, expenses);
    return m.hasPresupuesto && m.marginPercentActual < MARGIN_HEALTHY_THRESHOLD;
  }).length;
  if (lowMarginCount > 0) {
    const s = lowMarginCount !== 1;
    warnings.push({
      type: "low_margin",
      tone: "warning",
      label: "Trabajos con margen bajo",
      description: `${lowMarginCount} obra${s ? "s" : ""} por debajo del ${Math.round(MARGIN_HEALTHY_THRESHOLD * 100)}% de margen`,
      count: lowMarginCount,
      href: "/verticals/construction/projects"
    });
  }

  return warnings;
}

export function buildMonthlyFinancialReport(
  month: string,
  projects: ConstructionProject[],
  expenses: ConstructionExpense[],
  payments: ConstructionPayment[],
  tickets: ConstructionTicket[],
  invoices: IssuedInvoice[],
  contactNameById: Record<string, string>
): MonthlyFinancialReport {
  const monthInvoices = invoices.filter(
    inv => inv.issueDate.startsWith(month) && inv.status !== "draft" && inv.status !== "cancelled"
  );
  const facturado = monthInvoices.reduce((acc, inv) => acc + inv.total, 0);
  const cobrado = monthInvoices.filter(inv => inv.status === "paid").reduce((acc, inv) => acc + inv.paidAmount, 0);

  const monthExpenses = expenses.filter(e => e.date.startsWith(month) && e.status !== "rejected");
  const gastos = monthExpenses.reduce((acc, e) => acc + e.amount, 0);

  const vatCollected = calculateVatCollected(invoices, month);
  const vatPaid = calculateVatPaid(expenses, month);
  const vatDue = calculateEstimatedVatDue(vatCollected, vatPaid);
  const margin = calculateMonthlyGrossMargin(facturado, gastos);
  const pendienteDeCobro = unpaidInvoicesTotal(invoices);

  const projectSummaries: ProjectReportSummary[] = projects
    .filter(p => p.status !== "archived")
    .map(p => {
      const m = computeObraMargin(p, expenses);
      return {
        projectId: p.id,
        name: p.name,
        clientName: contactNameById[p.contactId] ?? "Sin cliente",
        budget: m.presupuestoTotal,
        expenses: m.actualCost,
        marginAmount: m.marginAmountActual,
        marginPercent: m.marginPercentActual,
        marginStatus: m.status
      };
    });

  const warnings = getMonthlyAdminWarnings(projects, expenses, payments, tickets, invoices);

  const issuedCount = invoices.filter(inv => inv.status !== "draft" && inv.status !== "cancelled").length;
  const confirmedExpensesCount = expenses.filter(e => e.status === "confirmed").length;
  const reviewedTicketsCount = tickets.filter(t => t.status !== "pending_review").length;
  const paidPaymentsCount = payments.filter(p => p.status === "paid").length;

  const checklist: ChecklistItem[] = [
    { id: "invoices_issued", label: "Facturas emitidas registradas", done: issuedCount > 0 },
    { id: "expenses_registered", label: "Gastos registrados", done: confirmedExpensesCount > 0 },
    { id: "tickets_reviewed", label: "Tickets revisados", done: reviewedTicketsCount > 0 },
    { id: "payments_updated", label: "Cobros actualizados", done: paidPaymentsCount > 0 },
    { id: "vat_summary", label: "Resumen IVA preparado", done: vatCollected > 0 || vatPaid > 0 },
    { id: "profitability_reviewed", label: "Rentabilidad de obras revisada", done: projectSummaries.length > 0 }
  ];

  return {
    month,
    facturado,
    cobrado,
    gastos,
    pendienteDeCobro,
    vat: { collected: vatCollected, paid: vatPaid, due: vatDue },
    margin,
    projectSummaries,
    warnings,
    checklist
  };
}

// ── Accountant export ─────────────────────────────────────────────────────────

export type AccountantExportStatus = "ready" | "missing_items" | "review_recommended";

export interface AccountantExportItem {
  id: string;
  label: string;
  count: number;
  included: boolean;
}

export interface AccountantExportPackage {
  month: string;
  monthLabel: string;
  status: AccountantExportStatus;
  statusLabel: string;
  metrics: {
    invoicesIssued: number;
    expensesRegistered: number;
    ticketsPending: number;
    paymentsPending: number;
    vatEstimated: number;
    marginEstimated: number;
  };
  checklist: ChecklistItem[];
  warnings: AdminWarning[];
  documents: AccountantExportItem[];
  missingItems: string[];
}

export function getExportReadinessStatus(
  warnings: AdminWarning[],
  checklist: ChecklistItem[]
): AccountantExportStatus {
  const hasRiskWarning = warnings.some(w => w.tone === "risk");
  if (hasRiskWarning) return "missing_items";
  const hasCriticalMissing = checklist.some(
    item => (item.id === "invoices_issued" || item.id === "expenses_registered") && !item.done
  );
  if (hasCriticalMissing) return "missing_items";
  const hasAnyIssue = warnings.length > 0 || checklist.some(item => !item.done);
  if (hasAnyIssue) return "review_recommended";
  return "ready";
}

export function getMissingExportItems(checklist: ChecklistItem[], warnings: AdminWarning[]): string[] {
  const missing: string[] = [];
  for (const item of checklist) {
    if (!item.done) missing.push(item.label);
  }
  for (const w of warnings) {
    if (w.tone === "risk") missing.push(w.label);
  }
  return missing;
}

export function buildAccountantExportPackage(
  report: MonthlyFinancialReport,
  monthLabel: string,
  expenses: ConstructionExpense[],
  payments: ConstructionPayment[],
  tickets: ConstructionTicket[],
  invoices: IssuedInvoice[]
): AccountantExportPackage {
  const invoicesIssued = invoices.filter(inv => inv.status !== "draft" && inv.status !== "cancelled").length;
  const expensesRegistered = expenses.filter(e => e.status === "confirmed").length;
  const ticketsPending = pendingTicketsCount(tickets);
  const paymentsPending = payments.filter(p => p.status === "pending" || p.status === "overdue").length;
  const paidPaymentsCount = payments.filter(p => p.status === "paid").length;

  const documents: AccountantExportItem[] = [
    { id: "invoices", label: "Facturas emitidas", count: invoicesIssued, included: invoicesIssued > 0 },
    { id: "expenses", label: "Gastos y tickets", count: expensesRegistered, included: expensesRegistered > 0 },
    { id: "payments", label: "Cobros registrados", count: paidPaymentsCount, included: paidPaymentsCount > 0 },
    {
      id: "vat_summary",
      label: "Resumen IVA",
      count: 1,
      included: report.vat.collected > 0 || report.vat.paid > 0
    },
    {
      id: "profitability",
      label: "Rentabilidad por obra",
      count: report.projectSummaries.length,
      included: report.projectSummaries.length > 0
    }
  ];

  const status = getExportReadinessStatus(report.warnings, report.checklist);

  const statusLabels: Record<AccountantExportStatus, string> = {
    ready: "Listo para exportar",
    missing_items: "Faltan documentos",
    review_recommended: "Revisión recomendada"
  };

  const missingItems = getMissingExportItems(report.checklist, report.warnings);

  return {
    month: report.month,
    monthLabel,
    status,
    statusLabel: statusLabels[status],
    metrics: {
      invoicesIssued,
      expensesRegistered,
      ticketsPending,
      paymentsPending,
      vatEstimated: report.vat.due,
      marginEstimated: report.margin.percent
    },
    checklist: report.checklist,
    warnings: report.warnings,
    documents,
    missingItems
  };
}

// ── Project extras ────────────────────────────────────────────────────────────

export interface ExtraTotals {
  count: number;
  approvedCount: number;
  proposedCount: number;
  approvedTotal: number;
  uninvoicedTotal: number;
  allTotal: number;
}

export function extraTotalsByProject(projectId: string, extras: ConstructionExtra[]): ExtraTotals {
  const projectExtras = extras.filter(e => e.projectId === projectId && e.status !== "rejected");
  let approvedCount = 0;
  let proposedCount = 0;
  let approvedTotal = 0;
  let uninvoicedTotal = 0;
  let allTotal = 0;
  for (const e of projectExtras) {
    allTotal += e.amount;
    if (e.status === "approved" || e.status === "invoiced" || e.status === "paid") {
      approvedCount += 1;
      approvedTotal += e.amount;
    }
    if (e.status === "proposed") proposedCount += 1;
    if (e.status === "approved") uninvoicedTotal += e.amount;
  }
  return { count: projectExtras.length, approvedCount, proposedCount, approvedTotal, uninvoicedTotal, allTotal };
}

export function approvedExtrasTotalByProject(projectId: string, extras: ConstructionExtra[]): number {
  return extras
    .filter(e => e.projectId === projectId && (e.status === "approved" || e.status === "invoiced" || e.status === "paid"))
    .reduce((acc, e) => acc + e.amount, 0);
}

export function uninvoicedExtrasTotalByProject(projectId: string, extras: ConstructionExtra[]): number {
  return extras
    .filter(e => e.projectId === projectId && e.status === "approved")
    .reduce((acc, e) => acc + e.amount, 0);
}

export function effectiveProjectBudgetWithExtras(project: ConstructionProject, extras: ConstructionExtra[]): number {
  const baseBudget = project.presupuestoTotal ?? project.budget ?? 0;
  return baseBudget + approvedExtrasTotalByProject(project.id, extras);
}

// ── Profitability ─────────────────────────────────────────────────────────────

export interface ProjectProfitabilityRow {
  projectId: string;
  name: string;
  clientName: string;
  status: ConstructionProject["status"];
  effectiveBudget: number;
  actualCost: number;
  estimatedCost: number;
  invoicedTotal: number;
  collectedTotal: number;
  marginAmount: number;
  marginPercent: number;
  marginStatus: MarginStatus;
  costDeviation: number;
  costDeviationPercent: number;
  hasOverduePayment: boolean;
  hasOverdueInvoice: boolean;
  pendingTickets: number;
  isOverBudget: boolean;
  approvedExtrasTotal: number;
}

export interface ProfitabilityOverview {
  totalEffectiveBudget: number;
  totalActualCost: number;
  totalInvoiced: number;
  totalCollected: number;
  portfolioMargin: { amount: number; percent: number };
  riskCount: number;
  rows: ProjectProfitabilityRow[];
}

export function calculateProjectDeviation(
  estimated: number,
  actual: number
): { amount: number; percent: number; favorable: boolean } {
  const amount = actual - estimated;
  const percent = estimated > 0 ? amount / estimated : 0;
  return { amount, percent, favorable: amount <= 0 };
}

export function calculatePortfolioGrossMargin(rows: ProjectProfitabilityRow[]): { amount: number; percent: number } {
  const totalBudget = rows.reduce((acc, r) => acc + r.effectiveBudget, 0);
  const totalCost = rows.reduce((acc, r) => acc + r.actualCost, 0);
  const amount = totalBudget - totalCost;
  const percent = totalBudget > 0 ? amount / totalBudget : 0;
  return { amount, percent };
}

export function rankProjectsByMargin(
  rows: ProjectProfitabilityRow[],
  direction: "asc" | "desc" = "asc"
): ProjectProfitabilityRow[] {
  return [...rows].sort((a, b) =>
    direction === "asc" ? a.marginPercent - b.marginPercent : b.marginPercent - a.marginPercent
  );
}

export function getLowMarginProjects(rows: ProjectProfitabilityRow[]): ProjectProfitabilityRow[] {
  return rows.filter(
    r => r.status !== "archived" && r.effectiveBudget > 0 && r.marginPercent < MARGIN_HEALTHY_THRESHOLD
  );
}

export function getOverBudgetProjects(rows: ProjectProfitabilityRow[]): ProjectProfitabilityRow[] {
  return rows.filter(r => r.isOverBudget);
}

export function buildProfitabilityOverview(
  projects: ConstructionProject[],
  expenses: ConstructionExpense[],
  payments: ConstructionPayment[],
  invoices: IssuedInvoice[],
  tickets: ConstructionTicket[],
  extras: ConstructionExtra[],
  contactNameById: Record<string, string>
): ProfitabilityOverview {
  const overduePaymentsMap = overduePaymentsByProject(payments);
  const allInvoiceTotals = invoiceTotalsAll(invoices);
  const totalCollected = payments.filter(p => p.status === "paid").reduce((acc, p) => acc + p.amount, 0);

  const rows: ProjectProfitabilityRow[] = projects
    .filter(p => p.status !== "archived")
    .map(project => {
      const margin = computeObraMargin(project, expenses);
      const approvedExtrasTotal = approvedExtrasTotalByProject(project.id, extras);
      const effectiveBudget = (project.presupuestoTotal ?? project.budget ?? 0) + approvedExtrasTotal;
      const invTotals = invoiceTotalsByProject(project.id, invoices);
      const projectPaidPayments = payments.filter(p => p.projectId === project.id && p.status === "paid");
      const collectedTotal = projectPaidPayments.reduce((acc, p) => acc + p.amount, 0);
      const ticketsPending = ticketTotalsByProject(project.id, tickets).pending;
      const overdueEntry = overduePaymentsMap[project.id];
      const deviation = calculateProjectDeviation(margin.estimatedCost, margin.actualCost);
      const marginAmount = effectiveBudget - margin.actualCost;
      const marginPercent = effectiveBudget > 0 ? marginAmount / effectiveBudget : 0;

      return {
        projectId: project.id,
        name: project.name,
        clientName: contactNameById[project.contactId] ?? "Sin cliente",
        status: project.status,
        effectiveBudget,
        actualCost: margin.actualCost,
        estimatedCost: margin.estimatedCost,
        invoicedTotal: invTotals.totalIssued,
        collectedTotal,
        marginAmount,
        marginPercent,
        marginStatus: marginStatus(marginPercent),
        costDeviation: deviation.amount,
        costDeviationPercent: deviation.percent,
        hasOverduePayment: !!(overdueEntry && overdueEntry.count > 0),
        hasOverdueInvoice: invTotals.totalOverdue > 0,
        pendingTickets: ticketsPending,
        isOverBudget: effectiveBudget > 0 && margin.actualCost > effectiveBudget,
        approvedExtrasTotal
      };
    });

  const portfolioMargin = calculatePortfolioGrossMargin(rows);
  const riskCount = rows.filter(r => r.marginStatus !== "healthy").length;
  const totalEffectiveBudget = rows.reduce((acc, r) => acc + r.effectiveBudget, 0);
  const totalActualCost = rows.reduce((acc, r) => acc + r.actualCost, 0);

  return {
    totalEffectiveBudget,
    totalActualCost,
    totalInvoiced: allInvoiceTotals.totalIssued,
    totalCollected,
    portfolioMargin,
    riskCount,
    rows
  };
}
