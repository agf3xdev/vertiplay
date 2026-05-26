import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { gate, str, strOpt, parseInt0 } from "@/lib/admin-api";

export async function POST(req: Request) {
  const g = await gate();
  if (g) return g;
  const body = await req.json();
  const productId = str(body.productId);
  const seriesId = str(body.seriesId);
  if (!productId || !seriesId) return NextResponse.json({ error: "productId+seriesId required" }, { status: 400 });
  const created = await prisma.productAppearance.create({
    data: {
      productId,
      seriesId,
      episodeId: strOpt(body.episodeId),
      sceneNote: strOpt(body.sceneNote),
      timestampSec: body.timestampSec !== undefined && body.timestampSec !== "" ? parseInt0(body.timestampSec) : null,
    },
  });
  return NextResponse.json({ appearance: created });
}
