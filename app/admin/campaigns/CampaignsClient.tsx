"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { SeriesSponsorship } from "@prisma/client";
import { PageHeader, Card, PrimaryButton, Table, Th, Td, EmptyState, Field, inputCls, selectCls, Badge } from "@/components/admin/ui";
import { Trash2, Plus } from "lucide-react";

type Props = {
  campaigns: SeriesSponsorship[];
  brands: { id: string; name: string }[];
  series: { id: string; title: string }[];
};

export function CampaignsClient({ campaigns: initial, brands, series }: Props) {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState(initial);
  const [form, setForm] = useState({
    brandId: brands[0]?.id ?? "",
    seriesId: series[0]?.id ?? "",
    tier: "standard" as "standard" | "headline",
    startAt: new Date().toISOString().slice(0, 10),
    endAt: "",
  });
  const [creating, setCreating] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function create() {
    setCreating(true);
    setErr(null);
    const r = await fetch("/api/admin/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await r.json();
    setCreating(false);
    if (!r.ok) {
      setErr(data.error ?? "Erro");
      return;
    }
    setCampaigns([data.campaign, ...campaigns]);
    router.refresh();
  }

  async function del(id: string) {
    if (!confirm("Encerrar campanha?")) return;
    const r = await fetch(`/api/admin/campaigns/${id}`, { method: "DELETE" });
    if (r.ok) setCampaigns(campaigns.filter((c) => c.id !== id));
  }

  return (
    <div className="max-w-5xl">
      <PageHeader
        title="Campanhas"
        subtitle="Patrocínios de marcas em séries — vira selo 'Patrocinado por' na aba Loja da série."
      />

      <Card className="mb-6">
        <h2 className="font-bold mb-3">Nova campanha</h2>
        <div className="grid sm:grid-cols-5 gap-3">
          <Field label="Marca">
            <select className={selectCls} value={form.brandId} onChange={(e) => setForm({ ...form, brandId: e.target.value })}>
              {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </Field>
          <Field label="Série">
            <select className={selectCls} value={form.seriesId} onChange={(e) => setForm({ ...form, seriesId: e.target.value })}>
              {series.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
            </select>
          </Field>
          <Field label="Tier">
            <select className={selectCls} value={form.tier} onChange={(e) => setForm({ ...form, tier: e.target.value as any })}>
              <option value="standard">Standard</option>
              <option value="headline">Headline</option>
            </select>
          </Field>
          <Field label="Início">
            <input type="date" className={inputCls} value={form.startAt} onChange={(e) => setForm({ ...form, startAt: e.target.value })} />
          </Field>
          <Field label="Fim (opcional)">
            <input type="date" className={inputCls} value={form.endAt} onChange={(e) => setForm({ ...form, endAt: e.target.value })} />
          </Field>
        </div>
        {err && <p className="text-rose-300 text-sm mt-3">{err}</p>}
        <div className="mt-4">
          <PrimaryButton onClick={create} disabled={creating || !form.brandId || !form.seriesId}>
            <span className="inline-flex items-center gap-1.5"><Plus className="w-3.5 h-3.5" />{creating ? "Criando..." : "Criar campanha"}</span>
          </PrimaryButton>
        </div>
      </Card>

      {campaigns.length === 0 ? (
        <EmptyState title="Sem campanhas" hint="Crie patrocínios pra ativar a aba Loja nas séries." />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Marca</Th>
              <Th>Série</Th>
              <Th>Tier</Th>
              <Th>Início</Th>
              <Th>Fim</Th>
              <Th />
            </tr>
          </thead>
          <tbody>
            {campaigns.map((c) => {
              const b = brands.find((x) => x.id === c.brandId);
              const s = series.find((x) => x.id === c.seriesId);
              return (
                <tr key={c.id} className="hover:bg-white/5">
                  <Td>{b?.name ?? c.brandId}</Td>
                  <Td>{s?.title ?? c.seriesId}</Td>
                  <Td>{c.tier === "headline" ? <Badge tone="warn">headline</Badge> : <Badge>standard</Badge>}</Td>
                  <Td>{c.startAt.toLocaleDateString("pt-BR")}</Td>
                  <Td>{c.endAt ? c.endAt.toLocaleDateString("pt-BR") : "—"}</Td>
                  <Td className="text-right">
                    <button onClick={() => del(c.id)} className="text-rose-300 text-xs flex items-center gap-1">
                      <Trash2 className="w-3 h-3" /> encerrar
                    </button>
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}
    </div>
  );
}
