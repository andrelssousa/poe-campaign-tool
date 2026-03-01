// src/components/features/ActQuestList.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { Checkbox } from "@/components/ui/Checkbox";
import { t, type Language } from "@/lib/i18n";
import { l, type LString } from "@/lib/l10n";

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

function prettyType(tpe: string) {
  return tpe.replaceAll("_", " ");
}

function rewardTypeLabel(lang: Language, tpe: string) {
  switch (tpe) {
    case "gem_choice":
      return t(lang, "rewards_badge_gem_choice");
    case "flask_choice":
      return t(lang, "rewards_badge_flask_choice");
    case "book_of_skill":
      return t(lang, "rewards_badge_book_of_skill");
    default:
      return prettyType(tpe);
  }
}

function getAllRewards(q: Quest): Reward[] {
  if (Array.isArray(q.rewardMoments)) {
    return q.rewardMoments.flatMap((m) => m.rewards ?? []);
  }
  return q.rewards ?? [];
}

// XP-style: deterministic, no extra files needed.
// Base 10 XP, +5 if optional, +5 if has any rewards, +5 if has Book of Skill.
// (You can tweak later without breaking anything.)
function questXP(q: Quest): number {
  const all = getAllRewards(q);
  const hasAnyRewards = all.length > 0;
  const hasBook = all.some((r) => r.type === "book_of_skill");

  let xp = 10;
  if (q.isOptional) xp += 5;
  if (hasAnyRewards) xp += 5;
  if (hasBook) xp += 5;
  return xp;
}

function RewardCard({
  r,
  selectedClass,
  language,
}: {
  r: Reward;
  selectedClass: string;
  language: Language;
}) {
  const isGemChoice = r.type === "gem_choice";
  const isFlaskChoice = r.type === "flask_choice";
  const gemList = r.choicesByClass?.[selectedClass] ?? [];
  const choiceList = r.choices ?? [];

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="text-sm font-semibold text-zinc-100">
          {l(language, r.label)}
        </div>
        <div className="text-xs text-zinc-500">
          {rewardTypeLabel(language, r.type)}
        </div>
      </div>

      {isGemChoice ? (
        gemList.length ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {gemList.map((g, idx) => (
              <span
                key={`${r.id}:gem:${idx}`}
                className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs text-zinc-200"
              >
                {l(language, g)}
              </span>
            ))}
          </div>
        ) : (
          <div className="mt-2 text-xs text-zinc-500">
            {t(language, "reward_noGemListForClass_prefix")}{" "}
            <span className="text-zinc-300">{selectedClass}</span>
          </div>
        )
      ) : isFlaskChoice ? (
        choiceList.length ? (
          <div className="mt-2 flex flex-wrap gap-2">
            {choiceList.map((c, idx) => (
              <span
                key={`${r.id}:flask:${idx}`}
                className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs text-zinc-200"
              >
                {l(language, c)}
              </span>
            ))}
          </div>
        ) : null
      ) : (
        <div className="mt-2 text-xs text-zinc-400">
          {t(language, "reward_grantedOnCompletion")}
        </div>
      )}
    </div>
  );
}

