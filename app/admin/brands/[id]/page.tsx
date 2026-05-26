import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { BrandEditor } from "./BrandEditor";

export const dynamic = "force-dynamic";

export default async function EditBrandPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const brand = await prisma.brand.findUnique({
    where: { id },
    include: {
      products: { orderBy: { createdAt: "desc" } },
      sponsorships: true,
    },
  });
  if (!brand) notFound();
  return <BrandEditor brand={brand} />;
}
