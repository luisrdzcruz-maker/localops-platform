import { AppShell } from "@/components/shell/AppShell";
import { ObraMobileNav } from "@/components/verticals/construction/ObraMobileNav";
import { ActionsView } from "@/components/verticals/construction/ActionsView";

export default function Page() {
  return (
    <AppShell mobileNav={<ObraMobileNav />}>
      <ActionsView />
    </AppShell>
  );
}
