import { accountantPackDefinition } from "./definitions/accountantPack";
import { monthlyManagementDefinition } from "./definitions/monthlyManagement";
import { stockRiskDefinition } from "./definitions/stockRisk";
import { supplierSpendDefinition } from "./definitions/supplierSpend";
import { vatSummaryDefinition } from "./definitions/vatSummary";
import type { ReportDefinition, ReportType } from "@/types/reports";

export const REPORT_DEFINITIONS: ReportDefinition[] = [
  monthlyManagementDefinition,
  supplierSpendDefinition,
  accountantPackDefinition,
  vatSummaryDefinition,
  stockRiskDefinition,
];

export function getReportDefinition(id: ReportType): ReportDefinition | null {
  return REPORT_DEFINITIONS.find((d) => d.id === id) ?? null;
}
