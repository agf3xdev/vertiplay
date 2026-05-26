import { prisma } from "@/lib/prisma";
import { StoriesClient } from "./StoriesClient";

export const dynamic = "force-dynamic";

export default async function StoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = await searchParams;
  const where = sp.status ? { status: sp.status } : undefined;
  const stories = await prisma.storySubmission.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });
  const counts = await prisma.storySubmission.groupBy({
    by: ["status"],
    _count: { _all: true },
  });
  const summary = Object.fromEntries(counts.map((c) => [c.status, c._count._all]));
  return <StoriesClient stories={stories} summary={summary} active={sp.status ?? "all"} />;
}
