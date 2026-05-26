"use client";
import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { Mail, ChevronLeft, Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { signInWithGoogleNative, isCapacitor } from "@/lib/native-auth";

export default function AuthPage() {
  return (
    <Suspense>
      <AuthInner />
    </Suspense>
  );
}

function AuthInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const callbackUrl = sp.get("callbackUrl") || "/";
  const error = sp.get("error");

  const [mode, setMode] = useState<"choose" | "email-input" | "email-code">("choose");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function sendCode() {
    setLoading(true);
    setErr(null);
    try {
      const r = await fetch("/api/auth/email/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await r.json();
      if (!r.ok) {
        setErr(data.error ?? "Falha ao enviar código");
        setLoading(false);
        return;
      }
      setMode("email-code");
    } catch (e) {
      setErr("Erro de rede");
    }
    setLoading(false);
  }

  async function handleGoogle() {
    setErr(null);
    if (isCapacitor()) {
      setLoading(true);
      try {
        const r = await signInWithGoogleNative();
        if (!r.ok) {
          setErr(r.error ?? "Falha no login com Google");
          setLoading(false);
          return;
        }
        router.push(callbackUrl);
      } catch (e: any) {
        setErr(e?.message ?? "Falha no login com Google");
        setLoading(false);
      }
      return;
    }
    signIn("google", { callbackUrl });
  }

  async function verifyCode() {
    setLoading(true);
    setErr(null);
    const r = await signIn("email-otp", {
      email,
      code,
      callbackUrl,
      redirect: false,
    });
    if (r?.error) {
      setErr("Código incorreto ou expirado");
      setLoading(false);
      return;
    }
    if (r?.ok) router.push(callbackUrl);
    setLoading(false);
  }

  return (
    <div className="min-h-[100dvh] flex flex-col px-4 sm:px-6 pt-12 safe-top">
      {mode !== "choose" && (
        <button
          onClick={() => { setMode(mode === "email-code" ? "email-input" : "choose"); setErr(null); }}
          className="self-start w-9 h-9 rounded-full bg-white/10 flex items-center justify-center mb-4"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
      )}

      <div className="text-center">
        <Logo size={56} />
        {mode === "choose" && (
          <>
            <h1 className="text-2xl sm:text-3xl font-extrabold mt-6">Bem-vindo ao Vertiplay</h1>
            <p className="text-white/65 text-sm mt-2">
              Mini-novelas verticais, 60 segundos por episódio. Drama, paixão, reviravolta.
            </p>
          </>
        )}
        {mode === "email-input" && (
          <>
            <h1 className="text-2xl sm:text-3xl font-extrabold mt-6">Entrar com email</h1>
            <p className="text-white/65 text-sm mt-2">
              Vamos enviar um código de 6 dígitos pra você.
            </p>
          </>
        )}
        {mode === "email-code" && (
          <>
            <h1 className="text-2xl sm:text-3xl font-extrabold mt-6">Veja seu email</h1>
            <p className="text-white/65 text-sm mt-2">
              Enviamos um código de 6 dígitos pra <b className="text-white">{email}</b>
            </p>
          </>
        )}
      </div>

      {(error || err) && (
        <div className="mt-6 vp-card rounded-2xl p-3 border border-red-500/40 text-red-300 text-xs text-center">
          {err ?? `Erro: ${error}`}
        </div>
      )}

      {/* ── Escolher método ── */}
      {mode === "choose" && (
        <div className="mt-auto space-y-3 pb-10">
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-white text-black font-bold flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 11v3.8h5.3c-.2 1.3-1.6 3.8-5.3 3.8-3.2 0-5.8-2.6-5.8-5.8s2.6-5.8 5.8-5.8c1.8 0 3 .8 3.7 1.4l2.5-2.4C16.8 4.4 14.7 3.5 12 3.5 6.9 3.5 2.8 7.6 2.8 12.8S6.9 22 12 22c6.9 0 9.5-4.9 9.5-7.4 0-.5 0-.9-.1-1.2H12z"/></svg>
            Continuar com Google
          </button>
          <button
            onClick={() => setMode("email-input")}
            className="w-full py-3.5 rounded-2xl vp-gradient font-bold flex items-center justify-center gap-2 vp-glow"
          >
            <Mail className="w-4 h-4" /> Entrar com e-mail
          </button>
          <p className="text-[10px] text-white/45 text-center mt-4">
            Ao continuar, você concorda com os{" "}
            <a href="/termos" className="underline">Termos</a> e a{" "}
            <a href="/privacidade" className="underline">Política de Privacidade</a>.
          </p>
        </div>
      )}

      {/* ── Email input ── */}
      {mode === "email-input" && (
        <div className="mt-8 flex flex-col">
          <label className="text-xs text-white/65 mb-2 font-medium">Seu email</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            autoFocus
            autoComplete="email"
            inputMode="email"
            placeholder="voce@email.com"
            className="bg-white/8 border border-white/10 rounded-2xl px-4 py-3.5 text-base placeholder:text-white/40 focus:outline-none focus:border-[var(--color-vp-pink)]"
          />
          <button
            onClick={sendCode}
            disabled={loading || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)}
            className={cn(
              "mt-6 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2",
              loading || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
                ? "bg-white/10 text-white/45"
                : "vp-gradient vp-glow"
            )}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Enviar código"}
          </button>
        </div>
      )}

      {/* ── Email code ── */}
      {mode === "email-code" && (
        <div className="mt-8 flex flex-col">
          <label className="text-xs text-white/65 mb-2 font-medium">Código de 6 dígitos</label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            placeholder="123456"
            maxLength={6}
            className="bg-white/8 border border-white/10 rounded-2xl px-4 py-3.5 text-2xl tracking-[0.5em] text-center font-mono font-bold placeholder:text-white/30 focus:outline-none focus:border-[var(--color-vp-pink)]"
          />
          <button
            onClick={verifyCode}
            disabled={loading || code.length !== 6}
            className={cn(
              "mt-6 py-3.5 rounded-2xl font-bold flex items-center justify-center gap-2",
              loading || code.length !== 6 ? "bg-white/10 text-white/45" : "vp-gradient vp-glow"
            )}
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Entrar"}
          </button>
          <button
            onClick={sendCode}
            disabled={loading}
            className="mt-3 text-sm text-white/65 underline"
          >
            Reenviar código
          </button>
        </div>
      )}
    </div>
  );
}
