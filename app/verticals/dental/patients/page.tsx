import { AppShell } from "@/components/shell/AppShell";
import { PatientList } from "@/components/verticals/dental/PatientList";import { dentalPatients } from "@/lib/mock/dental";
export default function Page() { return <AppShell><div className="space-y-6"><h1 className="text-2xl font-bold">Patients</h1><PatientList patients={dentalPatients} /></div></AppShell>; }
