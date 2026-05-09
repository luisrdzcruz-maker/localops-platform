"use client";

import { Plus } from "lucide-react";
import { useState, useTransition } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Input, Label, Select, Textarea } from "@/components/ui/Input";
import { upsertTaskAction } from "@/lib/tasks/actions";
import {
  TASK_CATEGORY_LABELS,
  TASK_PRIORITY_LABELS,
  TASK_STATUS_LABELS,
  TASK_STATUSES,
  type TaskCategory,
  type TaskPriority,
  type TaskStatus,
} from "@/types/tasks";

const today = () => new Date().toISOString().slice(0, 10);

export function AddTaskForm() {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<TaskCategory>("general");
  const [priority, setPriority] = useState<TaskPriority>("normal");
  const [status, setStatus] = useState<TaskStatus>("open");
  const [dueDate, setDueDate] = useState(today());
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function reset() {
    setTitle("");
    setDescription("");
    setCategory("general");
    setPriority("normal");
    setStatus("open");
    setDueDate(today());
    setError(null);
  }

  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      try {
        await upsertTaskAction({
          title,
          description: description || null,
          category,
          priority,
          status,
          dueDate: dueDate || null,
        });
        reset();
        setOpen(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al guardar.");
      }
    });
  }

  if (!open) {
    return (
      <Button size="sm" onClick={() => setOpen(true)}>
        <Plus className="h-3.5 w-3.5" />
        Nueva tarea
      </Button>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="grid gap-3 rounded-xl border border-ink-200 bg-white p-4 md:grid-cols-2"
    >
      <div className="md:col-span-2 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-ink-900">Nueva tarea</h4>
        <Button
          variant="ghost"
          size="sm"
          type="button"
          onClick={() => {
            setOpen(false);
            reset();
          }}
        >
          Cancelar
        </Button>
      </div>

      <div className="md:col-span-2 flex flex-col gap-1.5">
        <Label htmlFor="task-title">Título</Label>
        <Input
          id="task-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          minLength={2}
        />
      </div>
      <div className="md:col-span-2 flex flex-col gap-1.5">
        <Label htmlFor="task-description">Descripción</Label>
        <Textarea
          id="task-description"
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="task-category">Categoría</Label>
        <Select
          id="task-category"
          value={category}
          onChange={(e) => setCategory(e.target.value as TaskCategory)}
        >
          {(Object.keys(TASK_CATEGORY_LABELS) as TaskCategory[]).map((c) => (
            <option key={c} value={c}>
              {TASK_CATEGORY_LABELS[c]}
            </option>
          ))}
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="task-priority">Prioridad</Label>
        <Select
          id="task-priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value as TaskPriority)}
        >
          {(Object.keys(TASK_PRIORITY_LABELS) as TaskPriority[]).map((p) => (
            <option key={p} value={p}>
              {TASK_PRIORITY_LABELS[p]}
            </option>
          ))}
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="task-status">Estado</Label>
        <Select
          id="task-status"
          value={status}
          onChange={(e) => setStatus(e.target.value as TaskStatus)}
        >
          {TASK_STATUSES.map((s) => (
            <option key={s} value={s}>
              {TASK_STATUS_LABELS[s]}
            </option>
          ))}
        </Select>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="task-due">Vencimiento</Label>
        <Input
          id="task-due"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
      </div>

      {error ? (
        <div className="md:col-span-2">
          <Alert tone="danger" title="Error">
            {error}
          </Alert>
        </div>
      ) : null}

      <div className="md:col-span-2 flex justify-end">
        <Button type="submit" disabled={pending}>
          {pending ? "Guardando..." : "Guardar tarea"}
        </Button>
      </div>
    </form>
  );
}
