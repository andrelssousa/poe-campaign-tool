// app/acts/[actId]/page.tsx
// app/acts/[actId]/page.tsx
import Link from "next/link";
import { readGenerated } from "@/lib/readGenerated.server";
import { ActQuestList } from "@/components/features/ActQuestList";
import { ClientT } from "@/components/ui/ClientT";
import { ActHeaderProgress } from "@/components/features/ActHeaderProgress";

type ActLike = {
  id?: number;
  name?: unknown;
  slug?: unknown;
  questsInOrder?: unknown;
};

function isActLike(x: unknown): x is ActLike {
  return typeof x === "object" && x !== null;
}

function getQuestsInOrder(act: ActLike): string[] {
  const v = act.questsInOrder;
  if (!Array.isArray(v)) return [];
  return v.filter((q): q is string => typeof q === "string");
}

export default async function ActPage({
  params,
}: {
  params: Promise<{ actId: string }>;
}) {
  const { actId } = await params;

  // ✅ no any
  const actById = readGenerated<Record<string, unknown>>("actById.json");
  const questById = readGenerated<Record<string, unknown>>("questById.json");

  const direct = actById[actId];
  const numeric = actById[String(Number(actId))];
  const actPrefixed = actById[`act${actId}`];

  const found =
    direct ??
    numeric ??
    actPrefixed ??
    Object.values(actById).find((a) => {
      if (!isActLike(a)) return false;
      const id = a.id;
      const slug = a.slug;
      return String(id) === actId || String(slug) === actId;
    });

  if (!isActLike(found)) {
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

  const questsInOrder = getQuestsInOrder(found);
  const actName = typeof found.name === "string" ? found.name : `Act ${found.id ?? ""}`;

  return (
    <main>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h1 className="text-2xl font-bold">{actName}</h1>
        <Link
          href="/acts"
          className="text-sm text-zinc-300 underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/40"
        >
          <ClientT k="common_back" />
        </Link>
      </div>

      {/* Sticky progress header (client) */}
      <ActHeaderProgress actName={String(actName)} questIdsInOrder={questsInOrder} />

      <ActQuestList questIdsInOrder={questsInOrder} questById={questById as any} />
    </main>
  );
}
