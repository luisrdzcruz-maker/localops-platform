import { AppShell } from "@/components/shell/AppShell";
import { ContactList } from "@/components/contacts/ContactList";
export default function Page() { return <AppShell><div className="space-y-6"><h1 className="text-2xl font-bold">Contacts</h1><ContactList /></div></AppShell>; }
