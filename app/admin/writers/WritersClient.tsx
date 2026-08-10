"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { WriterApplication } from "@prisma/client";
import { PageHeader, Card, Badge, EmptyState } from "@/components/admin/ui";
import { cn } from "@/lib/cn";
import { Mail, Phone, Link2, Trash2 } from "lucide-react";

const STATUS_TABS: { id: string; label: string; tone: any }[] = [
  { id: "all", label: "Todas", tone: "default" },
  { id: "pending", label: "Pendentes", tone: "warn" },
  { id: "reviewing", label: "Em análise", tone: "info" },
  { id: "approved", label: "Aprovadas", tone: "success" },
  { id: "rejected", label: "Rejeitadas", tone: "danger" },
];

const EXPERIENCE_LABEL: Record<string, string> = {
  iniciante: "Iniciante",
  amador: "Amador(a)",
  profissional: "Profissional",
};

export function WritersClient({
  writers,
  summary,
  active,
}: {
  writers: WriterApplication[];
  summary: Record<string, number>;
  active: string;
}) {
  const router = useRouter();
  const [list, setList] = useState(writers);

  async function setStatus(id: string, status: string) {
    const r = await fetch(`/api/admin/writers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (r.ok) {
      const d = await r.json();
      setList(list.map((w) => (w.id === id ? d.writer : w)));
      router.refresh();
    }
  }

  async function del(id: string) {
    if (!confirm("Apagar permanentemente esta candidatura?")) return;
    const r = await fetch(`/api/admin/writers/${id}`, { method: "DELETE" });
    if (r.ok) {
      setList(list.filter((w) => w.id !== id));
      router.refresh();
    }
  }

  return (
    <div>
      <PageHeader
        title="Roteiristas"
        subtitle="Candidaturas recebidas pela landing page 'Seja roteirista'."
      />

      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4 -mx-2 px-2">
        {STATUS_TABS.map((t) => {
          const isActive = active === t.id;
          const count = t.id === "all"
            ? Object.values(summary).reduce((a, b) => a + b, 0)
            : summary[t.id] ?? 0;
          return (
            <a
              key={t.id}
              href={t.id === "all" ? "/admin/writers" : `/admin/writers?status=${t.id}`}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap",
                isActive ? "vp-gradient" : "bg-white/8 text-white/65 hover:bg-white/12"
              )}
            >
              {t.label} <span className="opacity-70 ml-1">{count}</span>
            </a>
          );
        })}
      </div>

      {list.length === 0 ? (
        <EmptyState title="Nenhuma candidatura nesta aba" />
      ) : (
        <div className="space-y-3">
          {list.map((w) => (
            <Card key={w.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold">{w.name}</h3>
                    <Badge
                      tone={
                        w.status === "pending"
                          ? "warn"
                          : w.status === "reviewing"
                          ? "info"
                          : w.status === "approved"
                          ? "success"
                          : "danger"
                      }
                    >
                      {w.status}
                    </Badge>
                    <Badge>{EXPERIENCE_LABEL[w.experience] ?? w.experience}</Badge>
                  </div>
                  <p className="text-xs text-white/55 mt-1">
                    {w.createdAt.toLocaleDateString("pt-BR")} {w.createdAt.toLocaleTimeString("pt-BR").slice(0, 5)}
                    {w.genres && <> · {w.genres}</>}
                  </p>
                </div>
                <button onClick={() => del(w.id)} className="text-rose-300 text-xs flex items-center gap-1 shrink-0">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>

              <p className="text-sm text-white/85 mt-3 leading-relaxed whitespace-pre-line">{w.sample}</p>

              {w.motivation && (
                <p className="text-[11px] text-white/55 mt-2 italic">
                  Motivação: {w.motivation}
                </p>
              )}
              {w.availability && (
                <p className="text-[11px] text-white/45 mt-1">
                  Disponibilidade: {w.availability}
                </p>
              )}

              <div className="flex flex-wrap gap-3 mt-3 text-[11px] text-white/55">
                <a href={`mailto:${w.email}`} className="flex items-center gap-1 hover:text-white">
                  <Mail className="w-3 h-3" /> {w.email}
                </a>
                {w.phone && (
                  <a href={`https://wa.me/${w.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-white">
                    <Phone className="w-3 h-3" /> {w.phone}
                  </a>
                )}
                {w.portfolioUrl && (
                  <a href={w.portfolioUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-white">
                    <Link2 className="w-3 h-3" /> Portfólio
                  </a>
                )}
                {!w.consent && <Badge tone="danger">SEM consentimento</Badge>}
              </div>

              <div className="flex gap-2 mt-4 flex-wrap">
                {w.status !== "reviewing" && (
                  <button onClick={() => setStatus(w.id, "reviewing")} className="px-3 py-1.5 rounded-lg bg-sky-500/15 text-sky-300 text-xs font-medium">
                    Marcar em análise
                  </button>
                )}
                {w.status !== "approved" && (
                  <button onClick={() => setStatus(w.id, "approved")} className="px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-300 text-xs font-medium">
                    Aprovar
                  </button>
                )}
                {w.status !== "rejected" && (
                  <button onClick={() => setStatus(w.id, "rejected")} className="px-3 py-1.5 rounded-lg bg-rose-500/15 text-rose-300 text-xs font-medium">
                    Rejeitar
                  </button>
                )}
                {w.status !== "pending" && (
                  <button onClick={() => setStatus(w.id, "pending")} className="px-3 py-1.5 rounded-lg bg-white/10 text-xs font-medium">
                    Voltar pra fila
                  </button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
