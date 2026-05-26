import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { gate, parseInt0, bool } from "@/lib/admin-api";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await gate();
  if (g) return g;
  const { id } = await params;
  const body = await req.json();
  const data: any = {};
  if (body.coinsBonus !== undefined) data.coinsBonus = parseInt0(body.coinsBonus);
  if (body.coinsPaid !== undefined) data.coinsPaid = parseInt0(body.coinsPaid);
  if (body.isVip !== undefined) data.isVip = bool(body.isVip);
  if (body.vipExpiresAt !== undefined) data.vipExpiresAt = body.vipExpiresAt ? new Date(body.vipExpiresAt) : null;
  if (typeof body.displayName === "string") data.displayName = body.displayName;
  if (typeof body.bio === "string") data.bio = body.bio;
  const updated = await prisma.user.update({ where: { id }, data });
  return NextResponse.json({ user: updated });
}
