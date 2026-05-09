import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
export function EstimateBuilder() { return <Card><h2 className="text-lg font-semibold">Estimate builder</h2><p className="mt-1 text-sm text-slate-500">Manual line items first; AI draft from notes is credit-gated later.</p><div className="mt-4 grid gap-3 md:grid-cols-3"><Input placeholder="Description" /><Input placeholder="Quantity" /><Input placeholder="Unit price" /></div><Button className="mt-4">Add placeholder line</Button></Card>; }
