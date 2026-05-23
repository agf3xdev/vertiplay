import { notFound } from "next/navigation";
import { findSeries } from "@/lib/catalog";
import { brandsBySeries, productsBySeries } from "@/lib/shop";
import { SeriesDetailClient } from "./SeriesDetailClient";

export default async function SeriesPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const series = findSeries(slug);
  if (!series) notFound();
  const brands = brandsBySeries(series.id);
  const products = productsBySeries(series.id);
  return <SeriesDetailClient series={series} brands={brands} products={products} />;
}
