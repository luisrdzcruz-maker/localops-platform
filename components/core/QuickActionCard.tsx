import { Card } from "@/components/ui/Card";
export function QuickActionCard({ title, description }: { title: string; description: string }) { return <Card className="hover:border-slate-300"><h3 className="font-semibold text-slate-950">{title}</h3><p className="mt-1 text-sm text-slate-500">{description}</p></Card>; }
