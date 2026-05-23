// GET /api/me — retorna usuário logado + amigos/pedidos
import { auth } from "@/auth";
import { findUserByEmail, listFriendsFor } from "@/lib/social-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) {
    return Response.json({ authenticated: false }, { status: 401 });
  }
  const me = await findUserByEmail(session.user.email);
  if (!me) {
    return Response.json({ authenticated: true, user: null }, { status: 404 });
  }
  const social = await listFriendsFor(me.username);
  return Response.json({
    authenticated: true,
    user: {
      username: me.username,
      displayName: me.displayName,
      email: me.email,
      avatarUrl: me.avatarUrl,
    },
    ...social,
  });
}
