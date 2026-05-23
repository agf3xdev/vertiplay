// Mercado Pago client server-side (PIX + cartão BR).
// Foco: Checkout Pro (preferência hospedada pelo MP, suporta PIX nativo).

import { MercadoPagoConfig, Preference, Payment } from "mercadopago";

let _client: MercadoPagoConfig | null = null;

export function mpClient(): MercadoPagoConfig {
  if (_client) return _client;
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN;
  if (!token) throw new Error("MERCADOPAGO_ACCESS_TOKEN ausente");
  _client = new MercadoPagoConfig({ accessToken: token, options: { timeout: 5000 } });
  return _client;
}

export const mpPreference = () => new Preference(mpClient());
export const mpPayment = () => new Payment(mpClient());

export const MP_PUBLIC_KEY = process.env.MERCADOPAGO_PUBLIC_KEY ?? "";
export const MP_WEBHOOK_SECRET = process.env.MERCADOPAGO_WEBHOOK_SECRET ?? "";
