// src/components/ui/ClientT.tsx
"use client";

import { useAppStore } from "@/store/useAppStore";
import { tAny, type TKey } from "@/lib/i18n";

type Props = {
  k: TKey | string;
  fallback?: string;
};

export function ClientT({ k, fallback }: Props) {
  const language = useAppStore((s) => s.language);

  const v = tAny(language, k);

  return <>{v || fallback || ""}</>;
}
