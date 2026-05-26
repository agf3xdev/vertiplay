import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { PageHeader, PrimaryButton, Table, Th, Td, EmptyState } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

export default async function AdminProductsList() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
    include: { brand: { select: { name: true } } },
  });

  return (
    <div>
      <PageHeader
        title="Produtos"
        subtitle={`${products.length} produtos no catálogo shoppable.`}
        action={<PrimaryButton href="/admin/products/new">+ Novo produto</PrimaryButton>}
      />

      {products.length === 0 ? (
        <EmptyState title="Sem produtos" hint="Cadastre marcas primeiro, depois produtos." />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Produto</Th>
              <Th>Marca</Th>
              <Th>Preço</Th>
              <Th>Estoque</Th>
              <Th />
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-white/5">
                <Td>
                  <div className="flex items-center gap-3">
                    {p.imageUrl && <Image src={p.imageUrl} alt={p.name} width={40} height={40} className="w-10 h-10 rounded-lg object-cover" unoptimized />}
                    <div>
                      <div className="font-semibold">{p.name}</div>
                      <div className="text-[11px] text-white/45">/{p.slug}</div>
                    </div>
                  </div>
                </Td>
                <Td>{p.brand.name}</Td>
                <Td>R$ {(p.priceBRL / 100).toFixed(2)}</Td>
                <Td>{p.stock}</Td>
                <Td className="text-right">
                  <Link href={`/admin/products/${p.id}`} className="text-[var(--color-vp-pink)] font-medium">
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
