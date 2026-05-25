// POST /api/auth/email/start { email } — envia código de 6 dígitos
import { sendOtpEmail } from "@/lib/email";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = String(body.email ?? "").trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return Response.json({ error: "Email inválido" }, { status: 400 });
    }
    const r = await sendOtpEmail(email);
    if (!r.ok) {
      console.error("[email/start] failed:", r.error);
      return Response.json({ error: r.error ?? "Falha ao enviar" }, { status: 500 });
    }
    return Response.json({ ok: true });
  } catch (e: any) {
    console.error("[email/start] uncaught:", e?.message, e);
    return Response.json({ error: e?.message ?? "Erro interno" }, { status: 500 });
  }
}
