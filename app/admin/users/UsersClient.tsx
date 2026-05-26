"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { User } from "@prisma/client";
import { PageHeader, Card, Table, Th, Td, Badge, EmptyState, inputCls, PrimaryButton } from "@/components/admin/ui";
import { cn } from "@/lib/cn";
import { Crown, Coins } from "lucide-react";

export function UsersClient({
  users,
  q,
  filter,
}: {
  users: User[];
  q: string;
  filter: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(q);
  const [editing, setEditing] = useState<string | null>(null);

  function search(e: React.FormEvent) {
    e.preventDefault();
    const sp = new URLSearchParams();
    if (query) sp.set("q", query);
    if (filter !== "all") sp.set("filter", filter);
    router.push(`/admin/users?${sp.toString()}`);
  }

  return (
    <div>
      <PageHeader
        title="Usuários"
        subtitle={`${users.length} resultados (limite 200).`}
      />

      <Card className="mb-4">
        <form onSubmit={search} className="flex gap-2 items-end flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="text-xs text-white/65 font-medium">Buscar</label>
            <input
              className={cn(inputCls, "mt-1.5")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Email, @username ou nome"
            />
          </div>
          <div className="flex gap-1">
            <a
              href="/admin/users"
              className={cn("px-3 py-2 rounded-lg text-xs font-medium", filter === "all" ? "vp-gradient" : "bg-white/10")}
            >
              Todos
            </a>
            <a
              href="/admin/users?filter=vip"
              className={cn("px-3 py-2 rounded-lg text-xs font-medium", filter === "vip" ? "vp-gradient" : "bg-white/10")}
            >
              VIP
            </a>
          </div>
          <PrimaryButton type="submit">Buscar</PrimaryButton>
        </form>
      </Card>

      {users.length === 0 ? (
        <EmptyState title="Nenhum usuário" />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Usuário</Th>
              <Th>Email</Th>
              <Th>Coins</Th>
              <Th>VIP</Th>
              <Th>Criado</Th>
              <Th />
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <UserRow key={u.id} user={u} editing={editing === u.id} setEditing={(v) => setEditing(v ? u.id : null)} />
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
}

function UserRow({
  user,
  editing,
  setEditing,
}: {
  user: User;
  editing: boolean;
  setEditing: (v: boolean) => void;
}) {
  const router = useRouter();
  const [coinsBonus, setCoinsBonus] = useState(user.coinsBonus);
  const [isVip, setIsVip] = useState(user.isVip);
  const [vipExpires, setVipExpires] = useState(
    user.vipExpiresAt ? user.vipExpiresAt.toISOString().slice(0, 10) : ""
  );
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    const r = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ coinsBonus, isVip, vipExpiresAt: vipExpires || null }),
    });
    setSaving(false);
    if (r.ok) {
      setEditing(false);
      router.refresh();
    }
  }

  return (
    <>
      <tr className="hover:bg-white/5">
        <Td>
          <div className="font-semibold">@{user.username}</div>
          <div className="text-[11px] text-white/45">{user.displayName}</div>
        </Td>
        <Td>{user.email}</Td>
        <Td>
          <span className="inline-flex items-center gap-1">
            <Coins className="w-3 h-3 text-[var(--color-vp-gold)]" />
            {user.coinsPaid + user.coinsBonus}
          </span>
          <p className="text-[10px] text-white/45">{user.coinsPaid}p + {user.coinsBonus}b</p>
        </Td>
        <Td>
          {user.isVip ? (
            <Badge tone="warn">
              <span className="inline-flex items-center gap-1"><Crown className="w-3 h-3" /> VIP</span>
            </Badge>
          ) : (
            <Badge>—</Badge>
          )}
        </Td>
        <Td>{user.createdAt.toLocaleDateString("pt-BR")}</Td>
        <Td className="text-right">
          <button
            onClick={() => setEditing(!editing)}
            className="text-[var(--color-vp-pink)] text-xs font-medium"
          >
            {editing ? "Fechar" : "Editar"}
          </button>
        </Td>
      </tr>
      {editing && (
        <tr className="bg-white/[0.03]">
          <td colSpan={6} className="px-4 py-3 border-b border-white/5">
            <div className="grid sm:grid-cols-4 gap-3 items-end">
              <div>
                <label className="text-xs text-white/65">Coins bônus</label>
                <input
                  type="number"
                  className={cn(inputCls, "mt-1")}
                  value={coinsBonus}
                  onChange={(e) => setCoinsBonus(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="text-xs text-white/65">VIP</label>
                <div className="mt-1.5">
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={isVip} onChange={(e) => setIsVip(e.target.checked)} className="accent-[var(--color-vp-pink)]" />
                    Ativar VIP
                  </label>
                </div>
              </div>
              <div>
                <label className="text-xs text-white/65">VIP até</label>
                <input
                  type="date"
                  className={cn(inputCls, "mt-1")}
                  value={vipExpires}
                  onChange={(e) => setVipExpires(e.target.value)}
                />
              </div>
              <PrimaryButton onClick={save} disabled={saving}>
                {saving ? "Salvando..." : "Salvar"}
              </PrimaryButton>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
