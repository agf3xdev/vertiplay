import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { gate, str, strOpt, parseInt0, parseFloat0, slugify } from "@/lib/admin-api";

export async function GET() {
  const g = await gate();
  if (g) return g;
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { brand: { select: { name: true, slug: true } } },
  });
  return NextResponse.json({ products });
}

export async function POST(req: Request) {
  const g = await gate();
  if (g) return g;
  const body = await req.json();
  const name = str(body.name).trim();
  const brandId = str(body.brandId);
  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });
  if (!brandId) return NextResponse.json({ error: "brandId required" }, { status: 400 });
  const slug = slugify(strOpt(body.slug) ?? name);
  const exists = await prisma.product.findUnique({ where: { slug } });
  if (exists) return NextResponse.json({ error: "slug in use" }, { status: 409 });
  const created = await prisma.product.create({
    data: {
      brandId,
      slug,
      name,
      description: str(body.description),
      imageUrl: str(body.imageUrl),
      gallery: str(body.gallery),
      priceBRL: parseInt0(body.priceBRL),
      oldPriceBRL: body.oldPriceBRL !== undefined && body.oldPriceBRL !== "" ? parseInt0(body.oldPriceBRL) : null,
      currency: "BRL",
      category: str(body.category, "Outros"),
      stock: body.stock === undefined ? 50 : parseInt0(body.stock),
      rating: body.rating === undefined ? 4.7 : parseFloat0(body.rating),
      affiliateUrl: strOpt(body.affiliateUrl),
    },
  });
  return NextResponse.json({ product: created });
}
