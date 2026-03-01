// components\ui\HtmlLangSync.tsx
"use client";

import { useEffect } from "react";
import { useAppStore } from "@/store/useAppStore";

export function HtmlLangSync({ children }: { children: React.ReactNode }) {
  const language = useAppStore((s) => s.language);

  useEffect(() => {
    const el = document.documentElement;
    el.lang = language;
    // Future-proof if you ever add RTL languages
    el.dir = "ltr";
  }, [language]);

  return <>{children}</>;
}
