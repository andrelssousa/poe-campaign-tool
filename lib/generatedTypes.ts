// src/lib/generatedTypes.ts
import type { Language } from "@/lib/i18n";
import type { LString } from "@/lib/l10n";

export const CLASSES = [
  "Marauder",
  "Ranger",
  "Witch",
  "Duelist",
  "Templar",
  "Shadow",
  "Scion",
] as const;

export type ClassName = (typeof CLASSES)[number];

export const REWARD_TYPES = [
  "gem_choice",
  "flask_choice",
  "book_of_skill",
  // future: vendor_unlock, item_reward, etc.
] as const;

export type RewardType = (typeof REWARD_TYPES)[number];

export type RewardBase = {
  type: RewardType;
  id: string;
  label: LString;
};

export type GemChoiceReward = RewardBase & {
  type: "gem_choice";
  choicesByClass: Record<ClassName, LString[]>;
};

export type FlaskChoiceReward = RewardBase & {
  type: "flask_choice";
  choices: LString[];
};

export type BookOfSkillReward = RewardBase & {
  type: "book_of_skill";
};

export type Reward = GemChoiceReward | FlaskChoiceReward | BookOfSkillReward;

export type RewardMoment = {
  when: LString;
  npc?: LString;
  rewards: Reward[];
};

export type QuestGenerated = {
  id: string;
  name: LString;
  actId: number;
  isOptional: boolean;
  steps: LString[];
  rewards?: Reward[];
  rewardMoments?: RewardMoment[];
};

export type ActGenerated = {
  id: number;
  name: LString;
  slug: string;
  questsInOrder: string[];
};

// What your server reads
export type QuestById = Record<string, QuestGenerated>;
export type ActById = Record<string, ActGenerated>;

// What RewardsBrowser consumes
export type RewardRowGenerated = {
  questId: string;
  questName: LString;
  actId: number;
  rewardId: string;
  rewardType: RewardType;
  label: LString;
  choicesByClass?: Partial<Record<ClassName, LString[]>>;
  choices?: LString[];
};
