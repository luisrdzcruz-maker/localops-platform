import { AppShell } from "@/components/shell/AppShell";
import { ObraMobileNav } from "@/components/verticals/construction/ObraMobileNav";
import { InvoicesView } from "@/components/verticals/construction/InvoicesView";

export default function Page() {
  return (
    <AppShell mobileNav={<ObraMobileNav />}>
      <InvoicesView />
    </AppShell>
  );
}
