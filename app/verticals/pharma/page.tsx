import { AppShell } from "@/components/shell/AppShell";
import { PharmaDashboard } from "@/components/verticals/pharma/PharmaDashboard";
export default function Page() { return <AppShell><div className="space-y-6"><h1 className="text-2xl font-bold">PharmaOps Dashboard</h1><PharmaDashboard /></div></AppShell>; }
