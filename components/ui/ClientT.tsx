// src/components/ui/ClientT.tsx
"use client";

import { useAppStore } from "@/store/useAppStore";
import { t, type TKey } from "@/lib/i18n";

export function ClientT({ k, fallback }: { k: TKey; fallback?: string }) {
  const language = useAppStore((s) => s.language);
  const v = t(language, k);
  return <>{v || fallback || ""}</>;
}
