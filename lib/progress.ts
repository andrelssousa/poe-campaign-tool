// src/lib/progress.ts
export type CompletedQuestIds = Record<string, boolean>;

export type ActInfo = {
  id: number;
  name: string;
  slug?: string;
  questsInOrder: string[];
};

export function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

export function pct(done: number, total: number) {
  if (!total) return 0;
  return clamp(Math.round((done / total) * 100), 0, 100);
}

// XP-style leveling visual (deterministic):
// 0–9% => LV 1 ... 90–99% => LV 10, 100% stays LV 10.
export function levelFromPercent(percent: number) {
  if (percent >= 100) return 10;
  return clamp(Math.floor(percent / 10) + 1, 1, 10);
}

export function countCompleted(completedQuestIds: CompletedQuestIds) {
  let n = 0;
  for (const k in completedQuestIds) {
    if (completedQuestIds[k]) n += 1;
  }
  return n;
}

export function overallProgress(completedQuestIds: CompletedQuestIds, totalQuests: number) {
  const done = countCompleted(completedQuestIds);
  const percent = pct(done, totalQuests);
  const level = levelFromPercent(percent);
  const complete = totalQuests > 0 && done >= totalQuests;
  return { done, total: totalQuests, percent, level, complete };
}

type Progress = { done: number; total: number; percent: number; complete: boolean };

export function actProgressMap(acts: ActInfo[], completedQuestIds: CompletedQuestIds) {
  const map = new Map<number, Progress>();

  for (const act of acts) {
    const ids = act.questsInOrder ?? [];
    const total = ids.length;

    let done = 0;
    for (const qid of ids) {
      if (completedQuestIds[qid]) done += 1;
    }

    const percent = pct(done, total);
    map.set(act.id, { done, total, percent, complete: total > 0 && done >= total });
  }

  return map;
}
