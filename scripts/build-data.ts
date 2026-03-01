// scripts\build-data.ts
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const rawDir = path.join(ROOT, "data", "raw");
const outDir = path.join(ROOT, "data", "generated");

type Language = "en" | "pt-BR";
type LString = string | Partial<Record<Language, string>>;

type RewardChoicesL10n = {
  gems?: Record<string, LString>;
  flasks?: Record<string, LString>;
};

function toKey(s: string) {
  return String(s).trim().toLowerCase();
}

function readOptionalJson(fileName: string) {
  const full = path.join(rawDir, fileName);
  if (!fs.existsSync(full)) return null;
  return JSON.parse(fs.readFileSync(full, "utf-8"));
}

const choicesL10n = (readOptionalJson("rewardChoices.l10n.json") ??
  {}) as RewardChoicesL10n;

function lz(kind: "gems" | "flasks", raw: string): LString {
  const key = toKey(raw);
  const hit = (choicesL10n as any)?.[kind]?.[key];
  return hit ?? raw; // fallback: keep current behavior
}

function localizeChoicesByClass(rawMap: Record<string, string[]> | undefined) {
  if (!rawMap) return undefined;
  const out: Record<string, LString[]> = {};
  for (const cls of Object.keys(rawMap)) {
    out[cls] = (rawMap[cls] ?? []).map((g) => lz("gems", g));
  }
  return out;
}

function localizeChoiceList(list: string[] | undefined) {
  if (!list) return undefined;
  return list.map((c) => lz("flasks", c));
}

function readJson(fileName: string) {
  const full = path.join(rawDir, fileName);
  return JSON.parse(fs.readFileSync(full, "utf-8"));
}

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function getAllRewardsFromQuest(q: any) {
  if (Array.isArray(q.rewardMoments)) {
    return q.rewardMoments.flatMap((m: any) => m.rewards ?? []);
  }
  return q.rewards ?? [];
}

function main() {
  ensureDir(outDir);

  const acts = readJson("acts.json") as any[];
  const quests = readJson("quests.json") as any[];

  const questById: Record<string, any> = {};
  for (const q of quests) questById[q.id] = q;

  const actById: Record<string, any> = {};
  for (const a of acts) actById[String(a.id)] = a;

  // gem indexes:
  // - gemToQuests: all gems across all classes
  // - gemToQuestsByClass: per class filtering support
  const gemToQuests: Record<string, string[]> = {};
  const gemToQuestsByClass: Record<string, Record<string, string[]>> = {};

  for (const q of quests) {
    for (const r of getAllRewardsFromQuest(q)) {
      if (r.type !== "gem_choice") continue;

      const choicesByClass = (r as any).choicesByClass || {};
      for (const cls of Object.keys(choicesByClass)) {
        const gems: string[] = choicesByClass[cls] || [];

        gemToQuestsByClass[cls] ||= {};

        for (const gem of gems) {
          const key = toKey(gem);

          // global index
          gemToQuests[key] ||= [];
          if (!gemToQuests[key].includes(q.id)) gemToQuests[key].push(q.id);

          // per class index
          gemToQuestsByClass[cls][key] ||= [];
          if (!gemToQuestsByClass[cls][key].includes(q.id)) {
            gemToQuestsByClass[cls][key].push(q.id);
          }
        }
      }
    }
  }

  // reward index (all rewards, normalized for browsing)
  type RewardRow = {
    questId: string;
    questName: string;
    actId: number;
    rewardId: string;
    rewardType: string;
    label: string;
    // For gem_choice only
    choicesByClass?: Record<string, LString[]>;
    // For simple choices (like flasks)
    choices?: LString[];
  };

  const rewardsIndex: RewardRow[] = [];

  for (const q of quests) {
    for (const r of getAllRewardsFromQuest(q)) {
      rewardsIndex.push({
        questId: q.id,
        questName: q.name,
        actId: q.actId,
        rewardId: r.id,
        rewardType: r.type,
        label: r.label ?? r.id,
        choicesByClass:
          r.type === "gem_choice"
            ? localizeChoicesByClass((r as any).choicesByClass)
            : undefined,
        choices: localizeChoiceList((r as any).choices),
      });
    }
  }

  fs.writeFileSync(path.join(outDir, "acts.json"), JSON.stringify(acts, null, 2));
  fs.writeFileSync(path.join(outDir, "quests.json"), JSON.stringify(quests, null, 2));
  fs.writeFileSync(path.join(outDir, "questById.json"), JSON.stringify(questById, null, 2));
  fs.writeFileSync(path.join(outDir, "actById.json"), JSON.stringify(actById, null, 2));
  fs.writeFileSync(path.join(outDir, "gemToQuests.json"), JSON.stringify(gemToQuests, null, 2));
  fs.writeFileSync(path.join(outDir, "gemToQuestsByClass.json"), JSON.stringify(gemToQuestsByClass, null, 2));
  fs.writeFileSync(path.join(outDir, "rewardsIndex.json"), JSON.stringify(rewardsIndex, null, 2));

  console.log("✅ Data build complete: data/generated/*");
}

main();