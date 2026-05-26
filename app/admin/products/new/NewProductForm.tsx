"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PageHeader, PrimaryButton, SecondaryButton, Card, Field, inputCls, textareaCls, selectCls } from "@/components/admin/ui";

const CATEGORIES = ["Vestido", "Sofá", "Perfume", "Relógio", "Joia", "Eletrônico", "Alimento", "Casa", "Beleza", "Outros"];

export function NewProductForm({
  brands,
  preselectBrandId,
}: {
  brands: { id: string; name: string }[];
  preselectBrandId?: string;
}) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    brandId: preselectBrandId ?? brands[0]?.id ?? "",
    description: "",
    imageUrl: "",
    gallery: "",
    priceBRL: 0,
    oldPriceBRL: "",
    category: CATEGORIES[0],
    stock: 50,
    affiliateUrl: "",
  });

  async function submit() {
    setSubmitting(true);
    setErr(null);
    const r = await fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await r.json();
    if (!r.ok) {
      setErr(data.error ?? "Erro");
      setSubmitting(false);
      return;
    }
    router.push(`/admin/products/${data.product.id}`);
  }

  const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) =>
    setForm((s) => ({ ...s, [k]: v }));

  if (brands.length === 0) {
    return (
      <div className="max-w-2xl">
        <PageHeader title="Novo produto" />
        <Card>
          <p className="text-sm">Você precisa cadastrar uma marca primeiro.</p>
          <div className="mt-4">
            <PrimaryButton href="/admin/brands/new">+ Nova marca</PrimaryButton>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Novo produto"
        action={<SecondaryButton href="/admin/products">Cancelar</SecondaryButton>}
      />
      <Card>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Nome" required><input className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} /></Field>
          <Field label="Marca" required>
            <select className={selectCls} value={form.brandId} onChange={(e) => set("brandId", e.target.value)}>
              {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </Field>
        </div>
        <div className="mt-4">
          <Field label="Descrição"><textarea className={textareaCls} rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} /></Field>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          <Field label="Imagem principal URL" required><input className={inputCls} value={form.imageUrl} onChange={(e) => set("imageUrl", e.target.value)} /></Field>
          <Field label="Galeria (URLs separadas por vírgula)"><input className={inputCls} value={form.gallery} onChange={(e) => set("gallery", e.target.value)} /></Field>
        </div>
        <div className="grid sm:grid-cols-4 gap-4 mt-4">
          <Field label="Preço (centavos)" required hint="Ex: 19900 = R$ 199,00">
            <input type="number" className={inputCls} value={form.priceBRL} onChange={(e) => set("priceBRL", Number(e.target.value))} />
          </Field>
          <Field label="Preço antigo (centavos)" hint="Opcional (riscado)">
            <input type="number" className={inputCls} value={form.oldPriceBRL} onChange={(e) => set("oldPriceBRL", e.target.value)} />
          </Field>
          <Field label="Estoque">
            <input type="number" className={inputCls} value={form.stock} onChange={(e) => set("stock", Number(e.target.value))} />
          </Field>
          <Field label="Categoria">
            <select className={selectCls} value={form.category} onChange={(e) => set("category", e.target.value)}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </Field>
        </div>
        <div className="mt-4">
          <Field label="Link de afiliado (opcional)" hint="Se preenchido, o botão Comprar abre URL externa">
            <input className={inputCls} value={form.affiliateUrl} onChange={(e) => set("affiliateUrl", e.target.value)} />
          </Field>
        </div>
        {err && <p className="text-rose-300 text-sm mt-4">{err}</p>}
        <div className="flex gap-2 mt-6">
          <PrimaryButton onClick={submit} disabled={submitting || !form.name || !form.imageUrl || !form.priceBRL}>
            {submitting ? "Criando..." : "Criar produto"}
          </PrimaryButton>
          <SecondaryButton href="/admin/products">Cancelar</SecondaryButton>
        </div>
      </Card>
    </div>
  );
}
