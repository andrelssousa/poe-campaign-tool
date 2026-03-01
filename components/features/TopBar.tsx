// components/features/TopBar.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { useAppStore } from "@/store/useAppStore";
import { t } from "@/lib/i18n";
import type { ActInfo } from "@/lib/progress";
import { actProgressMap, overallProgress } from "@/lib/progress";

const CLASSES = [
  "Marauder",
  "Ranger",
  "Witch",
  "Duelist",
  "Templar",
  "Shadow",
  "Scion",
] as const;

export function TopBar({
  totalQuests,
  actById,
}: {
  totalQuests: number;
  actById: Record<string, ActInfo>;
}) {
  const selectedClass = useAppStore((s) => s.selectedClass);
  const setSelectedClass = useAppStore((s) => s.setSelectedClass);

  const language = useAppStore((s) => s.language);
  const setLanguage = useAppStore((s) => s.setLanguage);

  const resetProgress = useAppStore((s) => s.resetProgress);
  const pathname = usePathname();

  const completedQuestIds = useAppStore((s) => s.completedQuestIds);
  const hasHydrated = useAppStore((s) => s.hasHydrated);

  const completedCount = useMemo(
    () => Object.values(completedQuestIds).filter(Boolean).length,
    [completedQuestIds]
  );

  const overall = useMemo(() => {
    if (!hasHydrated) return { done: 0, total: totalQuests, percent: 0, level: 1, complete: false };
    return overallProgress(completedQuestIds, totalQuests);
  }, [completedQuestIds, totalQuests, hasHydrated]);

  // ---- animated glow when progress increases ----
  const prevCompletedRef = useRef<number>(completedCount);
  const [glow, setGlow] = useState(false);

  useEffect(() => {
    if (!hasHydrated) return;

    const prev = prevCompletedRef.current;
    if (completedCount > prev) {
      setGlow(true);
      const h = window.setTimeout(() => setGlow(false), 900);
      prevCompletedRef.current = completedCount;
      return () => window.clearTimeout(h);
    }
    prevCompletedRef.current = completedCount;
  }, [completedCount, hasHydrated]);

  // ---- per-act progress (only show on /acts index) ----
  const showActMiniBars = pathname === "/acts"; // IMPORTANT: prevents bar stacking everywhere

  const actsSorted = useMemo(() => {
    const acts = Object.values(actById || {});
    return acts.sort((a, b) => (a.id ?? 0) - (b.id ?? 0));
  }, [actById]);

  const actProg = useMemo(() => {
    if (!hasHydrated) return new Map<number, { done: number; total: number; percent: number; complete: boolean }>();
    return actProgressMap(actsSorted, completedQuestIds);
  }, [actsSorted, completedQuestIds, hasHydrated]);

  function isActive(href: string) {
    if (href === "/") return pathname === "/";

    if (href === "/acts") return pathname === "/acts" || pathname.startsWith("/acts/");
    if (href === "/tracker") return pathname === "/tracker" || pathname.startsWith("/tracker/");
    if (href === "/rewards") {
      if (pathname === "/rewards/gems") return false;
      return pathname === "/rewards" || pathname.startsWith("/rewards/");
    }
    if (href === "/rewards/gems") return pathname === "/rewards/gems";

    return pathname === href;
  }

  function navClass(href: string) {
    const active = isActive(href);
    return [
      "text-zinc-200 hover:text-white hover:underline",
      active ? "text-white underline decoration-amber-500/60 underline-offset-4" : "",
    ].join(" ");
  }

  return (
    <header
      className={[
        "mb-4 rounded-2xl border border-zinc-800 bg-zinc-950/80 px-4 py-3",
        glow ? "stl-progress-glow" : "",
      ].join(" ")}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-semibold tracking-wide text-white hover:opacity-90">
            PoE Campaign Tool
          </Link>

          <nav className="flex items-center gap-3 text-sm">
            <Link className={navClass("/acts")} href="/acts">
              {t(language, "acts")}
            </Link>
            <Link className={navClass("/rewards/gems")} href="/rewards/gems">
              {t(language, "gems")}
            </Link>
            <Link className={navClass("/tracker")} href="/tracker">
              {t(language, "tracker")}
            </Link>
            <Link className={navClass("/rewards")} href="/rewards">
              {t(language, "rewards")}
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {/* Language flags */}
          <div className="flex items-center rounded-lg border border-zinc-700 bg-zinc-900 p-1">
            <button
              type="button"
              onClick={() => setLanguage("en")}
              className={[
                "rounded-md px-2 py-1 text-sm",
                language === "en" ? "bg-zinc-800 text-white" : "text-zinc-300 hover:text-white",
              ].join(" ")}
              title={t(language, "common_lang_en")}
            >
              🇺🇸
            </button>
            <button
              type="button"
              onClick={() => setLanguage("pt-BR")}
              className={[
                "rounded-md px-2 py-1 text-sm",
                language === "pt-BR" ? "bg-zinc-800 text-white" : "text-zinc-300 hover:text-white",
              ].join(" ")}
              title={t(language, "common_lang_ptbr")}
            >
              🇧🇷
            </button>
          </div>

          {/* Class select */}
          <label className="flex items-center gap-2 text-sm">
            <span className="text-zinc-200">{t(language, "class")}</span>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-white outline-none focus:ring-2 focus:ring-amber-500/40"
              style={{ colorScheme: "dark" }}
            >
              {CLASSES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <button
            onClick={resetProgress}
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40"
            title={t(language, "common_reset_title")}
          >
            {t(language, "reset")}
          </button>
        </div>
      </div>

      {/* Overall progress */}
      <div className="mt-3 space-y-2">
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
          className="h-2 w-full overflow-hidden rounded-full border border-zinc-800 bg-zinc-900"
          aria-label={t(language, "common_campaignProgressAria")}
        >
          <div
            className={[
              "h-full rounded-full bg-amber-500/80 transition-[width] duration-500",
              glow ? "stl-progress-fill-glow" : "",
            ].join(" ")}
            style={{ width: `${overall.percent}%` }}
          />
        </div>
      </div>

      {/* Act mini-bars ONLY on /acts */}
      {showActMiniBars && actsSorted.length ? (
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {actsSorted.map((act) => {
            const p = actProg.get(act.id) ?? { done: 0, total: 0, percent: 0, complete: false };
            return (
              <Link
                key={act.id}
                href={`/acts/${act.id}`}
                className="rounded-xl border border-zinc-800 bg-zinc-950/50 p-3 hover:bg-zinc-900/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50"
              >
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
              </Link>
            );
          })}
        </div>
      ) : null}
    </header>
  );
}