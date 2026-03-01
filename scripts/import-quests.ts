import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const RAW_QUESTS = path.join(ROOT, "data", "raw", "quests.json");

type Reward = {
  type: string;
  id: string;
  label: string;
  choicesByClass?: Record<string, string[]>;
  choices?: string[];
};

type RewardMoment = {
  when: string;
  npc?: string;
  rewards: Reward[];
};

type Quest = {
  id: string;
  actId: number;
  name: string;
  isOptional: boolean;
  steps: string[];
  rewards?: Reward[];
  rewardMoments?: RewardMoment[];
};

function mustRead(filePath: string) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing file: ${filePath}`);
  }
  return fs.readFileSync(filePath, "utf-8");
}

function parseBool(s: string) {
  const v = s.trim().toLowerCase();
  if (v === "true") return true;
  if (v === "false") return false;
  throw new Error(`Invalid boolean: "${s}"`);
}

function splitCSV(s: string): string[] {
  return s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

function parseQuestHeader(line: string) {
  // QUEST: Name | id=... | optional=true/false | act=1(optional)
  const rest = line.replace(/^QUEST:\s*/i, "").trim();
  const parts = rest.split("|").map((p) => p.trim());

  const name = parts[0];
  let id = "";
  let optional = false;
  let actId: number | null = null;

  for (const p of parts.slice(1)) {
    if (p.startsWith("id=")) id = p.slice(3).trim();
    else if (p.startsWith("optional=")) optional = parseBool(p.slice("optional=".length));
    else if (p.startsWith("act=")) actId = Number(p.slice(4).trim());
  }

  if (!name) throw new Error(`QUEST missing name: ${line}`);
  if (!id) throw new Error(`QUEST missing id=: ${line}`);

  return { name, id, optional, actId };
}

function parseMomentHeader(line: string) {
  // MOMENT: Turn in to Nessa | npc=Nessa
  const rest = line.replace(/^MOMENT:\s*/i, "").trim();
  const parts = rest.split("|").map((p) => p.trim());
  const when = parts[0];
  let npc: string | undefined;

  for (const p of parts.slice(1)) {
    if (p.startsWith("npc=")) npc = p.slice(4).trim();
  }

  if (!when) throw new Error(`MOMENT missing when: ${line}`);
  return { when, npc };
}

function parseRewardLine(line: string): Reward {
  // REWARD: type | id=... | label=...
  const rest = line.replace(/^REWARD:\s*/i, "").trim();
  const parts = rest.split("|").map((p) => p.trim());
  const type = parts[0];

  let id = "";
  let label = "";

  for (const p of parts.slice(1)) {
    if (p.startsWith("id=")) id = p.slice(3).trim();
    else if (p.startsWith("label=")) label = p.slice(6).trim();
  }

  if (!type) throw new Error(`REWARD missing type: ${line}`);
  if (!id) throw new Error(`REWARD missing id=: ${line}`);
  if (!label) throw new Error(`REWARD missing label=: ${line}`);

  // remove optional surrounding quotes in label
  if (label.startsWith('"') && label.endsWith('"')) {
    label = label.slice(1, -1);
  }

  return { type, id, label };
}

function parseSimpleRewardItem(line: string): Reward {
  // - type | id=... | label=...
  const rest = line.replace(/^-+\s*/i, "").trim();
  const parts = rest.split("|").map((p) => p.trim());
  const type = parts[0];

  let id = "";
  let label = "";

  for (const p of parts.slice(1)) {
    if (p.startsWith("id=")) id = p.slice(3).trim();
    else if (p.startsWith("label=")) label = p.slice(6).trim();
  }

  if (!type) throw new Error(`REWARDS item missing type: ${line}`);
  if (!id) throw new Error(`REWARDS item missing id=: ${line}`);
  if (!label) throw new Error(`REWARDS item missing label=: ${line}`);

  if (label.startsWith('"') && label.endsWith('"')) {
    label = label.slice(1, -1);
  }

  return { type, id, label };
}

function importFromText(txt: string, defaultActId: number): Quest[] {
  const lines = txt
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith("#"));

  const out: Quest[] = [];

  let currentQuest: Quest | null = null;
  let mode: "none" | "steps" | "rewards" = "none";
  let currentMoment: RewardMoment | null = null;
  let lastReward: Reward | null = null;

  function pushQuest() {
    if (!currentQuest) return;

    // close open moment
    if (currentMoment) {
      currentQuest.rewardMoments ||= [];
      currentQuest.rewardMoments.push(currentMoment);
      currentMoment = null;
    }

    // sanity: must have at least one reward model
    const hasMoments = Array.isArray(currentQuest.rewardMoments) && currentQuest.rewardMoments.length > 0;
    const hasRewards = Array.isArray(currentQuest.rewards);

    if (!hasMoments && !hasRewards) {
      // allow “no rewards yet” during data entry? -> no, keep strict
      throw new Error(`Quest "${currentQuest.id}" has no rewards/rewardMoments.`);
    }

    out.push(currentQuest);
    currentQuest = null;
    mode = "none";
    lastReward = null;
  }

  for (const line of lines) {
    if (/^QUEST:/i.test(line)) {
      // new quest
      pushQuest();
      const { name, id, optional, actId } = parseQuestHeader(line);
      currentQuest = {
        id,
        name,
        actId: actId ?? defaultActId,
        isOptional: optional,
        steps: [],
      };
      mode = "none";
      currentMoment = null;
      lastReward = null;
      continue;
    }

    if (!currentQuest) {
      throw new Error(`Found content before QUEST: "${line}"`);
    }

    if (/^STEPS:/i.test(line)) {
      mode = "steps";
      continue;
    }

    if (/^REWARDS:/i.test(line)) {
      // old model: completion rewards
      // close any open moment first
      if (currentMoment) {
        currentQuest.rewardMoments ||= [];
        currentQuest.rewardMoments.push(currentMoment);
        currentMoment = null;
      }
      currentQuest.rewards = [];
      mode = "rewards";
      continue;
    }

    if (/^MOMENT:/i.test(line)) {
      // close previous moment if open
      if (currentMoment) {
        currentQuest.rewardMoments ||= [];
        currentQuest.rewardMoments.push(currentMoment);
      }
      const { when, npc } = parseMomentHeader(line);
      currentMoment = { when, npc, rewards: [] };
      currentQuest.rewardMoments ||= [];
      mode = "none";
      lastReward = null;
      continue;
    }

    if (/^REWARD:/i.test(line)) {
      if (!currentMoment) throw new Error(`REWARD without MOMENT in quest ${currentQuest.id}`);
      const r = parseRewardLine(line);
      currentMoment.rewards.push(r);
      lastReward = r;
      continue;
    }

    if (/^CLASS:/i.test(line)) {
      if (!lastReward || lastReward.type !== "gem_choice") {
        throw new Error(`CLASS line but last reward is not gem_choice (quest ${currentQuest.id})`);
      }
      const rest = line.replace(/^CLASS:\s*/i, "").trim();
      const [lhs, rhs] = rest.split("=").map((x) => x.trim());
      if (!lhs || !rhs) throw new Error(`Invalid CLASS line: ${line}`);
      lastReward.choicesByClass ||= {};
      lastReward.choicesByClass[lhs] = splitCSV(rhs);
      continue;
    }

    if (/^CHOICES:/i.test(line)) {
      if (!lastReward) throw new Error(`CHOICES line without a previous REWARD (quest ${currentQuest.id})`);
      const rest = line.replace(/^CHOICES:\s*/i, "").trim();
      lastReward.choices = splitCSV(rest);
      continue;
    }

    if (mode === "steps" && line.startsWith("-")) {
      currentQuest.steps.push(line.replace(/^-+\s*/, "").trim());
      continue;
    }

    if (mode === "rewards" && line.startsWith("-")) {
      const r = parseSimpleRewardItem(line);
      currentQuest.rewards ||= [];
      currentQuest.rewards.push(r);
      continue;
    }

    throw new Error(`Unrecognized line: "${line}" (quest ${currentQuest.id})`);
  }

  pushQuest();
  return out;
}

function main() {
  const inputPath = process.argv[2];
  const actArg = process.argv[3]; // e.g. "1"

  if (!inputPath) {
    console.error("Usage: tsx scripts/import-quests.ts <path-to-txt> <defaultActId>");
    process.exit(1);
  }

  const defaultActId = actArg ? Number(actArg) : 1;
  if (!Number.isFinite(defaultActId) || defaultActId <= 0) {
    throw new Error(`Invalid defaultActId: ${actArg}`);
  }

  const fullInput = path.isAbsolute(inputPath)
    ? inputPath
    : path.join(ROOT, inputPath);

  const txt = mustRead(fullInput);

  const imported = importFromText(txt, defaultActId);

  // Merge into existing raw quests.json
  const current: Quest[] = JSON.parse(fs.readFileSync(RAW_QUESTS, "utf-8"));

  const byId = new Map<string, Quest>();
  for (const q of current) byId.set(q.id, q);
  for (const q of imported) byId.set(q.id, q); // overwrite same ids

  const merged = Array.from(byId.values()).sort((a, b) => {
    if (a.actId !== b.actId) return a.actId - b.actId;
    return a.name.localeCompare(b.name);
  });

  fs.writeFileSync(RAW_QUESTS, JSON.stringify(merged, null, 2));
  console.log(`✅ Imported ${imported.length} quests into data/raw/quests.json`);
}

main();