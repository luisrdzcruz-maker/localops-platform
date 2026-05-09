import { AppShell } from "@/components/shell/AppShell";
import { ObraMobileNav } from "@/components/verticals/construction/ObraMobileNav";
import { TicketsView } from "@/components/verticals/construction/TicketsView";

export default function Page() {
  return (
    <AppShell mobileNav={<ObraMobileNav />}>
      <TicketsView />
    </AppShell>
  );
}
