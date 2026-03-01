// app/acts/[actId]/page.tsx
import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import { ActQuestList } from "@/components/features/ActQuestList";
import { ClientT } from "@/components/ui/ClientT";
import { ActHeaderProgress } from "@/components/features/ActHeaderProgress";

function readGenerated(fileName: string) {
  const full = path.join(process.cwd(), "data", "generated", fileName);
  return JSON.parse(fs.readFileSync(full, "utf-8"));
}

export default async function ActPage({
  params,
}: {
  params: Promise<{ actId: string }>;
}) {
  const { actId } = await params;

  const actById = readGenerated("actById.json") as Record<string, any>;
  const questById = readGenerated("questById.json") as Record<string, any>;

  const act = actById[actId];

  if (!act) {
    return (
      <main>
        <h1 className="text-2xl font-bold">
          <ClientT k="acts_act_notFound" />
        </h1>
        <Link href="/acts" className="mt-2 inline-block text-zinc-300 underline">
          <ClientT k="acts_backToActs" />
        </Link>
      </main>
    );
  }

  return (
    <main>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h1 className="text-2xl font-bold">{act.name}</h1>
        <Link
          href="/acts"
          className="text-sm text-zinc-300 underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40"
        >
          <ClientT k="common_back" />
        </Link>
      </div>

      {/* Sticky progress header (client) */}
      <ActHeaderProgress actName={act.name} questIdsInOrder={act.questsInOrder} />

      <ActQuestList questIdsInOrder={act.questsInOrder} questById={questById} />
    </main>
  );
}
