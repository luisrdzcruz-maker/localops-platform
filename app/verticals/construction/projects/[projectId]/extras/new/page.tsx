import { AppShell } from "@/components/shell/AppShell";
import { ObraMobileNav } from "@/components/verticals/construction/ObraMobileNav";
import { ExtraFormView } from "@/components/verticals/construction/forms/ExtraFormView";
import { constructionProjects } from "@/lib/mock/construction";

export function generateStaticParams() {
  return constructionProjects.map(p => ({ projectId: p.id }));
}

export const dynamicParams = true;

export default async function Page({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  return (
    <AppShell mobileNav={<ObraMobileNav />}>
      <ExtraFormView projectId={projectId} />
    </AppShell>
  );
}
