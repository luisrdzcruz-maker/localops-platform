import { Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { TBody, TD, TH, THead, TR, Table } from "@/components/ui/Table";
import {
  TASK_CATEGORY_LABELS,
  TASK_PRIORITY_LABELS,
  TASK_STATUS_LABELS,
  type Task,
  type TaskPriority,
  type TaskStatus,
} from "@/types/tasks";
import { formatDate, formatRelative } from "@/lib/utils/format";

const STATUS_TONE: Record<TaskStatus, "ok" | "warn" | "info" | "neutral"> = {
  open: "info",
  in_progress: "warn",
  done: "ok",
  skipped: "neutral",
};

const PRIORITY_TONE: Record<TaskPriority, "ok" | "warn" | "danger" | "neutral"> = {
  low: "neutral",
  normal: "neutral",
  high: "warn",
  urgent: "danger",
};

export function TaskList({ tasks }: { tasks: Task[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tareas</CardTitle>
        <CardDescription>
          PharmaOps sugiere tareas a partir de proveedores con factura
          pendiente, stock próximo a caducar e importaciones con errores.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {tasks.length === 0 ? (
          <p className="text-sm text-ink-500">No hay tareas registradas.</p>
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>Tarea</TH>
                <TH>Categoría</TH>
                <TH>Prioridad</TH>
                <TH>Estado</TH>
                <TH>Vence</TH>
                <TH>Origen</TH>
              </TR>
            </THead>
            <TBody>
              {tasks.map((t) => (
                <TR key={t.id}>
                  <TD>
                    <p className="font-medium text-ink-900">{t.title}</p>
                    {t.description ? (
                      <p className="line-clamp-1 text-xs text-ink-500">
                        {t.description}
                      </p>
                    ) : null}
                  </TD>
                  <TD className="text-xs text-ink-500">
                    {TASK_CATEGORY_LABELS[t.category]}
                  </TD>
                  <TD>
                    <Badge tone={PRIORITY_TONE[t.priority]} className="text-[10px]">
                      {TASK_PRIORITY_LABELS[t.priority]}
                    </Badge>
                  </TD>
                  <TD>
                    <Badge tone={STATUS_TONE[t.status]} className="text-[10px]">
                      {TASK_STATUS_LABELS[t.status]}
                    </Badge>
                  </TD>
                  <TD className="text-xs text-ink-500">
                    {t.dueDate ? formatDate(t.dueDate) : "—"}
                    {t.dueDate ? (
                      <span className="ml-1 text-[10px] text-ink-400">
                        ({formatRelative(t.dueDate)})
                      </span>
                    ) : null}
                  </TD>
                  <TD>
                    {t.autoSuggested ? (
                      <Badge tone="info" className="gap-1 text-[10px]">
                        <Sparkles className="h-3 w-3" />
                        Sugerida
                      </Badge>
                    ) : (
                      <Badge tone="neutral" className="text-[10px]">
                        Manual
                      </Badge>
                    )}
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
