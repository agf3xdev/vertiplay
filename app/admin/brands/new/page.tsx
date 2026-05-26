"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PageHeader, PrimaryButton, SecondaryButton, Card, Field, inputCls, textareaCls, selectCls } from "@/components/admin/ui";

const CATEGORIES = ["Moda", "Casa", "Beleza", "Eletro", "Joias", "Joalheria", "Atacadão", "Iluminação", "Perfumaria", "Outros"];

export default function NewBrand() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    logoUrl: "",
    coverUrl: "",
    bio: "",
    website: "",
    category: CATEGORIES[0],
    isVerified: false,
  });

  async function submit() {
    setSubmitting(true);
    setErr(null);
    const r = await fetch("/api/admin/brands", {
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
    router.push(`/admin/brands/${data.brand.id}`);
  }

  const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) =>
    setForm((s) => ({ ...s, [k]: v }));

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Nova marca"
        action={<SecondaryButton href="/admin/brands">Cancelar</SecondaryButton>}
      />
      <Card>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Nome" required><input className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} /></Field>
          <Field label="Slug"><input className={inputCls} value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="auto" /></Field>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          <Field label="Logo URL" required><input className={inputCls} value={form.logoUrl} onChange={(e) => set("logoUrl", e.target.value)} /></Field>
          <Field label="Cover URL"><input className={inputCls} value={form.coverUrl} onChange={(e) => set("coverUrl", e.target.value)} /></Field>
        </div>
        <div className="mt-4">
          <Field label="Bio"><textarea className={textareaCls} rows={3} value={form.bio} onChange={(e) => set("bio", e.target.value)} /></Field>
        </div>
        <div className="grid sm:grid-cols-3 gap-4 mt-4">
          <Field label="Website"><input className={inputCls} value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="https://" /></Field>
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
        {err && <p className="text-rose-300 text-sm mt-4">{err}</p>}
        <div className="flex gap-2 mt-6">
          <PrimaryButton onClick={submit} disabled={submitting || !form.name || !form.logoUrl}>
            {submitting ? "Criando..." : "Criar marca"}
          </PrimaryButton>
          <SecondaryButton href="/admin/brands">Cancelar</SecondaryButton>
        </div>
      </Card>
    </div>
  );
}
