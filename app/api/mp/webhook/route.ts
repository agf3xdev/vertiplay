// POST /api/mp/webhook — Mercado Pago envia notificações de pagamento aqui.
// Body típico: { type: "payment", data: { id: "<paymentId>" }, ... }
// Buscamos o payment pelo id e processamos quando status === "approved".

import { NextRequest } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { promises as fs } from "node:fs";
import { join } from "node:path";
import { mpPayment, MP_WEBHOOK_SECRET } from "@/lib/mercadopago";

export const runtime = "nodejs";

const LEDGER = join(process.cwd(), "prisma", "ledger.json");

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
  try {
    const body = await req.json();
    const topic = body.type ?? body.topic;
    const id = body.data?.id ?? body.resource;

    if (topic === "payment" && id) {
      if (!verifyMpSignature(req, String(id))) {
        await appendLedger({ type: "mp.signature_invalid", id });
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
      await appendLedger({ type: "mp.ignored", topic, raw: body });
    }

    return Response.json({ received: true });
  } catch (e: any) {
    await appendLedger({ type: "mp.error", error: e?.message });
    // MP retenta se status != 200, então retornamos 200 sempre que possível
    return Response.json({ received: true, soft_error: e?.message }, { status: 200 });
  }
}

// GET tb pode chegar (legacy notifications)
export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const id = url.searchParams.get("data.id") ?? url.searchParams.get("id");
  await appendLedger({ type: "mp.get", id, qs: Object.fromEntries(url.searchParams) });
  return Response.json({ received: true });
}
