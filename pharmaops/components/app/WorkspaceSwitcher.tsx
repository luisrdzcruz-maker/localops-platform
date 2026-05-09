"use client";

import { Building2, ChevronDown } from "lucide-react";
import * as React from "react";

interface WorkspaceSwitcherProps {
  pharmacyName: string;
  province?: string | null;
}

export function WorkspaceSwitcher({
  pharmacyName,
  province,
}: WorkspaceSwitcherProps) {
  // MVP: single workspace. The chevron is decorative — when multi-workspace
  // arrives, this becomes a popover trigger.
  return (
    <button
      type="button"
      className="flex items-center gap-2 rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-left text-sm shadow-card hover:bg-ink-50"
      aria-label="Cambiar de farmacia"
      title="MVP: una sola farmacia"
    >
      <span className="flex h-7 w-7 items-center justify-center rounded-md bg-brand-50 text-brand-700">
        <Building2 className="h-4 w-4" />
      </span>
      <span className="flex flex-col leading-tight">
        <span className="font-medium text-ink-900">{pharmacyName}</span>
        {province ? (
          <span className="text-[11px] text-ink-500">{province}</span>
        ) : null}
      </span>
      <ChevronDown className="ml-1 h-4 w-4 text-ink-400" />
    </button>
  );
}
