"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ChevronLeft,
  Play,
  Bookmark,
  Share2,
  Star,
  ShoppingBag,
  Lock,
  CheckCircle2,
  BadgeCheck,
  Gift,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { formatViews, formatBRL, type Series } from "@/lib/catalog";
import type { Product, Brand } from "@/lib/shop";
import { useWallet } from "@/lib/store";
import { cn } from "@/lib/cn";

export function SeriesDetailClient({
  series,
  brands,
  products,
}: {
  series: Series;
  brands: Brand[];
  products: Product[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"episodios" | "loja" | "sobre">("episodios");
  const isInWatchlist = useWallet((s) => s.isInWatchlist(series.id));
  const toggleWatchlist = useWallet((s) => s.toggleWatchlist);
  const isVip = useWallet((s) => s.isVip);
  const isUnlocked = useWallet((s) => s.isUnlocked);

  return (
    <div>
      {/* Banner hero */}
      <div className="relative h-[55dvh]">
        <Image
          src={series.bannerUrl || series.posterUrl}
          alt={series.title}
          fill
          className="object-cover"
          unoptimized
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-vp-bg)] via-black/40 to-black/30" />

        <button
          onClick={() => router.back()}
          className="absolute top-4 left-3 z-10 w-10 h-10 rounded-full bg-black/45 backdrop-blur flex items-center justify-center safe-top"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button className="absolute top-4 right-3 z-10 w-10 h-10 rounded-full bg-black/45 backdrop-blur flex items-center justify-center safe-top">
          <Share2 className="w-4 h-4" />
        </button>

        <div className="absolute bottom-4 left-4 right-4 z-10">
          {series.isExclusive && (
            <span className="vp-gradient px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider inline-block mb-2">
              Exclusivo Vertiplay
            </span>
          )}
          <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight">{series.title}</h1>
          <div className="flex items-center gap-3 mt-2 text-xs text-white/85">
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 fill-[var(--color-vp-gold)] text-[var(--color-vp-gold)]" />
              {series.rating}
            </span>
            <span>·</span>
            <span>{formatViews(series.views)} vistos</span>
            <span>·</span>
            <span>{series.totalEpisodes} ep.</span>
            <span>·</span>
            <span>{series.genre}</span>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-2">
        <p className="text-sm text-white/85 leading-relaxed">{series.synopsis}</p>

        <div className="flex gap-2 mt-4">
          <Link
            href={`/watch/${series.slug}/1`}
            className="flex-1 vp-gradient py-3.5 rounded-2xl font-bold text-center flex items-center justify-center gap-2 vp-glow"
          >
            <Play className="w-5 h-5 fill-white" /> Assistir agora
          </Link>
          <Link
            href={`/gifts/send?kind=series&payload=${encodeURIComponent(series.slug)}`}
            className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center"
            aria-label="Presentear"
          >
            <Gift className="w-5 h-5" />
          </Link>
          <button
            onClick={() => toggleWatchlist(series.id)}
            className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center"
            aria-label="Salvar"
          >
            <Bookmark
              className={cn("w-5 h-5", isInWatchlist && "fill-white")}
            />
          </button>
        </div>

        {/* Tags */}
        <div className="flex gap-2 mt-3 flex-wrap">
          {series.tags.map((t) => (
            <span
              key={t}
              className="bg-white/8 px-2 py-1 rounded-md text-[11px] text-white/70"
            >
              #{t}
            </span>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-6 mt-6 border-b border-white/10">
          {(
            [
              { id: "episodios", label: `Episódios · ${series.totalEpisodes}` },
              { id: "loja", label: `Loja · ${products.length}` },
              { id: "sobre", label: "Sobre" },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "py-2 text-sm font-medium border-b-2 transition",
                tab === t.id ? "border-[var(--color-vp-pink)] text-white" : "border-transparent text-white/55"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tab === "episodios" && (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-4 pb-6">
            {series.episodes.map((ep) => {
              const unlocked = ep.isFree || isVip || isUnlocked(series.id, ep.number);
              return (
                <Link
                  key={ep.number}
                  href={`/watch/${series.slug}/${ep.number}`}
                  className={cn(
                    "aspect-square rounded-xl border flex items-center justify-center text-sm font-bold relative",
                    unlocked
                      ? "border-white/20 bg-white/5"
                      : "border-white/10 bg-white/5 text-white/45"
                  )}
                >
                  {ep.number}
                  {ep.isFree && (
                    <span className="absolute -top-1 -right-1 vp-gradient text-[8px] px-1 py-0.5 rounded font-bold">
                      FREE
                    </span>
                  )}
                  {!unlocked && (
                    <Lock className="absolute bottom-1 right-1 w-3 h-3 text-white/50" />
                  )}
                </Link>
              );
            })}
          </div>
        )}

        {tab === "loja" && (
          <div className="mt-4 pb-6">
            {brands.length > 0 && (
              <div className="mb-5">
                <p className="text-xs text-white/55 mb-2 flex items-center gap-1">
                  <BadgeCheck className="w-3.5 h-3.5 text-[var(--color-vp-pink)]" /> Patrocinado por
                </p>
                <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
                  {brands.map((b) => (
                    <Link
                      key={b.id}
                      href={`/shop/brand/${b.slug}`}
                      className="shrink-0 vp-card rounded-2xl py-2 px-3 flex items-center gap-2"
                    >
                      <Image
                        src={b.logoUrl}
                        alt={b.name}
                        width={32}
                        height={32}
                        className="w-8 h-8 rounded-full object-cover"
                        unoptimized
                      />
                      <div>
                        <p className="text-xs font-semibold flex items-center gap-1">
                          {b.name}
                          {b.isVerified && (
                            <BadgeCheck className="w-3 h-3 text-[var(--color-vp-blue)]" />
                          )}
                        </p>
                        <p className="text-[10px] text-white/50">{b.category}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <p className="text-xs text-white/55 mb-2 flex items-center gap-1">
              <ShoppingBag className="w-3.5 h-3.5 text-[var(--color-vp-pink)]" /> Da série · {products.length} itens
            </p>
            <div className="grid grid-cols-2 gap-3">
              {products.map((p) => (
                <Link
                  key={p.id}
                  href={`/shop/product/${p.slug}`}
                  className="vp-card rounded-2xl overflow-hidden"
                >
                  <div className="relative aspect-square">
                    <Image src={p.imageUrl} alt={p.name} fill className="object-cover" unoptimized />
                  </div>
                  <div className="p-2">
                    <p className="text-[10px] text-white/55">
                      {brands.find((b) => b.id === p.brandId)?.name}
                    </p>
                    <p className="text-xs font-semibold line-clamp-2 leading-tight">{p.name}</p>
                    <p className="text-sm font-bold vp-gradient-text mt-1">
                      {formatBRL(p.priceBRL)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
            {products.length === 0 && (
              <p className="text-center text-white/45 py-8 text-sm">
                Esta série ainda não tem produtos shoppable.
              </p>
            )}
          </div>
        )}

        {tab === "sobre" && (
          <div className="mt-4 pb-6 space-y-3 text-sm">
            <Info label="Gênero" value={series.genre} />
            <Info label="Episódios" value={`${series.totalEpisodes} (~75s cada)`} />
            <Info label="Idioma" value="Dublado em PT-BR" />
            <Info label="Avaliação" value={`${series.rating} / 5`} />
            <Info label="Episódios grátis" value={String(series.freeEpisodes)} />
            <Info label="Custo por episódio" value="20 coins" />
            <p className="text-xs text-white/45 pt-3">
              Continue a história com coins. VIP libera tudo sem custo.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between border-b border-white/5 py-2">
      <span className="text-white/55">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );
}
