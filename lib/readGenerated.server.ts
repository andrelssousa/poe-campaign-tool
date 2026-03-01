// lib/readGenerated.server.ts
import fs from "node:fs";
import path from "node:path";

export function readGenerated<T = any>(fileName: string): T {
  const full = path.join(process.cwd(), "data", "generated", fileName);
  return JSON.parse(fs.readFileSync(full, "utf-8"));
}