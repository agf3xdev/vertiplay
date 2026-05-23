"use client";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, BadgeCheck, ExternalLink, Heart, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatBRL, type Series } from "@/lib/catalog";
import { useWallet } from "@/lib/store";
import { type Brand, type Product } from "@/lib/shop";
import { cn } from "@/lib/cn";

export function BrandPageClient({
  brand,
  products,
  series,
}: {
  brand: Brand;
  products: Product[];
  series: Series[];
}) {
  const router = useRouter();
  const isFollowing = useWallet((s) => s.isFollowingBrand(brand.id));
  const toggle = useWallet((s) => s.toggleBrandFollow);
  const addToCart = useWallet((s) => s.addToCart);

  return (
    <div className="pb-8">
      <div className="relative h-48">
        <Image src={brand.coverUrl} alt={brand.name} fill className="object-cover" unoptimized />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-vp-bg)] via-black/40 to-transparent" />
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-3 z-10 w-10 h-10 rounded-full bg-black/45 backdrop-blur flex items-center justify-center safe-top"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>

      <div className="px-4 -mt-10 relative z-10">
        <div className="flex items-end gap-3 mb-3">
          <Image
            src={brand.logoUrl}
            alt={brand.name}
            width={80}
            height={80}
            className="w-20 h-20 rounded-2xl object-cover border-4 border-[var(--color-vp-bg)]"
            unoptimized
          />
          <div className="flex-1 pb-1">
            <h1 className="text-xl font-bold flex items-center gap-1">
              {brand.name}
              {brand.isVerified && <BadgeCheck className="w-5 h-5 text-[var(--color-vp-blue)]" />}
            </h1>
            <p className="text-xs text-white/60">{brand.category}</p>
          </div>
        </div>

        <p className="text-sm text-white/85 leading-relaxed">{brand.bio}</p>

        <div className="flex gap-2 mt-3">
          <button
            onClick={() => toggle(brand.id)}
            className={cn(
              "flex-1 py-3 rounded-2xl font-semibold flex items-center justify-center gap-2",
              isFollowing ? "bg-white/10" : "vp-gradient vp-glow"
            )}
          >
            <Heart className={cn("w-4 h-4", isFollowing && "fill-white")} />
            {isFollowing ? "Seguindo" : "Seguir loja"}
          </button>
          {brand.website && (
            <a
              href={brand.website}
              target="_blank"
              rel="noreferrer"
              className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center"
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>

        {/* Em destaque nas séries */}
        {series.length > 0 && (
          <section className="mt-5">
            <p className="text-xs text-white/55 mb-2">Em destaque nas séries</p>
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {series.map((s) => (
                <Link
                  key={s.id}
                  href={`/series/${s.slug}`}
                  className="shrink-0 w-24"
                >
                  <div className="relative w-24 aspect-poster rounded-xl overflow-hidden">
                    <Image src={s.posterUrl} alt={s.title} fill className="object-cover" unoptimized />
                  </div>
                  <p className="text-[10px] mt-1 line-clamp-2">{s.title}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Catálogo */}
        <section className="mt-6">
          <h3 className="font-bold mb-3 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-[var(--color-vp-pink)]" /> Catálogo · {products.length}
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {products.map((p) => (
              <div key={p.id} className="vp-card rounded-2xl overflow-hidden">
                <Link href={`/shop/product/${p.slug}`}>
                  <div className="relative aspect-square">
                    <Image src={p.imageUrl} alt={p.name} fill className="object-cover" unoptimized />
                  </div>
                </Link>
                <div className="p-2">
                  <p className="text-[10px] text-white/55">{p.category}</p>
                  <p className="text-xs font-semibold line-clamp-2 leading-tight">{p.name}</p>
                  <p className="text-sm font-bold vp-gradient-text mt-1">{formatBRL(p.priceBRL)}</p>
                  <button
                    onClick={() => addToCart(p.id)}
                    className="mt-2 w-full py-1.5 vp-gradient rounded-lg text-[11px] font-bold"
                  >
                    Adicionar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
