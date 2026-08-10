// Cadastro de roteiristas (recrutamento pra sala de roteiro) — Postgres via Prisma.

import { prisma } from "@/lib/prisma";
import { gate } from "@/lib/admin-api";

const EXPERIENCE_LEVELS = ["iniciante", "amador", "profissional"];

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { name, email, experience, genres, sample, consent } = body ?? {};

  if (!name || !email || !experience || !sample || !consent) {
    return Response.json({ error: "Campos obrigatórios faltando" }, { status: 400 });
  }
  if (!EXPERIENCE_LEVELS.includes(String(experience))) {
    return Response.json({ error: "Experiência inválida" }, { status: 400 });
  }
  if (String(sample).length < 60 || String(sample).length > 4000) {
    return Response.json({ error: "Amostra fora do tamanho permitido" }, { status: 400 });
  }

  const item = await prisma.writerApplication.create({
    data: {
      name: String(name).slice(0, 120),
      email: String(email).slice(0, 200),
      phone: body.phone ? String(body.phone).slice(0, 50) : undefined,
      portfolioUrl: body.portfolioUrl ? String(body.portfolioUrl).slice(0, 300) : undefined,
      experience: String(experience),
      genres: body.genres ? String(genres).slice(0, 300) : "",
      sample: String(sample).slice(0, 4000),
      motivation: body.motivation ? String(body.motivation).slice(0, 800) : undefined,
      availability: body.availability ? String(body.availability).slice(0, 120) : undefined,
      consent: Boolean(consent),
      status: "pending",
    },
  });

  return Response.json({ ok: true, id: item.id });
}

export async function GET() {
  const g = await gate();
  if (g) return g;
  const items = await prisma.writerApplication.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  const count = await prisma.writerApplication.count();
  return Response.json({ count, items });
}
