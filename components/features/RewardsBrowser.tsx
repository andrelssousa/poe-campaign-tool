// src/components/features/RewardsBrowser.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { t, type Language } from "@/lib/i18n";
import { l, type LString } from "@/lib/l10n";
import { toast } from "@/components/ui/ToastHost";

type RewardRow = {
  questId: string;
  questName: LString;
  actId: number;
  rewardId: string;
  rewardType: string;
  label: LString;
  choicesByClass?: Record<string, LString[]>;
  choices?: LString[];
};

const TYPES = [
  "all",
  "gem_choice",
  "flask_choice",
  "book_of_skill",
  // future: vendor_unlock, item_reward, etc.
] as const;

const PAGE_SIZE = 50;

function buildUrl(pathname: string, params: URLSearchParams) {
  const qs = params.toString();
  return `${pathname}${qs ? `?${qs}` : ""}`;
}

async function safeCopy(text: string) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fall through
  }

  try {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.top = "-1000px";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function typeLabel(lang: Language, tpe: string) {
  switch (tpe) {
    case "all":
      return t(lang, "rewards_types_all");
    case "gem_choice":
      return t(lang, "rewards_types_gem_choice");
    case "flask_choice":
      return t(lang, "rewards_types_flask_choice");
    case "book_of_skill":
      return t(lang, "rewards_types_book_of_skill");
    default:
      return tpe.replaceAll("_", " ");
  }
}

function typeBadgeLabel(lang: Language, tpe: string) {
  switch (tpe) {
    case "gem_choice":
      return t(lang, "rewards_badge_gem_choice");
    case "flask_choice":
      return t(lang, "rewards_badge_flask_choice");
    case "book_of_skill":
      return t(lang, "rewards_badge_book_of_skill");
    default:
      return tpe.replaceAll("_", " ");
  }
}

export function RewardsBrowser({ rewardsIndex }: { rewardsIndex: RewardRow[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const selectedClass = useAppStore((s) => s.selectedClass);
  const language = useAppStore((s) => s.language);

  // ---- URL -> State (initial) ----
  const urlType = (searchParams.get("type") ?? "all") as (typeof TYPES)[number];
  const urlAct = searchParams.get("act") ?? "all";
  const urlQ = searchParams.get("q") ?? "";
  const urlPage = Number(searchParams.get("page") ?? "1");

  const [type, setType] = useState<(typeof TYPES)[number]>(
    TYPES.includes(urlType) ? urlType : "all"
  );
  const [act, setAct] = useState<number | "all">(
    urlAct === "all" ? "all" : Number(urlAct)
  );
  const [q, setQ] = useState(urlQ);
  const [page, setPage] = useState(
    Number.isFinite(urlPage) && urlPage > 0 ? urlPage : 1
  );

  // ---- State -> URL (sync) ----
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());

    if (type === "all") params.delete("type");
    else params.set("type", type);

    if (act === "all") params.delete("act");
    else params.set("act", String(act));

    const qq = q.trim();
    if (!qq) params.delete("q");
    else params.set("q", qq);

    if (page <= 1) params.delete("page");
    else params.set("page", String(page));

    const next = params.toString();
    const current = searchParams.toString();

    // ✅ Guard: don't replace if URL already matches (prevents loops)
    if (next === current) return;

    router.replace(`${pathname}${next ? `?${next}` : ""}`, { scroll: false });
  }, [type, act, q, page, router, pathname, searchParams]);

  const actOptions = useMemo(() => {
    return Array.from(new Set(rewardsIndex.map((r) => r.actId))).sort(
      (a, b) => a - b
    );
  }, [rewardsIndex]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();

    return rewardsIndex
      .filter((r) => (type === "all" ? true : r.rewardType === type))
      .filter((r) => (act === "all" ? true : r.actId === act))
      .filter((r) => {
        if (!query) return true;

        // Search label + quest name + (for gems) class choices + choices list
        const hay = [l(language, r.label), l(language, r.questName)]
          .join(" ")
          .toLowerCase();

        if (hay.includes(query)) return true;

        const gems = r.choicesByClass?.[selectedClass]
          ?.map((x) => l(language, x))
          .join(" ")
          .toLowerCase();
        if (gems && gems.includes(query)) return true;

        const choices = r.choices
          ?.map((x) => l(language, x))
          .join(" ")
          .toLowerCase();
        if (choices && choices.includes(query)) return true;

        return false;
      })
      .sort((a, b) => {
        const byAct = a.actId - b.actId;
        if (byAct !== 0) return byAct;
        return l(language, a.questName).localeCompare(l(language, b.questName));
      });
  }, [rewardsIndex, type, act, q, selectedClass, language]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = clamp(page, 1, totalPages);

  useEffect(() => {
    // If filtering reduces results, clamp page automatically
    if (safePage !== page) setPage(safePage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPages]);

  const pageItems = useMemo(() => {
    const start = (safePage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, safePage]);

  function clearFilters() {
    setType("all");
    setAct("all");
    setQ("");
    setPage(1);
    toast(t(language, "common_filtersCleared"), "info");
  }

  function copyLink() {
    const params = new URLSearchParams(searchParams.toString());
    const rel = buildUrl(pathname, params);
    const full = `${window.location.origin}${rel}`;
    safeCopy(full);
    toast(t(language, "common_linkCopied"), "success");
  }

  return (
    <>
      {/* Sticky Filters + Pagination */}
      <div className="mt-4 sticky top-0 z-10">
        <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-3 backdrop-blur">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={act}
              onChange={(e) => {
                const v = e.target.value;
                setPage(1);
                setAct(v === "all" ? "all" : Number(v));
              }}
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-amber-500/40"
              style={{ colorScheme: "dark" }}
            >
              <option value="all">{t(language, "rewards_allActs")}</option>
              {actOptions.map((a) => (
                <option key={a} value={a}>
                  {t(language, "rewards_actLabel")} {a}
                </option>
              ))}
            </select>

            <select
              value={type}
              onChange={(e) => {
                setPage(1);
                setType(e.target.value as any);
              }}
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-amber-500/40"
              style={{ colorScheme: "dark" }}
            >
              {TYPES.map((tpe) => (
                <option key={tpe} value={tpe}>
                  {typeLabel(language, tpe)}
                </option>
              ))}
            </select>

            <input
              value={q}
              onChange={(e) => {
                setPage(1);
                setQ(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.preventDefault();
                  setPage(1);
                  setQ("");
                }
              }}
              placeholder={t(language, "rewards_searchPlaceholder")}
              className="w-full max-w-md rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none focus:ring-2 focus:ring-amber-500/40"
            />

            <div className="text-sm text-zinc-400">
              {t(language, "rewards_showing")}{" "}
              <span className="font-semibold text-zinc-200">
                {filtered.length}
              </span>
              {filtered.length ? (
                <>
                  {" "}
                  • {t(language, "rewards_page")}{" "}
                  <span className="font-semibold text-zinc-200">
                    {safePage}
                  </span>
                  /
                  <span className="font-semibold text-zinc-200">
                    {totalPages}
                  </span>
                </>
              ) : null}{" "}
              • <span className="text-zinc-500">
                {t(language, "common_classLabel")}:
              </span>{" "}
              <span className="font-semibold text-zinc-200">
                {selectedClass}
              </span>
            </div>

            <button
              type="button"
              onClick={clearFilters}
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 hover:bg-zinc-800"
            >
              {t(language, "common_clear")}
            </button>

            <button
              type="button"
              onClick={copyLink}
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 hover:bg-zinc-800"
              title={t(language, "rewards_copyLink_title")}
            >
              {t(language, "rewards_copyLink")}
            </button>
          </div>

          {/* Pagination */}
          {filtered.length > 0 ? (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <button
                className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1 text-sm text-zinc-100 disabled:opacity-40"
                onClick={() => setPage(1)}
                disabled={safePage === 1}
              >
                {t(language, "rewards_first")}
              </button>
              <button
                className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1 text-sm text-zinc-100 disabled:opacity-40"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePage === 1}
              >
                {t(language, "rewards_prev")}
              </button>
              <button
                className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1 text-sm text-zinc-100 disabled:opacity-40"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePage === totalPages}
              >
                {t(language, "rewards_next")}
              </button>
              <button
                className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-1 text-sm text-zinc-100 disabled:opacity-40"
                onClick={() => setPage(totalPages)}
                disabled={safePage === totalPages}
              >
                {t(language, "rewards_last")}
              </button>
            </div>
          ) : null}
        </div>
      </div>

      {/* Results */}
      <div className="mt-6 space-y-3">
        {pageItems.length === 0 ? (
          <div className="text-sm text-zinc-400">
            {t(language, "rewards_noneFound")}
          </div>
        ) : (
          pageItems.map((r) => (
            <div
              key={`${r.questId}:${r.rewardId}`}
              className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div className="font-semibold text-white">
                  {l(language, r.label)}
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <span>
                    {t(language, "rewards_actLabel")} {r.actId}
                  </span>

                  <span className="rounded-full border border-zinc-700 bg-zinc-900 px-2 py-0.5 text-[11px] text-zinc-200">
                    {typeBadgeLabel(language, r.rewardType)}
                  </span>
                </div>
              </div>

              <div className="mt-1 flex flex-wrap items-center justify-between gap-2 text-sm text-zinc-300">
                <div>
                  {t(language, "rewards_from")}{" "}
                  <span className="text-zinc-100">
                    {l(language, r.questName)}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    href={`/acts/${r.actId}?questId=${encodeURIComponent(
                      r.questId
                    )}`}
                    className="text-xs text-amber-300 underline decoration-amber-500/40 underline-offset-2 hover:text-amber-200"
                  >
                    {t(language, "rewards_openQuest")}
                  </Link>

                  <button
                    type="button"
                    onClick={async () => {
                      const rel = `/acts/${r.actId}?questId=${encodeURIComponent(r.questId)}`;
                      const full = `${window.location.origin}${rel}`;
                      const ok = await safeCopy(full);
                      toast(t(language, "common_linkCopied"), ok ? "success" : "info");
                    }}
                    className="text-xs text-zinc-300 underline decoration-zinc-600 underline-offset-2 hover:text-zinc-100"
                    title={t(language, "rewards_copyQuestLink_title")}
                  >
                    {t(language, "rewards_copyQuestLink")}
                  </button>
                </div>
              </div>

              {r.rewardType === "flask_choice" && r.choices?.length ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {r.choices.map((c, idx) => (
                    <span
                      key={`${r.rewardId}:flask:${idx}`}
                      className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs text-zinc-200"
                    >
                      {l(language, c)}
                    </span>
                  ))}
                </div>
              ) : null}

              {r.rewardType === "gem_choice" &&
              r.choicesByClass?.[selectedClass]?.length ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {r.choicesByClass[selectedClass].map((g, idx) => (
                    <span
                      key={`${r.rewardId}:gem:${idx}`}
                      className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-xs text-zinc-200"
                    >
                      {l(language, g)}
                    </span>
                  ))}
                </div>
              ) : r.rewardType === "gem_choice" ? (
                <div className="mt-2 text-xs text-zinc-500">
                  {t(language, "reward_noGemListForClass_prefix")}{" "}
                  <span className="text-zinc-300">{selectedClass}</span>
                </div>
              ) : null}
            </div>
          ))
        )}
      </div>
    </>
  );
}
