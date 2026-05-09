import { AppShell } from "@/components/shell/AppShell";
import { ObraMobileNav } from "@/components/verticals/construction/ObraMobileNav";
import { ExportView } from "@/components/verticals/construction/ExportView";

export default function Page() {
  return (
    <AppShell mobileNav={<ObraMobileNav />}>
      <ExportView />
    </AppShell>
  );
}
