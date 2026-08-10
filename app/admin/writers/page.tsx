import { prisma } from "@/lib/prisma";
import { WritersClient } from "./WritersClient";

export const dynamic = "force-dynamic";

export default async function WritersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = await searchParams;
  const where = sp.status ? { status: sp.status } : undefined;
  const writers = await prisma.writerApplication.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
  const counts = await prisma.writerApplication.groupBy({
    by: ["status"],
    _count: { _all: true },
  });
  const summary = Object.fromEntries(counts.map((c) => [c.status, c._count._all]));
  return <WritersClient writers={writers} summary={summary} active={sp.status ?? "all"} />;
}
