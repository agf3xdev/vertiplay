import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { gate, str, strOpt, bool, slugify } from "@/lib/admin-api";

export async function GET() {
  const g = await gate();
  if (g) return g;
  const brands = await prisma.brand.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { products: true, sponsorships: true } } },
  });
  return NextResponse.json({ brands });
}

export async function POST(req: Request) {
  const g = await gate();
  if (g) return g;
  const body = await req.json();
  const name = str(body.name).trim();
  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });
  const slug = slugify(strOpt(body.slug) ?? name);
  const exists = await prisma.brand.findUnique({ where: { slug } });
  if (exists) return NextResponse.json({ error: "slug in use" }, { status: 409 });
  const created = await prisma.brand.create({
    data: {
      slug,
      name,
      logoUrl: str(body.logoUrl),
      coverUrl: strOpt(body.coverUrl),
      bio: str(body.bio),
      website: strOpt(body.website),
      category: str(body.category, "Outros"),
      isVerified: bool(body.isVerified),
    },
  });
  return NextResponse.json({ brand: created });
}
