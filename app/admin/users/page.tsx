import { prisma } from "@/lib/prisma";
import { UsersClient } from "./UsersClient";

export const dynamic = "force-dynamic";

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; filter?: string }>;
}) {
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const filter = sp.filter ?? "all";

  const where: any = {};
  if (q) {
    where.OR = [
      { email: { contains: q, mode: "insensitive" } },
      { username: { contains: q, mode: "insensitive" } },
      { displayName: { contains: q, mode: "insensitive" } },
    ];
  }
  if (filter === "vip") where.isVip = true;

  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return <UsersClient users={users} q={q} filter={filter} />;
}
