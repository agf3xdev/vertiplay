import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { gate } from "@/lib/admin-api";
import { signScriptFileUrl } from "@/lib/storage";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const g = await gate();
  if (g) return g;
  const { id } = await params;
  const writer = await prisma.writerApplication.findUnique({ where: { id } });
  if (!writer?.argumentFileUrl) {
    return NextResponse.json({ error: "Sem arquivo anexado" }, { status: 404 });
  }
  const url = await signScriptFileUrl(writer.argumentFileUrl);
  return NextResponse.redirect(url);
}
