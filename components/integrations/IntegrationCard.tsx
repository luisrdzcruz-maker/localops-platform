import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/core/StatusBadge";
export function IntegrationCard({ label, description, status = "not_connected" }: { label: string; description: string; status?: string }) { return <Card className="p-4"><div className="flex justify-between gap-3"><div><h3 className="font-semibold">{label}</h3><p className="text-sm text-slate-500">{description}</p></div><StatusBadge status={status} /></div></Card>; }
