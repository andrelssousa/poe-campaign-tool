import fs from "node:fs";
import path from "node:path";
import { z } from "zod";

const ROOT = process.cwd();
const rawDir = path.join(ROOT, "data", "raw");

const ActSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  slug: z.string().min(1),
  questsInOrder: z.array(z.string().min(1)),
});

const RewardBaseSchema = z.object({
  type: z.string().min(1),
  id: z.string().min(1),
  label: z.string().min(1),
});

const QuestSchema = z.object({
  id: z.string().min(1),
  actId: z.number().int().positive(),
  name: z.string().min(1),
  isOptional: z.boolean(),
  steps: z.array(z.string().min(1)).min(1),
  rewards: z.array(RewardBaseSchema).min(0),
});

function readJson(fileName: string) {
  const full = path.join(rawDir, fileName);
  const txt = fs.readFileSync(full, "utf-8");
  return JSON.parse(txt);
}

function main() {
  const acts = readJson("acts.json");
  const quests = readJson("quests.json");

  const actsParsed = z.array(ActSchema).parse(acts);
  const questsParsed = z.array(QuestSchema).parse(quests);

  // Uniqueness checks
  const actIds = new Set<number>();
  for (const a of actsParsed) {
    if (actIds.has(a.id)) throw new Error(`Duplicate act id: ${a.id}`);
    actIds.add(a.id);
  }

  const questIds = new Set<string>();
  for (const q of questsParsed) {
    if (questIds.has(q.id)) throw new Error(`Duplicate quest id: ${q.id}`);
    questIds.add(q.id);
  }

  // Referential integrity: act.questsInOrder must exist in quests
  for (const act of actsParsed) {
    for (const qid of act.questsInOrder) {
      if (!questIds.has(qid)) {
        throw new Error(`Act ${act.id} references missing quest id: ${qid}`);
      }
    }
  }

  console.log("✅ Data validation passed.");
}

main();