import { contacts } from "@/lib/mock/core";
import { ContactCard } from "./ContactCard";
export function ContactList() { return <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{contacts.map(contact => <ContactCard key={contact.id} contact={contact} />)}</div>; }
