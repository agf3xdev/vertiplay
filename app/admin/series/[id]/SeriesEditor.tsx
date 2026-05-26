"use client";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import type { Series, Episode } from "@prisma/client";
import { PageHeader, PrimaryButton, SecondaryButton, Card, Field, inputCls, textareaCls, selectCls, Badge } from "@/components/admin/ui";
import { GENRES } from "@/lib/catalog";
import { Trash2, Plus, Save } from "lucide-react";

type Props = {
  series: Series & { episodes: Episode[] };
};

export function SeriesEditor({ series: initial }: Props) {
  const router = useRouter();
  const [series, setSeries] = useState(initial);
  const [form, setForm] = useState({
    title: initial.title,
    slug: initial.slug,
    genre: initial.genre,
    synopsis: initial.synopsis,
    posterUrl: initial.posterUrl,
    bannerUrl: initial.bannerUrl ?? "",
    tags: initial.tags,
    freeEpisodes: initial.freeEpisodes,
    views: initial.views,
    rating: initial.rating,
    isFeatured: initial.isFeatured,
    isExclusive: initial.isExclusive,
  });
  const [saving, setSaving] = useState(false);
  const [_, startTransition] = useTransition();

  async function save() {
    setSaving(true);
    const r = await fetch(`/api/admin/series/${series.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await r.json();
    setSaving(false);
    if (r.ok) {
      setSeries(data.series);
      startTransition(() => router.refresh());
    } else {
      alert(data.error ?? "Erro ao salvar");
    }
  }

  async function remove() {
    if (!confirm(`Apagar a série "${series.title}" e todos seus episódios?`)) return;
    const r = await fetch(`/api/admin/series/${series.id}`, { method: "DELETE" });
    if (r.ok) router.push("/admin/series");
    else alert("Erro ao apagar");
  }

  const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) =>
    setForm((s) => ({ ...s, [k]: v }));

  return (
    <div className="max-w-5xl">
      <PageHeader
        title={series.title}
        subtitle={`/${series.slug} · ${series.episodes.length} episódios`}
        action={
          <div className="flex gap-2">
            <SecondaryButton href="/admin/series">Voltar</SecondaryButton>
            <PrimaryButton onClick={save} disabled={saving}>
              <span className="inline-flex items-center gap-1.5"><Save className="w-3.5 h-3.5" />{saving ? "Salvando..." : "Salvar"}</span>
            </PrimaryButton>
          </div>
        }
      />

      <Card className="mb-6">
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Título"><input className={inputCls} value={form.title} onChange={(e) => set("title", e.target.value)} /></Field>
          <Field label="Slug"><input className={inputCls} value={form.slug} onChange={(e) => set("slug", e.target.value)} /></Field>
        </div>
        <div className="mt-4">
          <Field label="Sinopse"><textarea className={textareaCls} rows={4} value={form.synopsis} onChange={(e) => set("synopsis", e.target.value)} /></Field>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          <Field label="Poster URL"><input className={inputCls} value={form.posterUrl} onChange={(e) => set("posterUrl", e.target.value)} /></Field>
          <Field label="Banner URL"><input className={inputCls} value={form.bannerUrl} onChange={(e) => set("bannerUrl", e.target.value)} placeholder="Opcional" /></Field>
        </div>
        <div className="grid sm:grid-cols-4 gap-4 mt-4">
          <Field label="Gênero">
            <select className={selectCls} value={form.genre} onChange={(e) => set("genre", e.target.value)}>
              {GENRES.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </Field>
          <Field label="Tags (CSV)"><input className={inputCls} value={form.tags} onChange={(e) => set("tags", e.target.value)} /></Field>
          <Field label="Episódios grátis"><input type="number" className={inputCls} value={form.freeEpisodes} onChange={(e) => set("freeEpisodes", Number(e.target.value))} /></Field>
          <Field label="Rating"><input type="number" step="0.1" className={inputCls} value={form.rating} onChange={(e) => set("rating", Number(e.target.value))} /></Field>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 mt-4">
          <Field label="Views"><input type="number" className={inputCls} value={form.views} onChange={(e) => set("views", Number(e.target.value))} /></Field>
          <div className="flex items-end gap-4">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.isFeatured} onChange={(e) => set("isFeatured", e.target.checked)} className="accent-[var(--color-vp-pink)]" /> Featured
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.isExclusive} onChange={(e) => set("isExclusive", e.target.checked)} className="accent-[var(--color-vp-pink)]" /> Exclusivo
            </label>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button onClick={remove} className="text-rose-300 text-sm flex items-center gap-1 hover:text-rose-200">
            <Trash2 className="w-3.5 h-3.5" /> Apagar série
          </button>
        </div>
      </Card>

      <EpisodesEditor
        seriesId={series.id}
        episodes={series.episodes}
        onChange={(eps) => setSeries({ ...series, episodes: eps })}
      />
    </div>
  );
}

function EpisodesEditor({
  seriesId,
  episodes,
  onChange,
}: {
  seriesId: string;
  episodes: Episode[];
  onChange: (eps: Episode[]) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [newEp, setNewEp] = useState({
    title: "",
    videoUrl: "",
    thumbUrl: "",
    durationSec: 75,
    costCoins: 20,
    isFree: false,
  });

  async function add() {
    setAdding(true);
    const r = await fetch("/api/admin/episodes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ seriesId, ...newEp }),
    });
    const data = await r.json();
    setAdding(false);
    if (!r.ok) return alert(data.error ?? "Erro");
    onChange([...episodes, data.episode]);
    setNewEp({ title: "", videoUrl: "", thumbUrl: "", durationSec: 75, costCoins: 20, isFree: false });
  }

  async function patch(id: string, data: Partial<Episode>) {
    const r = await fetch(`/api/admin/episodes/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (r.ok) {
      const d = await r.json();
      onChange(episodes.map((e) => (e.id === id ? d.episode : e)));
    }
  }

  async function del(id: string) {
    if (!confirm("Apagar episódio?")) return;
    const r = await fetch(`/api/admin/episodes/${id}`, { method: "DELETE" });
    if (r.ok) onChange(episodes.filter((e) => e.id !== id));
  }

  return (
    <Card>
      <h2 className="font-bold mb-3">Episódios ({episodes.length})</h2>

      {/* Add inline */}
      <div className="rounded-xl bg-white/5 p-3 mb-4 space-y-3">
        <p className="text-xs font-semibold text-white/65">Adicionar episódio</p>
        <div className="grid sm:grid-cols-2 gap-2">
          <input className={inputCls} placeholder="Título do episódio" value={newEp.title} onChange={(e) => setNewEp({ ...newEp, title: e.target.value })} />
          <input className={inputCls} placeholder="Video URL (.m3u8 ou .mp4)" value={newEp.videoUrl} onChange={(e) => setNewEp({ ...newEp, videoUrl: e.target.value })} />
        </div>
        <div className="grid sm:grid-cols-4 gap-2">
          <input className={inputCls} placeholder="Thumb URL" value={newEp.thumbUrl} onChange={(e) => setNewEp({ ...newEp, thumbUrl: e.target.value })} />
          <input type="number" className={inputCls} placeholder="Duração (s)" value={newEp.durationSec} onChange={(e) => setNewEp({ ...newEp, durationSec: Number(e.target.value) })} />
          <input type="number" className={inputCls} placeholder="Custo coins" value={newEp.costCoins} onChange={(e) => setNewEp({ ...newEp, costCoins: Number(e.target.value) })} />
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={newEp.isFree} onChange={(e) => setNewEp({ ...newEp, isFree: e.target.checked })} className="accent-[var(--color-vp-pink)]" /> Grátis
          </label>
        </div>
        <button
          onClick={add}
          disabled={adding || !newEp.videoUrl}
          className="px-3 py-1.5 rounded-lg vp-gradient text-sm font-semibold disabled:opacity-50 inline-flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" /> {adding ? "Adicionando..." : "Adicionar episódio"}
        </button>
      </div>

      {/* List */}
      <div className="space-y-2">
        {episodes.map((ep) => (
          <details key={ep.id} className="rounded-xl bg-white/5 group">
            <summary className="px-3 py-2.5 flex items-center justify-between cursor-pointer list-none">
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold shrink-0">{ep.number}</span>
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{ep.title}</p>
                  <p className="text-[11px] text-white/45 truncate">{ep.videoUrl || "sem URL"}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {ep.isFree && <Badge tone="success">grátis</Badge>}
                {!ep.isFree && <span className="text-[11px] text-white/55">{ep.costCoins} coins</span>}
                <span className="text-[11px] text-white/40">{ep.durationSec}s</span>
              </div>
            </summary>
            <div className="px-3 pb-3 grid sm:grid-cols-2 gap-2">
              <input className={inputCls} defaultValue={ep.title} placeholder="Título" onBlur={(e) => patch(ep.id, { title: e.target.value })} />
              <input className={inputCls} defaultValue={ep.videoUrl} placeholder="Video URL" onBlur={(e) => patch(ep.id, { videoUrl: e.target.value })} />
              <input className={inputCls} defaultValue={ep.thumbUrl} placeholder="Thumb URL" onBlur={(e) => patch(ep.id, { thumbUrl: e.target.value })} />
              <div className="grid grid-cols-3 gap-2">
                <input type="number" className={inputCls} defaultValue={ep.durationSec} placeholder="Duração" onBlur={(e) => patch(ep.id, { durationSec: Number(e.target.value) })} />
                <input type="number" className={inputCls} defaultValue={ep.costCoins} placeholder="Custo" onBlur={(e) => patch(ep.id, { costCoins: Number(e.target.value) })} />
                <label className="flex items-center gap-1 text-xs">
                  <input type="checkbox" defaultChecked={ep.isFree} onChange={(e) => patch(ep.id, { isFree: e.target.checked })} className="accent-[var(--color-vp-pink)]" /> grátis
                </label>
              </div>
              <button onClick={() => del(ep.id)} className="text-rose-300 text-xs flex items-center gap-1 mt-1">
                <Trash2 className="w-3 h-3" /> Apagar episódio
              </button>
            </div>
          </details>
        ))}
        {episodes.length === 0 && <p className="text-sm text-white/45 py-4 text-center">Nenhum episódio. Adicione o primeiro acima.</p>}
      </div>
    </Card>
  );
}
