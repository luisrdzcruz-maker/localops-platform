import { AppShell } from "@/components/shell/AppShell";
import { ObraMobileNav } from "@/components/verticals/construction/ObraMobileNav";
import { PaymentFormView } from "@/components/verticals/construction/forms/PaymentFormView";
import { constructionProjects } from "@/lib/mock/construction";

export function generateStaticParams() {
  return constructionProjects.map(p => ({ projectId: p.id }));
}

export const dynamicParams = true;

export default async function Page({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return (
    <AppShell mobileNav={<ObraMobileNav />}>
      <PaymentFormView projectId={projectId} />
    </AppShell>
  );
}
