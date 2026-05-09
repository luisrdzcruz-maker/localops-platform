import { AppShell } from "@/components/shell/AppShell";
import { ObraMobileNav } from "@/components/verticals/construction/ObraMobileNav";
import { CobrosPendientesView } from "@/components/verticals/construction/CobrosPendientesView";

export default function Page() {
  return (
    <AppShell mobileNav={<ObraMobileNav />}>
      <CobrosPendientesView />
    </AppShell>
  );
}
