"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Feather,
  Send,
  CheckCircle2,
  Sparkles,
  Coins,
  BadgeCheck,
  Users,
  Link2,
} from "lucide-react";
import { GENRES } from "@/lib/catalog";
import { cn } from "@/lib/cn";

const EXPERIENCE_LEVELS = [
  { id: "iniciante", label: "Iniciante" },
  { id: "amador", label: "Amador(a)" },
  { id: "profissional", label: "Profissional" },
];

export default function WritersLandingPage() {
  const router = useRouter();
  const [step, setStep] = useState<"form" | "success">("form");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    portfolioUrl: "",
    experience: "",
    genres: [] as string[],
    sample: "",
    motivation: "",
    availability: "",
    consent: false,
  });

  const valid =
    form.name.trim().length >= 2 &&
    /\S+@\S+\.\S+/.test(form.email) &&
    form.experience.length > 0 &&
    form.sample.trim().length >= 60 &&
    form.consent;

  function toggleGenre(g: string) {
    setForm((s) => ({
      ...s,
      genres: s.genres.includes(g) ? s.genres.filter((x) => x !== g) : [...s.genres, g],
    }));
  }

  async function submit() {
    if (!valid) return;
    setSubmitting(true);
    setError("");
    try {
      const r = await fetch("/api/writers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, genres: form.genres.join(",") }),
      });
      if (!r.ok) throw new Error();
      setStep("success");
    } catch {
      setError("Não deu pra enviar agora. Tenta de novo em instantes.");
    } finally {
      setSubmitting(false);
    }
  }

  if (step === "success") {
    return (
      <div className="min-h-[100dvh] px-6 pt-16 safe-top text-center">
        <div className="w-24 h-24 vp-gradient rounded-full flex items-center justify-center mx-auto mb-5 vp-glow">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h1 className="text-2xl font-extrabold mb-2">Candidatura recebida!</h1>
        <p className="text-white/70 text-sm mb-1">
          Nossa sala de roteiro vai avaliar seu material.
        </p>
        <p className="text-white/55 text-xs mb-8">
          Se aprovado(a), você entra na fila de roteiristas do{" "}
          <b className="vp-gradient-text">Vertiplay</b> com remuneração por roteiro.
        </p>
        <Link
          href="/"
          className="block py-3.5 rounded-2xl vp-gradient vp-glow font-bold"
        >
          Voltar para o app
        </Link>
        <button
          onClick={() => {
            setForm({
              name: "",
              email: "",
              phone: "",
              portfolioUrl: "",
              experience: "",
              genres: [],
              sample: "",
              motivation: "",
              availability: "",
              consent: false,
            });
            setStep("form");
          }}
          className="block w-full mt-3 text-sm text-white/65 underline"
        >
          Enviar outra candidatura
        </button>
      </div>
    );
  }

  return (
    <div className="pb-32">
      {/* Hero */}
      <div className="relative">
        <div className="vp-gradient h-56 relative overflow-hidden">
          <Sparkles className="absolute top-6 left-8 w-4 h-4 opacity-50" />
          <Sparkles className="absolute top-16 right-14 w-5 h-5 opacity-60" />
          <Sparkles className="absolute bottom-10 left-20 w-3 h-3 opacity-70" />
          <Sparkles className="absolute bottom-20 right-8 w-4 h-4 opacity-50" />
          <button
            onClick={() => router.back()}
            className="absolute top-4 left-3 z-10 w-10 h-10 rounded-full bg-black/30 backdrop-blur flex items-center justify-center safe-top"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <div className="absolute inset-x-0 bottom-0 px-5 pb-5 safe-top">
            <p className="text-[11px] font-bold uppercase tracking-wider text-white/85 mb-1">
              Vertiplay convida
            </p>
            <h1 className="text-2xl font-extrabold leading-tight">
              Escreva a próxima novela viral do Brasil.
            </h1>
            <p className="text-sm text-white/95 mt-1">
              Estamos montando a sala de roteiro BR-first. Cadastre-se como roteirista.
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-3">
        {/* Benefícios */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
          <Perk icon={Coins} label="Remuneração por roteiro aprovado" />
          <Perk icon={BadgeCheck} label="Crédito oficial nos episódios" />
          <Perk icon={Users} label="Faça parte da sala de roteiro" />
          <Perk icon={Feather} label="Publique em ritmo semanal/mensal" />
        </div>

        {/* Form */}
        <div className="vp-card rounded-3xl p-5 space-y-4">
          <Field
            label="Seu nome"
            placeholder="Como devemos te chamar?"
            value={form.name}
            onChange={(v) => setForm((s) => ({ ...s, name: v }))}
            icon={Feather}
          />

          <div className="grid grid-cols-2 gap-2">
            <Field
              label="E-mail"
              placeholder="seu@email.com"
              type="email"
              value={form.email}
              onChange={(v) => setForm((s) => ({ ...s, email: v }))}
            />
            <Field
              label="WhatsApp (opcional)"
              placeholder="+55 ..."
              value={form.phone}
              onChange={(v) => setForm((s) => ({ ...s, phone: v }))}
            />
          </div>

          <Field
            label="Portfólio (opcional)"
            placeholder="Wattpad, Instagram, site, PDF..."
            value={form.portfolioUrl}
            onChange={(v) => setForm((s) => ({ ...s, portfolioUrl: v }))}
            icon={Link2}
          />

          <div>
            <p className="text-xs text-white/65 mb-2 font-medium">
              Nível de experiência <span className="text-[var(--color-vp-pink)]">*</span>
            </p>
            <div className="flex gap-2 flex-wrap">
              {EXPERIENCE_LEVELS.map((e) => (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => setForm((s) => ({ ...s, experience: e.id }))}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium border transition",
                    form.experience === e.id
                      ? "vp-gradient border-transparent"
                      : "border-white/15 text-white/65"
                  )}
                >
                  {e.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-white/65 mb-2 font-medium">
              Gêneros que você domina <span className="text-white/40">(opcional)</span>
            </p>
            <div className="flex gap-2 flex-wrap">
              {GENRES.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => toggleGenre(g)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium border transition",
                    form.genres.includes(g)
                      ? "vp-gradient border-transparent"
                      : "border-white/15 text-white/65"
                  )}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs text-white/65 mb-2 font-medium">
              Amostra de escrita <span className="text-white/40">(cena ou sinopse)</span>
            </p>
            <textarea
              rows={7}
              value={form.sample}
              onChange={(e) => setForm((s) => ({ ...s, sample: e.target.value }))}
              placeholder="Cole aqui uma cena curta ou a sinopse de um roteiro seu, original ou de amostra. É o que mais pesa na avaliação."
              className="w-full bg-white/8 border border-white/10 rounded-2xl px-3 py-3 text-sm placeholder:text-white/40 focus:outline-none focus:border-[var(--color-vp-pink)] resize-none"
            />
            <p className="text-[10px] text-white/45 mt-1 flex justify-between">
              <span>Mínimo 60 caracteres</span>
              <span
                className={
                  form.sample.length >= 60 ? "text-[var(--color-vp-pink)]" : ""
                }
              >
                {form.sample.length} / 4000
              </span>
            </p>
          </div>

          <Field
            label="Por que quer escrever pro Vertiplay? (opcional)"
            placeholder="Sua motivação em uma frase"
            value={form.motivation}
            onChange={(v) => setForm((s) => ({ ...s, motivation: v }))}
          />

          <Field
            label="Disponibilidade (opcional)"
            placeholder="Ex.: 1 roteiro por semana"
            value={form.availability}
            onChange={(v) => setForm((s) => ({ ...s, availability: v }))}
          />

          <label className="flex items-start gap-3 mt-1 cursor-pointer">
            <input
              type="checkbox"
              checked={form.consent}
              onChange={(e) =>
                setForm((s) => ({ ...s, consent: e.target.checked }))
              }
              className="mt-0.5 w-4 h-4 accent-[var(--color-vp-pink)]"
            />
            <span className="text-[11px] text-white/70 leading-relaxed">
              Autorizo o Vertiplay a avaliar meu material e entrar em contato sobre
              oportunidades como roteirista, com remuneração combinada por roteiro aprovado.
            </span>
          </label>
        </div>

        {error && (
          <p className="text-[11px] text-rose-300 text-center mt-3">{error}</p>
        )}

        <p className="text-[10px] text-white/40 text-center mt-3 px-4">
          Não compartilhamos seus dados nem seu material com terceiros. Você é
          creditado(a) e remunerado(a) por roteiro aprovado.
        </p>
      </div>

      {/* CTA fixo */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] safe-bottom z-30 bg-[rgba(10,6,18,0.95)] border-t border-white/8 px-4 py-3 backdrop-blur-md">
        <button
          onClick={submit}
          disabled={!valid || submitting}
          className={cn(
            "w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2",
            valid ? "vp-gradient vp-glow" : "bg-white/10 text-white/45"
          )}
        >
          {submitting ? (
            "Enviando..."
          ) : (
            <>
              <Send className="w-4 h-4" /> Quero ser roteirista
            </>
          )}
        </button>
        {!valid && (
          <p className="text-[10px] text-white/45 text-center mt-1.5">
            Preencha nome, e-mail, experiência, amostra (60+ caracteres) e aceite os termos
          </p>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  placeholder,
  value,
  onChange,
  icon: Icon,
  type = "text",
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  icon?: any;
  type?: string;
}) {
  return (
    <div>
      <p className="text-xs text-white/65 mb-2 font-medium">{label}</p>
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/45" />
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "w-full bg-white/8 border border-white/10 rounded-xl pr-3 py-2.5 text-sm placeholder:text-white/40 focus:outline-none focus:border-[var(--color-vp-pink)]",
            Icon ? "pl-9" : "pl-3"
          )}
        />
      </div>
    </div>
  );
}

function Perk({ icon: Icon, label }: { icon: any; label: string }) {
  return (
    <div className="vp-card rounded-2xl p-3 flex flex-col items-center gap-1.5 text-center">
      <Icon className="w-4 h-4 text-[var(--color-vp-pink)]" />
      <span className="text-[10px] leading-tight">{label}</span>
    </div>
  );
}
