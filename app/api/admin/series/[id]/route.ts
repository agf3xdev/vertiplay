import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { gate, str, strOpt, parseInt0, parseFloat0, bool, slugify } from "@/lib/admin-api";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await gate();
  if (g) return g;
  const { id } = await params;
  const series = await prisma.series.findUnique({
    where: { id },
    include: { episodes: { orderBy: { number: "asc" } } },
  });
  if (!series) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json({ series });
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await gate();
  if (g) return g;
  const { id } = await params;
  const body = await req.json();
  const data: any = {};
  if (typeof body.title === "string") data.title = body.title;
  if (typeof body.slug === "string") data.slug = slugify(body.slug);
  if (typeof body.synopsis === "string") data.synopsis = body.synopsis;
  if (typeof body.posterUrl === "string") data.posterUrl = body.posterUrl;
  if (body.bannerUrl !== undefined) data.bannerUrl = strOpt(body.bannerUrl);
  if (typeof body.genre === "string") data.genre = body.genre;
  if (typeof body.tags === "string") data.tags = body.tags;
  if (typeof body.language === "string") data.language = body.language;
  if (body.isDubbed !== undefined) data.isDubbed = bool(body.isDubbed);
  if (body.views !== undefined) data.views = parseInt0(body.views);
  if (body.rating !== undefined) data.rating = parseFloat0(body.rating);
  if (body.totalEpisodes !== undefined) data.totalEpisodes = parseInt0(body.totalEpisodes);
  if (body.freeEpisodes !== undefined) data.freeEpisodes = parseInt0(body.freeEpisodes);
  if (body.isFeatured !== undefined) data.isFeatured = bool(body.isFeatured);
  if (body.isExclusive !== undefined) data.isExclusive = bool(body.isExclusive);

  const updated = await prisma.series.update({ where: { id }, data });
  return NextResponse.json({ series: updated });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await gate();
  if (g) return g;
  const { id } = await params;
  await prisma.series.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
