import { AppShell } from "@/components/app/AppShell";
import { getInitials, resolveDemoSession } from "@/lib/demo/session";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = resolveDemoSession();

  return (
    <AppShell
      pharmacyName={session.pharmacy.name}
      province={session.pharmacy.province}
      userInitials={getInitials(session.user.fullName)}
    >
      {children}
    </AppShell>
  );
}
