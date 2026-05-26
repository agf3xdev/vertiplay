import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { gate, parseInt0, bool } from "@/lib/admin-api";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await gate();
  if (g) return g;
  const { id } = await params;
  const body = await req.json();
  const data: any = {};
  if (typeof body.title === "string") data.title = body.title;
  if (typeof body.videoUrl === "string") data.videoUrl = body.videoUrl;
  if (typeof body.thumbUrl === "string") data.thumbUrl = body.thumbUrl;
  if (body.number !== undefined) data.number = parseInt0(body.number);
  if (body.durationSec !== undefined) data.durationSec = parseInt0(body.durationSec);
  if (body.costCoins !== undefined) data.costCoins = parseInt0(body.costCoins);
  if (body.isFree !== undefined) data.isFree = bool(body.isFree);

  const updated = await prisma.episode.update({ where: { id }, data });
  return NextResponse.json({ episode: updated });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await gate();
  if (g) return g;
  const { id } = await params;
  const ep = await prisma.episode.delete({ where: { id } });
  const count = await prisma.episode.count({ where: { seriesId: ep.seriesId } });
  await prisma.series.update({ where: { id: ep.seriesId }, data: { totalEpisodes: count } });
  return NextResponse.json({ ok: true });
}
