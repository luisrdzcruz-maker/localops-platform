import { AppShell } from "@/components/shell/AppShell";
import { DentalDashboard } from "@/components/verticals/dental/DentalDashboard";
export default function Page() { return <AppShell><div className="space-y-6"><h1 className="text-2xl font-bold">DentalOps Dashboard</h1><DentalDashboard /></div></AppShell>; }
