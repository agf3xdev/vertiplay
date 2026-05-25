"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, BadgeCheck, Star, ShoppingBag, Check, Truck, Shield, Gift } from "lucide-react";
import { useRouter } from "next/navigation";
import { formatBRL, type Series } from "@/lib/catalog";
import { useWallet } from "@/lib/store";
import { type Product, type Brand } from "@/lib/shop";
import { CartButton } from "@/components/CartButton";

export function ProductPageClient({
  product,
  brand,
  seriesList,
}: {
  product: Product;
  brand: Brand;
  seriesList: Series[];
}) {
  const router = useRouter();
  const [active, setActive] = useState(0);
  const [qty, setQty] = useState(1);
  const addToCart = useWallet((s) => s.addToCart);
  const cart = useWallet((s) => s.cart);
  const inCart = cart.some((l) => l.productId === product.id);
  const gallery = [product.imageUrl, ...product.gallery.filter((g) => g !== product.imageUrl)];

  return (
    <div className="pb-32">
      <div className="relative aspect-square">
        <Image src={gallery[active]} alt={product.name} fill className="object-cover" unoptimized />
        <button
          onClick={() => router.back()}
          className="absolute top-4 left-3 z-10 w-10 h-10 rounded-full bg-black/45 backdrop-blur flex items-center justify-center safe-top"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="absolute top-4 right-3 safe-top">
          <CartButton />
        </div>

        {gallery.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">
            {gallery.map((_, i) => (
              <button
                key={i}
                onClick={() => setActive(i)}
                className={`h-1.5 rounded-full transition-all ${
                  active === i ? "w-6 bg-white" : "w-2 bg-white/45"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      <div className="px-4 pt-4">
        <Link
          href={`/shop/brand/${brand.slug}`}
          className="inline-flex items-center gap-1 text-xs text-white/70"
        >
          {brand.name}
          {brand.isVerified && <BadgeCheck className="w-3 h-3 text-[var(--color-vp-blue)]" />}
        </Link>
        <h1 className="text-2xl font-bold leading-tight mt-1">{product.name}</h1>

        <div className="flex items-center gap-2 mt-1.5 text-xs">
          <span className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-[var(--color-vp-gold)] text-[var(--color-vp-gold)]" />
            {product.rating}
          </span>
          <span className="text-white/40">·</span>
          <span className="text-white/55">{product.stock} em estoque</span>
        </div>

        <div className="flex items-baseline gap-2 mt-3">
          <p className="text-3xl font-extrabold vp-gradient-text">
            {formatBRL(product.priceBRL)}
          </p>
          {product.oldPriceBRL && (
            <p className="text-sm text-white/40 line-through">{formatBRL(product.oldPriceBRL)}</p>
          )}
          {product.oldPriceBRL && (
            <span className="bg-[var(--color-vp-pink)] text-[10px] font-bold px-2 py-0.5 rounded-full">
              -{Math.round((1 - product.priceBRL / product.oldPriceBRL) * 100)}%
            </span>
          )}
        </div>

        <p className="text-sm text-white/85 leading-relaxed mt-3">{product.description}</p>

        {/* Visto em */}
        {seriesList.length > 0 && (
          <section className="mt-5">
            <p className="text-xs text-white/55 mb-2 flex items-center gap-1">
              <BadgeCheck className="w-3 h-3 text-[var(--color-vp-pink)]" /> Visto em
            </p>
            <div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4">
              {seriesList.map((s) => {
                const apr = product.appearances.find((a) => a.seriesId === s.id);
                return (
                  <Link
                    key={s.id}
                    href={`/series/${s.slug}`}
                    className="shrink-0 w-28 sm:w-32 vp-card rounded-xl overflow-hidden"
                  >
                    <div className="relative w-28 sm:w-32 h-20">
                      <Image src={s.bannerUrl || s.posterUrl} alt={s.title} fill className="object-cover" unoptimized />
                    </div>
                    <div className="p-2">
                      <p className="text-[11px] font-semibold line-clamp-1">{s.title}</p>
                      {apr?.sceneNote && (
                        <p className="text-[10px] text-white/55 line-clamp-1">
                          {apr.sceneNote}
                        </p>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}

        {/* Benefits */}
        <div className="vp-card rounded-2xl p-3 mt-5 space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-[var(--color-vp-pink)]" />
            <span>Frete grátis acima de R$ 199</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[var(--color-vp-pink)]" />
            <span>Garantia de 30 dias direto com a marca</span>
          </div>
        </div>

        {/* Quantidade */}
        <div className="flex items-center justify-between mt-5">
          <p className="font-semibold">Quantidade</p>
          <div className="flex items-center gap-3 vp-card rounded-full">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="w-10 h-10 flex items-center justify-center"
            >
              −
            </button>
            <span className="font-bold">{qty}</span>
            <button
              onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
              className="w-10 h-10 flex items-center justify-center"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* CTA fixo */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] safe-bottom z-30 bg-[rgba(10,6,18,0.95)] border-t border-white/8 px-4 py-3 backdrop-blur-md">
        <div className="flex gap-2">
          <Link
            href={`/gifts/send?kind=product&payload=${encodeURIComponent(product.slug)}`}
            className="w-14 py-3.5 rounded-2xl bg-white/10 flex items-center justify-center"
            aria-label="Presentear"
          >
            <Gift className="w-4 h-4" />
          </Link>
          <button
            onClick={() => addToCart(product.id, qty)}
            className="flex-1 py-3.5 rounded-2xl bg-white/10 font-bold flex items-center justify-center gap-2"
          >
            {inCart ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
            {inCart ? "Adicionado" : "Adicionar"}
          </button>
          <Link
            href="/cart"
            onClick={() => addToCart(product.id, qty)}
            className="flex-1 py-3.5 rounded-2xl vp-gradient vp-glow font-bold text-center"
          >
            Comprar
          </Link>
        </div>
      </div>
    </div>
  );
}
