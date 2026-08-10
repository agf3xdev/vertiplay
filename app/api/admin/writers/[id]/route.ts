import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { gate } from "@/lib/admin-api";

const VALID_STATUSES = ["pending", "reviewing", "approved", "rejected"];

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await gate();
  if (g) return g;
  const { id } = await params;
  const body = await req.json();
  const status = String(body.status ?? "");
  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: "invalid status" }, { status: 400 });
  }
  const updated = await prisma.writerApplication.update({ where: { id }, data: { status } });
  return NextResponse.json({ writer: updated });
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await gate();
  if (g) return g;
  const { id } = await params;
  await prisma.writerApplication.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
