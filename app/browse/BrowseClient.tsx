"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Play, X } from "lucide-react";
import { formatViews, type Series } from "@/lib/catalog";
import { cn } from "@/lib/cn";

export function BrowseClient({ series, genres }: { series: Series[]; genres: string[] }) {
  const [q, setQ] = useState("");
  const [genre, setGenre] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let r = series;
    if (genre) r = r.filter((s) => s.genre === genre);
    if (q) {
      const t = q.toLowerCase();
      r = r.filter(
        (s) =>
          s.title.toLowerCase().includes(t) ||
          s.synopsis.toLowerCase().includes(t) ||
          s.tags.some((tag) => tag.includes(t))
      );
    }
    return r;
  }, [series, q, genre]);

  return (
    <div className="px-4 pt-4 safe-top">
      <h1 className="text-2xl font-bold mb-3">Descobrir</h1>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/45" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Busque uma série, gênero, ator..."
          className="w-full bg-white/8 border border-white/10 rounded-2xl pl-10 pr-10 py-3 text-sm placeholder:text-white/40 focus:outline-none focus:border-[var(--color-vp-pink)]"
        />
        {q && (
          <button
            onClick={() => setQ("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-white/15 flex items-center justify-center"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3 mb-2 -mx-4 px-4">
        <button
          onClick={() => setGenre(null)}
          className={cn(
            "shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition",
            !genre ? "vp-gradient border-transparent" : "border-white/15 text-white/70"
          )}
        >
          Todos
        </button>
        {genres.map((g) => (
          <button
            key={g}
            onClick={() => setGenre(genre === g ? null : g)}
            className={cn(
              "shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition",
              genre === g ? "vp-gradient border-transparent" : "border-white/15 text-white/70"
            )}
          >
            {g}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {filtered.map((s) => (
          <Link key={s.id} href={`/series/${s.slug}`} className="block">
            <div className="relative aspect-[3/4] rounded-2xl overflow-hidden">
              <Image src={s.posterUrl} alt={s.title} fill className="object-cover" unoptimized />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
              {s.isExclusive && (
                <span className="absolute top-2 left-2 vp-gradient px-1.5 py-0.5 rounded text-[10px] font-bold">
                  EXCLUSIVO
                </span>
              )}
              <div className="absolute bottom-2 left-2 right-2">
                <p className="text-[10px] text-white/80 flex items-center gap-1">
                  <Play className="w-2.5 h-2.5 fill-white" /> {formatViews(s.views)} · {s.genre}
                </p>
                <h4 className="text-sm font-bold leading-tight mt-0.5 line-clamp-2">
                  {s.title}
                </h4>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-center text-white/45 py-12 text-sm">
          Nenhuma série encontrada. Tente outro termo.
        </p>
      )}
    </div>
  );
}
