import type { Contact } from "@/types/core";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/core/StatusBadge";
export function ContactCard({ contact }: { contact: Contact }) { return <Card className="p-4"><div className="flex items-start justify-between gap-3"><div><h3 className="font-semibold text-slate-950">{contact.name}</h3><p className="text-sm text-slate-500">{contact.email ?? contact.phone ?? contact.type}</p></div><StatusBadge status={contact.status} /></div></Card>; }
