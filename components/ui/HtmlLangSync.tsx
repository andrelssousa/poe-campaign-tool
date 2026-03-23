// src/components/ui/HtmlLangSync.tsx
"use client";

import { useEffect, type ReactNode } from "react";
import { useAppStore } from "@/store/useAppStore";

export function HtmlLangSync({ children }: { children: ReactNode }) {
  const language = useAppStore((s) => s.language);

  useEffect(() => {
    const el = document.documentElement;

    el.lang = language;

    // Future-proof for RTL languages
    const RTL_LANGS = new Set(["ar", "he", "fa", "ur"]);
    const base = language.split("-")[0];
    el.dir = RTL_LANGS.has(base) ? "rtl" : "ltr";
  }, [language]);

  return <>{children}</>;
}
