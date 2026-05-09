import { DashboardGrid } from "@/components/dashboard/DashboardGrid";
import { MetricCard } from "@/components/core/MetricCard";
import { AiCreditMeter } from "@/components/ai/AiCreditMeter";
import { constructionEstimates, constructionExpenses, constructionPayments, constructionProjects } from "@/lib/mock/construction";
import { computeObraMargin } from "@/lib/construction/obraMath";
import { ProjectList } from "./ProjectList";

export function ConstructionDashboard() {
  const openEstimates = constructionEstimates.filter(e => e.status === "draft" || e.status === "sent").length;
  const activeProjects = constructionProjects.filter(p => p.status === "active").length;
  const pendingPayments = constructionPayments
    .filter(p => p.status !== "paid")
    .reduce((acc, p) => acc + p.amount, 0);
  const marginWarnings = constructionProjects.filter(p => {
    const m = computeObraMargin(p, constructionExpenses);
    return m.hasPresupuesto && m.status !== "healthy";
  }).length;

  return (
    <div className="space-y-6">
      <DashboardGrid>
        <MetricCard label="Open estimates" value={openEstimates} />
        <MetricCard label="Active projects" value={activeProjects} />
        <MetricCard label="Pending payments" value={`€${pendingPayments.toLocaleString("es-ES")}`} />
        <MetricCard label="Margin warnings" value={marginWarnings} />
      </DashboardGrid>
      <AiCreditMeter />
      <ProjectList projects={constructionProjects} />
    </div>
  );
}
