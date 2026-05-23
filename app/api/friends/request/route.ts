// POST /api/friends/request { to: "<username>" }
import { auth } from "@/auth";
import { findUserByEmail, findUserByUsername, requestFriendship } from "@/lib/social-store";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) return Response.json({ error: "não autenticado" }, { status: 401 });
  const me = await findUserByEmail(session.user.email);
  if (!me) return Response.json({ error: "user não registrado" }, { status: 404 });

  const { to } = await req.json().catch(() => ({}));
  if (!to) return Response.json({ error: "to ausente" }, { status: 400 });

  const target = await findUserByUsername(to);
  if (!target) return Response.json({ error: "usuário não existe" }, { status: 404 });

  const r = await requestFriendship(me.username, target.username);
  if (!r.ok) return Response.json({ error: r.reason }, { status: 400 });
  return Response.json({ ok: true });
}
