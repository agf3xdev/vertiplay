"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PageHeader, PrimaryButton, SecondaryButton, Card, Field, inputCls, textareaCls, selectCls } from "@/components/admin/ui";
import { GENRES } from "@/lib/catalog";

export default function NewSeriesPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    genre: GENRES[0],
    synopsis: "",
    posterUrl: "",
    bannerUrl: "",
    tags: "",
    freeEpisodes: 3,
    isFeatured: false,
    isExclusive: false,
  });

  async function submit() {
    setErr(null);
    setSubmitting(true);
    try {
      const r = await fetch("/api/admin/series", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await r.json();
      if (!r.ok) {
        setErr(data.error ?? "Erro ao criar");
        setSubmitting(false);
        return;
      }
      router.push(`/admin/series/${data.series.id}`);
    } catch (e: any) {
      setErr(e?.message ?? "Erro de rede");
      setSubmitting(false);
    }
  }

  const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) =>
    setForm((s) => ({ ...s, [k]: v }));

  return (
    <div className="max-w-3xl">
      <PageHeader
        title="Nova série"
        subtitle="Crie a série primeiro, depois adicione episódios."
        action={<SecondaryButton href="/admin/series">Cancelar</SecondaryButton>}
      />

      <Card>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Título" required>
            <input className={inputCls} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="O Bilionário do Edifício 7" />
          </Field>
          <Field label="Slug" hint="Deixa vazio pra gerar do título">
            <input className={inputCls} value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="bilionario-edificio-7" />
          </Field>
        </div>

        <div className="mt-4">
          <Field label="Sinopse" required>
            <textarea className={textareaCls} rows={4} value={form.synopsis} onChange={(e) => set("synopsis", e.target.value)} />
          </Field>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          <Field label="Poster URL" required hint="Imagem retrato 2:3 (1080x1620)">
            <input className={inputCls} value={form.posterUrl} onChange={(e) => set("posterUrl", e.target.value)} placeholder="https://..." />
          </Field>
          <Field label="Banner URL" hint="Opcional, 16:9 (hero)">
            <input className={inputCls} value={form.bannerUrl} onChange={(e) => set("bannerUrl", e.target.value)} placeholder="https://..." />
          </Field>
        </div>

        <div className="grid sm:grid-cols-3 gap-4 mt-4">
          <Field label="Gênero" required>
            <select className={selectCls} value={form.genre} onChange={(e) => set("genre", e.target.value)}>
              {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </Field>
          <Field label="Tags" hint="CSV (bilionario,paixao,vinganca)">
            <input className={inputCls} value={form.tags} onChange={(e) => set("tags", e.target.value)} />
          </Field>
          <Field label="Episódios grátis" hint="Primeiros N grátis">
            <input type="number" min={0} className={inputCls} value={form.freeEpisodes} onChange={(e) => set("freeEpisodes", Number(e.target.value))} />
          </Field>
        </div>

        <div className="flex gap-4 mt-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isFeatured} onChange={(e) => set("isFeatured", e.target.checked)} className="accent-[var(--color-vp-pink)]" />
            Featured (destaque na home)
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isExclusive} onChange={(e) => set("isExclusive", e.target.checked)} className="accent-[var(--color-vp-pink)]" />
            Exclusivo Vertiplay
          </label>
        </div>

        {err && <p className="text-rose-300 text-sm mt-4">{err}</p>}

        <div className="flex gap-2 mt-6">
          <PrimaryButton onClick={submit} disabled={submitting || !form.title || !form.synopsis || !form.posterUrl}>
            {submitting ? "Criando..." : "Criar série"}
          </PrimaryButton>
          <SecondaryButton href="/admin/series">Cancelar</SecondaryButton>
        </div>
      </Card>
    </div>
  );
}
