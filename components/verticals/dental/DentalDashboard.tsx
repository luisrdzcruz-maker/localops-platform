import { DashboardGrid } from "@/components/dashboard/DashboardGrid";
import { MetricCard } from "@/components/core/MetricCard";
import { AiCreditMeter } from "@/components/ai/AiCreditMeter";
import { dentalMetrics, dentalAppointments } from "@/lib/mock/dental";
import { AppointmentList } from "./AppointmentList";
export function DentalDashboard() { return <div className="space-y-6"><DashboardGrid><MetricCard label="Today appointments" value={dentalMetrics.todayAppointments} /><MetricCard label="No-shows this month" value={dentalMetrics.noShowsThisMonth} /><MetricCard label="Recall opportunities" value={dentalMetrics.recallOpportunities} /><MetricCard label="Review requests" value={dentalMetrics.reviewRequests} /></DashboardGrid><AiCreditMeter /><AppointmentList appointments={dentalAppointments} /></div>; }
