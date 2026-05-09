import Link from "next/link";
import { AppShell } from "@/components/shell/AppShell";
import { Card } from "@/components/ui/Card";
import { verticals } from "@/lib/verticals/registry";

const productNameOverrides: Record<string, string> = {
  construction: "ObraRentable OS"
};

export default function OnboardingPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Choose your first vertical</h1>
          <p className="text-slate-500">The platform can enable more than one vertical per organization later.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {verticals.map(v => {
            const productName = productNameOverrides[v.key] ?? v.commercialName;
            return (
              <Link href={`/verticals/${v.key}`} key={v.key}>
                <Card className="h-full hover:border-slate-300">
                  <div className="text-sm font-semibold text-slate-500">{productName}</div>
                  <h2 className="mt-2 text-xl font-bold">{v.name}</h2>
                  <p className="mt-2 text-sm text-slate-500">{v.description}</p>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
