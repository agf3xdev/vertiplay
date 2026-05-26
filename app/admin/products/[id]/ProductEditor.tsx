"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Product, Brand, ProductAppearance } from "@prisma/client";
import { PageHeader, PrimaryButton, SecondaryButton, Card, Field, inputCls, textareaCls, selectCls } from "@/components/admin/ui";
import { Trash2, Save, Plus } from "lucide-react";

const CATEGORIES = ["Vestido", "Sofá", "Perfume", "Relógio", "Joia", "Eletrônico", "Alimento", "Casa", "Beleza", "Outros"];

type Props = {
  product: Product & { brand: Brand; appearances: ProductAppearance[] };
  brands: { id: string; name: string }[];
  series: { id: string; title: string; slug: string }[];
};

export function ProductEditor({ product, brands, series }: Props) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: product.name,
    slug: product.slug,
    brandId: product.brandId,
    description: product.description,
    imageUrl: product.imageUrl,
    gallery: product.gallery,
    priceBRL: product.priceBRL,
    oldPriceBRL: product.oldPriceBRL ?? "",
    category: product.category,
    stock: product.stock,
    rating: product.rating,
    affiliateUrl: product.affiliateUrl ?? "",
  });
  const [appearances, setAppearances] = useState(product.appearances);
  const [saving, setSaving] = useState(false);
  const [newAppr, setNewAppr] = useState({ seriesId: series[0]?.id ?? "", sceneNote: "" });

  async function save() {
    setSaving(true);
    const r = await fetch(`/api/admin/products/${product.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setSaving(false);
    if (r.ok) router.refresh();
    else alert("Erro ao salvar");
  }

  async function remove() {
    if (!confirm("Apagar produto?")) return;
    const r = await fetch(`/api/admin/products/${product.id}`, { method: "DELETE" });
    if (r.ok) router.push("/admin/products");
  }

  async function addAppearance() {
    if (!newAppr.seriesId) return;
    const r = await fetch("/api/admin/appearances", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id, ...newAppr }),
    });
    if (r.ok) {
      const d = await r.json();
      setAppearances([...appearances, d.appearance]);
      setNewAppr({ seriesId: series[0]?.id ?? "", sceneNote: "" });
    }
  }

  async function delAppearance(id: string) {
    const r = await fetch(`/api/admin/appearances/${id}`, { method: "DELETE" });
    if (r.ok) setAppearances(appearances.filter((a) => a.id !== id));
  }

  const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) =>
    setForm((s) => ({ ...s, [k]: v }));

  return (
    <div className="max-w-4xl">
      <PageHeader
        title={product.name}
        subtitle={`/${product.slug} · ${product.brand.name}`}
        action={
          <div className="flex gap-2">
            <SecondaryButton href="/admin/products">Voltar</SecondaryButton>
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
          <Field label="Marca">
            <select className={selectCls} value={form.brandId} onChange={(e) => set("brandId", e.target.value)}>
              {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </Field>
          <Field label="Categoria">
            <select className={selectCls} value={form.category} onChange={(e) => set("category", e.target.value)}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
        </div>
        <div className="mt-4">
          <Field label="Descrição"><textarea className={textareaCls} rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} /></Field>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          <Field label="Imagem principal"><input className={inputCls} value={form.imageUrl} onChange={(e) => set("imageUrl", e.target.value)} /></Field>
          <Field label="Galeria (CSV)"><input className={inputCls} value={form.gallery} onChange={(e) => set("gallery", e.target.value)} /></Field>
        </div>
        <div className="grid sm:grid-cols-4 gap-4 mt-4">
          <Field label="Preço (centavos)"><input type="number" className={inputCls} value={form.priceBRL} onChange={(e) => set("priceBRL", Number(e.target.value))} /></Field>
          <Field label="Preço antigo"><input type="number" className={inputCls} value={form.oldPriceBRL} onChange={(e) => set("oldPriceBRL", e.target.value as any)} /></Field>
          <Field label="Estoque"><input type="number" className={inputCls} value={form.stock} onChange={(e) => set("stock", Number(e.target.value))} /></Field>
          <Field label="Rating"><input type="number" step="0.1" className={inputCls} value={form.rating} onChange={(e) => set("rating", Number(e.target.value))} /></Field>
        </div>
        <div className="mt-4">
          <Field label="Link de afiliado"><input className={inputCls} value={form.affiliateUrl} onChange={(e) => set("affiliateUrl", e.target.value)} /></Field>
        </div>
        <div className="mt-6 flex justify-end">
          <button onClick={remove} className="text-rose-300 text-sm flex items-center gap-1 hover:text-rose-200">
            <Trash2 className="w-3.5 h-3.5" /> Apagar produto
          </button>
        </div>
      </Card>

      <Card>
        <h2 className="font-bold mb-3">Aparece em séries</h2>
        <div className="rounded-xl bg-white/5 p-3 mb-4 grid sm:grid-cols-[1fr_2fr_auto] gap-2">
          <select className={selectCls} value={newAppr.seriesId} onChange={(e) => setNewAppr({ ...newAppr, seriesId: e.target.value })}>
            {series.map((s) => <option key={s.id} value={s.id}>{s.title}</option>)}
          </select>
          <input className={inputCls} placeholder="Cena / nota (ex: vestido do jantar)" value={newAppr.sceneNote} onChange={(e) => setNewAppr({ ...newAppr, sceneNote: e.target.value })} />
          <button onClick={addAppearance} className="px-3 py-1.5 rounded-lg vp-gradient text-sm font-semibold inline-flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Adicionar
          </button>
        </div>
        {appearances.length === 0 ? (
          <p className="text-sm text-white/55 py-4 text-center">Nenhuma aparição. Linka este produto a uma série pra ele aparecer na sacolinha.</p>
        ) : (
          <ul className="divide-y divide-white/5">
            {appearances.map((a) => {
              const s = series.find((x) => x.id === a.seriesId);
              return (
                <li key={a.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{s?.title ?? a.seriesId}</p>
                    {a.sceneNote && <p className="text-[11px] text-white/55 truncate">{a.sceneNote}</p>}
                  </div>
                  <button onClick={() => delAppearance(a.id)} className="text-rose-300 text-xs flex items-center gap-1">
                    <Trash2 className="w-3 h-3" /> remover
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </Card>
    </div>
  );
}
