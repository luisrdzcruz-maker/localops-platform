import { tasks } from "@/lib/mock/core";
import { TaskCard } from "./TaskCard";
export function TaskList() { return <div className="space-y-3">{tasks.map(task => <TaskCard key={task.id} task={task} />)}</div>; }
