import * as React from "react";
import { ComplianceFooter } from "./ComplianceFooter";
import { MobileNav } from "./MobileNav";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

interface AppShellProps {
  pharmacyName: string;
  province?: string | null;
  userInitials?: string;
  children: React.ReactNode;
}

export function AppShell({
  pharmacyName,
  province,
  userInitials,
  children,
}: AppShellProps) {
  return (
    <div className="flex min-h-screen bg-[var(--pharmaops-bg)]">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <MobileNav pharmacyName={pharmacyName} userInitials={userInitials} />
        <Topbar
          pharmacyName={pharmacyName}
          province={province}
          userInitials={userInitials}
        />
        <main className="flex-1 overflow-x-hidden">{children}</main>
        <ComplianceFooter />
      </div>
    </div>
  );
}
