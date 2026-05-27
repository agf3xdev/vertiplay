"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Database } from "lucide-react";

export function SeedShopButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<{ series: number; brands: number; products: number; appearances: number } | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function go() {
    setLoading(true);
    setErr(null);
    try {
      const r = await fetch("/api/admin/seed-shop", { method: "POST" });
      const data = await r.json();
      if (!r.ok) {
        setErr(data.error ?? "Erro");
      } else {
        setDone(data);
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
        <p className="font-bold text-emerald-300">✓ Catálogo importado</p>
        <p className="text-xs text-white/65 mt-1">
          {done.series} séries · {done.brands} marcas · {done.products} produtos · {done.appearances} aparições.
        </p>
        <div className="flex gap-2 mt-3 flex-wrap">
          <a href="/admin/series" className="px-3 py-1.5 rounded-lg bg-white/10 text-xs font-medium">
            Séries
          </a>
          <a href="/admin/brands" className="px-3 py-1.5 rounded-lg bg-white/10 text-xs font-medium">
            Marcas
          </a>
          <a href="/admin/products" className="px-3 py-1.5 rounded-lg bg-white/10 text-xs font-medium">
            Produtos
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="vp-card rounded-2xl p-4">
      <p className="font-bold flex items-center gap-2">
        <Database className="w-4 h-4 text-[var(--color-vp-pink)]" /> Importar catálogo do app
      </p>
      <p className="text-xs text-white/65 mt-1">
        Popula o admin com as 12 séries, 11 marcas e ~30 produtos que existem hoje no app (mocks de lib/catalog.ts + lib/shop.ts). Idempotente: pode rodar de novo sem duplicar.
      </p>
      {err && <p className="text-rose-300 text-xs mt-2">{err}</p>}
      <button
        onClick={go}
        disabled={loading}
        className="mt-3 px-3 py-1.5 rounded-lg vp-gradient vp-glow text-xs font-bold disabled:opacity-60"
      >
        {loading ? "Importando..." : "Importar catálogo"}
      </button>
    </div>
  );
}
