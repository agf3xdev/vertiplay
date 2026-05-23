// POST /api/auth/email/start { email } — envia código de 6 dígitos
import { sendOtpEmail } from "@/lib/email";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = String(body.email ?? "").trim().toLowerCase();
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return Response.json({ error: "Email inválido" }, { status: 400 });
  }
  const r = await sendOtpEmail(email);
  if (!r.ok) return Response.json({ error: r.error }, { status: 500 });
  return Response.json({ ok: true });
}
