"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { StorySubmission } from "@prisma/client";
import { PageHeader, Card, Badge, EmptyState } from "@/components/admin/ui";
import { cn } from "@/lib/cn";
import { Mail, Phone, Trash2 } from "lucide-react";

const STATUS_TABS: { id: string; label: string; tone: any }[] = [
  { id: "all", label: "Todas", tone: "default" },
  { id: "pending", label: "Pendentes", tone: "warn" },
  { id: "reviewing", label: "Em análise", tone: "info" },
  { id: "approved", label: "Aprovadas", tone: "success" },
  { id: "rejected", label: "Rejeitadas", tone: "danger" },
];

export function StoriesClient({
  stories,
  summary,
  active,
}: {
  stories: StorySubmission[];
  summary: Record<string, number>;
  active: string;
}) {
  const router = useRouter();
  const [list, setList] = useState(stories);

  async function setStatus(id: string, status: string) {
    const r = await fetch(`/api/admin/stories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (r.ok) {
      const d = await r.json();
      setList(list.map((s) => (s.id === id ? d.story : s)));
      router.refresh();
    }
  }

  async function del(id: string) {
    if (!confirm("Apagar permanentemente esta história?")) return;
    const r = await fetch(`/api/admin/stories/${id}`, { method: "DELETE" });
    if (r.ok) {
      setList(list.filter((s) => s.id !== id));
      router.refresh();
    }
  }

  return (
    <div>
      <PageHeader
        title="Histórias UGC"
        subtitle="Roteiros enviados pelos usuários via 'Conte sua história'."
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
              href={t.id === "all" ? "/admin/stories" : `/admin/stories?status=${t.id}`}
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
        <EmptyState title="Nenhuma história nesta aba" />
      ) : (
        <div className="space-y-3">
          {list.map((s) => (
            <Card key={s.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-bold">{s.title}</h3>
                    <Badge
                      tone={
                        s.status === "pending"
                          ? "warn"
                          : s.status === "reviewing"
                          ? "info"
                          : s.status === "approved"
                          ? "success"
                          : "danger"
                      }
                    >
                      {s.status}
                    </Badge>
                    {s.genre && <Badge>{s.genre}</Badge>}
                  </div>
                  <p className="text-xs text-white/55 mt-1">
                    Por <b>{s.authorName}</b> · {s.createdAt.toLocaleDateString("pt-BR")} {s.createdAt.toLocaleTimeString("pt-BR").slice(0, 5)}
                  </p>
                </div>
                <button onClick={() => del(s.id)} className="text-rose-300 text-xs flex items-center gap-1 shrink-0">
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>

              <p className="text-sm text-white/85 mt-3 leading-relaxed whitespace-pre-line">{s.synopsis}</p>

              {s.inspiration && (
                <p className="text-[11px] text-white/55 mt-2 italic">
                  Inspiração: {s.inspiration}
                </p>
              )}

              <div className="flex flex-wrap gap-3 mt-3 text-[11px] text-white/55">
                {s.email && (
                  <a href={`mailto:${s.email}`} className="flex items-center gap-1 hover:text-white">
                    <Mail className="w-3 h-3" /> {s.email}
                  </a>
                )}
                {s.phone && (
                  <a href={`https://wa.me/${s.phone.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:text-white">
                    <Phone className="w-3 h-3" /> {s.phone}
                  </a>
                )}
                {!s.consent && <Badge tone="danger">SEM consentimento</Badge>}
              </div>

              <div className="flex gap-2 mt-4 flex-wrap">
                {s.status !== "reviewing" && (
                  <button onClick={() => setStatus(s.id, "reviewing")} className="px-3 py-1.5 rounded-lg bg-sky-500/15 text-sky-300 text-xs font-medium">
                    Marcar em análise
                  </button>
                )}
                {s.status !== "approved" && (
                  <button onClick={() => setStatus(s.id, "approved")} className="px-3 py-1.5 rounded-lg bg-emerald-500/15 text-emerald-300 text-xs font-medium">
                    Aprovar
                  </button>
                )}
                {s.status !== "rejected" && (
                  <button onClick={() => setStatus(s.id, "rejected")} className="px-3 py-1.5 rounded-lg bg-rose-500/15 text-rose-300 text-xs font-medium">
                    Rejeitar
                  </button>
                )}
                {s.status !== "pending" && (
                  <button onClick={() => setStatus(s.id, "pending")} className="px-3 py-1.5 rounded-lg bg-white/10 text-xs font-medium">
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
