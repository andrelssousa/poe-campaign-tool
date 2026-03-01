export type ClassId =
  | "Marauder"
  | "Ranger"
  | "Witch"
  | "Duelist"
  | "Templar"
  | "Shadow"
  | "Scion";

export type RewardType =
  | "gem_choice"
  | "flask_choice"
  | "item_base"
  | "vendor_unlock"
  | "pantheon_unlock"
  | "book_of_skill"
  | "book_of_regrets"
  | "passive_point";

export type Reward =
  | {
      type: "gem_choice";
      id: string;
      label: string;
      choicesByClass: Partial<Record<ClassId, string[]>>;
    }
  | {
      type: "flask_choice";
      id: string;
      label: string;
      choices: string[];
    }
  | {
      type: "book_of_skill" | "book_of_regrets" | "passive_point";
      id: string;
      label: string;
    }
  | {
      type: "item_base";
      id: string;
      label: string;
      bases: string[];
    }
  | {
      type: "vendor_unlock";
      id: string;
      label: string;
      vendorId: string;
      scope: string;
    }
  | {
      type: "pantheon_unlock";
      id: string;
      label: string;
      majorOrMinor: "major" | "minor";
      godId: string;
    };

export type Quest = {
  id: string;
  actId: number;
  name: string;
  isOptional: boolean;
  steps: string[];
  rewards: Reward[];
};

export type Act = {
  id: number;
  name: string;
  slug: string;
  questsInOrder: string[];
};