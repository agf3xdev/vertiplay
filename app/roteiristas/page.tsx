"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Send,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  FileText,
  Users2,
  Layers,
  Rocket,
  Download,
  Paperclip,
  X,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/cn";
import { Logo } from "@/components/Logo";
import { isWritersSubmissionOpen, WRITERS_DEADLINE_LABEL } from "@/lib/writers-deadline";

const GENRES = [
  {
    id: "Drama",
    desc: "Histórias intensas, conflitos familiares, segredos, escolhas difíceis, perdas, ambições e personagens diante de situações capazes de transformar suas vidas.",
  },
  {
    id: "Romance",
    desc: "Paixões, encontros, desencontros, relações impossíveis, desejo, ciúmes e histórias de amor capazes de fazer o público torcer pelo casal até o último episódio.",
  },
  {
    id: "Comédia Romântica",
    desc: "Química, situações inesperadas, personagens marcantes, humor e romance em histórias leves, divertidas e irresistíveis.",
  },
];

const STEPS = [
  {
    n: "01",
    icon: FileText,
    title: "Apresente sua história",
    body: [
      "Você não precisa enviar o roteiro completo nesta primeira etapa.",
      "Queremos conhecer primeiro a essência da sua história, o universo que você imaginou e os personagens que fazem parte dela.",
    ],
  },
  {
    n: "02",
    icon: Layers,
    title: "Envie sinopse e argumento",
    body: [
      "Nesta primeira etapa, você deverá enviar uma Sinopse — apresentação clara e objetiva da sua história — e um Argumento — apresentação mais detalhada do universo da obra, seus personagens, conflitos, acontecimentos e desenvolvimento da história.",
    ],
  },
  {
    n: "03",
    icon: Sparkles,
    title: "Seletiva",
    body: ["Nossa equipe vai analisar os projetos recebidos, considerando aspectos como:"],
    bullets: [
      "Originalidade da história",
      "Força dos personagens",
      "Potencial dramático",
      "Capacidade de gerar episódios e ganchos",
      "Adequação ao formato vertical",
      "Potencial de conexão com o público",
      "Potencial comercial",
    ],
  },
  {
    n: "04",
    icon: Users2,
    title: "Desenvolvimento",
    body: [
      "As histórias selecionadas poderão avançar para uma etapa de desenvolvimento junto ao Vertiplay.",
      "Nesta fase, poderão ser solicitados materiais complementares, incluindo o roteiro completo e outros documentos necessários para o desenvolvimento da produção.",
    ],
  },
  {
    n: "05",
    icon: Rocket,
    title: "Produção e parceria",
    body: [
      "Os projetos aprovados para produção poderão ser transformados em novelas verticais.",
      "Se o projeto for produzido, seu autor celebrará contrato com o Vertiplay e poderá participar dos resultados financeiros gerados pela obra em razão de sua autoria, conforme as condições estabelecidas para cada produção.",
      "Você entra com a história. O Vertiplay entra com a produção.",
    ],
  },
];

const MAX_FILE_SIZE = 4 * 1024 * 1024; // 4MB

