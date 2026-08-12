// Cadastro de roteiristas (recrutamento pra sala de roteiro) — Postgres via Prisma.

import { prisma } from "@/lib/prisma";
import { gate } from "@/lib/admin-api";
import { uploadScriptFile } from "@/lib/storage";

const EXPERIENCE_LEVELS = ["iniciante", "amador", "profissional"];
const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];
const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB

export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  if (!form) {
    return Response.json({ error: "Formulário inválido" }, { status: 400 });
  }

  const name = String(form.get("name") ?? "");
  const email = String(form.get("email") ?? "");
  const experience = String(form.get("experience") ?? "");
  const scriptGenre = String(form.get("scriptGenre") ?? "");
  const sample = String(form.get("sample") ?? "");
  const consent = form.get("consent") === "true";

  if (!name || !email || !experience || !scriptGenre || !sample || !consent) {
    return Response.json({ error: "Campos obrigatórios faltando" }, { status: 400 });
  }
  if (!EXPERIENCE_LEVELS.includes(experience)) {
    return Response.json({ error: "Experiência inválida" }, { status: 400 });
  }
  if (sample.length < 60 || sample.length > 4000) {
    return Response.json({ error: "Amostra fora do tamanho permitido" }, { status: 400 });
  }

  let scriptFileUrl: string | undefined;
  let scriptFileName: string | undefined;
  const file = form.get("script");
  if (file instanceof File && file.size > 0) {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return Response.json({ error: "Formato de arquivo não aceito (use PDF, DOC, DOCX ou TXT)" }, { status: 400 });
    }
    if (file.size > MAX_FILE_SIZE) {
      return Response.json({ error: "Arquivo maior que 4MB" }, { status: 400 });
    }
    const safeName = file.name.replace(/[^\w.\-]+/g, "_").slice(-120);
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}/${safeName}`;
    await uploadScriptFile(path, file);
    scriptFileUrl = path;
    scriptFileName = file.name.slice(0, 200);
  }

  const item = await prisma.writerApplication.create({
    data: {
      name: name.slice(0, 120),
      email: email.slice(0, 200),
      phone: String(form.get("phone") ?? "").slice(0, 50) || undefined,
      portfolioUrl: String(form.get("portfolioUrl") ?? "").slice(0, 300) || undefined,
      experience,
      scriptGenre: scriptGenre.slice(0, 60),
      genres: String(form.get("genres") ?? "").slice(0, 300),
      sample: sample.slice(0, 4000),
      scriptFileUrl,
      scriptFileName,
      motivation: String(form.get("motivation") ?? "").slice(0, 800) || undefined,
      availability: String(form.get("availability") ?? "").slice(0, 120) || undefined,
      consent,
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
