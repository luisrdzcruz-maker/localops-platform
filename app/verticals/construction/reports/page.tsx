import { AppShell } from "@/components/shell/AppShell";
import { ObraMobileNav } from "@/components/verticals/construction/ObraMobileNav";
import { ReportsView } from "@/components/verticals/construction/ReportsView";

export default function Page() {
  return (
    <AppShell mobileNav={<ObraMobileNav />}>
      <ReportsView />
    </AppShell>
  );
}
