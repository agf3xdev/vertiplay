// Recebe submissões de histórias dos usuários (UGC pipeline)
// No MVP, persiste em arquivo local. Em prod, troca por Prisma (StorySubmission).

import { promises as fs } from "node:fs";
import { dataPath } from "@/lib/data-dir";

const storePath = () => dataPath("stories.json");

type Submission = {
  id: string;
  authorName: string;
  email?: string;
  phone?: string;
  title: string;
  genre?: string;
  synopsis: string;
  inspiration?: string;
  consent: boolean;
  status: "pending";
  createdAt: string;
};

async function readAll(): Promise<Submission[]> {
  try {
    const raw = await fs.readFile(await storePath(), "utf8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function writeAll(list: Submission[]) {
  await fs.writeFile(await storePath(), JSON.stringify(list, null, 2), "utf8");
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { authorName, title, synopsis, consent } = body ?? {};

  if (!authorName || !title || !synopsis || !consent) {
    return Response.json({ error: "Campos obrigatórios faltando" }, { status: 400 });
  }
  if (String(synopsis).length < 60 || String(synopsis).length > 4000) {
    return Response.json({ error: "Sinopse fora do tamanho permitido" }, { status: 400 });
  }

  const item: Submission = {
    id: "story_" + Math.random().toString(36).slice(2, 10),
    authorName: String(authorName).slice(0, 120),
    email: body.email ? String(body.email).slice(0, 200) : undefined,
    phone: body.phone ? String(body.phone).slice(0, 50) : undefined,
    title: String(title).slice(0, 200),
    genre: body.genre ? String(body.genre).slice(0, 60) : undefined,
    synopsis: String(synopsis).slice(0, 4000),
    inspiration: body.inspiration ? String(body.inspiration).slice(0, 400) : undefined,
    consent: Boolean(consent),
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  const all = await readAll();
  all.unshift(item);
  await writeAll(all);

  return Response.json({ ok: true, id: item.id });
}

export async function GET() {
  const all = await readAll();
  return Response.json({ count: all.length, items: all.slice(0, 100) });
}
