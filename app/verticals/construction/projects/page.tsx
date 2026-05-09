import Link from "next/link";
import { AppShell } from "@/components/shell/AppShell";
import { ObrasFilterableList } from "@/components/verticals/construction/ObrasFilterableList";
import { ObraMobileNav } from "@/components/verticals/construction/ObraMobileNav";
import { PlusIcon } from "@/components/verticals/construction/icons";
import { ObrasHeader } from "@/components/verticals/construction/ObrasHeader";

export default function Page() {
  return (
    <AppShell mobileNav={<ObraMobileNav />}>
      <div className="space-y-5">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <ObrasHeader />
          <Link
            href="/verticals/construction/projects/new"
            className="inline-flex items-center gap-1.5 rounded-xl bg-obra-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-obra-600"
          >
            <PlusIcon className="h-4 w-4" />
            Nueva obra
          </Link>
        </header>
        <ObrasFilterableList />
      </div>
    </AppShell>
  );
}
