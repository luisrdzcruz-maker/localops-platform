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
  type TaskCategory,
  type TaskPriority,
} from "@/types/tasks";
import { formatRelative } from "@/lib/utils/format";

const PRIORITY_TONE: Record<TaskPriority, "ok" | "warn" | "danger" | "neutral"> = {
  low: "neutral",
  normal: "neutral",
  high: "warn",
  urgent: "danger",
};

/**
 * Short Spanish category labels used in the mobile metadata line. Different
 * from TASK_CATEGORY_LABELS, which is used everywhere else and reads more
 * formal ("Pago a proveedor"). Mobile rows need 1–2 words.
 */
const CATEGORY_SHORT: Record<TaskCategory, string> = {
  supplier_payment: "Proveedor",
  stock_review: "Stock",
  accountant: "Gestoría",
  import: "Importación",
  document: "Documento",
  compliance: "Cumplimiento",
  general: "General",
};

/**
 * Build a compact metadata line for the mobile dashboard row.
 *
 * Pattern: "<contextual cue> · <category>". Cues come from cheap regex
 * matches over the task title + description so we never show a full long
 * sentence on a 390px viewport. Falls back to just the category label when
 * no cue matches.
 */
function deriveMobileSummary(task: Task): string {
  const cat = CATEGORY_SHORT[task.category];
  const text = `${task.title} ${task.description ?? ""}`.toLowerCase();

  // Numeric cues — "4 errores", "6 referencias", "3 facturas".
  const errMatch = text.match(
    /(\d+)\s+(?:filas?\s+con\s+)?(error|errores|aviso|avisos)/
  );
  if (errMatch) return `${errMatch[1]} ${errMatch[2]} · ${cat}`;
  const countMatch = text.match(
    /(\d+)\s+(referencia|referencias|producto|productos|factura|facturas)/
  );
  if (countMatch) return `${countMatch[1]} ${countMatch[2]} · ${cat}`;

  // Phrase cues, ordered most-specific first.
  if (text.includes("pdf") && text.includes("excel")) {
    return `PDF + Excel · ${cat}`;
  }
  if (/plantilla[^.]*\bunycop\b|\bunycop\b[^.]*plantilla/.test(text)) {
    return `Plantilla Unycop · ${cat}`;
  }
  if (/plantilla[^.]*\bfarmatic\b|\bfarmatic\b[^.]*plantilla/.test(text)) {
    return `Plantilla Farmatic · ${cat}`;
  }
  if (/plantilla[^.]*\bnixfarma\b|\bnixfarma\b[^.]*plantilla/.test(text)) {
    return `Plantilla Nixfarma · ${cat}`;
  }
  if (text.includes("plantilla")) return `Plantilla · ${cat}`;
  if (text.includes("paquete") && text.includes("gestor")) {
    return `Paquete gestoría · ${cat}`;
  }
  if (text.includes("paquete")) return `Paquete · ${cat}`;
  if (/factura[^.]*\b(pendiente|pendientes|revisar)\b/.test(text)) {
    return `Factura pendiente · ${cat}`;
  }
  if (text.includes("caducar") || text.includes("caducidad")) {
    return `Caducidades · ${cat}`;
  }
  if (text.includes("negociar") || text.includes("renegociar")) {
    return `Negociación · ${cat}`;
  }
  if (task.category === "compliance") return `Política · ${cat}`;

  return cat;
}

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
          <div className="min-w-0 flex-1">
            <CardTitle className="flex items-center gap-2 truncate">
              <ListChecks className="h-4 w-4 shrink-0 text-brand-600" />
              <span className="truncate">Tareas por vencer</span>
            </CardTitle>
            <CardDescription className="hidden sm:block">
              Pagos a proveedores, revisiones y preparación para gestoría.
            </CardDescription>
          </div>
          <Link
            href="/tasks"
            className="shrink-0 text-xs font-medium text-brand-700 hover:underline"
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
                  {/* Mobile-only compact metadata. Hidden at sm+ so the
                      desktop row keeps the full description below. */}
                  <p className="truncate text-xs text-ink-500 sm:hidden">
                    {deriveMobileSummary(t)}
                  </p>
                  {t.description ? (
                    <p className="hidden line-clamp-1 text-xs text-ink-500 sm:block">
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
