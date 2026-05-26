import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { gate } from "@/lib/admin-api";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await gate();
  if (g) return g;
  const { id } = await params;
  const body = await req.json();
  const data: any = {};
  if (typeof body.tier === "string") data.tier = body.tier;
  if (body.endAt !== undefined) data.endAt = body.endAt ? new Date(body.endAt) : null;
  if (body.startAt) data.startAt = new Date(body.startAt);
  const updated = await prisma.seriesSponsorship.update({ where: { id }, data });
  return NextResponse.json({ campaign: updated });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await gate();
  if (g) return g;
  const { id } = await params;
  await prisma.seriesSponsorship.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
