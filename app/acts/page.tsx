// app/acts/page.tsx
import { ClientT } from "@/components/ui/ClientT";
import { readGenerated } from "@/lib/readGenerated.server";
import { ActsIndexClient } from "@/components/features/ActsIndexClient";

export default function ActsIndex() {
  const acts = readGenerated<any[]>("acts.json");

  const questById = readGenerated<Record<string, any>>("questById.json");
  const totalQuests = Object.keys(questById).length;

  return (
    <main>
      <h1 className="text-2xl font-bold">
        <ClientT k="acts_index_title" />
      </h1>
      <p className="mt-1 text-zinc-400">
        <ClientT k="acts_index_subtitle" />
      </p>

      {/* Client UI: progress bars, % per act, badges, glow, campaign complete, XP-style level */}
      <ActsIndexClient acts={acts} totalQuests={totalQuests} />
    </main>
  );
}
