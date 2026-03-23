// lib/readGenerated.server.ts
import fs from "node:fs";
import path from "node:path";

type CacheEntry = {
  mtimeMs: number;
  value: unknown;
};

const cache = new Map<string, CacheEntry>();

export function readGenerated<T = unknown>(fileName: string): T {
  const full = path.join(process.cwd(), "data", "generated", fileName);

  // Invalidate cache when the file changes (regen / edit)
  const stat = fs.statSync(full);
  const cached = cache.get(full);

  if (cached && cached.mtimeMs === stat.mtimeMs) {
    return cached.value as T;
  }

  const value = JSON.parse(fs.readFileSync(full, "utf-8")) as T;
  cache.set(full, { mtimeMs: stat.mtimeMs, value });
  return value;
}
