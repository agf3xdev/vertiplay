"use client";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronLeft, Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useWallet } from "@/lib/store";
import { PRODUCTS, BRANDS } from "@/lib/shop";
import { formatBRL } from "@/lib/catalog";

export default function CartPage() {
  const router = useRouter();
  const cart = useWallet((s) => s.cart);
  const removeFromCart = useWallet((s) => s.removeFromCart);
  const setQty = useWallet((s) => s.setQty);

  const lines = cart.map((l) => {
    const p = PRODUCTS.find((x) => x.id === l.productId)!;
    return { ...l, product: p, brand: BRANDS.find((b) => b.id === p?.brandId) };
  });

  const subtotal = lines.reduce((acc, l) => acc + (l.product?.priceBRL ?? 0) * l.qty, 0);
  const shipping = subtotal >= 19900 || subtotal === 0 ? 0 : 1990;
  const total = subtotal + shipping;

  if (cart.length === 0) {
    return (
      <div className="px-4 pt-4 safe-top">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => router.back()}
            className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Carrinho</h1>
        </div>
        <div className="flex flex-col items-center text-center py-20">
          <div className="w-20 h-20 rounded-full vp-gradient flex items-center justify-center mb-4 vp-glow">
            <ShoppingBag className="w-9 h-9" />
          </div>
          <p className="font-bold text-lg mb-1">Seu carrinho está vazio</p>
          <p className="text-sm text-white/55 mb-5">
            Encontre produtos shoppable nas suas séries favoritas.
          </p>
          <Link href="/shop" className="vp-gradient px-6 py-3 rounded-2xl font-bold">
            Ir para a loja
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-40">
      <div className="px-4 pt-4 safe-top flex items-center gap-3 mb-4">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">Carrinho · {cart.length}</h1>
      </div>

      <div className="px-4 space-y-3">
        {lines.map(({ product, qty, brand }) =>
          product ? (
            <div key={product.id} className="vp-card rounded-2xl p-3 flex gap-3">
              <Image
                src={product.imageUrl}
                alt={product.name}
                width={80}
                height={80}
                className="w-20 h-20 rounded-xl object-cover"
                unoptimized
              />
              <div className="flex-1 min-w-0">
                <p className="text-[10px] text-white/55">{brand?.name}</p>
                <p className="font-semibold text-sm leading-tight line-clamp-2">{product.name}</p>
                <p className="text-sm font-bold vp-gradient-text mt-1">
                  {formatBRL(product.priceBRL * qty)}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-3 bg-white/8 rounded-full">
                    <button
                      onClick={() => setQty(product.id, qty - 1)}
                      className="w-8 h-8 flex items-center justify-center"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-sm font-bold">{qty}</span>
                    <button
                      onClick={() => setQty(product.id, qty + 1)}
                      className="w-8 h-8 flex items-center justify-center"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                  <button onClick={() => removeFromCart(product.id)} className="text-white/55">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : null
        )}
      </div>

      <div className="px-4 mt-6">
        <div className="vp-card rounded-2xl p-4 space-y-2 text-sm">
          <Row label="Subtotal" value={formatBRL(subtotal)} />
          <Row label="Frete" value={shipping === 0 ? "Grátis" : formatBRL(shipping)} />
          <div className="h-px bg-white/10 my-1" />
          <Row label="Total" value={formatBRL(total)} bold />
        </div>
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] safe-bottom z-30 bg-[rgba(10,6,18,0.95)] border-t border-white/8 px-4 py-3 backdrop-blur-md">
        <Link
          href="/checkout"
          className="block w-full py-4 rounded-2xl vp-gradient vp-glow font-bold text-center"
        >
          Finalizar · {formatBRL(total)}
        </Link>
      </div>
    </div>
  );
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className={bold ? "font-bold" : "text-white/65"}>{label}</span>
      <span className={bold ? "font-bold vp-gradient-text text-lg" : "font-semibold"}>{value}</span>
    </div>
  );
}
