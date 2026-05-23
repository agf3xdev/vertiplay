// POST /api/friends/reject { from: "<username>" }
import { auth } from "@/auth";
import { findUserByEmail, rejectFriendship } from "@/lib/social-store";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) return Response.json({ error: "não autenticado" }, { status: 401 });
  const me = await findUserByEmail(session.user.email);
  if (!me) return Response.json({ error: "user não registrado" }, { status: 404 });
  const { from } = await req.json().catch(() => ({}));
  if (!from) return Response.json({ error: "from ausente" }, { status: 400 });
  const ok = await rejectFriendship(from, me.username);
  if (!ok) return Response.json({ error: "nenhum pedido pendente" }, { status: 404 });
  return Response.json({ ok: true });
}
