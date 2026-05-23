// POST /api/friends/remove { username }
import { auth } from "@/auth";
import { findUserByEmail, removeFriendship } from "@/lib/social-store";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.email) return Response.json({ error: "não autenticado" }, { status: 401 });
  const me = await findUserByEmail(session.user.email);
  if (!me) return Response.json({ error: "user não registrado" }, { status: 404 });
  const { username } = await req.json().catch(() => ({}));
  if (!username) return Response.json({ error: "username ausente" }, { status: 400 });
  const ok = await removeFriendship(me.username, username);
  return Response.json({ ok });
}
