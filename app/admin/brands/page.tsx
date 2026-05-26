import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { PageHeader, PrimaryButton, Table, Th, Td, EmptyState, Badge } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function AdminBrandsList() {
  const brands = await prisma.brand.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { products: true, sponsorships: true } } },
  });

  return (
    <div>
      <PageHeader
        title="Marcas"
        subtitle={`${brands.length} marcas patrocinadoras.`}
        action={<PrimaryButton href="/admin/brands/new">+ Nova marca</PrimaryButton>}
      />

      {brands.length === 0 ? (
        <EmptyState title="Nenhuma marca ainda" hint="Cadastre marcas pra ativar a loja shoppable." />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Marca</Th>
              <Th>Categoria</Th>
              <Th>Produtos</Th>
              <Th>Campanhas</Th>
              <Th />
            </tr>
          </thead>
          <tbody>
            {brands.map((b) => (
              <tr key={b.id} className="hover:bg-white/5">
                <Td>
                  <div className="flex items-center gap-3">
                    {b.logoUrl && (
                      <Image src={b.logoUrl} alt={b.name} width={32} height={32} className="w-8 h-8 rounded-full object-cover" unoptimized />
                    )}
                    <div>
                      <div className="font-semibold flex items-center gap-1">
                        {b.name}
                        {b.isVerified && <Badge tone="info">verificada</Badge>}
                      </div>
                      <div className="text-[11px] text-white/45">/{b.slug}</div>
                    </div>
                  </div>
                </Td>
                <Td>{b.category}</Td>
                <Td>{b._count.products}</Td>
                <Td>{b._count.sponsorships}</Td>
                <Td className="text-right">
                  <Link href={`/admin/brands/${b.id}`} className="text-[var(--color-vp-pink)] font-medium">
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
