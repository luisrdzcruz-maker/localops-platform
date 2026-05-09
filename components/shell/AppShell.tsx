import type { ReactNode } from "react";
import { MobileNav } from "./MobileNav";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";

export function AppShell({ children, mobileNav }: { children: ReactNode; mobileNav?: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex">
        <Sidebar />
        <main className="min-w-0 flex-1 pb-24 lg:pb-10">
          <TopBar />
          <div className="mx-auto max-w-7xl px-3 py-4 sm:px-4 sm:py-5 md:px-6 md:py-6">{children}</div>
        </main>
      </div>
      {mobileNav ?? <MobileNav />}
    </div>
  );
}
