"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, CreditCard, Wallet, CheckCircle2 } from "lucide-react";
import { useWallet } from "@/lib/store";
import { PRODUCTS } from "@/lib/shop";
import { formatBRL } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import Link from "next/link";

export default function CheckoutPage() {
  const router = useRouter();
  const cart = useWallet((s) => s.cart);
  const checkout = useWallet((s) => s.checkout);
  const [pm, setPm] = useState<"pix" | "card">("pix");
  const [done, setDone] = useState(false);

  const subtotal = cart.reduce((a, l) => {
    const p = PRODUCTS.find((x) => x.id === l.productId);
    return a + (p ? p.priceBRL * l.qty : 0);
  }, 0);
  const shipping = subtotal >= 19900 ? 0 : 1990;
  const total = subtotal + shipping;

  function finish() {
    checkout(total);
    setDone(true);
  }

  if (done) {
    return (
      <div className="px-6 pt-20 safe-top text-center">
        <div className="w-24 h-24 vp-gradient rounded-full flex items-center justify-center mx-auto mb-5 vp-glow">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Pedido confirmado!</h1>
        <p className="text-white/65 text-sm mb-1">Total: {formatBRL(total)}</p>
        <p className="text-white/45 text-xs mb-8">
          Você receberá atualizações de envio por e-mail e push.
        </p>
        <Link href="/" className="block py-3.5 rounded-2xl vp-gradient vp-glow font-bold">
          Continuar assistindo
        </Link>
        <Link href="/profile" className="block mt-3 text-sm text-white/65 underline">
          Ver meus pedidos
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-32">
      <div className="px-4 pt-4 safe-top flex items-center gap-3 mb-4">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">Pagamento</h1>
      </div>

      <div className="px-4">
        <p className="font-bold mb-2">Entrega</p>
        <div className="vp-card rounded-2xl p-4 space-y-3 text-sm">
          <input
            placeholder="Nome completo"
            className="w-full bg-white/8 border border-white/10 rounded-xl px-3 py-2 placeholder:text-white/40 focus:outline-none focus:border-[var(--color-vp-pink)]"
          />
          <input
            placeholder="CPF"
            className="w-full bg-white/8 border border-white/10 rounded-xl px-3 py-2 placeholder:text-white/40 focus:outline-none focus:border-[var(--color-vp-pink)]"
          />
          <input
            placeholder="CEP"
            className="w-full bg-white/8 border border-white/10 rounded-xl px-3 py-2 placeholder:text-white/40 focus:outline-none focus:border-[var(--color-vp-pink)]"
          />
          <input
            placeholder="Endereço completo"
            className="w-full bg-white/8 border border-white/10 rounded-xl px-3 py-2 placeholder:text-white/40 focus:outline-none focus:border-[var(--color-vp-pink)]"
          />
        </div>

        <p className="font-bold mt-5 mb-2">Forma de pagamento</p>
        <div className="space-y-2">
          <button
            onClick={() => setPm("pix")}
            className={cn(
              "vp-card rounded-2xl w-full p-4 flex items-center gap-3 border",
              pm === "pix" ? "border-[var(--color-vp-pink)]" : "border-transparent"
            )}
          >
            <Wallet className="w-5 h-5 text-[var(--color-vp-pink)]" />
            <div className="flex-1 text-left">
              <p className="font-semibold text-sm">Pix</p>
              <p className="text-[11px] text-white/55">5% off · Mercado Pago</p>
            </div>
            <span
              className={cn(
                "w-5 h-5 rounded-full border-2",
                pm === "pix" ? "vp-gradient border-transparent" : "border-white/30"
              )}
            />
          </button>
          <button
            onClick={() => setPm("card")}
            className={cn(
              "vp-card rounded-2xl w-full p-4 flex items-center gap-3 border",
              pm === "card" ? "border-[var(--color-vp-pink)]" : "border-transparent"
            )}
          >
            <CreditCard className="w-5 h-5 text-[var(--color-vp-pink)]" />
            <div className="flex-1 text-left">
              <p className="font-semibold text-sm">Cartão de crédito</p>
              <p className="text-[11px] text-white/55">Até 6x sem juros · Stripe</p>
            </div>
            <span
              className={cn(
                "w-5 h-5 rounded-full border-2",
                pm === "card" ? "vp-gradient border-transparent" : "border-white/30"
              )}
            />
          </button>
        </div>

        <div className="vp-card rounded-2xl p-4 mt-5 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-white/65">Subtotal</span>
            <span className="font-semibold">{formatBRL(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-white/65">Frete</span>
            <span className="font-semibold">{shipping === 0 ? "Grátis" : formatBRL(shipping)}</span>
          </div>
          <div className="h-px bg-white/10 my-1" />
          <div className="flex justify-between">
            <span className="font-bold">Total</span>
            <span className="font-bold vp-gradient-text text-lg">{formatBRL(total)}</span>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] safe-bottom z-30 bg-[rgba(10,6,18,0.95)] border-t border-white/8 px-4 py-3 backdrop-blur-md">
        <button onClick={finish} className="w-full py-4 rounded-2xl vp-gradient vp-glow font-bold">
          Pagar {formatBRL(total)}
        </button>
      </div>
    </div>
  );
}
