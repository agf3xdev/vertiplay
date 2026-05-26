import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { gate, str } from "@/lib/admin-api";

export async function POST(req: Request) {
  const g = await gate();
  if (g) return g;
  const body = await req.json();
  const brandId = str(body.brandId);
  const seriesId = str(body.seriesId);
  const tier = str(body.tier, "standard");
  if (!brandId || !seriesId) return NextResponse.json({ error: "brandId+seriesId required" }, { status: 400 });
  const exists = await prisma.seriesSponsorship.findUnique({
    where: { brandId_seriesId: { brandId, seriesId } },
  });
  if (exists) return NextResponse.json({ error: "campaign already exists" }, { status: 409 });
  const created = await prisma.seriesSponsorship.create({
    data: {
      brandId,
      seriesId,
      tier,
      startAt: body.startAt ? new Date(body.startAt) : new Date(),
      endAt: body.endAt ? new Date(body.endAt) : null,
    },
  });
  return NextResponse.json({ campaign: created });
}
