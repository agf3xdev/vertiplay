"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Sparkles,
  Send,
  CheckCircle2,
  Pencil,
  Heart,
  Crown,
  Drama,
} from "lucide-react";
import { GENRES } from "@/lib/catalog";
import { cn } from "@/lib/cn";

export default function StoryFormPage() {
  const router = useRouter();
  const [step, setStep] = useState<"form" | "success">("form");
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    authorName: "",
    email: "",
    phone: "",
    title: "",
    genre: "",
    synopsis: "",
    inspiration: "",
    consent: false,
  });

  const valid =
    form.authorName.trim().length >= 2 &&
    form.title.trim().length >= 3 &&
    form.synopsis.trim().length >= 60 &&
    form.consent;

  async function submit() {
    if (!valid) return;
    setSubmitting(true);
    try {
      await fetch("/api/stories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } catch {}
    setSubmitting(false);
    setStep("success");
  }

  if (step === "success") {
    return (
      <div className="min-h-[100dvh] px-6 pt-16 safe-top text-center">
        <div className="w-24 h-24 vp-gradient rounded-full flex items-center justify-center mx-auto mb-5 vp-glow">
          <CheckCircle2 className="w-12 h-12" />
        </div>
        <h1 className="text-2xl font-extrabold mb-2">História recebida!</h1>
        <p className="text-white/70 text-sm mb-1">
          Nossa equipe de roteiro vai ler com carinho.
        </p>
        <p className="text-white/55 text-xs mb-8">
          Se virar série, você ganha <b className="vp-gradient-text">500 coins</b> e
          aparece nos créditos.
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
              authorName: "",
              email: "",
              phone: "",
              title: "",
              genre: "",
              synopsis: "",
              inspiration: "",
              consent: false,
            });
            setStep("form");
          }}
          className="block w-full mt-3 text-sm text-white/65 underline"
        >
          Enviar outra história
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
              A sua história na palma da sua mão.
            </h1>
            <p className="text-sm text-white/95 mt-1">
              Conte a sua. Pode virar a próxima novela do Vertiplay.
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-3">
        {/* Benefícios */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-5">
          <Perk icon={Crown} label="500 coins se aprovada" />
          <Perk icon={Pencil} label="Crédito como roteirista" />
          <Perk icon={Heart} label="Você inspira outras pessoas" />
        </div>

        {/* Form */}
        <div className="vp-card rounded-3xl p-5 space-y-4">
          <Field
            label="Seu nome"
            placeholder="Como devemos te creditar?"
            value={form.authorName}
            onChange={(v) => setForm((s) => ({ ...s, authorName: v }))}
            icon={Pencil}
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
            label="Título da história"
            placeholder="Ex.: O Bilionário do Edifício 7"
            value={form.title}
            onChange={(v) => setForm((s) => ({ ...s, title: v }))}
            icon={Drama}
          />

          <div>
            <p className="text-xs text-white/65 mb-2 font-medium">
              Gênero <span className="text-white/40">(opcional)</span>
            </p>
            <div className="flex gap-2 flex-wrap">
              {GENRES.map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() =>
                    setForm((s) => ({ ...s, genre: s.genre === g ? "" : g }))
                  }
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium border transition",
                    form.genre === g
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
              Conte a sua história <span className="text-white/40">(resumido)</span>
            </p>
            <textarea
              rows={7}
              value={form.synopsis}
              onChange={(e) => setForm((s) => ({ ...s, synopsis: e.target.value }))}
              placeholder="Quem é o protagonista? Qual o conflito? Por que essa história precisa virar novela? Pode ser baseada em fato real ou inventada."
              className="w-full bg-white/8 border border-white/10 rounded-2xl px-3 py-3 text-sm placeholder:text-white/40 focus:outline-none focus:border-[var(--color-vp-pink)] resize-none"
            />
            <p className="text-[10px] text-white/45 mt-1 flex justify-between">
              <span>Mínimo 60 caracteres</span>
              <span
                className={
                  form.synopsis.length >= 60 ? "text-[var(--color-vp-pink)]" : ""
                }
              >
                {form.synopsis.length} / 800
              </span>
            </p>
          </div>

          <Field
            label="É baseada em fato real? (opcional)"
            placeholder="Ex.: Aconteceu comigo · Vi acontecer · É autoral"
            value={form.inspiration}
            onChange={(v) => setForm((s) => ({ ...s, inspiration: v }))}
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
              Autorizo o Vertiplay a avaliar minha história e, se aprovada, transformá-la
              em série mediante crédito como criador(a) e remuneração combinada.
            </span>
          </label>
        </div>

        <p className="text-[10px] text-white/40 text-center mt-3 px-4">
          Não publicamos sua história sem o seu consentimento. Você é creditado(a) e
          pode receber royalties se virar produção.
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
              <Send className="w-4 h-4" /> Enviar minha história
            </>
          )}
        </button>
        {!valid && (
          <p className="text-[10px] text-white/45 text-center mt-1.5">
            Preencha nome, título, ao menos 60 caracteres e aceite os termos
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
