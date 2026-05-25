// POST /api/stripe/webhook — Stripe envia eventos aqui.
// Valida assinatura com STRIPE_WEBHOOK_SECRET, credita coins/VIP no usuário.
// No MVP, persiste em arquivo local. Em prod, atualiza User via Prisma.

import { NextRequest } from "next/server";
import { stripe, STRIPE_WEBHOOK_SECRET } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import type Stripe from "stripe";

export const runtime = "nodejs";

async function appendLedger(entry: {
  type: string;
  paymentId?: string;
  status?: string;
  amount?: number;
  method?: string;
  userId?: string;
  kind?: string;
  meta?: Record<string, any>;
}) {
  try {
    await prisma.ledgerEntry.create({
      data: {
        source: "stripe",
        type: entry.type,
        paymentId: entry.paymentId,
        status: entry.status,
        amount: entry.amount,
        method: entry.method,
        userId: entry.userId,
        kind: entry.kind,
        meta: entry.meta as any,
      },
    });
  } catch (e: any) {
    console.error("[stripe/webhook] ledger write failed:", e?.message);
  }
}

export async function POST(req: NextRequest) {
  if (!STRIPE_WEBHOOK_SECRET) {
    return Response.json({ error: "STRIPE_WEBHOOK_SECRET ausente" }, { status: 500 });
  }
  const sig = req.headers.get("stripe-signature");
  if (!sig) return Response.json({ error: "sem assinatura" }, { status: 400 });

  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(body, sig, STRIPE_WEBHOOK_SECRET);
  } catch (e: any) {
    return Response.json({ error: `assinatura inválida: ${e.message}` }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const md = session.metadata ?? {};
      await appendLedger({
        type: "checkout.completed",
        paymentId: session.id,
        userId: md.userId,
        kind: md.kind,
        amount: session.amount_total ?? undefined,
        meta: { ...md, currency: session.currency },
      });
      // TODO: credit user: se kind=coins, +coins +bonus; se kind=vip, ativar VIP por N dias
      break;
    }
    case "payment_intent.succeeded": {
      const pi = event.data.object as Stripe.PaymentIntent;
      await appendLedger({ type: "payment.succeeded", paymentId: pi.id, amount: pi.amount });
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await appendLedger({ type: event.type, paymentId: sub.id, status: sub.status });
      break;
    }
    default:
      await appendLedger({ type: "ignored", meta: { evt: event.type } });
  }

  return Response.json({ received: true });
}
