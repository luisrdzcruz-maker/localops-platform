import { AppShell } from "@/components/shell/AppShell";
import { ObraMobileNav } from "@/components/verticals/construction/ObraMobileNav";
import { ExpenseFormView } from "@/components/verticals/construction/forms/ExpenseFormView";
import { constructionProjects } from "@/lib/mock/construction";

export function generateStaticParams() {
  return constructionProjects.map(p => ({ projectId: p.id }));
}

export const dynamicParams = true;

export default async function Page({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return (
    <AppShell mobileNav={<ObraMobileNav />}>
      <ExpenseFormView projectId={projectId} />
    </AppShell>
  );
}
