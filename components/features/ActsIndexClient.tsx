// src/components/features/ActsIndexClient.tsx
"use client";

import { useMemo } from "react";
import type { ActInfo } from "@/lib/progress";
import { ProgressPanel } from "@/components/features/ProgressPanel";

export function ActsIndexClient({
  acts,
  totalQuests,
}: {
  acts: any[];
  totalQuests: number;
}) {
  const actsNormalized: ActInfo[] = useMemo(() => {
    return (acts ?? []).map((a: any) => ({
      id: Number(a.id),
      name: String(a.name ?? `Act ${a.id}`),
      slug: a.slug ? String(a.slug) : undefined,
      questsInOrder: Array.isArray(a.questsInOrder) ? a.questsInOrder : [],
    }));
  }, [acts]);

  return (
    <ProgressPanel
      totalQuests={totalQuests}
      acts={actsNormalized}
      showActLinks={true}
    />
  );
}
