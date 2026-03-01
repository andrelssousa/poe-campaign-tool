// src/lib/l10n.ts
import type { Language } from "@/lib/i18n";

export type LString = string | Partial<Record<Language, string>>;

export function l(lang: Language, v: LString | undefined | null): string {
  if (v == null) return "";
  if (typeof v === "string") return v;
  return v[lang] ?? v.en ?? v["pt-BR"] ?? "";
}
