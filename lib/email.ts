// Resend SDK + helpers de OTP por email
//
// 1. lib gera código de 6 dígitos, salva em /prisma/email-codes.json com expiry de 10 min
// 2. envia email via Resend com template HTML branded
// 3. valida código → retorna ok/erro

import { Resend } from "resend";
import { promises as fs } from "node:fs";
import { join } from "node:path";
import { createHash, randomInt } from "node:crypto";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.EMAIL_FROM || "Vertiplay <vertiplay@diogoarchanjo.com.br>";

let _resend: Resend | null = null;
function resend(): Resend {
  if (_resend) return _resend;
  if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY ausente");
  _resend = new Resend(RESEND_API_KEY);
  return _resend;
}

// Em prod (DO App Platform) o /app é writable mas efêmero — codes expiram
// em 10min então tudo bem perder no redeploy. Usa /tmp como fallback caso
// a writes em /app/prisma falhem por permissão (Docker).
const CODES_FILE = process.env.EMAIL_CODES_FILE
  || join(process.cwd(), "prisma", "email-codes.json");
const CODES_FALLBACK = "/tmp/vertiplay-email-codes.json";

type CodeEntry = {
  email: string;
  codeHash: string; // SHA-256 (não guardamos o código em claro)
  expiresAt: number; // ms epoch
  attempts: number;
};

async function loadCodes(): Promise<CodeEntry[]> {
  for (const path of [CODES_FILE, CODES_FALLBACK]) {
    try {
      return JSON.parse(await fs.readFile(path, "utf8"));
    } catch { /* keep trying */ }
  }
  return [];
}
async function saveCodes(arr: CodeEntry[]) {
  const data = JSON.stringify(arr, null, 2);
  try {
    await fs.mkdir(join(CODES_FILE, ".."), { recursive: true });
    await fs.writeFile(CODES_FILE, data);
    return;
  } catch (e) {
    console.warn("[email] write to", CODES_FILE, "failed, fallback to /tmp:", (e as any)?.message);
  }
  await fs.writeFile(CODES_FALLBACK, data);
}
function hash(s: string) {
  return createHash("sha256").update(s).digest("hex");
}

const TTL_MS = 10 * 60 * 1000; // 10 min
const MAX_ATTEMPTS = 5;

export async function sendOtpEmail(email: string): Promise<{ ok: boolean; error?: string }> {
  const code = String(randomInt(100000, 999999)); // 6 dígitos
  const now = Date.now();

  // upsert na lista, limpa expirados
  const all = (await loadCodes())
    .filter((c) => c.expiresAt > now)
    .filter((c) => c.email.toLowerCase() !== email.toLowerCase());
  all.unshift({
    email: email.toLowerCase(),
    codeHash: hash(code),
    expiresAt: now + TTL_MS,
    attempts: 0,
  });
  await saveCodes(all.slice(0, 500)); // safety cap

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
  const all = await loadCodes();
  const now = Date.now();
  const entry = all.find((c) => c.email.toLowerCase() === email.toLowerCase());
  if (!entry) return { ok: false, error: "Pedir um novo código" };
  if (entry.expiresAt < now) {
    await saveCodes(all.filter((c) => c !== entry));
    return { ok: false, error: "Código expirou — peça outro" };
  }
  if (entry.attempts >= MAX_ATTEMPTS) {
    await saveCodes(all.filter((c) => c !== entry));
    return { ok: false, error: "Muitas tentativas — peça outro código" };
  }
  if (hash(code.trim()) !== entry.codeHash) {
    entry.attempts++;
    await saveCodes(all);
    return { ok: false, error: "Código incorreto" };
  }
  // sucesso — remove o código (one-time use)
  await saveCodes(all.filter((c) => c !== entry));
  return { ok: true };
}

// ─────────────── Template HTML ───────────────

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
