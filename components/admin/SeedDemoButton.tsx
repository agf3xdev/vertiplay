"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";

export function SeedDemoButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function go() {
    setLoading(true);
    setErr(null);
    try {
      const r = await fetch("/api/admin/seed-demo", { method: "POST" });
      const data = await r.json();
      if (!r.ok) {
        setErr(data.error ?? "Erro");
      } else {
        setDone(data.series.slug);
        router.refresh();
      }
    } catch (e: any) {
      setErr(e?.message ?? "Erro de rede");
    }
    setLoading(false);
  }

  if (done) {
    return (
      <div className="vp-card rounded-2xl p-4">
        <p className="font-bold text-emerald-300">✓ Série demo criada</p>
        <p className="text-xs text-white/65 mt-1">
          1 série + 10 episódios (3 grátis) + 1 marca + 3 produtos linkados.
        </p>
        <div className="flex gap-2 mt-3">
          <a href={`/admin/series`} className="px-3 py-1.5 rounded-lg bg-white/10 text-xs font-medium">
            Ver no admin
          </a>
          <a href={`/series/${done}`} className="px-3 py-1.5 rounded-lg vp-gradient text-xs font-bold">
            Abrir no app →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="vp-card rounded-2xl p-4">
      <p className="font-bold flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-[var(--color-vp-pink)]" /> Série demo
      </p>
      <p className="text-xs text-white/65 mt-1">
        Cria 1 série completa (10 eps, marca patrocinadora, produtos shoppable) usando vídeos públicos de teste. Útil pra validar o pipeline ponta-a-ponta.
      </p>
      {err && <p className="text-rose-300 text-xs mt-2">{err}</p>}
      <button
        onClick={go}
        disabled={loading}
        className="mt-3 px-3 py-1.5 rounded-lg vp-gradient vp-glow text-xs font-bold disabled:opacity-60"
      >
        {loading ? "Criando..." : "Gerar série demo"}
      </button>
    </div>
  );
}
