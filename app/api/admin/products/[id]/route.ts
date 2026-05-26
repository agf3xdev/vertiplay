import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { gate, strOpt, parseInt0, parseFloat0, slugify } from "@/lib/admin-api";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await gate();
  if (g) return g;
  const { id } = await params;
  const body = await req.json();
  const data: any = {};
  if (typeof body.name === "string") data.name = body.name;
  if (typeof body.slug === "string") data.slug = slugify(body.slug);
  if (typeof body.description === "string") data.description = body.description;
  if (typeof body.imageUrl === "string") data.imageUrl = body.imageUrl;
  if (typeof body.gallery === "string") data.gallery = body.gallery;
  if (body.priceBRL !== undefined) data.priceBRL = parseInt0(body.priceBRL);
  if (body.oldPriceBRL !== undefined) data.oldPriceBRL = body.oldPriceBRL === "" ? null : parseInt0(body.oldPriceBRL);
  if (typeof body.category === "string") data.category = body.category;
  if (body.stock !== undefined) data.stock = parseInt0(body.stock);
  if (body.rating !== undefined) data.rating = parseFloat0(body.rating);
  if (body.affiliateUrl !== undefined) data.affiliateUrl = strOpt(body.affiliateUrl);
  if (typeof body.brandId === "string") data.brandId = body.brandId;
  const updated = await prisma.product.update({ where: { id }, data });
  return NextResponse.json({ product: updated });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await gate();
  if (g) return g;
  const { id } = await params;
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
