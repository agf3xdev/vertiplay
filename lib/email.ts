// Resend SDK + OTP por email via Postgres (Prisma).
//
// 1. gera código 6 dígitos, salva hash SHA-256 na tabela OtpCode com expiry 10min
// 2. envia email via Resend com template HTML branded
// 3. valida código → ok/erro, max 5 tentativas

import { Resend } from "resend";
import { createHash, randomInt } from "node:crypto";
import { prisma } from "./prisma";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.EMAIL_FROM || "Vertiplay <vertiplay@diogoarchanjo.com.br>";

let _resend: Resend | null = null;
function resend(): Resend {
  if (_resend) return _resend;
  if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY ausente");
  _resend = new Resend(RESEND_API_KEY);
  return _resend;
}

function hash(s: string) {
  return createHash("sha256").update(s).digest("hex");
}

const TTL_MS = 10 * 60 * 1000; // 10 min
const MAX_ATTEMPTS = 5;

export async function sendOtpEmail(email: string): Promise<{ ok: boolean; error?: string }> {
  const code = String(randomInt(100000, 999999)); // 6 dígitos
  const normalized = email.toLowerCase();
  const expiresAt = new Date(Date.now() + TTL_MS);

  // upsert: substitui qualquer código anterior do mesmo email
  await prisma.otpCode.upsert({
    where: { email: normalized },
    create: {
      email: normalized,
      codeHash: hash(code),
      expiresAt,
      attempts: 0,
    },
    update: {
      codeHash: hash(code),
      expiresAt,
      attempts: 0,
    },
  });

  try {
    const r = await resend().emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `Seu código Vertiplay: ${code}`,
      html: renderHtml(code),
      text: `Seu código de acesso ao Vertiplay é: ${code}\n\nExpira em 10 minutos. Se você não pediu esse código, ignore esta mensagem.`,
    });
    if ((r as any)?.error) {
      const err = (r as any).error;
      console.error("[email] resend api error:", err);
      return { ok: false, error: err.message || JSON.stringify(err) };
    }
    return { ok: true };
  } catch (e: any) {
    console.error("[email] send threw:", e?.message, e);
    return { ok: false, error: e?.message ?? "Falha ao enviar email" };
  }
}

export async function verifyOtp(email: string, code: string): Promise<{ ok: boolean; error?: string }> {
  const normalized = email.toLowerCase();
  const entry = await prisma.otpCode.findUnique({ where: { email: normalized } });
  if (!entry) return { ok: false, error: "Pedir um novo código" };

  if (entry.expiresAt.getTime() < Date.now()) {
    await prisma.otpCode.delete({ where: { id: entry.id } });
    return { ok: false, error: "Código expirou — peça outro" };
  }
  if (entry.attempts >= MAX_ATTEMPTS) {
    await prisma.otpCode.delete({ where: { id: entry.id } });
    return { ok: false, error: "Muitas tentativas — peça outro código" };
  }
  if (hash(code.trim()) !== entry.codeHash) {
    await prisma.otpCode.update({
      where: { id: entry.id },
      data: { attempts: { increment: 1 } },
    });
    return { ok: false, error: "Código incorreto" };
  }
  // sucesso — one-time use
  await prisma.otpCode.delete({ where: { id: entry.id } });
  return { ok: true };
}

// Notificação de pedido de amizade
export async function sendFriendRequestEmail(opts: {
  to: string;
  fromDisplayName: string;
  fromUsername: string;
}): Promise<void> {
  try {
    await resend().emails.send({
      from: FROM_EMAIL,
      to: opts.to,
      subject: `${opts.fromDisplayName} quer ser seu amigo no Vertiplay`,
      html: renderFriendRequestHtml(opts.fromDisplayName, opts.fromUsername),
      text: `${opts.fromDisplayName} (@${opts.fromUsername}) quer te adicionar como amigo no Vertiplay.\n\nAbra o app pra aceitar: https://vertiplay.diogoarchanjo.com.br/amigos`,
    });
  } catch (e: any) {
    console.error("[email] friend request notification failed:", e?.message);
    // não bloqueia o pedido se o email falhar
  }
}

