import { AppShell } from "@/components/shell/AppShell";
import { ObraMobileNav } from "@/components/verticals/construction/ObraMobileNav";
import { TicketReviewView } from "@/components/verticals/construction/TicketReviewView";
import { constructionTickets } from "@/lib/mock/construction";

export function generateStaticParams() {
  return constructionTickets.map(t => ({ ticketId: t.id }));
}

export const dynamicParams = true;

export default async function Page({ params }: { params: Promise<{ ticketId: string }> }) {
  const { ticketId } = await params;
  return (
    <AppShell mobileNav={<ObraMobileNav />}>
      <TicketReviewView ticketId={ticketId} />
    </AppShell>
  );
}
