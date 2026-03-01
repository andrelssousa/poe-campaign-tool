// app/tracker/page.tsx
import { readGenerated } from "@/lib/readGenerated.server";
import { TrackerPanel } from "@/components/features/TrackerPanel";
import type { LString } from "@/lib/l10n";
import type { ActInfo } from "@/lib/progress";

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

export default function TrackerPage() {
  const questById = readGenerated<Record<string, Quest>>("questById.json");
  const totalQuests = Object.keys(questById).length;

  const actsRaw = readGenerated<any[]>("acts.json");
  const acts: ActInfo[] = (actsRaw ?? []).map((a: any) => ({
    id: Number(a.id),
    name: String(a.name ?? `Act ${a.id}`),
    slug: a.slug ? String(a.slug) : undefined,
    questsInOrder: Array.isArray(a.questsInOrder) ? a.questsInOrder : [],
  }));

  return (
    <TrackerPanel totalQuests={totalQuests} questById={questById} acts={acts} />
  );
}
