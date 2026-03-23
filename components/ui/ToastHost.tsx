// src/components/ui/ToastHost.tsx
"use client";

import { useEffect, useState } from "react";
import { create } from "zustand";
import { useAppStore } from "@/store/useAppStore";
import { t } from "@/lib/i18n";

type ToastKind = "info" | "success" | "error";

type Toast = {
  id: string;
  message: string;
  kind: ToastKind;
  ms: number;
};

type ToastStore = {
  toasts: Toast[];
  push: (message: string, kind?: ToastKind, ms?: number) => void;
  remove: (id: string) => void;
  clear: () => void;
};

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],
  push: (message, kind = "info", ms = 1600) => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
    const t: Toast = { id, message, kind, ms };
    set({ toasts: [...get().toasts, t].slice(-3) }); // keep last 3
  },
  remove: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
  clear: () => set({ toasts: [] }),
}));

export function toast(message: string, kind: ToastKind = "info", ms = 1600) {
  useToastStore.getState().push(message, kind, ms);
}

function kindClasses(kind: ToastKind) {
  switch (kind) {
    case "success":
      return "border-emerald-500/30 bg-emerald-950/70 text-emerald-100";
    case "error":
      return "border-red-500/30 bg-red-950/70 text-red-100";
    default:
      return "border-zinc-700 bg-zinc-950/70 text-zinc-100";
  }
}

export function ToastHost() {
  const toasts = useToastStore((s) => s.toasts);

  return (
    <div
      className="pointer-events-none fixed bottom-4 left-1/2 z-50 w-[min(520px,calc(100vw-2rem))] -translate-x-1/2 space-y-2"
      aria-live="polite"
      aria-relevant="additions"
    >
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} />
      ))}
    </div>
  );
}

function ToastItem({ toast }: { toast: Toast }) {
  const language = useAppStore((s) => s.language);
  const remove = useToastStore((s) => s.remove);

  const [open, setOpen] = useState(true);

  useEffect(() => {
    const a = window.setTimeout(() => setOpen(false), toast.ms);
    const b = window.setTimeout(() => remove(toast.id), toast.ms + 180);
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
    };
  }, [toast.id, toast.ms, remove]);

  function dismiss() {
    setOpen(false);
    window.setTimeout(() => remove(toast.id), 180);
  }

  const dismissLabel = t(language, "common_dismiss");

  return (
    <div
      className={[
        "pointer-events-auto rounded-xl border px-3 py-2 text-sm shadow-lg backdrop-blur transition",
        "cursor-pointer select-none",
        kindClasses(toast.kind),
        open ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0",
      ].join(" ")}
      role={toast.kind === "error" ? "alert" : "status"}
      tabIndex={0}
      onClick={dismiss}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " " || e.key === "Escape") {
          e.preventDefault();
          dismiss();
        }
      }}
      title={dismissLabel}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">{toast.message}</div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            dismiss();
          }}
          className="shrink-0 rounded-md border border-zinc-700/60 bg-zinc-900/40 px-2 py-0.5 text-xs text-zinc-200 hover:bg-zinc-800/60"
          aria-label={dismissLabel}
          title={dismissLabel}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
