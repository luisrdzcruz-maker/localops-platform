import { ListChecks } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import {
  TASK_PRIORITY_LABELS,
  type Task,
  type TaskPriority,
} from "@/types/tasks";
import { formatRelative } from "@/lib/utils/format";

const PRIORITY_TONE: Record<TaskPriority, "ok" | "warn" | "danger" | "neutral"> = {
  low: "neutral",
  normal: "neutral",
  high: "warn",
  urgent: "danger",
};

export function TasksDueCard({ tasks }: { tasks: Task[] }) {
  const upcoming = tasks
    .filter((t) => t.status === "open" || t.status === "in_progress")
    .filter((t) => Boolean(t.dueDate))
    .sort((a, b) => (a.dueDate! < b.dueDate! ? -1 : 1))
    .slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div>
            <CardTitle className="flex items-center gap-2">
              <ListChecks className="h-4 w-4 text-brand-600" />
              Tareas por vencer
            </CardTitle>
            <CardDescription>
              Pagos a proveedores, revisiones y preparación para gestoría.
            </CardDescription>
          </div>
          <Link
            href="/tasks"
            className="text-xs font-medium text-brand-700 hover:underline"
          >
            Ver todas
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {upcoming.length === 0 ? (
          <p className="text-sm text-ink-500">No tienes tareas próximas.</p>
        ) : (
          <ul className="flex flex-col divide-y divide-ink-100">
            {upcoming.map((t) => (
              <li
                key={t.id}
                className="flex items-start justify-between gap-3 py-3 first:pt-0 last:pb-0"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink-900">
                    {t.title}
                  </p>
                  {t.description ? (
                    <p className="line-clamp-1 text-xs text-ink-500">
                      {t.description}
                    </p>
                  ) : null}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1 text-right">
                  <Badge tone={PRIORITY_TONE[t.priority]} className="text-[10px]">
                    {TASK_PRIORITY_LABELS[t.priority]}
                  </Badge>
                  <span className="text-[11px] text-ink-500">
                    {formatRelative(t.dueDate)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
