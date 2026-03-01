// components\ui\HydrationGate.tsx
"use client";

import React from "react";
import { useAppStore } from "@/store/useAppStore";

export function HydrationGate({ children }: { children: React.ReactNode }) {
  const hasHydrated = useAppStore((s) => s.hasHydrated);

  // Avoid EN→PT-BR flash by not rendering content until Zustand is hydrated.
  if (!hasHydrated) {
  return (
    <div className="animate-pulse">
      <div className="mb-4 rounded-2xl border border-zinc-800 bg-zinc-950/80 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="h-5 w-40 rounded bg-zinc-800/70" />
          <div className="flex items-center gap-2">
            <div className="h-8 w-20 rounded bg-zinc-800/60" />
            <div className="h-8 w-40 rounded bg-zinc-800/60" />
            <div className="h-9 w-28 rounded bg-zinc-800/60" />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
        <div className="h-7 w-64 rounded bg-zinc-800/60" />
        <div className="mt-3 h-4 w-[min(540px,90%)] rounded bg-zinc-800/50" />
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="h-24 rounded-xl border border-zinc-800 bg-zinc-900/40" />
          <div className="h-24 rounded-xl border border-zinc-800 bg-zinc-900/40" />
          <div className="h-24 rounded-xl border border-zinc-800 bg-zinc-900/40" />
        </div>
      </div>
    </div>
  );
}

  return <>{children}</>;
}
