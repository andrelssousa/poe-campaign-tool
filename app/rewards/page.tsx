// app/rewards/page.tsx
import Link from "next/link";
import { ClientT } from "@/components/ui/ClientT";

export default function RewardsHome() {
  return (
    <main>
      <h1 className="text-2xl font-bold">
        <ClientT k="rewards_home_title" />
      </h1>
      <p className="mt-1 text-zinc-400">
        <ClientT k="rewards_home_subtitle" />
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Link
          href="/rewards/gems"
          className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 hover:bg-zinc-900/60"
        >
          <div className="font-semibold">
            <ClientT k="rewards_home_gems_title" />
          </div>
          <div className="text-sm text-zinc-400">
            <ClientT k="rewards_home_gems_desc" />
          </div>
        </Link>

        <Link
          href="/rewards/all"
          className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4 hover:bg-zinc-900/60"
        >
          <div className="font-semibold">
            <ClientT k="rewards_home_all_title" />
          </div>
          <div className="text-sm text-zinc-400">
            <ClientT k="rewards_home_all_desc" />
          </div>
        </Link>
      </div>
    </main>
  );
}
