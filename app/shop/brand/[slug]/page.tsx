import { notFound } from "next/navigation";
import { findBrandBySlug, productsByBrand, seriesByBrand } from "@/lib/shop";
import { BrandPageClient } from "./BrandPageClient";

export default async function BrandPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const brand = findBrandBySlug(slug);
  if (!brand) notFound();
  const products = productsByBrand(brand.id);
  const series = seriesByBrand(brand.id);
  return <BrandPageClient brand={brand} products={products} series={series} />;
}