export function ActQuestList({
  questIdsInOrder,
  questById,
}: {
  questIdsInOrder: string[];
  questById: Record<string, Quest>;
}) {
  const hasHydrated = useAppStore((s) => s.hasHydrated);
  const language = useAppStore((s) => s.language);
  const searchParams = useSearchParams();
  const [highlightQuestId, setHighlightQuestId] = useState<string | null>(null);

  const selectedClass = useAppStore((s) => s.selectedClass);
  const showUncompletedOnly = useAppStore((s) => s.showUncompletedOnly);
  const toggleShowUncompletedOnly = useAppStore(
    (s) => s.toggleShowUncompletedOnly
  );

  const completedQuestIds = useAppStore((s) => s.completedQuestIds);
  const toggleQuestCompleted = useAppStore((s) => s.toggleQuestCompleted);

  const isCompleted = (questId: string) => !!completedQuestIds[questId];

  // --- delta glow: when a quest changes to completed, flash it briefly ---
  const prevCompletedRef = useRef<Record<string, boolean>>({});
  const [flashQuestId, setFlashQuestId] = useState<string | null>(null);

  useEffect(() => {
    if (!hasHydrated) return;

    const prev = prevCompletedRef.current;
    let newlyCompleted: string | null = null;

    // find a quest that flipped false -> true
    for (const qid of questIdsInOrder) {
      const before = !!prev[qid];
      const now = !!completedQuestIds[qid];
      if (!before && now) {
        newlyCompleted = qid;
        break;
      }
    }

    prevCompletedRef.current = { ...completedQuestIds };

    if (newlyCompleted) {
      setFlashQuestId(newlyCompleted);
      const h = window.setTimeout(() => setFlashQuestId(null), 900);
      return () => window.clearTimeout(h);
    }
  }, [completedQuestIds, hasHydrated, questIdsInOrder]);

  // --- scroll-to quest from rewards page (questId=...) ---
  useEffect(() => {
    if (!hasHydrated) return;

    const qid = searchParams.get("questId");
    if (!qid) return;

    const handle = window.setTimeout(() => {
      const el = document.getElementById(`quest-${qid}`);
      if (!el) return;

      // With TopBar + sticky act header, use more scroll margin
      el.scrollIntoView({ behavior: "smooth", block: "start" });
      setHighlightQuestId(qid);

      window.setTimeout(() => setHighlightQuestId(null), 1200);
    }, 50);

    return () => window.clearTimeout(handle);
  }, [hasHydrated, searchParams]);

  const quests = useMemo(() => {
    const items = questIdsInOrder.map((id) => questById[id]).filter(Boolean);

    if (!hasHydrated) return items;

    if (!showUncompletedOnly) return items;
    return items.filter((q) => !isCompleted(q.id));
  }, [
    questIdsInOrder,
    questById,
    showUncompletedOnly,
    hasHydrated,
    completedQuestIds,
  ]);

  const passivePointsEarned = useMemo(() => {
    if (!hasHydrated) return 0;

    let total = 0;
    for (const qid of questIdsInOrder) {
      const q = questById[qid];
      if (!q) continue;
      if (!isCompleted(q.id)) continue;

      const allRewards = getAllRewards(q);
      const hasBookOfSkill = allRewards.some((r) => r.type === "book_of_skill");
      if (hasBookOfSkill) total += 1;
    }
    return total;
  }, [questIdsInOrder, questById, hasHydrated, completedQuestIds]);

  const xpEarned = useMemo(() => {
    if (!hasHydrated) return 0;

    let total = 0;
    for (const qid of questIdsInOrder) {
      const q = questById[qid];
      if (!q) continue;
      if (!isCompleted(q.id)) continue;
      total += questXP(q);
    }
    return total;
  }, [questIdsInOrder, questById, hasHydrated, completedQuestIds]);

  const xpTotal = useMemo(() => {
    let total = 0;
    for (const qid of questIdsInOrder) {
      const q = questById[qid];
      if (!q) continue;
      total += questXP(q);
    }
    return total;
  }, [questIdsInOrder, questById]);

  if (!hasHydrated) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 text-sm text-zinc-300">
        {t(language, "loading")}
      </div>
    );
  }

  return (
    <>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-zinc-400">
          {t(language, "passivePoints")}:{" "}
          <span className="font-semibold text-zinc-200">
            {passivePointsEarned}
          </span>

          <span className="mx-2 text-zinc-700">•</span>

          <span className="text-zinc-500">XP:</span>{" "}
          <span className="font-semibold text-zinc-200">
            {xpEarned}/{xpTotal}
          </span>
        </div>

        <Checkbox
          checked={showUncompletedOnly}
          onChange={() => toggleShowUncompletedOnly()}
          label={t(language, "showUncompletedOnly")}
        />
      </div>

      <div className="space-y-3">
        {quests.map((quest) => {
          const done = isCompleted(quest.id);
          const rewardCount = getAllRewards(quest).length;
          const xp = questXP(quest);

          return (
            <div
              key={quest.id}
              id={`quest-${quest.id}`}
              className={[
                // bigger scroll margin because we have sticky act header now
                "scroll-mt-40 rounded-2xl border p-4 transition",
                highlightQuestId === quest.id ? "ring-2 ring-amber-500/60" : "",
                flashQuestId === quest.id ? "stl-quest-flash" : "",
                done
                  ? "border-zinc-800 bg-zinc-950/40 opacity-80"
                  : "border-zinc-800 bg-zinc-950/70",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <Checkbox
                      checked={done}
                      onChange={() => toggleQuestCompleted(quest.id)}
                    />

                    <div className="truncate font-semibold text-white">
                      {l(language, quest.name)}
                      {quest.isOptional && (
                        <span className="ml-2 rounded bg-zinc-800 px-2 py-0.5 text-xs text-zinc-200">
                          {t(language, "act_optional")}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Steps */}
                  {quest.steps?.length ? (
                    <ol className="mt-3 space-y-1 text-sm text-zinc-300">
                      {quest.steps.map((s, idx) => (
                        <li key={idx} className="flex gap-2">
                          <span className="text-zinc-500">{idx + 1}.</span>
                          <span>{l(language, s)}</span>
                        </li>
                      ))}
                    </ol>
                  ) : (
                    <div className="mt-3 text-sm text-zinc-500">
                      {t(language, "act_noSteps")}
                    </div>
                  )}
                </div>

                {/* Right-side: rewards + XP + complete badge */}
                <div className="shrink-0 text-right text-xs text-zinc-500">
                  <div>
                    {rewardCount} {t(language, "rewards_countLabel")}
                  </div>

                  <div className="mt-1 inline-flex items-center gap-2">
                    <span className="rounded-full border border-zinc-700 bg-zinc-900 px-2 py-0.5 text-[11px] text-zinc-200">
                      XP {done ? `+${xp}` : xp}
                    </span>

                    {done ? (
                      <span className="rounded-full border border-emerald-500/30 bg-emerald-950/60 px-2 py-0.5 text-[11px] font-semibold text-emerald-100">
                        ✓ {t(language, "common_complete")}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Rewards */}
              {Array.isArray(quest.rewardMoments) ? (
                <div className="mt-4 space-y-4">
                  {quest.rewardMoments.map((m, idx) => (
                    <div key={idx} className="space-y-2">
                      <div className="text-xs font-semibold tracking-wide text-zinc-400">
                        {m.when}
                        {m.npc ? (
                          <span className="text-zinc-500"> • {m.npc}</span>
                        ) : null}
                      </div>

                      <div className="space-y-3">
                        {(m.rewards ?? []).map((r) => (
                          <RewardCard
                            key={r.id}
                            r={r}
                            selectedClass={selectedClass}
                            language={language}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : quest.rewards?.length ? (
                <div className="mt-4 space-y-3">
                  {quest.rewards.map((r) => (
                    <RewardCard
                      key={r.id}
                      r={r}
                      selectedClass={selectedClass}
                      language={language}
                    />
                  ))}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </>
  );
}
