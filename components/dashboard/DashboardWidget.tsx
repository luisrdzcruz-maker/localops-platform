import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
export function DashboardWidget({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) { return <Card><CardTitle>{title}</CardTitle>{description ? <CardDescription>{description}</CardDescription> : null}<div className="mt-4">{children}</div></Card>; }
