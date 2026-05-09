import { AppShell } from "@/components/shell/AppShell";
import { ObraMobileNav } from "@/components/verticals/construction/ObraMobileNav";
import { InvoiceFormView } from "@/components/verticals/construction/forms/InvoiceFormView";

export default function Page() {
  return (
    <AppShell mobileNav={<ObraMobileNav />}>
      <InvoiceFormView />
    </AppShell>
  );
}
