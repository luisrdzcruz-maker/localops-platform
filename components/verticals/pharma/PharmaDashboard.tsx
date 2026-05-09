import { DashboardGrid } from "@/components/dashboard/DashboardGrid";
import { MetricCard } from "@/components/core/MetricCard";
import { AiCreditMeter } from "@/components/ai/AiCreditMeter";
import { pharmaMetrics, pharmacyProducts, salesImports } from "@/lib/mock/pharma";
import { ProductList } from "./ProductList";
export function PharmaDashboard() { return <div className="space-y-6"><DashboardGrid><MetricCard label="Low stock" value={pharmaMetrics.lowStock} hint="Needs review" /><MetricCard label="Expiring soon" value={pharmaMetrics.expiringSoon} hint="Next 90 days" /><MetricCard label="Weekly sales" value={`€${pharmaMetrics.weeklySales}`} hint="From CSV import" /><MetricCard label="Supplier orders" value={pharmaMetrics.supplierOrders} /></DashboardGrid><AiCreditMeter /><ProductList products={pharmacyProducts.slice(0,3)} /><div className="rounded-2xl bg-white p-5 shadow-sm"><h3 className="font-semibold">Recent import</h3><p className="text-sm text-slate-500">{salesImports[0].fileName} · {salesImports[0].rows} rows · €{salesImports[0].totalSales}</p></div></div>; }
