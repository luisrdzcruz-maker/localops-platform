import { Card } from "@/components/ui/Card";
export function EntityDetailPanel({ title, children }: { title: string; children: React.ReactNode }) { return <Card><h2 className="text-lg font-semibold">{title}</h2><div className="mt-4">{children}</div></Card>; }
