"use client";
import { useState, useMemo, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ChevronLeft,
  Search,
  UserPlus,
  UserCheck,
  X,
  Gift,
  Users,
  Loader2,
  LogIn,
} from "lucide-react";
import { cn } from "@/lib/cn";

type ApiUser = { username: string; displayName: string; avatarUrl?: string; bio?: string };

export default function FriendsPage() {
  const router = useRouter();
  const { status, data: session } = useSession();

  const [me, setMe] = useState<{ username: string; displayName: string; avatarUrl?: string } | null>(null);
  const [friends, setFriends] = useState<string[]>([]);
  const [requestsIn, setRequestsIn] = useState<string[]>([]);
  const [requestsOut, setRequestsOut] = useState<string[]>([]);

  const [allUsers, setAllUsers] = useState<Record<string, ApiUser>>({});
  const [tab, setTab] = useState<"amigos" | "pedidos" | "descobrir">("amigos");
  const [q, setQ] = useState("");
  const [searchResults, setSearchResults] = useState<ApiUser[]>([]);
  const [searching, setSearching] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const r = await fetch("/api/me", { cache: "no-store" });
    if (!r.ok) {
      setLoading(false);
      return;
    }
    const data = await r.json();
    setMe(data.user);
    setFriends(data.friends ?? []);
    setRequestsIn(data.requestsIn ?? []);
    setRequestsOut(data.requestsOut ?? []);

    // Resolve display names dos usernames referenciados
    const usernamesToFetch = [
      ...(data.friends ?? []),
      ...(data.requestsIn ?? []),
      ...(data.requestsOut ?? []),
    ];
    if (usernamesToFetch.length) {
      const all = await fetch(`/api/users/search?q=`).then((r) => r.json());
      const map: Record<string, ApiUser> = {};
      for (const u of all.users as ApiUser[]) map[u.username] = u;
      setAllUsers(map);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (status === "authenticated") refresh();
    else if (status === "unauthenticated") setLoading(false);
  }, [status, refresh]);

  // Busca quando muda query
  useEffect(() => {
    if (tab !== "descobrir" || status !== "authenticated") return;
    const t = setTimeout(async () => {
      setSearching(true);
      const r = await fetch(`/api/users/search?q=${encodeURIComponent(q)}`);
      const d = await r.json();
      const taken = new Set([...friends, ...requestsIn, ...requestsOut, me?.username].filter(Boolean));
      setSearchResults((d.users as ApiUser[]).filter((u) => !taken.has(u.username)));
      setSearching(false);
    }, 250);
    return () => clearTimeout(t);
  }, [q, tab, status, friends, requestsIn, requestsOut, me]);

  async function sendRequest(toUsername: string) {
    await fetch("/api/friends/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ to: toUsername }),
    });
    await refresh();
  }
  async function accept(fromUsername: string) {
    await fetch("/api/friends/accept", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from: fromUsername }),
    });
    await refresh();
  }
  async function reject(fromUsername: string) {
    await fetch("/api/friends/reject", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from: fromUsername }),
    });
    await refresh();
  }
  async function remove(username: string) {
    await fetch("/api/friends/remove", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });
    await refresh();
  }

  // ── Estado: não logado ──
  if (status === "unauthenticated") {
    return (
      <div className="px-4 pt-4 safe-top">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => router.back()} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Users className="w-5 h-5 text-[var(--color-vp-pink)]" /> Amigos
          </h1>
        </div>
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-full vp-gradient flex items-center justify-center mx-auto mb-4 vp-glow">
            <LogIn className="w-9 h-9" />
          </div>
          <p className="font-bold text-lg mb-1">Entre pra ter amigos</p>
          <p className="text-sm text-white/55 mb-5">
            Faça login com Google pra descobrir e adicionar outros usuários do Vertiplay.
          </p>
          <Link href="/auth" className="vp-gradient inline-block px-6 py-3 rounded-2xl font-bold vp-glow">
            Entrar com Google
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-white/55" />
      </div>
    );
  }

  return (
    <div className="pb-8">
      <div className="px-4 pt-4 safe-top flex items-center gap-3 mb-3">
        <button onClick={() => router.back()} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <Users className="w-5 h-5 text-[var(--color-vp-pink)]" /> Amigos
          </h1>
          <p className="text-[11px] text-white/55">
            Você é <span className="font-bold text-white">@{me?.username ?? "—"}</span> · {friends.length} amigos · {requestsIn.length} pedidos
          </p>
        </div>
        <Link href="/gifts" className="vp-card rounded-full px-3 py-1.5 text-xs font-bold flex items-center gap-1.5">
          <Gift className="w-3.5 h-3.5 text-[var(--color-vp-pink)]" /> Presentes
        </Link>
      </div>

      <div className="px-4 flex gap-6 border-b border-white/10 mb-3">
        {([
          ["amigos", `Amigos · ${friends.length}`],
          ["pedidos", `Pedidos${requestsIn.length ? ` · ${requestsIn.length}` : ""}`],
          ["descobrir", "Descobrir"],
        ] as const).map(([k, label]) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={cn(
              "py-2 text-sm font-medium border-b-2 transition",
              tab === k ? "border-[var(--color-vp-pink)] text-white" : "border-transparent text-white/55"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="px-4">
        {tab === "amigos" && (
          friends.length === 0 ? (
            <Empty title="Sem amigos por aqui ainda" text="Vai na aba Descobrir e adiciona pessoas." cta="Descobrir" onClick={() => setTab("descobrir")} />
          ) : (
            <ul className="space-y-2">
              {friends.map((username) => {
                const u = allUsers[username];
                return (
                  <li key={username} className="vp-card rounded-2xl p-3 flex items-center gap-3">
                    <Avatar user={u} fallback={username} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{u?.displayName ?? username}</p>
                      <p className="text-xs text-white/55">@{username}</p>
                    </div>
                    <Link href={`/gifts/send?to=${username}`} className="vp-gradient px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1">
                      <Gift className="w-3 h-3" /> Presentear
                    </Link>
                    <button onClick={() => remove(username)} className="text-white/40 px-1">
                      <X className="w-4 h-4" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )
        )}

        {tab === "pedidos" && (
          requestsIn.length === 0 && requestsOut.length === 0 ? (
            <Empty title="Nenhum pedido" text="Quando alguém te enviar pedido, aparece aqui." />
          ) : (
            <>
              {requestsIn.length > 0 && (
                <>
                  <p className="text-xs text-white/55 mb-2 font-medium">Querem te adicionar</p>
                  <ul className="space-y-2 mb-5">
                    {requestsIn.map((username) => {
                      const u = allUsers[username];
                      return (
                        <li key={username} className="vp-card rounded-2xl p-3 flex items-center gap-3">
                          <Avatar user={u} fallback={username} />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm">{u?.displayName ?? username}</p>
                            <p className="text-xs text-white/55">@{username}</p>
                          </div>
                          <button onClick={() => accept(username)} className="vp-gradient px-3 py-2 rounded-xl text-xs font-bold">Aceitar</button>
                          <button onClick={() => reject(username)} className="bg-white/10 px-3 py-2 rounded-xl text-xs">Recusar</button>
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}
              {requestsOut.length > 0 && (
                <>
                  <p className="text-xs text-white/55 mb-2 font-medium">Você pediu</p>
                  <ul className="space-y-2">
                    {requestsOut.map((username) => {
                      const u = allUsers[username];
                      return (
                        <li key={username} className="vp-card rounded-2xl p-3 flex items-center gap-3 opacity-75">
                          <Avatar user={u} fallback={username} small />
                          <div className="flex-1">
                            <p className="text-sm">{u?.displayName ?? username}</p>
                            <p className="text-xs text-white/55">@{username}</p>
                          </div>
                          <span className="text-[11px] text-white/55">Aguardando…</span>
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}
            </>
          )
        )}

        {tab === "descobrir" && (
          <>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/45" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="@username, nome ou email"
                className="w-full bg-white/8 border border-white/10 rounded-2xl pl-10 pr-3 py-3 text-sm placeholder:text-white/40 focus:outline-none focus:border-[var(--color-vp-pink)]"
              />
              {searching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-white/45" />}
            </div>
            <ul className="space-y-2">
              {searchResults.map((u) => (
                <li key={u.username} className="vp-card rounded-2xl p-3 flex items-center gap-3">
                  <Avatar user={u} fallback={u.username} />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{u.displayName}</p>
                    <p className="text-xs text-white/55">@{u.username}{u.bio && ` · ${u.bio}`}</p>
                  </div>
                  <button onClick={() => sendRequest(u.username)} className="vp-gradient px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1">
                    <UserPlus className="w-3 h-3" /> Adicionar
                  </button>
                </li>
              ))}
              {!searching && searchResults.length === 0 && (
                <p className="text-center text-white/45 text-sm py-8">
                  {q
                    ? "Ninguém encontrado. Confirme se a pessoa entrou no app pelo menos 1 vez."
                    : "Comece digitando @username ou nome."}
                </p>
              )}
            </ul>
          </>
        )}
      </div>
    </div>
  );
}

function Avatar({ user, fallback, small }: { user?: ApiUser; fallback: string; small?: boolean }) {
  const sz = small ? 40 : 44;
  if (user?.avatarUrl) {
    return (
      <Image src={user.avatarUrl} alt="" width={sz} height={sz} className={cn("rounded-full object-cover", small ? "w-10 h-10" : "w-11 h-11")} unoptimized />
    );
  }
  return (
    <div className={cn("rounded-full vp-gradient flex items-center justify-center font-bold", small ? "w-10 h-10 text-sm" : "w-11 h-11 text-base")}>
      {fallback[0].toUpperCase()}
    </div>
  );
}

function Empty({ title, text, cta, onClick }: { title: string; text: string; cta?: string; onClick?: () => void }) {
  return (
    <div className="text-center py-12">
      <div className="w-16 h-16 rounded-full vp-gradient flex items-center justify-center mx-auto mb-3 vp-glow">
        <UserCheck className="w-7 h-7" />
      </div>
      <p className="font-bold">{title}</p>
      <p className="text-xs text-white/55 mt-1 mb-4">{text}</p>
      {cta && onClick && (
        <button onClick={onClick} className="vp-gradient px-5 py-2.5 rounded-2xl text-sm font-bold">
          {cta}
        </button>
      )}
    </div>
  );
}
