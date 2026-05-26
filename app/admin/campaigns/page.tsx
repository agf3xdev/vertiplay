import { prisma } from "@/lib/prisma";
import { CampaignsClient } from "./CampaignsClient";

export const dynamic = "force-dynamic";

export default async function CampaignsPage() {
  const [campaigns, brands, series] = await Promise.all([
    prisma.seriesSponsorship.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.brand.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
    prisma.series.findMany({ orderBy: { title: "asc" }, select: { id: true, title: true } }),
  ]);
  return <CampaignsClient campaigns={campaigns} brands={brands} series={series} />;
}
