// Seleção de histórias para novelas verticais — chamada aberta pra novos autores.
// Postgres via Prisma + argumento em PDF no Supabase Storage.

import { prisma } from "@/lib/prisma";
import { gate } from "@/lib/admin-api";
import { uploadScriptFile } from "@/lib/storage";
import { isWritersSubmissionOpen } from "@/lib/writers-deadline";

const VALID_GENRES = ["Drama", "Romance", "Comédia Romântica"];
const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB

export async function POST(req: Request) {
  if (!isWritersSubmissionOpen()) {
    return Response.json({ error: "As inscrições estão encerradas" }, { status: 403 });
  }

  const form = await req.formData().catch(() => null);
  if (!form) {
    return Response.json({ error: "Formulário inválido" }, { status: 400 });
  }

  const name = String(form.get("name") ?? "").trim();
  const email = String(form.get("email") ?? "").trim();
  const phone = String(form.get("phone") ?? "").trim();
  const cityState = String(form.get("cityState") ?? "").trim();
  const workTitle = String(form.get("workTitle") ?? "").trim();
  const scriptGenre = String(form.get("scriptGenre") ?? "").trim();
  const synopsis = String(form.get("synopsis") ?? "").trim();
  const consent = form.get("consent") === "true";

  if (!name || !email || !phone || !cityState || !workTitle || !scriptGenre || !synopsis || !consent) {
    return Response.json({ error: "Campos obrigatórios faltando" }, { status: 400 });
  }
  if (!VALID_GENRES.includes(scriptGenre)) {
    return Response.json({ error: "Gênero inválido" }, { status: 400 });
  }
  if (synopsis.length < 60 || synopsis.length > 4000) {
    return Response.json({ error: "Sinopse fora do tamanho permitido" }, { status: 400 });
  }

  const file = form.get("argument");
  if (!(file instanceof File) || file.size === 0) {
    return Response.json({ error: "Anexe o argumento em PDF" }, { status: 400 });
  }
  if (file.type !== "application/pdf") {
    return Response.json({ error: "O argumento precisa ser um arquivo PDF" }, { status: 400 });
  }
  if (file.size > MAX_FILE_SIZE) {
    return Response.json({ error: "Arquivo maior que 4MB" }, { status: 400 });
  }

  const safeName = file.name.replace(/[^\w.\-]+/g, "_").slice(-120);
  const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}/${safeName}`;
  await uploadScriptFile(path, file);

  const item = await prisma.writerApplication.create({
    data: {
      name: name.slice(0, 120),
      artisticName: String(form.get("artisticName") ?? "").trim().slice(0, 120) || undefined,
      email: email.slice(0, 200),
      phone: phone.slice(0, 50),
      cityState: cityState.slice(0, 120),
      portfolioUrl: String(form.get("portfolioUrl") ?? "").trim().slice(0, 300) || undefined,
      workTitle: workTitle.slice(0, 200),
      scriptGenre,
      synopsis: synopsis.slice(0, 4000),
      argumentFileUrl: path,
      argumentFileName: file.name.slice(0, 200),
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
