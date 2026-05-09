import { AppShell } from "@/components/shell/AppShell";
import { TaskList } from "@/components/tasks/TaskList";
export default function Page() { return <AppShell><div className="space-y-6"><h1 className="text-2xl font-bold">Tasks</h1><TaskList /></div></AppShell>; }