// ─────────────── Templates HTML ───────────────

function renderHtml(code: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8"/>
<title>Vertiplay — seu código</title>
</head>
<body style="margin:0;padding:0;background:#0a0612;font-family:-apple-system,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0612;padding:40px 0;">
    <tr><td align="center">
      <table width="100%" style="max-width:480px;background:#15091f;border-radius:24px;padding:32px;color:#ffffff;">
        <tr><td style="padding-bottom:24px;">
          <div style="display:inline-block;background:linear-gradient(135deg,#ff2e92,#7c3aed 60%,#2563eb);padding:12px 16px;border-radius:14px;">
            <span style="color:white;font-weight:900;font-size:22px;letter-spacing:-1px;">Vertiplay</span>
          </div>
        </td></tr>
        <tr><td style="padding-bottom:8px;">
          <h1 style="margin:0;font-size:24px;font-weight:800;">Seu código de acesso</h1>
        </td></tr>
        <tr><td style="padding-bottom:24px;color:#b8b3c4;font-size:15px;line-height:1.5;">
          Use o código abaixo pra entrar no Vertiplay. Ele expira em <b style="color:white;">10 minutos</b>.
        </td></tr>
        <tr><td align="center" style="padding:24px 0;">
          <div style="display:inline-block;background:#0a0612;border:2px solid #ff2e92;border-radius:18px;padding:18px 28px;">
            <span style="font-family:'SF Mono',Menlo,monospace;font-size:38px;font-weight:900;letter-spacing:12px;color:white;">${code}</span>
          </div>
        </td></tr>
        <tr><td style="padding-top:24px;color:#8e8a99;font-size:12px;line-height:1.5;">
          Se você não pediu esse código, é só ignorar este email. Ninguém entra na sua conta sem o código.
        </td></tr>
        <tr><td style="padding-top:32px;border-top:1px solid rgba(255,255,255,0.08);margin-top:24px;color:#8e8a99;font-size:11px;text-align:center;padding:24px 0 0 0;">
          Vertiplay — Mini-novelas verticais no seu bolso.<br>
          Drama em 60 segundos.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function renderFriendRequestHtml(fromDisplayName: string, fromUsername: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="utf-8"/><title>Pedido de amizade — Vertiplay</title></head>
<body style="margin:0;padding:0;background:#0a0612;font-family:-apple-system,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0612;padding:40px 0;">
    <tr><td align="center">
      <table width="100%" style="max-width:480px;background:#15091f;border-radius:24px;padding:32px;color:#ffffff;">
        <tr><td style="padding-bottom:24px;">
          <div style="display:inline-block;background:linear-gradient(135deg,#ff2e92,#7c3aed 60%,#2563eb);padding:12px 16px;border-radius:14px;">
            <span style="color:white;font-weight:900;font-size:22px;letter-spacing:-1px;">Vertiplay</span>
          </div>
        </td></tr>
        <tr><td>
          <h1 style="margin:0 0 8px 0;font-size:22px;font-weight:800;">Pedido de amizade 🎉</h1>
          <p style="margin:0 0 20px 0;color:#b8b3c4;font-size:15px;line-height:1.5;">
            <b style="color:white;">${fromDisplayName}</b>
            <span style="color:#8e8a99;">(@${fromUsername})</span>
            quer ser seu amigo no Vertiplay. Vocês vão poder presentear séries, coins e produtos um pro outro.
          </p>
        </td></tr>
        <tr><td align="center" style="padding:8px 0 24px 0;">
          <a href="https://vertiplay.diogoarchanjo.com.br/amigos"
             style="display:inline-block;background:linear-gradient(135deg,#ff2e92,#7c3aed);color:white;text-decoration:none;font-weight:700;padding:14px 28px;border-radius:14px;font-size:15px;">
            Abrir Vertiplay
          </a>
        </td></tr>
        <tr><td style="padding-top:24px;border-top:1px solid rgba(255,255,255,0.08);color:#8e8a99;font-size:11px;text-align:center;">
          Vertiplay — Mini-novelas verticais no seu bolso.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
