import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { SeriesEditor } from "./SeriesEditor";

export const dynamic = "force-dynamic";

export default async function EditSeriesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const series = await prisma.series.findUnique({
    where: { id },
    include: { episodes: { orderBy: { number: "asc" } } },
  });
  if (!series) notFound();
  return <SeriesEditor series={series} />;
}
