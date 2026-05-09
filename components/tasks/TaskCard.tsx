import type { Task } from "@/types/core";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/core/StatusBadge";
export function TaskCard({ task }: { task: Task }) { return <Card className="p-4"><div className="flex justify-between gap-3"><div><h3 className="font-semibold">{task.title}</h3><p className="text-sm text-slate-500">Due {task.dueAt ?? "not set"}</p></div><StatusBadge status={task.priority} /></div></Card>; }
