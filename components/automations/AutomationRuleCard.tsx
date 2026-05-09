import type { AutomationRule } from "@/types/automations";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/core/StatusBadge";
export function AutomationRuleCard({ rule }: { rule: AutomationRule }) { return <Card className="p-4"><div className="flex justify-between"><div><h3 className="font-semibold">{rule.name}</h3><p className="text-sm text-slate-500">When {rule.trigger}</p></div><StatusBadge status={rule.enabled ? "active" : "disabled"} /></div></Card>; }
