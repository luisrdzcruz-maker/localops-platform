import { AppShell } from "@/components/shell/AppShell";

export default function Page() {
  return <AppShell><div className="space-y-6"><div><h1 className="text-2xl font-bold text-slate-950">Calendar</h1></div><div className="rounded-2xl bg-white p-5 shadow-sm">Calendar placeholder: appointments, site visits and reminders will render here.</div></div></AppShell>;
}
