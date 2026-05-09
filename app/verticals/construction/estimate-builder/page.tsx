import { AppShell } from "@/components/shell/AppShell";
import { EstimateBuilder } from "@/components/verticals/construction/EstimateBuilder";import { EstimatePreview } from "@/components/verticals/construction/EstimatePreview";
export default function Page() { return <AppShell><div className="grid gap-6 lg:grid-cols-2"><EstimateBuilder /><EstimatePreview /></div></AppShell>; }
