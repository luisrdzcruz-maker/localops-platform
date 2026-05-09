import type { ReactNode } from "react";
import { ObraStoreProvider } from "@/lib/store/sessionStore";

export default function ConstructionLayout({ children }: { children: ReactNode }) {
  return <ObraStoreProvider>{children}</ObraStoreProvider>;
}
