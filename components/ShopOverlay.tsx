"use client";
import { X, ShoppingBag, Check } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useWallet } from "@/lib/store";
import { BRANDS, type Product } from "@/lib/shop";
import { formatBRL } from "@/lib/catalog";

export function ShopOverlay({
  products,
  seriesTitle,
  onClose,
}: {
  products: Product[];
  seriesTitle: string;
  onClose: () => void;
}) {
  const addToCart = useWallet((s) => s.addToCart);
  const cart = useWallet((s) => s.cart);

  return (
    <div className="absolute inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-xl">
      <div className="flex items-center justify-between px-4 pt-4 safe-top">
        <div>
          <p className="text-xs text-white/60">Compre o que apareceu em</p>
          <h3 className="font-bold text-base">{seriesTitle}</h3>
        </div>
        <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center gap-2 px-4 mt-3 text-xs text-white/60">
        <ShoppingBag className="w-4 h-4" />
        <span>{products.length} itens da cena · Patrocinado</span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-32 no-scrollbar">
        {products.map((p) => {
          const brand = BRANDS.find((b) => b.id === p.brandId);
          const inCart = cart.some((c) => c.productId === p.id);
          return (
            <div key={p.id} className="vp-card rounded-2xl mb-3 p-3 flex gap-3">
              <Link href={`/shop/product/${p.slug}`} onClick={onClose} className="shrink-0">
                <Image
                  src={p.imageUrl}
                  alt={p.name}
                  width={88}
                  height={88}
                  className="w-22 h-22 rounded-xl object-cover"
                  unoptimized
                />
              </Link>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-white/55">{brand?.name}</p>
                <p className="font-semibold text-sm leading-tight line-clamp-2">{p.name}</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="font-bold vp-gradient-text">{formatBRL(p.priceBRL)}</span>
                  {p.oldPriceBRL && (
                    <span className="text-[11px] text-white/40 line-through">{formatBRL(p.oldPriceBRL)}</span>
                  )}
                </div>
                <button
                  onClick={() => addToCart(p.id)}
                  className="mt-2 px-3 py-1.5 vp-gradient rounded-full text-xs font-semibold flex items-center gap-1"
                >
                  {inCart ? <Check className="w-3 h-3" /> : <ShoppingBag className="w-3 h-3" />}
                  {inCart ? "No carrinho" : "Adicionar"}
                </button>
              </div>
            </div>
          );
        })}
        <Link
          href="/shop"
          onClick={onClose}
          className="block text-center mt-2 text-sm text-white/70 underline underline-offset-4"
        >
          Ver loja completa
        </Link>
      </div>
    </div>
  );
}
