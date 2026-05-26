import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader, PrimaryButton, Table, Th, Td, EmptyState, Badge } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function AdminSeriesList() {
  const series = await prisma.series.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { episodes: true } } },
  });

  return (
    <div>
      <PageHeader
        title="Séries"
        subtitle={`${series.length} séries cadastradas.`}
        action={<PrimaryButton href="/admin/series/new">+ Nova série</PrimaryButton>}
      />

      {series.length === 0 ? (
        <EmptyState title="Nenhuma série ainda" hint="Crie a primeira pra começar." />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Título</Th>
              <Th>Gênero</Th>
              <Th>Episódios</Th>
              <Th>Views</Th>
              <Th>Flags</Th>
              <Th />
            </tr>
          </thead>
          <tbody>
            {series.map((s) => (
              <tr key={s.id} className="hover:bg-white/5">
                <Td>
                  <div className="font-semibold">{s.title}</div>
                  <div className="text-[11px] text-white/45">/{s.slug}</div>
                </Td>
                <Td>{s.genre}</Td>
                <Td>{s._count.episodes} / {s.totalEpisodes}</Td>
                <Td>{s.views.toLocaleString("pt-BR")}</Td>
                <Td>
                  <div className="flex gap-1 flex-wrap">
                    {s.isFeatured && <Badge tone="info">featured</Badge>}
                    {s.isExclusive && <Badge tone="success">exclusivo</Badge>}
                  </div>
                </Td>
                <Td className="text-right">
                  <Link href={`/admin/series/${s.id}`} className="text-[var(--color-vp-pink)] font-medium">
                    Editar →
                  </Link>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
