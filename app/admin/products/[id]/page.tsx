import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ProductEditor } from "./ProductEditor";

export const dynamic = "force-dynamic";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await prisma.product.findUnique({
    where: { id },
    include: { brand: true, appearances: true },
  });
  if (!product) notFound();
  const brands = await prisma.brand.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } });
  const series = await prisma.series.findMany({ orderBy: { title: "asc" }, select: { id: true, title: true, slug: true } });
  return <ProductEditor product={product} brands={brands} series={series} />;
}
