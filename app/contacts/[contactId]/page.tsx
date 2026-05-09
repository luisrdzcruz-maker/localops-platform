import { AppShell } from "@/components/shell/AppShell";
import { contacts } from "@/lib/mock/core";import { ContactDetail } from "@/components/contacts/ContactDetail";
export default function Page({ params }: { params: { contactId: string } }) { const contact = contacts.find(c => c.id === params.contactId) ?? contacts[0]; return <AppShell><ContactDetail contact={contact} /></AppShell>; }
