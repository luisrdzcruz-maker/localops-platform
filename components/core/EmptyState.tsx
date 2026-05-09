import { Card } from "@/components/ui/Card";
export function EmptyState({ title, description }: { title: string; description: string }) { return <Card className="border-dashed text-center"><h3 className="font-semibold text-slate-950">{title}</h3><p className="mt-1 text-sm text-slate-500">{description}</p></Card>; }
