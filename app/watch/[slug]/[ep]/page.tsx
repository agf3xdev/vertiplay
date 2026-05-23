import { notFound } from "next/navigation";
import { findSeries } from "@/lib/catalog";
import { WatchClient } from "./WatchClient";

export default async function WatchPage({
  params,
}: {
  params: Promise<{ slug: string; ep: string }>;
}) {
  const { slug, ep } = await params;
  const series = findSeries(slug);
  if (!series) notFound();
  const epNumber = parseInt(ep, 10);
  const episode = series.episodes.find((e) => e.number === epNumber);
  if (!episode) notFound();
  return <WatchClient series={series} initialEpNumber={epNumber} />;
}
