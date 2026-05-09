import { AppShell } from "@/components/shell/AppShell";
import { InicioDashboard } from "@/components/verticals/construction/InicioDashboard";
import { ObraMobileNav } from "@/components/verticals/construction/ObraMobileNav";

export default function Page() {
  return (
    <AppShell mobileNav={<ObraMobileNav />}>
      <InicioDashboard />
    </AppShell>
  );
}
