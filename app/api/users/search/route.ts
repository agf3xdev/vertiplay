// GET /api/users/search?q= — busca usuários registrados (exclui o logado)
import { auth } from "@/auth";
import { searchUsersDB } from "@/lib/social-store";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const session = await auth();
  const url = new URL(req.url);
  const q = url.searchParams.get("q") ?? "";
  const excludeEmail = session?.user?.email ?? undefined;
  const users = await searchUsersDB(q, excludeEmail);
  return Response.json({
    users: users.map((u) => ({
      username: u.username,
      displayName: u.displayName,
      avatarUrl: u.avatarUrl,
      bio: u.bio,
    })),
  });
}
