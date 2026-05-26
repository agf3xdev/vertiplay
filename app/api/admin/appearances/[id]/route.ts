import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { gate } from "@/lib/admin-api";

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await gate();
  if (g) return g;
  const { id } = await params;
  await prisma.productAppearance.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
