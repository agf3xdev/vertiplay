import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { gate, str, parseInt0, bool } from "@/lib/admin-api";

export async function POST(req: Request) {
  const g = await gate();
  if (g) return g;
  const body = await req.json();
  const seriesId = str(body.seriesId);
  if (!seriesId) return NextResponse.json({ error: "seriesId required" }, { status: 400 });

  const last = await prisma.episode.findFirst({
    where: { seriesId },
    orderBy: { number: "desc" },
  });
  const number = body.number !== undefined ? parseInt0(body.number) : (last?.number ?? 0) + 1;

  const created = await prisma.episode.create({
    data: {
      seriesId,
      number,
      title: str(body.title, `Episódio ${number}`),
      durationSec: body.durationSec === undefined ? 75 : parseInt0(body.durationSec),
      videoUrl: str(body.videoUrl),
      thumbUrl: str(body.thumbUrl),
      costCoins: body.costCoins === undefined ? 20 : parseInt0(body.costCoins),
      isFree: bool(body.isFree),
    },
  });

  // Atualiza totalEpisodes da série
  const count = await prisma.episode.count({ where: { seriesId } });
  await prisma.series.update({ where: { id: seriesId }, data: { totalEpisodes: count } });

  return NextResponse.json({ episode: created });
}
