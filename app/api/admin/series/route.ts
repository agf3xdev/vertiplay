import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { gate, str, strOpt, parseInt0, parseFloat0, bool, slugify } from "@/lib/admin-api";

export async function GET() {
  const g = await gate();
  if (g) return g;
  const series = await prisma.series.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { episodes: true, watchlist: true } } },
  });
  return NextResponse.json({ series });
}

export async function POST(req: Request) {
  const g = await gate();
  if (g) return g;
  const body = await req.json();
  const title = str(body.title).trim();
  if (!title) return NextResponse.json({ error: "title required" }, { status: 400 });
  const slugInput = strOpt(body.slug);
  const slug = slugify(slugInput ?? title);
  const exists = await prisma.series.findUnique({ where: { slug } });
  if (exists) return NextResponse.json({ error: "slug already in use" }, { status: 409 });

  const created = await prisma.series.create({
    data: {
      slug,
      title,
      synopsis: str(body.synopsis),
      posterUrl: str(body.posterUrl),
      bannerUrl: strOpt(body.bannerUrl),
      genre: str(body.genre, "Drama"),
      tags: str(body.tags),
      language: str(body.language, "pt-BR"),
      isDubbed: body.isDubbed === undefined ? true : bool(body.isDubbed),
      views: parseInt0(body.views),
      rating: parseFloat0(body.rating),
      totalEpisodes: parseInt0(body.totalEpisodes),
      freeEpisodes: body.freeEpisodes === undefined ? 3 : parseInt0(body.freeEpisodes),
      isFeatured: bool(body.isFeatured),
      isExclusive: bool(body.isExclusive),
    },
  });
  return NextResponse.json({ series: created });
}
