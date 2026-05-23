"use client";
import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Search, UserPlus, UserCheck, X, Gift, Users } from "lucide-react";
import { MOCK_USERS, findUser, searchUsers } from "@/lib/social";
import { useWallet } from "@/lib/store";
import { cn } from "@/lib/cn";

export default function FriendsPage() {
  const router = useRouter();
  const friends = useWallet((s) => s.friends);
  const reqsIn = useWallet((s) => s.friendRequestsIn);
  const reqsOut = useWallet((s) => s.friendRequestsOut);
  const addFriend = useWallet((s) => s.addFriend);
  const acceptFriend = useWallet((s) => s.acceptFriend);
  const rejectFriend = useWallet((s) => s.rejectFriend);
  const removeFriend = useWallet((s) => s.removeFriend);
  const [q, setQ] = useState("");
  const [tab, setTab] = useState<"amigos" | "pedidos" | "descobrir">("amigos");

  const myFriends = useMemo(() => friends.map(findUser).filter(Boolean), [friends]);
  const incoming = useMemo(() => reqsIn.map(findUser).filter(Boolean), [reqsIn]);
  const outgoing = useMemo(() => reqsOut.map(findUser).filter(Boolean), [reqsOut]);
  const suggestions = useMemo(() => {
    const taken = new Set([...friends, ...reqsIn, ...reqsOut]);
    return searchUsers(q).filter((u) => !taken.has(u.username));
  }, [q, friends, reqsIn, reqsOut]);

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
          <p className="text-[11px] text-white/55">{friends.length} amigos · {reqsIn.length} pedidos</p>
        </div>
        <Link href="/gifts" className="vp-card rounded-full px-3 py-1.5 text-xs font-bold flex items-center gap-1.5">
          <Gift className="w-3.5 h-3.5 text-[var(--color-vp-pink)]" /> Presentes
        </Link>
      </div>

      <div className="px-4 flex gap-6 border-b border-white/10 mb-3">
        {([
          ["amigos", `Amigos · ${friends.length}`],
          ["pedidos", `Pedidos${reqsIn.length ? ` · ${reqsIn.length}` : ""}`],
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
          <>
            {myFriends.length === 0 ? (
              <Empty
                title="Sem amigos por aqui ainda"
                text="Vai na aba Descobrir e adiciona pessoas pra começar."
                cta="Descobrir"
                onClick={() => setTab("descobrir")}
              />
            ) : (
              <ul className="space-y-2">
                {myFriends.map((u) => u && (
                  <li key={u.username} className="vp-card rounded-2xl p-3 flex items-center gap-3">
                    <Image src={u.avatarUrl} alt={u.displayName} width={48} height={48} className="w-12 h-12 rounded-full" unoptimized />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm">{u.displayName}</p>
                      <p className="text-xs text-white/55">@{u.username}</p>
                    </div>
                    <Link href={`/gifts/send?to=${u.username}`} className="vp-gradient px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1">
                      <Gift className="w-3 h-3" /> Presentear
                    </Link>
                    <button onClick={() => removeFriend(u.username)} className="text-white/40 px-1">
                      <X className="w-4 h-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}

        {tab === "pedidos" && (
          <>
            {incoming.length === 0 && outgoing.length === 0 ? (
              <Empty title="Nenhum pedido por aqui" text="Quando alguém te enviar pedido, aparece aqui." />
            ) : (
              <>
                {incoming.length > 0 && (
                  <>
                    <p className="text-xs text-white/55 mb-2 font-medium">Querem ser teu amigo</p>
                    <ul className="space-y-2 mb-5">
                      {incoming.map((u) => u && (
                        <li key={u.username} className="vp-card rounded-2xl p-3 flex items-center gap-3">
                          <Image src={u.avatarUrl} alt="" width={48} height={48} className="w-12 h-12 rounded-full" unoptimized />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-sm">{u.displayName}</p>
                            <p className="text-xs text-white/55">@{u.username}</p>
                          </div>
                          <button onClick={() => acceptFriend(u.username)} className="vp-gradient px-3 py-2 rounded-xl text-xs font-bold">
                            Aceitar
                          </button>
                          <button onClick={() => rejectFriend(u.username)} className="bg-white/10 px-3 py-2 rounded-xl text-xs">
                            Recusar
                          </button>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                {outgoing.length > 0 && (
                  <>
                    <p className="text-xs text-white/55 mb-2 font-medium">Você pediu</p>
                    <ul className="space-y-2">
                      {outgoing.map((u) => u && (
                        <li key={u.username} className="vp-card rounded-2xl p-3 flex items-center gap-3 opacity-75">
                          <Image src={u.avatarUrl} alt="" width={40} height={40} className="w-10 h-10 rounded-full" unoptimized />
                          <div className="flex-1">
                            <p className="text-sm">{u.displayName}</p>
                            <p className="text-xs text-white/55">@{u.username}</p>
                          </div>
                          <span className="text-[11px] text-white/55">Aguardando…</span>
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </>
            )}
          </>
        )}

        {tab === "descobrir" && (
          <>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/45" />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="@username ou nome"
                className="w-full bg-white/8 border border-white/10 rounded-2xl pl-10 pr-3 py-3 text-sm placeholder:text-white/40 focus:outline-none focus:border-[var(--color-vp-pink)]"
              />
            </div>
            <ul className="space-y-2">
              {suggestions.map((u) => (
                <li key={u.username} className="vp-card rounded-2xl p-3 flex items-center gap-3">
                  <Image src={u.avatarUrl} alt="" width={44} height={44} className="w-11 h-11 rounded-full" unoptimized />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{u.displayName}</p>
                    <p className="text-xs text-white/55">@{u.username}{u.bio && ` · ${u.bio}`}</p>
                  </div>
                  <button onClick={() => addFriend(u.username)} className="vp-gradient px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1">
                    <UserPlus className="w-3 h-3" /> Adicionar
                  </button>
                </li>
              ))}
              {suggestions.length === 0 && (
                <p className="text-center text-white/45 text-sm py-8">Ninguém encontrado.</p>
              )}
            </ul>
          </>
        )}
      </div>
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
