import { AppShell } from "@/components/shell/AppShell";
import { ObraMobileNav } from "@/components/verticals/construction/ObraMobileNav";
import { ProfitabilityView } from "@/components/verticals/construction/ProfitabilityView";

export default function Page() {
  return (
    <AppShell mobileNav={<ObraMobileNav />}>
      <ProfitabilityView />
    </AppShell>
  );
}
