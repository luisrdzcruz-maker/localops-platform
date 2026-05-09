"use client";

import { useProjects } from "@/lib/store/sessionStore";

export function ObrasHeader() {
  const projects = useProjects();
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-obra-600">ObraRentable OS</p>
      <h1 className="mt-1 text-2xl font-bold text-slate-950 sm:text-3xl">Obras</h1>
      <p className="mt-1 text-sm text-slate-500">{projects.length} obras registradas en tu sesión.</p>
    </div>
  );
}
