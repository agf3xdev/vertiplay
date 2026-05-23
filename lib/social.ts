// Social layer do Vertiplay — amigos + presentes (gifts).
// MVP: persiste em zustand+localStorage (mesmo padrão da wallet).
// Em produção, sync com /api/friends e /api/gifts + Prisma (User, Friendship, Gift).

export type MockUser = {
  username: string;     // @bia, @rafa
  displayName: string;
  avatarUrl: string;
  bio?: string;
};

// Usuários mock para descobrir/adicionar
export const MOCK_USERS: MockUser[] = [
  { username: "bia", displayName: "Bia Romance", avatarUrl: "https://i.pravatar.cc/200?img=49", bio: "Viciada em novela coreana 💕" },
  { username: "rafa", displayName: "Rafa Drama", avatarUrl: "https://i.pravatar.cc/200?img=12", bio: "Bilionário fictício é meu tipo" },
  { username: "anacarol", displayName: "Ana Carolina", avatarUrl: "https://i.pravatar.cc/200?img=47", bio: "Maratonista profissional" },
  { username: "joao_alfa", displayName: "João Alfa", avatarUrl: "https://i.pravatar.cc/200?img=33", bio: "Time lobisomem aqui 🐺" },
  { username: "marina", displayName: "Marina S.", avatarUrl: "https://i.pravatar.cc/200?img=44", bio: "Vingança em primeiro lugar" },
  { username: "leo", displayName: "Léo Costa", avatarUrl: "https://i.pravatar.cc/200?img=11", bio: "CEO no Vertiplay e na vida" },
  { username: "duda", displayName: "Duda Mello", avatarUrl: "https://i.pravatar.cc/200?img=45", bio: "Sempre na cesta básica VIP" },
  { username: "renan", displayName: "Renan G.", avatarUrl: "https://i.pravatar.cc/200?img=14", bio: "Loja > série às vezes" },
  { username: "tati", displayName: "Tati Lima", avatarUrl: "https://i.pravatar.cc/200?img=48", bio: "Coleciono coins de recompensa" },
  { username: "felipe", displayName: "Felipe Reis", avatarUrl: "https://i.pravatar.cc/200?img=15", bio: "Sigo todas as exclusivas" },
];

export function findUser(username: string): MockUser | undefined {
  return MOCK_USERS.find((u) => u.username.toLowerCase() === username.toLowerCase());
}

export function searchUsers(q: string): MockUser[] {
  if (!q) return MOCK_USERS;
  const t = q.toLowerCase().replace(/^@/, "");
  return MOCK_USERS.filter(
    (u) =>
      u.username.toLowerCase().includes(t) ||
      u.displayName.toLowerCase().includes(t)
  );
}

// ──────────────────────────────────────────────────────────────
// Tipos de presente
// ──────────────────────────────────────────────────────────────

export type GiftKind = "series" | "episode" | "coins" | "vip" | "product";

export type Gift = {
  id: string;
  from: string;            // username remetente (ou "voce" se ego)
  to: string;              // username destinatário
  kind: GiftKind;
  // payload por tipo
  seriesSlug?: string;
  episodeNumber?: number;
  coinsAmount?: number;
  vipDays?: number;
  productSlug?: string;
  message?: string;
  createdAt: string;
  claimedAt?: string;
  status: "pending" | "claimed" | "expired";
};

export function describeGift(g: Gift): string {
  switch (g.kind) {
    case "series":
      return "Série completa de presente";
    case "episode":
      return `Episódio ${g.episodeNumber} desbloqueado`;
    case "coins":
      return `${g.coinsAmount} coins`;
    case "vip":
      return `${g.vipDays} dias de VIP`;
    case "product":
      return "Produto da loja";
  }
}

export function giftEmoji(kind: GiftKind): string {
  return (
    { series: "🎬", episode: "🎞️", coins: "🪙", vip: "👑", product: "🛍️" }[kind] ?? "🎁"
  );
}
