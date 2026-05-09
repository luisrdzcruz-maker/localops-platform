import type { ConstructionEstimateItem } from "@/types/construction";
import { marginStatus, type MarginStatus } from "./obraMath";

export interface EstimateLineTotals {
  revenue: number;
  cost: number;
  marginAmount: number;
}

export function computeLineTotals(item: ConstructionEstimateItem): EstimateLineTotals {
  const revenue = item.quantity * item.unitPrice;
  const cost = item.quantity * item.unitCost;
  return { revenue, cost, marginAmount: revenue - cost };
}

export interface EstimateTotals {
  subtotal: number;
  vat: number;
  total: number;
  materialCost: number;
  laborCost: number;
  totalCost: number;
  marginAmount: number;
  marginPercent: number;
  status: MarginStatus;
}

export function computeEstimateTotals(items: ConstructionEstimateItem[], vatRate: number): EstimateTotals {
  let subtotal = 0;
  let materialCost = 0;
  let laborCost = 0;
  for (const item of items) {
    const { revenue, cost } = computeLineTotals(item);
    subtotal += revenue;
    if (item.category === "material") materialCost += cost;
    else if (item.category === "labor") laborCost += cost;
    else materialCost += cost;
  }
  const totalCost = materialCost + laborCost;
  const vat = subtotal * vatRate;
  const total = subtotal + vat;
  const marginAmount = subtotal - totalCost;
  const marginPercent = subtotal > 0 ? marginAmount / subtotal : 0;
  return {
    subtotal,
    vat,
    total,
    materialCost,
    laborCost,
    totalCost,
    marginAmount,
    marginPercent,
    status: marginStatus(marginPercent)
  };
}
