// src/components/features/GemsBrowser.tsx
"use client";

import { useMemo, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { t, type Language } from "@/lib/i18n";
import { type LString, l } from "@/lib/l10n";

type RewardChoices = {
  gems?: Record<string, LString>;
  flasks?: Record<string, LString>;
};

type Props = {
  gemToQuestsByClass: Record<string, Record<string, string[]>>;
  questById: Record<string, { id: string; name: string | LString }>;
  rewardChoices: RewardChoices;
};

function toTitleCase(s: string) {
  return s
    .split(" ")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

function gemLabel(language: Language, rewardChoices: RewardChoices | undefined, gemKey: string) {
  const entry = rewardChoices?.gems?.[gemKey];
  if (entry) return l(language, entry);
  return toTitleCase(gemKey);
}

export function GemsBrowser({ gemToQuestsByClass, questById, rewardChoices }: Props) {
  const selectedClass = useAppStore((s) => s.selectedClass);
  const language = useAppStore((s) => s.language);
  const [q, setQ] = useState("");

  const classIndex = gemToQuestsByClass[selectedClass] || {};
  const allGemKeys = Object.keys(classIndex);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    const keys = allGemKeys.slice().sort();

    if (!query) return keys;

    return keys.filter((k) => {
      if (k.includes(query)) return true;
      const label = gemLabel(language, rewardChoices, k).toLowerCase();
      return label.includes(query);
    });
  }, [q, allGemKeys, language, rewardChoices]);

  return (
    <>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-zinc-400">
          {t(language, "showingGemsFor")}{" "}
          <span className="font-semibold text-zinc-200">{selectedClass}</span> •{" "}
          <span className="font-semibold text-zinc-200">{filtered.length}</span>{" "}
          {t(language, "gemsCountLabel")}
        </div>

        <div className="flex w-full max-w-sm items-center gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t(language, "searchGemsPlaceholder")}
            aria-label={t(language, "searchGemsPlaceholder")}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/40"
          />

          {q.trim() ? (
            <button
              type="button"
              onClick={() => setQ("")}
              className="shrink-0 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40"
              title={t(language, "common_clear")}
            >
              {t(language, "common_clear")}
            </button>
          ) : null}
        </div>
      </div>

      {allGemKeys.length === 0 ? (
        <div className="mt-4 rounded-xl border border-zinc-700 bg-zinc-800/60 p-4 text-sm text-zinc-200">
          <div className="font-semibold text-zinc-100">
            {t(language, "noGemsIndexedTitle")}
          </div>
          <div className="mt-1 text-zinc-300">
            {t(language, "noGemsIndexedHint")}{" "}
            <code className="text-amber-400">choicesByClass</code>{" "}
            {t(language, "noGemsIndexedHint2")}
          </div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-4 text-sm text-zinc-400">{t(language, "noMatches")}</div>
      ) : (
        <div className="mt-4 space-y-3">
          {filtered.slice(0, 200).map((gemKey) => (
            <div key={gemKey} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
              <div className="font-semibold">{gemLabel(language, rewardChoices, gemKey)}</div>

              <div className="mt-2 flex flex-wrap gap-2">
                {(classIndex[gemKey] || []).map((qid) => (
                  <span
                    key={qid}
                    className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs text-zinc-200"
                    title={
                      questById[qid]?.name
                        ? typeof questById[qid].name === "string"
                          ? questById[qid].name
                          : l(language, questById[qid].name)
                        : qid
                    }
                  >
                    {questById[qid]?.name
                      ? typeof questById[qid].name === "string"
                        ? questById[qid].name
                        : l(language, questById[qid].name)
                      : qid}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
