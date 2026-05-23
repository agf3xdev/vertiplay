"use client";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Logo } from "@/components/Logo";
import { Mail, Apple } from "lucide-react";

export default function AuthPage() {
  return (
    <Suspense>
      <AuthInner />
    </Suspense>
  );
}

function AuthInner() {
  const sp = useSearchParams();
  const callbackUrl = sp.get("callbackUrl") || "/";
  const error = sp.get("error");

  return (
    <div className="min-h-[100dvh] flex flex-col px-6 pt-12 safe-top">
      <div className="text-center">
        <Logo size={56} />
        <h1 className="text-3xl font-extrabold mt-6">Bem-vindo ao Vertiplay</h1>
        <p className="text-white/65 text-sm mt-2">
          Mini-novelas verticais, 60 segundos por episódio. Drama, paixão, reviravolta.
        </p>
      </div>

      {error && (
        <div className="mt-6 vp-card rounded-2xl p-3 border border-red-500/40 text-red-300 text-xs text-center">
          Erro ao entrar: {error}. Tenta de novo.
        </div>
      )}

      <div className="mt-auto space-y-3 pb-10">
        <button
          onClick={() => signIn("google", { callbackUrl })}
          className="w-full py-3.5 rounded-2xl bg-white text-black font-bold flex items-center justify-center gap-2"
        >
          <svg width="18" height="18" viewBox="0 0 24 24"><path fill="#EA4335" d="M12 11v3.8h5.3c-.2 1.3-1.6 3.8-5.3 3.8-3.2 0-5.8-2.6-5.8-5.8s2.6-5.8 5.8-5.8c1.8 0 3 .8 3.7 1.4l2.5-2.4C16.8 4.4 14.7 3.5 12 3.5 6.9 3.5 2.8 7.6 2.8 12.8S6.9 22 12 22c6.9 0 9.5-4.9 9.5-7.4 0-.5 0-.9-.1-1.2H12z"/></svg>
          Continuar com Google
        </button>
        <button
          disabled
          className="w-full py-3.5 rounded-2xl bg-white/10 font-semibold flex items-center justify-center gap-2 opacity-50"
        >
          <Apple className="w-4 h-4" /> Continuar com Apple <span className="text-[10px] text-white/55">(em breve)</span>
        </button>
        <button
          disabled
          className="w-full py-3.5 rounded-2xl vp-gradient font-bold flex items-center justify-center gap-2 vp-glow opacity-50"
        >
          <Mail className="w-4 h-4" /> Entrar com e-mail <span className="text-[10px]">(em breve)</span>
        </button>
        <p className="text-[10px] text-white/45 text-center mt-4">
          Ao continuar, você concorda com os{" "}
          <span className="underline">Termos</span> e a{" "}
          <span className="underline">Política de Privacidade</span>.
        </p>
      </div>
    </div>
  );
}
