// Submissões de histórias dos usuários (UGC pipeline) — Postgres via Prisma.

import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { authorName, title, synopsis, consent } = body ?? {};

  if (!authorName || !title || !synopsis || !consent) {
    return Response.json({ error: "Campos obrigatórios faltando" }, { status: 400 });
  }
  if (String(synopsis).length < 60 || String(synopsis).length > 4000) {
    return Response.json({ error: "Sinopse fora do tamanho permitido" }, { status: 400 });
  }

  const item = await prisma.storySubmission.create({
    data: {
      authorName: String(authorName).slice(0, 120),
      email: body.email ? String(body.email).slice(0, 200) : undefined,
      phone: body.phone ? String(body.phone).slice(0, 50) : undefined,
      title: String(title).slice(0, 200),
      genre: body.genre ? String(body.genre).slice(0, 60) : undefined,
      synopsis: String(synopsis).slice(0, 4000),
      inspiration: body.inspiration ? String(body.inspiration).slice(0, 400) : undefined,
      consent: Boolean(consent),
      status: "pending",
    },
  });

  return Response.json({ ok: true, id: item.id });
}

export async function GET() {
  const items = await prisma.storySubmission.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  const count = await prisma.storySubmission.count();
  return Response.json({ count, items });
}
