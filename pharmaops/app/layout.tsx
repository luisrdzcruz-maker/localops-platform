import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "PharmaOps — Control operativo de tu farmacia",
  description:
    "Capa de gestión operativa, análisis y reporting para farmacias en España. Complementa Unycop, Farmatic o Nixfarma.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
