// app\page.tsx
import Link from "next/link";
import { ClientT } from "@/components/ui/ClientT";

export default function Home() {
  return (
    <main>
      <h1 className="mb-1 text-2xl font-bold">
        <ClientT k="home_title" />
      </h1>
      <p className="text-zinc-400">
        <ClientT k="home_subtitle" />
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <Link
          href="/acts"
          className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 hover:bg-zinc-900/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50"
        >
          <div className="mb-1 font-semibold">
            <ClientT k="home_card_acts_title" />
          </div>
          <div className="text-sm text-zinc-400">
            <ClientT k="home_card_acts_desc" />
          </div>
        </Link>

        <Link
          href="/rewards/gems"
          className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 hover:bg-zinc-900/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50"
        >
          <div className="mb-1 font-semibold">
            <ClientT k="home_card_gems_title" />
          </div>
          <div className="text-sm text-zinc-400">
            <ClientT k="home_card_gems_desc" />
          </div>
        </Link>

        <Link
          href="/tracker"
          className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 hover:bg-zinc-900/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500/50"
        >
          <div className="mb-1 font-semibold">
            <ClientT k="home_card_tracker_title" />
          </div>
          <div className="text-sm text-zinc-400">
            <ClientT k="home_card_tracker_desc" />
          </div>
        </Link>
      </div>
    </main>
  );
}
