import { AppShell } from "@/components/shell/AppShell";
import { integrationProviders } from "@/lib/integrations/providers";import { IntegrationCard } from "@/components/integrations/IntegrationCard";
export default function Page() { return <AppShell><div className="space-y-6"><h1 className="text-2xl font-bold">Integrations</h1><div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{integrationProviders.map(p => <IntegrationCard key={p.key} label={p.label} description={p.description} />)}</div></div></AppShell>; }
