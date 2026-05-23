// POST /api/stripe/checkout
// Cria Checkout Session. Body: { type: "coins" | "vip", packId: string, userId?: string }
// Retorna { url } — frontend redireciona pra Stripe Checkout.

import { NextRequest } from "next/server";
import { stripe } from "@/lib/stripe";
import { COIN_PACKS, VIP_PLANS } from "@/lib/catalog";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { type, packId, userId } = await req.json();
    const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "https://vertiplay.diogoarchanjo.com.br";

    let priceData: { currency: string; unit_amount: number; product_data: { name: string; description: string } };
    let mode: "payment" | "subscription" = "payment";
    let metadata: Record<string, string> = { userId: userId ?? "anon" };

    if (type === "coins") {
      const pack = COIN_PACKS.find((p) => p.id === packId);
      if (!pack) return Response.json({ error: "Pack inválido" }, { status: 400 });
      priceData = {
        currency: "brl",
        unit_amount: pack.priceBRL,
        product_data: {
          name: `Vertiplay · ${pack.coins} coins${pack.bonus ? ` +${pack.bonus} bônus` : ""}`,
          description: `Pacote ${pack.label} — desbloqueie episódios premium`,
        },
      };
      metadata = { ...metadata, kind: "coins", packId: pack.id, coins: String(pack.coins), bonus: String(pack.bonus) };
    } else if (type === "vip") {
      const plan = VIP_PLANS.find((p) => p.id === packId);
      if (!plan) return Response.json({ error: "Plano inválido" }, { status: 400 });
      priceData = {
        currency: "brl",
        unit_amount: plan.priceBRL,
        product_data: {
          name: `Vertiplay ${plan.name}`,
          description: `${plan.coinsPerDay} coins bônus/dia · ${plan.days} dias de acesso ilimitado`,
        },
      };
      metadata = { ...metadata, kind: "vip", planId: plan.id, days: String(plan.days) };
    } else {
      return Response.json({ error: "type inválido" }, { status: 400 });
    }

    const session = await stripe().checkout.sessions.create({
      mode,
      payment_method_types: ["card"],
      line_items: [{ price_data: priceData, quantity: 1 }],
      success_url: `${origin}/wallet?paid=1&sid={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/wallet?canceled=1`,
      metadata,
      locale: "pt-BR",
    });

    return Response.json({ url: session.url, id: session.id });
  } catch (e: any) {
    return Response.json({ error: e.message ?? "Erro Stripe" }, { status: 500 });
  }
}
