// src/components/features/ProgressPanel.tsx
"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useAppStore } from "@/store/useAppStore";
import { t } from "@/lib/i18n";
import type { ActInfo } from "@/lib/progress";
import { actProgressMap, overallProgress } from "@/lib/progress";

type Props = {
  titleKey?: string; // optional header label
  totalQuests: number;
  acts: ActInfo[];
  showActLinks?: boolean; // show "open act" cards with link
  dense?: boolean; // smaller padding
};

export function ProgressPanel({
  titleKey,
  totalQuests,
  acts,
  showActLinks = true,
  dense = false,
}: Props) {
  const language = useAppStore((s) => s.language);
  const completedQuestIds = useAppStore((s) => s.completedQuestIds);
  const hasHydrated = useAppStore((s) => s.hasHydrated);

  const actsSorted = useMemo(() => {
    return [...(acts ?? [])].sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
  }, [acts]);

  const overall = useMemo(() => {
    if (!hasHydrated) return { done: 0, total: totalQuests, percent: 0, level: 1, complete: false };
    return overallProgress(completedQuestIds, totalQuests);
  }, [completedQuestIds, totalQuests, hasHydrated]);

  const actProg = useMemo(() => {
    if (!hasHydrated) return new Map<number, { done: number; total: number; percent: number; complete: boolean }>();
    return actProgressMap(actsSorted, completedQuestIds);
  }, [actsSorted, completedQuestIds, hasHydrated]);

  return (
    <section className={dense ? "" : "mt-4"}>
      {titleKey ? (
        <div className="mb-2 text-sm font-semibold text-zinc-200">
          {t(language, titleKey as any)}
        </div>
      ) : null}

      {/* Overall */}
      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
          <div className="text-zinc-300">
            {overall.complete ? (
              <span className="inline-flex items-center gap-2">
                <span className="rounded-full border border-emerald-500/30 bg-emerald-950/60 px-2 py-0.5 text-xs font-semibold text-emerald-100">
                  ✓ {t(language, "common_campaignComplete")}
                </span>
                <span className="text-zinc-400">
                  {t(language, "common_progress")}:{" "}
                  <span className="font-semibold text-zinc-100">
                    {overall.done}/{overall.total}
                  </span>
                </span>
              </span>
            ) : (
              <>
                {t(language, "common_progress")}:{" "}
                <span className="font-semibold text-zinc-100">
                  {overall.done}/{overall.total}
                </span>{" "}
                <span className="text-zinc-500">•</span>{" "}
                <span className="font-semibold text-zinc-100">{overall.percent}%</span>
              </>
            )}
          </div>

          <div className="inline-flex items-center gap-2">
            <span className="rounded-full border border-zinc-700 bg-zinc-900 px-2 py-0.5 text-xs text-zinc-200">
              {t(language, "common_levelShort")} {overall.level}
            </span>
            <span className="text-xs text-zinc-500">{t(language, "common_xpStyle")}</span>
          </div>
        </div>

        <div
          className="mt-2 h-2 w-full overflow-hidden rounded-full border border-zinc-800 bg-zinc-900"
          aria-label={t(language, "common_campaignProgressAria")}
        >
          <div
            className="h-full rounded-full bg-amber-500/80 transition-[width] duration-500"
            style={{ width: `${overall.percent}%` }}
          />
        </div>

        {/* Acts */}
        {actsSorted.length ? (
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {actsSorted.map((act) => {
              const p = actProg.get(act.id) ?? { done: 0, total: 0, percent: 0, complete: false };

              const Card = (
                <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-3">
                  <div className="flex items-center justify-between gap-2 text-sm">
                    <div className="min-w-0">
                      <div className="truncate font-semibold text-zinc-100">
                        {act.name ?? `Act ${act.id}`}
                      </div>
                      <div className="text-xs text-zinc-500">
                        {t(language, "common_progress")}:{" "}
                        <span className="text-zinc-200">
                          {p.done}/{p.total}
                        </span>{" "}
                        <span className="text-zinc-500">•</span>{" "}
                        <span className="text-zinc-200">{p.percent}%</span>
                      </div>
                    </div>

                    {p.complete ? (
                      <span className="shrink-0 rounded-full border border-emerald-500/30 bg-emerald-950/60 px-2 py-0.5 text-xs font-semibold text-emerald-100">
                        ✓ {t(language, "common_complete")}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full border border-zinc-800 bg-zinc-900">
                    <div
                      className="h-full rounded-full bg-amber-500/70 transition-[width] duration-500"
                      style={{ width: `${p.percent}%` }}
                    />
                  </div>
                </div>
              );

              if (!showActLinks) return <div key={act.id}>{Card}</div>;

              return (
                <Link
                  key={act.id}
                  href={`/acts/${act.id}`}
                  className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50 rounded-xl"
                >
                  {Card}
                </Link>
              );
            })}
          </div>
        ) : null}
      </div>
    </section>
  );
}
