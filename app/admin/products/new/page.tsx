import { prisma } from "@/lib/prisma";
import { NewProductForm } from "./NewProductForm";

export const dynamic = "force-dynamic";

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ brandId?: string }>;
}) {
  const sp = await searchParams;
  const brands = await prisma.brand.findMany({
    orderBy: { name: "asc" },
    select: { id: true, name: true },
  });
  return <NewProductForm brands={brands} preselectBrandId={sp.brandId} />;
}
