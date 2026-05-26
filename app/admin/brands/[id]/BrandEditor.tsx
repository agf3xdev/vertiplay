"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Brand, Product, SeriesSponsorship } from "@prisma/client";
import { PageHeader, PrimaryButton, SecondaryButton, Card, Field, inputCls, textareaCls, selectCls, Badge } from "@/components/admin/ui";
import { Trash2, Save } from "lucide-react";

const CATEGORIES = ["Moda", "Casa", "Beleza", "Eletro", "Joias", "Joalheria", "Atacadão", "Iluminação", "Perfumaria", "Outros"];

type Props = {
  brand: Brand & { products: Product[]; sponsorships: SeriesSponsorship[] };
};

export function BrandEditor({ brand }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: brand.name,
    slug: brand.slug,
    logoUrl: brand.logoUrl,
    coverUrl: brand.coverUrl ?? "",
    bio: brand.bio,
    website: brand.website ?? "",
    category: brand.category,
    isVerified: brand.isVerified,
  });
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const r = await fetch(`/api/admin/brands/${brand.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (r.ok) router.refresh();
    else alert("Erro ao salvar");
  }

  async function remove() {
    if (!confirm(`Apagar a marca "${brand.name}" e todos os produtos?`)) return;
    const r = await fetch(`/api/admin/brands/${brand.id}`, { method: "DELETE" });
    if (r.ok) router.push("/admin/brands");
  }

  const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) =>
    setForm((s) => ({ ...s, [k]: v }));

  return (
    <div className="max-w-4xl">
      <PageHeader
        title={brand.name}
        subtitle={`/${brand.slug} · ${brand.products.length} produtos · ${brand.sponsorships.length} campanhas`}
        action={
          <div className="flex gap-2">
            <SecondaryButton href="/admin/brands">Voltar</SecondaryButton>
            <PrimaryButton onClick={save} disabled={saving}>
              <span className="inline-flex items-center gap-1.5"><Save className="w-3.5 h-3.5" />{saving ? "Salvando..." : "Salvar"}</span>
            </PrimaryButton>
          </div>
        }
      />

      <Card className="mb-6">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Nome"><input className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} /></Field>
          <Field label="Slug"><input className={inputCls} value={form.slug} onChange={(e) => set("slug", e.target.value)} /></Field>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          <Field label="Logo URL"><input className={inputCls} value={form.logoUrl} onChange={(e) => set("logoUrl", e.target.value)} /></Field>
          <Field label="Cover URL"><input className={inputCls} value={form.coverUrl} onChange={(e) => set("coverUrl", e.target.value)} /></Field>
        </div>
        <div className="mt-4">
          <Field label="Bio"><textarea className={textareaCls} rows={3} value={form.bio} onChange={(e) => set("bio", e.target.value)} /></Field>
        </div>
        <div className="grid sm:grid-cols-3 gap-4 mt-4">
          <Field label="Website"><input className={inputCls} value={form.website} onChange={(e) => set("website", e.target.value)} /></Field>
          <Field label="Categoria">
            <select className={selectCls} value={form.category} onChange={(e) => set("category", e.target.value)}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
          <div className="flex items-end">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.isVerified} onChange={(e) => set("isVerified", e.target.checked)} className="accent-[var(--color-vp-pink)]" /> Verificada
            </label>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button onClick={remove} className="text-rose-300 text-sm flex items-center gap-1 hover:text-rose-200">
            <Trash2 className="w-3.5 h-3.5" /> Apagar marca
          </button>
        </div>
      </Card>

      <Card>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-bold">Produtos desta marca</h2>
          <Link href={`/admin/products/new?brandId=${brand.id}`} className="px-3 py-1.5 rounded-lg vp-gradient text-xs font-bold">
            + Novo produto
          </Link>
        </div>
        {brand.products.length === 0 ? (
          <p className="text-sm text-white/55 py-4 text-center">Sem produtos ainda.</p>
        ) : (
          <ul className="divide-y divide-white/5">
            {brand.products.map((p) => (
              <li key={p.id}>
                <Link href={`/admin/products/${p.id}`} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="flex items-center gap-3 min-w-0">
                    {p.imageUrl && <Image src={p.imageUrl} alt={p.name} width={40} height={40} className="w-10 h-10 rounded-lg object-cover" unoptimized />}
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{p.name}</p>
                      <p className="text-[11px] text-white/45">R$ {(p.priceBRL / 100).toFixed(2)} · {p.stock} em estoque</p>
                    </div>
                  </div>
                  <Badge>{p.category}</Badge>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
