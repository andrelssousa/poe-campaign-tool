// src/components/features/ActHeaderProgress.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { t } from "@/lib/i18n";
import { levelFromPercent, pct } from "@/lib/progress";

export function ActHeaderProgress({
  actName,
  questIdsInOrder,
}: {
  actName: string;
  questIdsInOrder: string[];
}) {
  const language = useAppStore((s) => s.language);
  const hasHydrated = useAppStore((s) => s.hasHydrated);
  const completedQuestIds = useAppStore((s) => s.completedQuestIds);

  const { done, total, percent, complete, level } = useMemo(() => {
    const total = questIdsInOrder?.length ?? 0;

    let done = 0;
    for (const qid of questIdsInOrder ?? []) {
      if (completedQuestIds[qid]) done += 1;
    }

    const percent = hasHydrated ? pct(done, total) : 0;
    const complete = hasHydrated && total > 0 && done >= total;
    const level = levelFromPercent(percent);

    return { done: hasHydrated ? done : 0, total, percent, complete, level };
  }, [questIdsInOrder, completedQuestIds, hasHydrated]);

  // Animated glow when progress increases
  const prevDoneRef = useRef<number>(done);
  const [glow, setGlow] = useState(false);

  useEffect(() => {
    if (!hasHydrated) return;

    const prev = prevDoneRef.current;
    if (done > prev) {
      setGlow(true);
      const h = window.setTimeout(() => setGlow(false), 900);
      prevDoneRef.current = done;
      return () => window.clearTimeout(h);
    }

    prevDoneRef.current = done;
  }, [done, hasHydrated]);

  return (
    <div
      className={[
        "sticky top-0 z-40 mb-4 rounded-2xl border border-zinc-800 bg-zinc-950/85 p-3 backdrop-blur",
        glow ? "stl-progress-glow" : "",
      ].join(" ")}
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-sm text-zinc-300">
          <span className="text-zinc-500">{t(language, "common_progress")}:</span>{" "}
          <span className="font-semibold text-zinc-100">
            {done}/{total}
          </span>{" "}
          <span className="text-zinc-600">•</span>{" "}
          <span className="font-semibold text-zinc-100">{percent}%</span>{" "}
          <span className="text-zinc-600">•</span>{" "}
          <span className="text-zinc-400">{actName}</span>
        </div>

        <div className="inline-flex items-center gap-2">
          <span className="rounded-full border border-zinc-700 bg-zinc-900 px-2 py-0.5 text-xs text-zinc-200">
            {t(language, "common_levelShort")} {level}
          </span>

          {complete ? (
            <span className="rounded-full border border-emerald-500/30 bg-emerald-950/60 px-2 py-0.5 text-xs font-semibold text-emerald-100">
              ✓ {t(language, "common_actComplete")}
            </span>
          ) : null}
        </div>
      </div>

      <div
        className="mt-2 h-2 w-full overflow-hidden rounded-full border border-zinc-800 bg-zinc-900"
        aria-label={t(language, "common_actProgressAria")}
      >
        <div
          className={[
            "h-full rounded-full bg-amber-500/80 transition-[width] duration-500",
            glow ? "stl-progress-fill-glow" : "",
          ].join(" ")}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
