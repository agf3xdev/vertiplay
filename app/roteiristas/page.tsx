"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Feather,
  Send,
  CheckCircle2,
  Sparkles,
  Coins,
  BadgeCheck,
  Users,
  Link2,
  Paperclip,
  X,
} from "lucide-react";
import { GENRES } from "@/lib/catalog";
import { cn } from "@/lib/cn";
import { Logo } from "@/components/Logo";

const EXPERIENCE_LEVELS = [
  { id: "iniciante", label: "Iniciante" },
  { id: "amador", label: "Amador(a)" },
  { id: "profissional", label: "Profissional" },
];

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB
const ACCEPTED_FILE_TYPES = ".pdf,.doc,.docx,.txt";

export default function WritersLandingPage() {
  const [step, setStep] = useState<"form" | "success">("form");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    portfolioUrl: "",
    experience: "",
    scriptGenre: "",
    genres: [] as string[],
    sample: "",
    motivation: "",
    availability: "",
    consent: false,
  });
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");

  const valid =
    form.name.trim().length >= 2 &&
    /\S+@\S+\.\S+/.test(form.email) &&
    form.experience.length > 0 &&
    form.scriptGenre.length > 0 &&
    form.sample.trim().length >= 60 &&
    form.consent;

  function toggleGenre(g: string) {
    setForm((s) => ({
      ...s,
      genres: s.genres.includes(g) ? s.genres.filter((x) => x !== g) : [...s.genres, g],
    }));
  }

  function pickFile(f: File | null) {
    if (!f) return setFile(null);
    if (f.size > MAX_FILE_SIZE) {
      setFileError("Arquivo maior que 4MB");
      return;
    }
    setFileError("");
    setFile(f);
  }

  async function submit() {
    if (!valid) return;
    setSubmitting(true);
    setError("");
    try {
      const body = new FormData();
      body.append("name", form.name);
      body.append("email", form.email);
      body.append("phone", form.phone);
      body.append("portfolioUrl", form.portfolioUrl);
      body.append("experience", form.experience);
      body.append("scriptGenre", form.scriptGenre);
      body.append("genres", form.genres.join(","));
      body.append("sample", form.sample);
      body.append("motivation", form.motivation);
      body.append("availability", form.availability);
      body.append("consent", String(form.consent));
      if (file) body.append("script", file);

      const r = await fetch("/api/writers", { method: "POST", body });
      if (!r.ok) throw new Error();
      setStep("success");
    } catch {
      setError("Não deu pra enviar agora. Tenta de novo em instantes.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-[100dvh] bg-[var(--color-vp-bg)] text-white">
      <header className="max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link href="/">
          <Logo size={26} />
        </Link>
        <a
          href="#form"
          className="hidden sm:inline-flex px-4 py-2 rounded-full vp-gradient text-sm font-bold vp-glow"
        >
          Quero me candidatar
        </a>
      </header>

      {step === "success" ? (
        <div className="max-w-lg mx-auto px-6 py-20 text-center">
          <div className="w-24 h-24 vp-gradient rounded-full flex items-center justify-center mx-auto mb-6 vp-glow">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h1 className="text-3xl font-extrabold mb-3">Candidatura recebida!</h1>
          <p className="text-white/70 mb-1">
            Nossa sala de roteiro vai avaliar seu material.
          </p>
          <p className="text-white/55 text-sm mb-10">
            Se aprovado(a), você entra na fila de roteiristas do{" "}
            <b className="vp-gradient-text">Vertiplay</b> com remuneração por roteiro.
          </p>
          <Link
            href="/"
            className="inline-block px-8 py-3.5 rounded-2xl vp-gradient vp-glow font-bold"
          >
            Conhecer o Vertiplay
          </Link>
        </div>
      ) : (
        <>
          {/* Hero */}
          <section className="relative overflow-hidden">
            <div
              aria-hidden
              className="pointer-events-none absolute left-1/2 top-0 w-[900px] max-w-[160%] aspect-square -translate-x-1/2 -translate-y-[45%] rounded-full vp-gradient opacity-35 blur-[100px]"
            />
            <Sparkles className="absolute top-16 left-[8%] w-5 h-5 opacity-40" />
            <Sparkles className="absolute top-24 right-[12%] w-6 h-6 opacity-50" />
            <Sparkles className="absolute bottom-10 left-[20%] w-4 h-4 opacity-40" />
            <div className="relative max-w-3xl mx-auto px-6 pt-14 pb-20 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70 mb-4">
                Vertiplay convida
              </p>
              <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-4">
                Escreva a próxima novela viral do Brasil.
              </h1>
              <p className="text-base sm:text-lg text-white/75 max-w-xl mx-auto">
                Estamos montando a sala de roteiro BR-first do short drama nacional.
                Cadastre-se como roteirista e concorra a ter sua história produzida.
              </p>
            </div>
          </section>

          {/* Benefícios */}
          <section className="max-w-4xl mx-auto px-6 pb-4 -mt-10 relative">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Perk icon={Coins} label="Remuneração por roteiro aprovado" />
              <Perk icon={BadgeCheck} label="Crédito oficial nos episódios" />
              <Perk icon={Users} label="Faça parte da sala de roteiro" />
              <Perk icon={Feather} label="Publique em ritmo semanal/mensal" />
            </div>
          </section>

          {/* Form */}
          <section id="form" className="max-w-2xl mx-auto px-6 py-14">
            <div className="vp-card rounded-3xl p-6 sm:p-8 space-y-5">
              <div>
                <h2 className="text-xl font-extrabold mb-1">Candidatura de roteirista</h2>
                <p className="text-sm text-white/55">
                  Leva menos de 5 minutos. Campos com <span className="text-[var(--color-vp-pink)]">*</span> são obrigatórios.
                </p>
              </div>

              <Field
                label="Seu nome"
                placeholder="Como devemos te chamar?"
                value={form.name}
                onChange={(v) => setForm((s) => ({ ...s, name: v }))}
                icon={Feather}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                          : "border-white/15 text-white/65 hover:border-white/30"
                      )}
                    >
                      {e.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs text-white/65 mb-2 font-medium">
                  Gênero do roteiro/amostra <span className="text-[var(--color-vp-pink)]">*</span>
                </p>
                <div className="flex gap-2 flex-wrap">
                  {GENRES.map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setForm((s) => ({ ...s, scriptGenre: g }))}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium border transition",
                        form.scriptGenre === g
                          ? "vp-gradient border-transparent"
                          : "border-white/15 text-white/65 hover:border-white/30"
                      )}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xs text-white/65 mb-2 font-medium">
                  Amostra de escrita <span className="text-white/40">(cena ou sinopse)</span>{" "}
                  <span className="text-[var(--color-vp-pink)]">*</span>
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

              <div>
                <p className="text-xs text-white/65 mb-2 font-medium">
                  Anexar roteiro completo <span className="text-white/40">(opcional, PDF/DOC/TXT, até 4MB)</span>
                </p>
                {file ? (
                  <div className="flex items-center justify-between gap-3 bg-white/8 border border-white/10 rounded-xl px-3 py-2.5">
                    <span className="flex items-center gap-2 text-sm text-white/85 min-w-0">
                      <Paperclip className="w-4 h-4 shrink-0 text-white/45" />
                      <span className="truncate">{file.name}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setFile(null)}
                      className="shrink-0 text-white/45 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center gap-2 bg-white/8 border border-dashed border-white/15 rounded-xl px-3 py-2.5 text-sm text-white/55 cursor-pointer hover:border-white/30">
                    <Paperclip className="w-4 h-4 shrink-0" />
                    Escolher arquivo
                    <input
                      type="file"
                      accept={ACCEPTED_FILE_TYPES}
                      className="hidden"
                      onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
                    />
                  </label>
                )}
                {fileError && <p className="text-[10px] text-rose-300 mt-1">{fileError}</p>}
              </div>

              <div>
                <p className="text-xs text-white/65 mb-2 font-medium">
                  Outros gêneros que você domina <span className="text-white/40">(opcional)</span>
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
                          : "border-white/15 text-white/65 hover:border-white/30"
                      )}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              </div>

              <label className="flex items-start gap-3 pt-1 cursor-pointer">
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

              {error && <p className="text-[11px] text-rose-300">{error}</p>}

              <button
                onClick={submit}
                disabled={!valid || submitting}
                className={cn(
                  "w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition",
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
                <p className="text-[10px] text-white/45 text-center -mt-2">
                  Preencha nome, e-mail, experiência, gênero, amostra (60+ caracteres) e aceite os termos
                </p>
              )}
            </div>

            <p className="text-[11px] text-white/40 text-center mt-5 max-w-md mx-auto">
              Não compartilhamos seus dados nem seu material com terceiros. Você é
              creditado(a) e remunerado(a) por roteiro aprovado.
            </p>
          </section>

          <footer className="border-t border-white/8 py-8">
            <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40">
              <span>© {new Date().getFullYear()} Vertiplay — produzido pela F3X</span>
              <Link href="/" className="hover:text-white/70">
                Voltar pro Vertiplay
              </Link>
            </div>
          </footer>
        </>
      )}
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
    <div className="vp-card rounded-2xl p-4 flex flex-col items-center gap-2 text-center">
      <Icon className="w-5 h-5 text-[var(--color-vp-pink)]" />
      <span className="text-xs leading-tight text-white/80">{label}</span>
    </div>
  );
}
