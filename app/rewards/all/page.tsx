// src/app/rewards/all/page.tsx
import { readGenerated } from "@/lib/readGenerated.server";
import { RewardsBrowser } from "@/components/features/RewardsBrowser";
import { ClientT } from "@/components/ui/ClientT";

export default function AllRewardsPage() {
  const rewardsIndex = readGenerated<any[]>("rewardsIndex.json");

  return (
    <main>
      <h1 className="text-2xl font-bold">
        <ClientT k="rewards_all_title" />
      </h1>

      <p className="mt-1 text-zinc-400">
        <ClientT k="rewards_all_subtitle" />
      </p>

      <RewardsBrowser rewardsIndex={rewardsIndex} />
    </main>
  );
}
