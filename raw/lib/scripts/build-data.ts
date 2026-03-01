import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const rawDir = path.join(ROOT, "data", "raw");
const outDir = path.join(ROOT, "data", "generated");

function readJson(fileName: string) {
  const full = path.join(rawDir, fileName);
  return JSON.parse(fs.readFileSync(full, "utf-8"));
}

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function main() {
  ensureDir(outDir);

  const acts = readJson("acts.json") as any[];
  const quests = readJson("quests.json") as any[];

  // questById index
  const questById: Record<string, any> = {};
  for (const q of quests) questById[q.id] = q;

  // actById index
  const actById: Record<string, any> = {};
  for (const a of acts) actById[String(a.id)] = a;

  // gem -> quest index (empty-ish now, but works once we populate choices)
  const gemToQuests: Record<string, string[]> = {};

  for (const q of quests) {
    for (const r of q.rewards ?? []) {
      if (r.type === "gem_choice") {
        const choicesByClass = r.choicesByClass || {};
        for (const cls of Object.keys(choicesByClass)) {
          const gems: string[] = choicesByClass[cls] || [];
          for (const gem of gems) {
            const key = gem.toLowerCase();
            gemToQuests[key] ||= [];
            if (!gemToQuests[key].includes(q.id)) gemToQuests[key].push(q.id);
          }
        }
      }
    }
  }

  fs.writeFileSync(path.join(outDir, "acts.json"), JSON.stringify(acts, null, 2));
  fs.writeFileSync(path.join(outDir, "quests.json"), JSON.stringify(quests, null, 2));
  fs.writeFileSync(path.join(outDir, "questById.json"), JSON.stringify(questById, null, 2));
  fs.writeFileSync(path.join(outDir, "actById.json"), JSON.stringify(actById, null, 2));
  fs.writeFileSync(path.join(outDir, "gemToQuests.json"), JSON.stringify(gemToQuests, null, 2));

  console.log("✅ Data build complete: data/generated/*");
}

main();