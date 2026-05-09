import type { AiActionCost } from "@/types/ai";
import { Card } from "@/components/ui/Card";
export function AiActionCard({ action }: { action: AiActionCost }) { return <Card className="p-4"><h3 className="font-semibold">{action.label}</h3><p className="text-sm text-slate-500">{action.credits} credits · {action.model}{action.allowsFiles ? " · files limited" : ""}</p></Card>; }
