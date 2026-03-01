// src/app/rewards/gems/page.tsx
import { readGenerated } from "@/lib/readGenerated.server";
import { GemsBrowser } from "@/components/features/GemsBrowser";
import { ClientT } from "@/components/ui/ClientT";

export default function GemsIndex() {
  const gemToQuestsByClass = readGenerated<
    Record<string, Record<string, string[]>>
  >("gemToQuestsByClass.json");
  const questById =
    readGenerated<
      Record<string, { id: string; name: import("@/lib/l10n").LString }>
    >("questById.json");
  const rewardChoices = readGenerated<{
    gems?: Record<string, import("@/lib/l10n").LString>;
    flasks?: Record<string, import("@/lib/l10n").LString>;
  }>("rewardChoices.l10n.json");

  return (
    <main>
      <h1 className="text-2xl font-bold">
        <ClientT k="rewards_gems_title" />
      </h1>
      <p className="mt-1 text-zinc-400">
        <ClientT k="rewards_gems_subtitle" />
      </p>

      <GemsBrowser
        gemToQuestsByClass={gemToQuestsByClass}
        questById={questById}
        rewardChoices={rewardChoices}
      />
    </main>
  );
}
