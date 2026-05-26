import { prisma } from "@/lib/prisma";
import { PageHeader, Card, Table, Th, Td, Badge, EmptyState } from "@/components/admin/ui";

export const dynamic = "force-dynamic";

function brl(v: number) {
  return v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function LedgerPage({
  searchParams,
}: {
  searchParams: Promise<{ source?: string }>;
}) {
  const sp = await searchParams;
  const source = sp.source;

  const where: any = {};
  if (source === "stripe" || source === "mp") where.source = source;

  const [entries, agg] = await Promise.all([
    prisma.ledgerEntry.findMany({
      where,
      orderBy: { at: "desc" },
      take: 200,
    }),
    prisma.ledgerEntry.aggregate({
      where: { ...where, type: "payment" },
      _sum: { amount: true },
      _count: { _all: true },
    }),
  ]);

  return (
    <div>
      <PageHeader
        title="Ledger"
        subtitle={`${agg._count._all} pagamentos · total ${brl(agg._sum.amount ?? 0)}`}
      />

      <div className="flex gap-2 mb-4">
        <a href="/admin/ledger" className={"px-3 py-1.5 rounded-full text-xs font-medium " + (!source ? "vp-gradient" : "bg-white/10")}>
          Todos
        </a>
        <a href="/admin/ledger?source=stripe" className={"px-3 py-1.5 rounded-full text-xs font-medium " + (source === "stripe" ? "vp-gradient" : "bg-white/10")}>
          Stripe
        </a>
        <a href="/admin/ledger?source=mp" className={"px-3 py-1.5 rounded-full text-xs font-medium " + (source === "mp" ? "vp-gradient" : "bg-white/10")}>
          Mercado Pago
        </a>
      </div>

      {entries.length === 0 ? (
        <EmptyState title="Sem entradas" hint="Webhooks ainda não geraram nada." />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Quando</Th>
              <Th>Source</Th>
              <Th>Tipo</Th>
              <Th>Status</Th>
              <Th>Valor</Th>
              <Th>Método</Th>
              <Th>Payment ID</Th>
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.id} className="hover:bg-white/5">
                <Td className="text-xs">{e.at.toLocaleString("pt-BR")}</Td>
                <Td>{e.source === "stripe" ? <Badge tone="info">Stripe</Badge> : <Badge tone="warn">MP</Badge>}</Td>
                <Td>{e.type}</Td>
                <Td>{e.status ?? "—"}</Td>
                <Td>{e.amount ? brl(e.amount) : "—"}</Td>
                <Td>{e.method ?? "—"}</Td>
                <Td className="font-mono text-[11px] text-white/55">{e.paymentId ?? "—"}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}
