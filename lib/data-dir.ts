// Diretório writable pros JSON "DBs" do MVP.
// Em dev: ./prisma/. Em prod (DO container): /app/prisma é read-only,
// então caímos pra /tmp/vertiplay/ (efêmero — em redeploy o estado some,
// mas pro MVP funciona até trocar pra Prisma/Postgres).

import { promises as fs } from "node:fs";
import { join } from "node:path";

let cached: string | null = null;

export async function dataDir(): Promise<string> {
  if (cached) return cached;
  const primary = join(process.cwd(), "prisma");
  const fallback = "/tmp/vertiplay";
  // testa escrita
  try {
    await fs.mkdir(primary, { recursive: true });
    await fs.writeFile(join(primary, ".write-test"), "ok");
    cached = primary;
    return primary;
  } catch {
    await fs.mkdir(fallback, { recursive: true });
    cached = fallback;
    return fallback;
  }
}

export async function dataPath(filename: string): Promise<string> {
  return join(await dataDir(), filename);
}
