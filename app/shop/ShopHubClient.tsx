"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  ShoppingBag,
  BadgeCheck,
  Sparkles,
  ChevronRight,
  X,
} from "lucide-react";
import { formatBRL, type Series } from "@/lib/catalog";
import { type Brand, type Product, productsBySeries } from "@/lib/shop";
import { useWallet } from "@/lib/store";
import { CartButton } from "@/components/CartButton";
import { cn } from "@/lib/cn";

export function ShopHubClient({
  brands,
  products,
  categories,
  series,
}: {
  brands: Brand[];
  products: Product[];
  categories: string[];
  series: Series[];
}) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string | null>(null);
  const addToCart = useWallet((s) => s.addToCart);

  const filtered = useMemo(() => {
    let r = products;
    if (cat) r = r.filter((p) => p.category === cat);
    if (q) {
      const t = q.toLowerCase();
      r = r.filter((p) =>
        [p.name, p.description, p.category].some((s) => s.toLowerCase().includes(t))
      );
    }
    return r;
  }, [products, q, cat]);

  return (
    <div className="px-4 pt-4 safe-top pb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold">Loja Vertiplay</h1>
          <p className="text-xs text-white/55">Compre o que aparece nas séries</p>
        </div>
        <CartButton />
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/45" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Busque produto, marca ou categoria"
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

      {/* Marcas */}
      <section className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-bold flex items-center gap-2">
            <BadgeCheck className="w-4 h-4 text-[var(--color-vp-pink)]" /> Marcas parceiras
          </h2>
          <span className="text-xs text-white/55">{brands.length}</span>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
          {brands.map((b) => (
            <Link
              key={b.id}
              href={`/shop/brand/${b.slug}`}
              className="shrink-0 w-24 text-center"
            >
              <div className="w-24 h-24 rounded-3xl overflow-hidden relative">
                <Image
                  src={b.logoUrl}
                  alt={b.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <p className="text-[11px] font-semibold mt-1 line-clamp-1">{b.name}</p>
              <p className="text-[10px] text-white/45">{b.category}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Categorias */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-3 mb-3 -mx-4 px-4">
        <button
          onClick={() => setCat(null)}
          className={cn(
            "shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition",
            !cat ? "vp-gradient border-transparent" : "border-white/15 text-white/70"
          )}
        >
          Todas
        </button>
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCat(cat === c ? null : c)}
            className={cn(
              "shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition",
              cat === c ? "vp-gradient border-transparent" : "border-white/15 text-white/70"
            )}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Produtos */}
      <section>
        <h3 className="font-bold mb-2 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[var(--color-vp-pink)]" />
          {cat ? `${cat}` : "Mais visto nas séries"}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((p) => {
            const brand = brands.find((b) => b.id === p.brandId);
            const apr = p.appearances[0];
            const ser = apr && series.find((s) => s.id === apr.seriesId);
            return (
              <div key={p.id} className="vp-card rounded-2xl overflow-hidden flex flex-col">
                <Link href={`/shop/product/${p.slug}`}>
                  <div className="relative aspect-square">
                    <Image src={p.imageUrl} alt={p.name} fill className="object-cover" unoptimized />
                    {p.oldPriceBRL && (
                      <span className="absolute top-2 left-2 bg-[var(--color-vp-pink)] text-[10px] font-bold px-2 py-0.5 rounded-full">
                        -{Math.round((1 - p.priceBRL / p.oldPriceBRL) * 100)}%
                      </span>
                    )}
                  </div>
                </Link>
                <div className="p-3 flex-1 flex flex-col">
                  <p className="text-[10px] text-white/55">{brand?.name}</p>
                  <Link href={`/shop/product/${p.slug}`}>
                    <p className="text-sm font-semibold leading-tight line-clamp-2 mt-0.5">
                      {p.name}
                    </p>
                  </Link>
                  {ser && (
                    <p className="text-[10px] text-white/45 mt-1 line-clamp-1">
                      Da série: {ser.title}
                    </p>
                  )}
                  <div className="flex items-baseline gap-2 mt-1.5">
                    <p className="font-bold vp-gradient-text">{formatBRL(p.priceBRL)}</p>
                    {p.oldPriceBRL && (
                      <p className="text-[10px] text-white/40 line-through">
                        {formatBRL(p.oldPriceBRL)}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => addToCart(p.id)}
                    className="mt-auto mt-2 px-3 py-2 vp-gradient rounded-xl text-xs font-bold flex items-center gap-1 justify-center"
                  >
                    <ShoppingBag className="w-3 h-3" /> Adicionar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Coleções por série */}
      <section className="mt-8">
        <h3 className="font-bold mb-2 flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-[var(--color-vp-pink)]" /> Coleções por série
        </h3>
        <div className="space-y-3">
          {series.filter((s) => productsBySeries(s.id).length > 0).slice(0, 4).map((s) => {
            const ps = productsBySeries(s.id);
            return (
              <Link
                key={s.id}
                href={`/series/${s.slug}?tab=loja`}
                className="vp-card rounded-2xl overflow-hidden flex"
              >
                <div className="relative w-24 h-28 shrink-0">
                  <Image src={s.posterUrl} alt={s.title} fill className="object-cover" unoptimized />
                </div>
                <div className="p-3 flex-1">
                  <p className="text-[10px] text-white/55">{s.genre}</p>
                  <p className="font-bold text-sm leading-tight line-clamp-1">{s.title}</p>
                  <p className="text-[11px] text-white/65 mt-1">
                    {ps.length} produtos na coleção
                  </p>
                  <div className="flex -space-x-2 mt-1.5">
                    {ps.slice(0, 4).map((p) => (
                      <Image
                        key={p.id}
                        src={p.imageUrl}
                        alt=""
                        width={28}
                        height={28}
                        className="w-7 h-7 rounded-full object-cover border-2 border-[var(--color-vp-bg)]"
                        unoptimized
                      />
                    ))}
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-white/45 self-center mr-3" />
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
