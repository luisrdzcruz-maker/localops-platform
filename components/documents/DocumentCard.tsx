import { Card } from "@/components/ui/Card";
export function DocumentCard({ title, type }: { title: string; type: string }) { return <Card className="p-4"><h3 className="font-semibold">{title}</h3><p className="text-sm text-slate-500">{type}</p></Card>; }
