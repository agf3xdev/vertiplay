// POST /api/mp/checkout
// Cria uma Preference no Mercado Pago (Checkout Pro).
// Body: { type: "coins" | "vip", packId, userId? }
// Retorna { init_point } — frontend redireciona pra página MP (PIX + cartão + boleto).

import { NextRequest } from "next/server";
import { mpPreference } from "@/lib/mercadopago";
import { COIN_PACKS, VIP_PLANS } from "@/lib/catalog";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { type, packId, userId } = await req.json();
    const origin = req.headers.get("origin") ?? process.env.NEXT_PUBLIC_APP_URL ?? "https://vertiplay.diogoarchanjo.com.br";

    let title: string;
    let unitPriceBRL: number;
    let metadata: Record<string, string> = { userId: userId ?? "anon" };

    if (type === "coins") {
      const pack = COIN_PACKS.find((p) => p.id === packId);
      if (!pack) return Response.json({ error: "Pack inválido" }, { status: 400 });
      title = `Vertiplay · ${pack.coins} coins${pack.bonus ? ` + ${pack.bonus} bônus` : ""}`;
      unitPriceBRL = pack.priceBRL / 100;
      metadata = { ...metadata, kind: "coins", packId: pack.id, coins: String(pack.coins), bonus: String(pack.bonus) };
    } else if (type === "vip") {
      const plan = VIP_PLANS.find((p) => p.id === packId);
      if (!plan) return Response.json({ error: "Plano inválido" }, { status: 400 });
      title = `Vertiplay ${plan.name}`;
      unitPriceBRL = plan.priceBRL / 100;
      metadata = { ...metadata, kind: "vip", planId: plan.id, days: String(plan.days) };
    } else {
      return Response.json({ error: "type inválido" }, { status: 400 });
    }

    const preference = await mpPreference().create({
      body: {
        items: [
          {
            id: packId,
            title,
            quantity: 1,
            currency_id: "BRL",
            unit_price: unitPriceBRL,
          },
        ],
        back_urls: {
          success: `${origin}/wallet?mp=success`,
          failure: `${origin}/wallet?mp=failure`,
          pending: `${origin}/wallet?mp=pending`,
        },
        auto_return: "approved",
        payment_methods: {
          excluded_payment_types: [], // permite tudo: pix, cartão, boleto
          installments: 6,
        },
        notification_url: `${origin}/api/mp/webhook`,
        metadata,
        statement_descriptor: "VERTIPLAY",
      },
    });

    return Response.json({
      init_point: preference.init_point,
      sandbox_init_point: preference.sandbox_init_point,
      id: preference.id,
    });
  } catch (e: any) {
    return Response.json({ error: e?.message ?? "Erro Mercado Pago" }, { status: 500 });
  }
}
