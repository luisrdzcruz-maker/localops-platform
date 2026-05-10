"use client";

import { Bell, Search } from "lucide-react";
import { DemoModePill } from "./DemoModePill";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";

interface TopbarProps {
  pharmacyName: string;
  province?: string | null;
  userInitials?: string;
}

export function Topbar({
  pharmacyName,
  province,
  userInitials = "OD",
}: TopbarProps) {
  return (
    <header className="hidden items-center gap-3 border-b border-ink-200 bg-white px-4 py-3 md:flex md:px-6">
      <WorkspaceSwitcher pharmacyName={pharmacyName} province={province} />

      <div className="ml-auto flex items-center gap-2">
        <DemoModePill className="hidden md:inline-flex" />
        <div className="hidden items-center gap-2 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-sm text-ink-500 shadow-card md:flex">
          <Search className="h-4 w-4 text-ink-400" />
          <input
            type="search"
            placeholder="Buscar..."
            className="w-48 bg-transparent text-ink-700 placeholder:text-ink-400 focus:outline-none"
            aria-label="Buscar"
          />
        </div>

        <button
          type="button"
          aria-label="Notificaciones"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-ink-200 bg-white text-ink-500 shadow-card transition hover:bg-ink-50 hover:text-ink-700"
        >
          <Bell className="h-4 w-4" />
        </button>

        <div
          aria-label="Tu cuenta"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-sm font-semibold text-white"
        >
          {userInitials}
        </div>
      </div>
    </header>
  );
}