export default function WritersLandingPage() {
  const [step, setStep] = useState<"form" | "success">("form");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    artisticName: "",
    email: "",
    phone: "",
    cityState: "",
    portfolioUrl: "",
    workTitle: "",
    scriptGenre: "",
    synopsis: "",
    consent: false,
  });
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");

  // A página é prerenderizada em build — recalcula no client após montar pra
  // não ficar presa no "aberto" de build antigo depois que o prazo passar.
  const [open, setOpen] = useState(true);
  useEffect(() => setOpen(isWritersSubmissionOpen()), []);

  const valid =
    form.name.trim().length >= 2 &&
    /\S+@\S+\.\S+/.test(form.email) &&
    form.phone.trim().length > 0 &&
    form.cityState.trim().length > 0 &&
    form.workTitle.trim().length > 0 &&
    form.scriptGenre.length > 0 &&
    form.synopsis.trim().length >= 60 &&
    !!file &&
    form.consent;

  function pickFile(f: File | null) {
    if (!f) return setFile(null);
    if (f.type !== "application/pdf") {
      setFileError("O argumento precisa ser um arquivo PDF");
      return;
    }
    if (f.size > MAX_FILE_SIZE) {
      setFileError("Arquivo maior que 4MB");
      return;
    }
    setFileError("");
    setFile(f);
  }

  async function submit() {
    if (!valid || !file) return;
    setSubmitting(true);
    setError("");
    try {
      const body = new FormData();
      body.append("name", form.name);
      body.append("artisticName", form.artisticName);
      body.append("email", form.email);
      body.append("phone", form.phone);
      body.append("cityState", form.cityState);
      body.append("portfolioUrl", form.portfolioUrl);
      body.append("workTitle", form.workTitle);
      body.append("scriptGenre", form.scriptGenre);
      body.append("synopsis", form.synopsis);
      body.append("consent", String(form.consent));
      body.append("argument", file);

      const r = await fetch("/api/writers", { method: "POST", body });
      if (!r.ok) {
        const d = await r.json().catch(() => null);
        throw new Error(d?.error);
      }
      setStep("success");
    } catch (e: any) {
      setError(e?.message || "Não deu pra enviar agora. Tenta de novo em instantes.");
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
        {open && (
          <a
            href="#form"
            className="hidden sm:inline-flex px-4 py-2 rounded-full vp-gradient text-sm font-bold vp-glow"
          >
            Enviar minha história
          </a>
        )}
      </header>

      {step === "success" ? (
        <div className="max-w-lg mx-auto px-6 py-20 text-center">
          <div className="w-24 h-24 vp-gradient rounded-full flex items-center justify-center mx-auto mb-6 vp-glow">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h1 className="text-3xl font-extrabold mb-3">História recebida!</h1>
          <p className="text-white/70 mb-1">
            Nossa equipe vai avaliar sua sinopse e argumento.
          </p>
          <p className="text-white/55 text-sm mb-10">
            Se o seu projeto for selecionado, ele poderá entrar em desenvolvimento e
            produção junto ao <b className="vp-gradient-text">Vertiplay</b>.
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
            <div className="relative max-w-3xl mx-auto px-6 pt-14 pb-16 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/70 mb-4">
                Vertiplay convida
              </p>
              <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-2">
                Seu roteiro. Nossa tela.
              </h1>
              <p className="text-lg sm:text-xl font-semibold text-white/90 mb-4">
                A próxima webnovela pode começar com a sua história.
              </p>
              <p className="text-base text-white/75 max-w-xl mx-auto mb-8">
                Você não precisa ser um roteirista profissional para ter uma grande
                história. Estamos procurando novas histórias e novos autores, de
                qualquer lugar do Brasil, para desenvolver e produzir novelas em
                formato vertical.
              </p>

              {open ? (
                <>
                  <a
                    href="#form"
                    className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl vp-gradient vp-glow font-bold"
                  >
                    <Send className="w-4 h-4" /> Enviar minha história
                  </a>
                  <p className="text-xs text-white/55 mt-4">
                    Inscrições para: Drama · Romance · Comédia Romântica
                  </p>
                  <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-vp-pink)] mt-2">
                    <Clock className="w-3.5 h-3.5" /> Inscrições até {WRITERS_DEADLINE_LABEL}
                  </p>
                </>
              ) : (
                <div className="vp-card rounded-2xl px-6 py-4 inline-block">
                  <p className="font-bold">As inscrições estão encerradas</p>
                  <p className="text-sm text-white/55 mt-1">
                    O prazo terminou em {WRITERS_DEADLINE_LABEL}.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* A oportunidade */}
          <section className="max-w-3xl mx-auto px-6 py-14">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-vp-pink)] mb-2 text-center">
              A oportunidade
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-6">
              Sua história pode ir além do papel.
            </h2>
            <div className="space-y-4 text-white/75 text-center">
              <p>
                Grandes histórias podem surgir de qualquer lugar. Estamos buscando
                personagens marcantes, conflitos envolventes e histórias com potencial
                para conquistar o público no formato vertical.
              </p>
              <p>Você apresenta sua história. Nós fazemos a seleção.</p>
              <p>
                E, se o seu projeto for escolhido, ele poderá entrar em desenvolvimento
                e produção junto à nossa equipe.
              </p>
            </div>

            <div className="vp-card rounded-3xl p-6 sm:p-8 mt-8">
              <h3 className="font-extrabold mb-3">Mais do que uma seleção.</h3>
              <p className="text-sm text-white/75 mb-3">
                Os projetos selecionados poderão se transformar em produções
                audiovisuais e seus autores poderão fazer parte desse processo como{" "}
                <b className="text-white">parceiros comerciais da obra</b>.
              </p>
              <p className="text-sm text-white/85 font-medium mb-3">
                Se a sua história for selecionada e produzida, você celebrará um
                contrato com o Vertiplay como autor da obra e terá participação nos
                resultados financeiros gerados pelo projeto, conforme as condições
                estabelecidas no contrato de cada produção.
              </p>
              <p className="text-sm font-bold vp-gradient-text">
                Você entra com a história. O Vertiplay entra com a produção.
              </p>
            </div>
          </section>

          {/* Que história você quer contar */}
          <section className="max-w-4xl mx-auto px-6 py-14">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-8">
              Que história você quer contar?
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {GENRES.map((g) => (
                <div key={g.id} className="vp-card rounded-2xl p-5">
                  <h3 className="font-extrabold vp-gradient-text mb-2">{g.id}</h3>
                  <p className="text-sm text-white/70 leading-relaxed">{g.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Como funciona */}
          <section className="max-w-3xl mx-auto px-6 py-14">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-vp-pink)] mb-2 text-center">
              Como funciona
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-10">
              Da sua história para a tela.
            </h2>
            <div className="space-y-6">
              {STEPS.map((s) => (
                <div key={s.n} className="vp-card rounded-2xl p-5 sm:p-6 flex gap-4">
                  <div className="w-11 h-11 rounded-xl vp-gradient flex items-center justify-center shrink-0 font-extrabold text-sm">
                    {s.n}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-extrabold mb-2 flex items-center gap-2">
                      <s.icon className="w-4 h-4 text-[var(--color-vp-pink)]" />
                      {s.title}
                    </h3>
                    {s.body.map((p, i) => (
                      <p key={i} className="text-sm text-white/70 leading-relaxed mb-2 last:mb-0">
                        {p}
                      </p>
                    ))}
                    {s.bullets && (
                      <ul className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {s.bullets.map((b) => (
                          <li key={b} className="text-sm text-white/70 flex items-start gap-2">
                            <span className="text-[var(--color-vp-pink)] mt-1">•</span> {b}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Proteja sua história */}
          <section className="max-w-3xl mx-auto px-6 py-14">
            <div className="vp-card rounded-3xl p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="w-5 h-5 text-[var(--color-vp-pink)]" />
                <h2 className="text-xl font-extrabold">A sua história é sua.</h2>
              </div>
              <div className="space-y-3 text-sm text-white/75 leading-relaxed">
                <p>
                  Antes de enviar sua obra para qualquer processo de seleção,
                  recomendamos fortemente que você mantenha documentada a autoria e a
                  criação da sua história, utilizando os meios disponíveis para
                  comprovar sua titularidade e seus direitos autorais.
                </p>
                <p>
                  Não importa se você está começando agora, se nunca publicou uma
                  história ou se esta é a primeira vez que apresenta seu trabalho a
                  uma produtora. Sua história tem valor. E a sua autoria também.
                </p>
                <p>
                  Por isso, recomendamos que você busque informações sobre as formas
                  adequadas de registro e documentação de obras e direitos autorais em
                  seu nome, antes de realizar o envio. Essa é uma forma de preservar a
                  origem da sua criação e manter documentada a sua autoria.
                </p>
                <p className="text-white font-semibold">
                  Cuide dela. Documente sua criação. Preserve sua autoria.
                </p>
              </div>
              <p className="text-[11px] text-white/45 italic mt-4 border-t border-white/8 pt-4">
                Esta recomendação não constitui orientação jurídica. Em caso de dúvida
                sobre proteção, registro ou titularidade de sua obra, procure
                orientação profissional especializada.
              </p>
            </div>
          </section>

          {/* O que você deve enviar */}
          <section className="max-w-3xl mx-auto px-6 py-14">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-vp-pink)] mb-2 text-center">
              O que você deve enviar
            </p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-center mb-8">
              Não precisamos do roteiro completo agora.
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="vp-card rounded-2xl p-6">
                <h3 className="font-extrabold mb-2">1. Sinopse</h3>
                <p className="text-sm text-white/70 leading-relaxed">
                  Apresente sua história de forma clara e objetiva. Conte o suficiente
                  para que possamos entender a essência da obra, seus personagens e o
                  conflito central.
                </p>
              </div>
              <div className="vp-card rounded-2xl p-6">
                <h3 className="font-extrabold mb-2">2. Argumento</h3>
                <p className="text-sm text-white/70 leading-relaxed">
                  Apresente os personagens principais, o universo da obra, os
                  conflitos, os acontecimentos e o caminho narrativo que você imagina
                  para a história.
                </p>
                <p className="text-xs text-[var(--color-vp-pink)] font-bold mt-3">
                  Limite: 1 página
                </p>
              </div>
            </div>
            <p className="text-sm text-white/55 text-center mt-6 max-w-lg mx-auto">
              Para garantir uma análise justa entre todos os projetos, o argumento
              deverá seguir o modelo padrão de página disponibilizado (formato,
              tipografia, tamanho de fonte, margens e espaçamento). Queremos conhecer
              sua história, não testar quem consegue colocar mais texto em uma página.
            </p>
          </section>

          {/* Autoria */}
          <section className="max-w-3xl mx-auto px-6 py-14">
            <div className="vp-card rounded-3xl p-6 sm:p-8 text-center">
              <h2 className="text-xl font-extrabold mb-3">A história precisa ser sua.</h2>
              <p className="text-sm text-white/75 leading-relaxed mb-3">
                Estamos em busca de novas vozes e histórias originais. Você não
                precisa ter experiência profissional como roteirista — o que queremos
                conhecer é a sua capacidade de contar uma boa história.
              </p>
              <p className="text-sm font-bold text-rose-300 leading-relaxed">
                Roteiros ou materiais criados integral ou substancialmente por
                Inteligência Artificial serão automaticamente desclassificados da
                seletiva.
              </p>
            </div>
          </section>

          {/* Formulário */}
          <section id="form" className="max-w-2xl mx-auto px-6 py-14">
            {!open ? (
              <div className="vp-card rounded-3xl p-8 text-center">
                <Clock className="w-8 h-8 text-white/40 mx-auto mb-3" />
                <h2 className="text-xl font-extrabold mb-2">Inscrições encerradas</h2>
                <p className="text-sm text-white/55">
                  O prazo para envio de histórias terminou em {WRITERS_DEADLINE_LABEL}.
                  Fique de olho nos canais do Vertiplay para futuras seletivas.
                </p>
              </div>
            ) : (
              <>
                <div className="vp-card rounded-3xl p-6 sm:p-8 space-y-6">
                  <div>
                    <h2 className="text-xl font-extrabold mb-1">Conte sua história</h2>
                    <p className="text-sm text-white/55">
                      Leva poucos minutos. Campos com{" "}
                      <span className="text-[var(--color-vp-pink)]">*</span> são
                      obrigatórios.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <p className="text-xs font-bold uppercase tracking-wider text-white/50">
                      Sobre você
                    </p>
                    <Field
                      label="Nome completo"
                      required
                      placeholder="Seu nome"
                      value={form.name}
                      onChange={(v) => setForm((s) => ({ ...s, name: v }))}
                    />
                    <Field
                      label="Nome artístico"
                      optional
                      placeholder="Se você usa outro nome pra assinar suas obras"
                      value={form.artisticName}
                      onChange={(v) => setForm((s) => ({ ...s, artisticName: v }))}
                    />
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field
                        label="E-mail"
                        required
                        type="email"
                        placeholder="seu@email.com"
                        value={form.email}
                        onChange={(v) => setForm((s) => ({ ...s, email: v }))}
                      />
                      <Field
                        label="Telefone"
                        required
                        placeholder="+55 ..."
                        value={form.phone}
                        onChange={(v) => setForm((s) => ({ ...s, phone: v }))}
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field
                        label="Cidade / Estado"
                        required
                        placeholder="Ex.: Cabo Frio / RJ"
                        value={form.cityState}
                        onChange={(v) => setForm((s) => ({ ...s, cityState: v }))}
                      />
                      <Field
                        label="Instagram / Portfólio"
                        optional
                        placeholder="@seu_usuario ou link"
                        value={form.portfolioUrl}
                        onChange={(v) => setForm((s) => ({ ...s, portfolioUrl: v }))}
                      />
                    </div>
                  </div>

                  <div className="space-y-4 pt-2 border-t border-white/8">
                    <p className="text-xs font-bold uppercase tracking-wider text-white/50 pt-4">
                      Sobre a história
                    </p>
                    <Field
                      label="Título da obra"
                      required
                      placeholder="Como sua história se chama?"
                      value={form.workTitle}
                      onChange={(v) => setForm((s) => ({ ...s, workTitle: v }))}
                    />

                    <div>
                      <p className="text-xs text-white/65 mb-2 font-medium">
                        Gênero <span className="text-[var(--color-vp-pink)]">*</span>
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {GENRES.map((g) => (
                          <button
                            key={g.id}
                            type="button"
                            onClick={() => setForm((s) => ({ ...s, scriptGenre: g.id }))}
                            className={cn(
                              "px-3 py-1.5 rounded-full text-xs font-medium border transition",
                              form.scriptGenre === g.id
                                ? "vp-gradient border-transparent"
                                : "border-white/15 text-white/65 hover:border-white/30"
                            )}
                          >
                            {g.id}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-white/65 mb-2 font-medium">
                        Sinopse <span className="text-white/40">(apresente sua história de forma clara e objetiva)</span>{" "}
                        <span className="text-[var(--color-vp-pink)]">*</span>
                      </p>
                      <textarea
                        rows={6}
                        value={form.synopsis}
                        onChange={(e) => setForm((s) => ({ ...s, synopsis: e.target.value }))}
                        placeholder="Quem é o protagonista? Qual o conflito central? Por que essa história precisa virar novela?"
                        className="w-full bg-white/8 border border-white/10 rounded-2xl px-3 py-3 text-sm placeholder:text-white/40 focus:outline-none focus:border-[var(--color-vp-pink)] resize-none"
                      />
                      <p className="text-[10px] text-white/45 mt-1 flex justify-between">
                        <span>Mínimo 60 caracteres</span>
                        <span className={form.synopsis.length >= 60 ? "text-[var(--color-vp-pink)]" : ""}>
                          {form.synopsis.length} / 4000
                        </span>
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-white/65 mb-1 font-medium">
                        Argumento <span className="text-[var(--color-vp-pink)]">*</span>
                      </p>
                      <p className="text-[11px] text-white/45 mb-2">
                        Personagens principais, universo da obra, conflitos e
                        desenvolvimento. Siga o modelo padrão — PDF, limite de 1 página.
                      </p>
                      <a
                        href="/modelo-argumento-vertiplay.pdf"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-vp-pink)] hover:opacity-80 mb-3"
                      >
                        <Download className="w-3.5 h-3.5" /> Baixar modelo de argumento
                      </a>

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
                          Anexar argumento (PDF)
                          <input
                            type="file"
                            accept="application/pdf,.pdf"
                            className="hidden"
                            onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
                          />
                        </label>
                      )}
                      {fileError && <p className="text-[10px] text-rose-300 mt-1">{fileError}</p>}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/8">
                    <p className="text-xs font-bold uppercase tracking-wider text-white/50 pt-4 mb-3">
                      Termo de ciência e responsabilidade
                    </p>
                    <div className="max-h-40 overflow-y-auto bg-white/5 border border-white/10 rounded-xl p-4 text-[11px] text-white/60 leading-relaxed space-y-2 mb-3">
                      <p>
                        Declaro, sob minha responsabilidade, que a sinopse, o
                        argumento e quaisquer outros materiais enviados nesta
                        inscrição são de minha autoria e/ou que detenho legitimamente
                        todos os direitos necessários sobre eles.
                      </p>
                      <p>
                        Declaro que o material apresentado não viola direitos
                        autorais, direitos de propriedade intelectual, direitos de
                        imagem ou quaisquer outros direitos de terceiros,
                        responsabilizando-me integralmente pela veracidade dessas
                        informações.
                      </p>
                      <p>
                        Estou ciente de que o envio do material não garante sua
                        seleção, contratação, aquisição ou produção pelo Vertiplay.
                      </p>
                      <p>
                        Caso meu projeto seja selecionado, estou ciente de que sua
                        eventual produção estará sujeita à celebração de contrato
                        específico com o Vertiplay, que estabelecerá os direitos,
                        obrigações, créditos e condições de participação do autor nos
                        resultados financeiros da obra.
                      </p>
                      <p>
                        Comprometo-me a responder integralmente por quaisquer
                        reivindicações de terceiros relacionadas à autoria ou
                        titularidade do material por mim enviado, isentando o
                        Vertiplay de responsabilidades decorrentes de declarações
                        falsas, omissões ou violações de direitos de terceiros.
                      </p>
                    </div>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.consent}
                        onChange={(e) => setForm((s) => ({ ...s, consent: e.target.checked }))}
                        className="mt-0.5 w-4 h-4 accent-[var(--color-vp-pink)]"
                      />
                      <span className="text-xs font-semibold text-white/85">
                        Declaro que li e estou de acordo com o termo acima.
                      </span>
                    </label>
                  </div>

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
                        <Send className="w-4 h-4" /> Enviar minha história
                      </>
                    )}
                  </button>
                  {!valid && (
                    <p className="text-[10px] text-white/45 text-center -mt-3">
                      Preencha todos os campos obrigatórios, anexe o argumento em PDF e aceite o termo
                    </p>
                  )}
                </div>

                <p className="inline-flex items-center gap-1.5 justify-center w-full text-xs text-white/50 mt-5">
                  <Clock className="w-3.5 h-3.5" /> Inscrições abertas até {WRITERS_DEADLINE_LABEL}. Não deixe sua história para depois.
                </p>
              </>
            )}
          </section>

          {/* Chamada final */}
          <section className="border-t border-white/8">
            <div className="max-w-2xl mx-auto px-6 py-16 text-center">
              <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">
                Talvez a próxima novela vertical comece com você.
              </h2>
              <p className="text-white/70 mb-6">
                Sua história pode sair do papel, chegar às telas e se transformar em
                uma oportunidade real. Apresente sua história. Quem sabe a próxima
                produção seja sua.
              </p>
              {open && (
                <a
                  href="#form"
                  className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl vp-gradient vp-glow font-bold"
                >
                  <Send className="w-4 h-4" /> Enviar minha história
                </a>
              )}
            </div>
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
  type = "text",
  required,
  optional,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  required?: boolean;
  optional?: boolean;
}) {
  return (
    <div>
      <p className="text-xs text-white/65 mb-2 font-medium">
        {label}
        {required && <span className="text-[var(--color-vp-pink)] ml-1">*</span>}
        {optional && <span className="text-white/40 ml-1">(opcional)</span>}
      </p>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white/8 border border-white/10 rounded-xl px-3 py-2.5 text-sm placeholder:text-white/40 focus:outline-none focus:border-[var(--color-vp-pink)]"
      />
    </div>
  );
}
