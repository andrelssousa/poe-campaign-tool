// src/components/features/TrackerPanel.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { t } from "@/lib/i18n";
import type { LString } from "@/lib/l10n";
import { l } from "@/lib/l10n";
import type { ActInfo } from "@/lib/progress";
import { countCompleted, overallProgress } from "@/lib/progress";
import { ProgressPanel } from "@/components/features/ProgressPanel";

type Reward = {
  id: string;
  type: string;
  label: string;
  choicesByClass?: Record<string, LString[]>;
  choices?: LString[];
};

type RewardMoment = {
  when: string;
  npc?: string;
  rewards: Reward[];
};

type Quest = {
  id: string;
  name: LString;
  isOptional: boolean;
  steps: LString[];
  rewards?: Reward[];
  rewardMoments?: RewardMoment[];
};

const LS_KEY = "poe_tracker_last_completed_count";

export function TrackerPanel({
  totalQuests,
  questById,
  acts,
}: {
  totalQuests: number;
  questById: Record<string, Quest>;
  acts: ActInfo[];
}) {
  const hasHydrated = useAppStore((s) => s.hasHydrated);
  const language = useAppStore((s) => s.language);
  const completedQuestIds = useAppStore((s) => s.completedQuestIds);
  const resetProgress = useAppStore((s) => s.resetProgress);

  const completedCount = useMemo(
    () => countCompleted(completedQuestIds),
    [completedQuestIds]
  );

  const overall = useMemo(() => {
    if (!hasHydrated)
      return { done: 0, total: totalQuests, percent: 0, level: 1, complete: false };
    return overallProgress(completedQuestIds, totalQuests);
  }, [completedQuestIds, totalQuests, hasHydrated]);

  // "Since last visit" delta (localStorage only; no store writes)
  const [sinceLast, setSinceLast] = useState<number>(0);

  useEffect(() => {
    if (!hasHydrated) return;

    let prev = 0;
    try {
      const raw = window.localStorage.getItem(LS_KEY);
      prev = raw ? Number(raw) : 0;
      if (!Number.isFinite(prev)) prev = 0;
    } catch {
      prev = 0;
    }

    const delta = completedCount - prev;
    setSinceLast(delta > 0 ? delta : 0);

    try {
      window.localStorage.setItem(LS_KEY, String(completedCount));
    } catch {
      // ignore
    }
  }, [completedCount, hasHydrated]);

  const completedQuestList = useMemo(() => {
    if (!hasHydrated) return [];
    const ids = Object.keys(completedQuestIds).filter((id) => completedQuestIds[id]);

    return ids
      .map((id) => questById[id])
      .filter(Boolean)
      .sort((a, b) => {
        const actA = (a as any).actId ?? 0;
        const actB = (b as any).actId ?? 0;
        if (actA !== actB) return actA - actB;
        return l(language, a.name).localeCompare(l(language, b.name));
      });
  }, [completedQuestIds, questById, hasHydrated, language]);

  if (!hasHydrated) {
    return (
      <main>
        <h1 className="text-2xl font-bold">{t(language, "tracker_title")}</h1>
        <p className="mt-1 text-zinc-400">{t(language, "tracker_subtitle")}</p>

        <div className="mt-4 rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 text-sm text-zinc-300">
          {t(language, "loading")}
        </div>
      </main>
    );
  }

  return (
    <main>
      <h1 className="text-2xl font-bold">{t(language, "tracker_title")}</h1>
      <p className="mt-1 text-zinc-400">{t(language, "tracker_subtitle")}</p>

      {/* Shared progress panel */}
      <ProgressPanel totalQuests={totalQuests} acts={acts} showActLinks={true} />

      {/* Stats */}
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
          <div className="text-sm text-zinc-400">{t(language, "tracker_completedQuests")}</div>
          <div className="mt-1 flex flex-wrap items-baseline gap-2">
            <div className="text-2xl font-bold text-zinc-100">{overall.done}</div>
            <div className="text-sm text-zinc-400">/ {overall.total}</div>
            <div className="text-sm text-zinc-500">•</div>
            <div className="text-sm font-semibold text-zinc-200">{overall.percent}%</div>
          </div>

          {sinceLast > 0 ? (
            <div className="mt-2 text-sm text-zinc-300">
              <span className="rounded-full border border-emerald-500/30 bg-emerald-950/60 px-2 py-0.5 text-xs font-semibold text-emerald-100">
                +{sinceLast} {t(language, "tracker_sinceLastVisit")}
              </span>
            </div>
          ) : null}

          <button
            onClick={() => {
              resetProgress();
              try {
                window.localStorage.setItem(LS_KEY, "0");
              } catch {}
              setSinceLast(0);
            }}
            className="mt-4 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40"
          >
            {t(language, "tracker_resetProgress")}
          </button>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
          <div className="text-sm text-zinc-400">{t(language, "tracker_overallProgress")}</div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-zinc-700 bg-zinc-900 px-2 py-0.5 text-xs text-zinc-200">
              {t(language, "common_levelShort")} {overall.level}
            </span>

            <span className="text-xs text-zinc-500">
              {t(language, "tracker_xp")} {overall.done}/{overall.total}
            </span>
          </div>

          <div className="mt-3 text-sm text-zinc-400">
            {overall.complete ? (
              <span className="rounded-full border border-emerald-500/30 bg-emerald-950/60 px-2 py-0.5 text-xs font-semibold text-emerald-100">
                ✓ {t(language, "common_campaignComplete")}
              </span>
            ) : (
              <span className="text-zinc-500">{t(language, "common_xpStyle")}</span>
            )}
          </div>
        </div>
      </div>

      {/* Completed quests list */}
      <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
        <div className="mb-2 text-sm font-semibold text-zinc-200">
          {t(language, "tracker_completedQuests")}
        </div>

        {completedQuestList.length ? (
          <ul className="space-y-1 text-sm text-zinc-300">
            {completedQuestList.slice(0, 80).map((q) => (
              <li key={q.id} className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span>
                <span className="truncate">{l(language, q.name)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-sm text-zinc-500">{t(language, "noMatches")}</div>
        )}
      </div>
    </main>
  );
}
