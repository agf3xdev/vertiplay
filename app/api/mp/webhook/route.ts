// POST /api/mp/webhook — Mercado Pago envia notificações de pagamento aqui.
// Body típico: { type: "payment", data: { id: "<paymentId>" }, ... }
// Buscamos o payment pelo id e processamos quando status === "approved".

import { NextRequest } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { mpPayment, MP_WEBHOOK_SECRET } from "@/lib/mercadopago";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

// Valida x-signature do Mercado Pago.
// Template: id:<dataId>;request-id:<reqId>;ts:<ts>;
// HMAC-SHA256(template, secret) === v1
function verifyMpSignature(req: NextRequest, dataId: string): boolean {
  if (!MP_WEBHOOK_SECRET) return true; // sem secret configurado → não bloqueia (MVP)
  const sig = req.headers.get("x-signature") ?? "";
  const reqId = req.headers.get("x-request-id") ?? "";
  if (!sig || !reqId) return false;

  const parts = Object.fromEntries(
    sig.split(",").map((p) => {
      const [k, v] = p.split("=");
      return [k.trim(), v?.trim() ?? ""];
    })
  );
  const ts = parts.ts;
  const v1 = parts.v1;
  if (!ts || !v1) return false;

  const tpl = `id:${dataId};request-id:${reqId};ts:${ts};`;
  const expected = createHmac("sha256", MP_WEBHOOK_SECRET).update(tpl).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(v1, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}

async function appendLedger(entry: {
  type: string;
  paymentId?: string | number;
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
        source: "mp",
        type: entry.type,
        paymentId: entry.paymentId != null ? String(entry.paymentId) : undefined,
        status: entry.status,
        amount: entry.amount,
        method: entry.method,
        userId: entry.userId,
        kind: entry.kind,
        meta: entry.meta as any,
      },
    });
  } catch (e: any) {
    console.error("[mp/webhook] ledger write failed:", e?.message);
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const topic = body.type ?? body.topic;
    const id = body.data?.id ?? body.resource;

    if (topic === "payment" && id) {
      if (!verifyMpSignature(req, String(id))) {
        await appendLedger({ type: "signature_invalid", paymentId: id });
        return Response.json({ error: "assinatura inválida" }, { status: 401 });
      }
      const payment = await mpPayment().get({ id: String(id) });
      const status = payment.status; // "approved" | "pending" | "rejected" | "cancelled"
      const md = (payment.metadata ?? {}) as Record<string, any>;

      await appendLedger({
        type: "mp.payment",
        paymentId: payment.id,
        status,
        amount: payment.transaction_amount,
        method: payment.payment_method_id, // pix, visa, master, bolbradesco, ...
        userId: md.userId,
        kind: md.kind,
        meta: md,
      });

      // TODO: se status === "approved":
      //   if kind === "coins": creditar coins + bonus no User (Prisma)
      //   if kind === "vip":   ativar VIP por N dias
    } else {
      await appendLedger({ type: "ignored", meta: { topic, raw: body } });
    }

    return Response.json({ received: true });
  } catch (e: any) {
    await appendLedger({ type: "error", meta: { error: e?.message } });
    return Response.json({ received: true, soft_error: e?.message }, { status: 200 });
  }
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get("data.id") ?? url.searchParams.get("id");
  await appendLedger({
    type: "get",
    paymentId: id ?? undefined,
    meta: Object.fromEntries(url.searchParams),
  });
  return Response.json({ received: true });
}
