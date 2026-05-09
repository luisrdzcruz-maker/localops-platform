import { AppShell } from "@/components/shell/AppShell";
import { DocumentList } from "@/components/documents/DocumentList";
export default function Page() { return <AppShell><div className="space-y-6"><h1 className="text-2xl font-bold">Documents</h1><DocumentList /></div></AppShell>; }
