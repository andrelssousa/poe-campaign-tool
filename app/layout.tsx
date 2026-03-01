// app\layout.tsx
import "./globals.css";
import { TopBar } from "@/components/features/TopBar";
import { HydrationGate } from "@/components/ui/HydrationGate";
import { HtmlLangSync } from "@/components/ui/HtmlLangSync";
import { readGenerated } from "@/lib/readGenerated.server";

export const metadata = {
  title: "PoE Campaign Tool",
  description: "Advanced PoE1 campaign rewards + tracker",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const questById = readGenerated<Record<string, any>>("questById.json");
  const totalQuests = Object.keys(questById).length;

  // uses your act-by-id JSON shape like the one you pasted
  const actById = readGenerated<Record<string, any>>("actById.json");

  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-950 text-zinc-100 antialiased">
        <HtmlLangSync>
          <div className="mx-auto max-w-5xl px-4 py-4">
            <div className="rounded-2xl bg-zinc-950/60 p-3 sm:p-4">
              <HydrationGate>
                <TopBar totalQuests={totalQuests} actById={actById} />
                {children}
              </HydrationGate>
            </div>
          </div>
        </HtmlLangSync>
      </body>
    </html>
  );
}
