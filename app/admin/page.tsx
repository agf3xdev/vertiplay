import { prisma } from "@/lib/prisma";
import { PageHeader, StatCard, Card, Badge } from "@/components/admin/ui";
import { SeedDemoButton } from "@/components/admin/SeedDemoButton";
import Link from "next/link";
import { ScrollText, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

function brl(centavos: number) {
  return (centavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function AdminDashboard() {
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    users,
    usersNew24h,
    series,
    episodes,
    brands,
    products,
    stories,
    storiesPending,
    sponsorships,
    orders,
    paidOrders,
    txns30d,
    pendingStories,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: since24h } } }),
    prisma.series.count(),
    prisma.episode.count(),
    prisma.brand.count(),
    prisma.product.count(),
    prisma.storySubmission.count(),
    prisma.storySubmission.count({ where: { status: "pending" } }),
    prisma.seriesSponsorship.count(),
    prisma.order.count(),
    prisma.order.count({ where: { status: "paid" } }),
    prisma.transaction.aggregate({
      where: { createdAt: { gte: since30d }, kind: "purchase" },
      _sum: { amountBRL: true },
    }),
    prisma.storySubmission.findMany({
      where: { status: "pending" },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  const receita30d = txns30d._sum.amountBRL ?? 0;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Visão geral do Vertiplay em tempo real."
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        <StatCard label="Usuários" value={users} hint={`+${usersNew24h} nas últimas 24h`} />
        <StatCard label="Séries" value={series} hint={`${episodes} episódios`} />
        <StatCard label="Marcas" value={brands} hint={`${products} produtos`} />
        <StatCard label="Campanhas" value={sponsorships} hint="patrocínios ativos" />
        <StatCard label="Pedidos" value={orders} hint={`${paidOrders} pagos`} />
        <StatCard label="Histórias UGC" value={stories} hint={`${storiesPending} pendentes`} />
        <StatCard label="Receita (30d)" value={brl(receita30d)} hint="compras de coins" />
        <StatCard label="Status" value="🟢 online" hint="Postgres + Resend" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4 mt-8">
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold flex items-center gap-2">
              <ScrollText className="w-4 h-4 text-[var(--color-vp-pink)]" /> Histórias aguardando review
            </h2>
            <Link href="/admin/stories" className="text-xs text-white/55 flex items-center gap-1">
              Ver todas <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
          {pendingStories.length === 0 ? (
            <p className="text-sm text-white/55 py-4 text-center">Nenhuma história pendente.</p>
          ) : (
            <ul className="divide-y divide-white/5">
              {pendingStories.map((s) => (
                <li key={s.id} className="py-2.5">
                  <Link
                    href={`/admin/stories#${s.id}`}
                    className="flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold truncate">{s.title}</p>
                      <p className="text-[11px] text-white/55 truncate">
                        {s.authorName}{s.genre ? ` · ${s.genre}` : ""}
                      </p>
                    </div>
                    <Badge tone="warn">pendente</Badge>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <div className="space-y-4">
          <SeedDemoButton />
          <Card>
            <h2 className="font-bold mb-3">Atalhos</h2>
          <div className="grid grid-cols-2 gap-2">
            <Link href="/admin/series/new" className="px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-sm font-medium text-center">
              + Nova série
            </Link>
            <Link href="/admin/brands/new" className="px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-sm font-medium text-center">
              + Nova marca
            </Link>
            <Link href="/admin/products/new" className="px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-sm font-medium text-center">
              + Novo produto
            </Link>
            <Link href="/admin/campaigns" className="px-3 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-sm font-medium text-center">
              + Nova campanha
            </Link>
          </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
