import { notFound } from "next/navigation";
import { findProductBySlug, BRANDS } from "@/lib/shop";
import { SERIES } from "@/lib/catalog";
import { ProductPageClient } from "./ProductPageClient";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = findProductBySlug(slug);
  if (!product) notFound();
  const brand = BRANDS.find((b) => b.id === product.brandId)!;
  const seriesList = SERIES.filter((s) =>
    product.appearances.some((a) => a.seriesId === s.id)
  );
  return <ProductPageClient product={product} brand={brand} seriesList={seriesList} />;
}
