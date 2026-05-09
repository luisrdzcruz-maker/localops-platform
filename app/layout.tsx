import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LocalOps Platform",
  description: "Modular CRM / Operations OS for micro-SMEs"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
