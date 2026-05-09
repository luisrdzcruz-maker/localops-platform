import { PageHeader } from "@/components/ui/PageHeader";
import { Stat } from "@/components/ui/Stat";
import { AddTaskForm } from "@/components/tasks/AddTaskForm";
import { TaskList } from "@/components/tasks/TaskList";
import { getDemoState } from "@/lib/demo/store";
import { formatNumber } from "@/lib/utils/format";

export const metadata = { title: "Tareas · PharmaOps" };

export default function TasksPage() {
  const state = getDemoState();
  const open = state.tasks.filter(
    (t) => t.status === "open" || t.status === "in_progress"
  );
  const auto = open.filter((t) => t.autoSuggested).length;
  const high = open.filter(
    (t) => t.priority === "high" || t.priority === "urgent"
  ).length;
  const overdue = open.filter((t) => {
    if (!t.dueDate) return false;
    return new Date(t.dueDate) < new Date();
  }).length;

  return (
    <div className="flex flex-col">
      <PageHeader
        eyebrow="Tareas"
        title="Tareas operativas"
        description="Recordatorios de pagos, revisiones de stock, preparación de informes mensuales y seguimiento de incidencias."
        actions={<AddTaskForm />}
      />
      <div className="flex flex-col gap-6 p-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Stat
            label="Abiertas"
            value={formatNumber(open.length)}
            hint={`${state.tasks.length} en total`}
          />
          <Stat label="Sugeridas por PharmaOps" value={formatNumber(auto)} />
          <Stat label="Alta prioridad" value={formatNumber(high)} />
          <Stat label="Vencidas" value={formatNumber(overdue)} />
        </div>
        <TaskList tasks={state.tasks} />
      </div>
    </div>
  );
}
