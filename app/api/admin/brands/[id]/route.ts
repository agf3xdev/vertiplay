import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { gate, strOpt, bool, slugify } from "@/lib/admin-api";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await gate();
  if (g) return g;
  const { id } = await params;
  const body = await req.json();
  const data: any = {};
  if (typeof body.name === "string") data.name = body.name;
  if (typeof body.slug === "string") data.slug = slugify(body.slug);
  if (typeof body.logoUrl === "string") data.logoUrl = body.logoUrl;
  if (body.coverUrl !== undefined) data.coverUrl = strOpt(body.coverUrl);
  if (typeof body.bio === "string") data.bio = body.bio;
  if (body.website !== undefined) data.website = strOpt(body.website);
  if (typeof body.category === "string") data.category = body.category;
  if (body.isVerified !== undefined) data.isVerified = bool(body.isVerified);
  const updated = await prisma.brand.update({ where: { id }, data });
  return NextResponse.json({ brand: updated });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await gate();
  if (g) return g;
  const { id } = await params;
  await prisma.brand.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
