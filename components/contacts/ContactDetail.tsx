import type { Contact } from "@/types/core";
import { EntityDetailPanel } from "@/components/core/EntityDetailPanel";
export function ContactDetail({ contact }: { contact: Contact }) { return <EntityDetailPanel title={contact.name}><dl className="space-y-2 text-sm"><div><dt className="text-slate-500">Type</dt><dd>{contact.type}</dd></div><div><dt className="text-slate-500">Status</dt><dd>{contact.status}</dd></div></dl></EntityDetailPanel>; }
