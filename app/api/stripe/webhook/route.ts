// POST /api/stripe/webhook — Stripe envia eventos aqui.
// Valida assinatura com STRIPE_WEBHOOK_SECRET, credita coins/VIP no usuário.
// No MVP, persiste em arquivo local. Em prod, atualiza User via Prisma.

import { NextRequest } from "next/server";
import { promises as fs } from "node:fs";
import { join } from "node:path";
import { stripe, STRIPE_WEBHOOK_SECRET } from "@/lib/stripe";
import type Stripe from "stripe";

export const runtime = "nodejs";

const LEDGER = join(process.cwd(), "prisma", "ledger.json");

async function appendLedger(entry: any) {
  let arr: any[] = [];
  try {
    const raw = await fs.readFile(LEDGER, "utf8");
    arr = JSON.parse(raw);
  } catch {}
  arr.unshift({ ...entry, at: new Date().toISOString() });
  await fs.mkdir(join(process.cwd(), "prisma"), { recursive: true });
  await fs.writeFile(LEDGER, JSON.stringify(arr.slice(0, 1000), null, 2));
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
        sessionId: session.id,
        userId: md.userId,
        kind: md.kind,
        amount: session.amount_total,
        currency: session.currency,
        meta: md,
      });
      // TODO: credit user (Prisma): se kind=coins, +coins +bonus; se kind=vip, ativar VIP por N dias
      break;
    }
    case "payment_intent.succeeded": {
      const pi = event.data.object as Stripe.PaymentIntent;
      await appendLedger({ type: "payment.succeeded", paymentIntent: pi.id, amount: pi.amount });
      break;
    }
    case "customer.subscription.created":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      await appendLedger({ type: event.type, subscriptionId: sub.id, status: sub.status });
      break;
    }
    default:
      await appendLedger({ type: "ignored", evt: event.type });
  }

  return Response.json({ received: true });
}
