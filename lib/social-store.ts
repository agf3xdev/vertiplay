// Users e amizades — Postgres via Prisma.
// API exportada igual à versão anterior (JSON-based) pra callers não quebrarem.

import { prisma } from "./prisma";

export type StoredUser = {
  username: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  createdAt: string;
  lastSeenAt: string;
};

export type Friendship = {
  id: string;
  from: string; // username
  to: string;
  status: "pending" | "accepted";
  createdAt: string;
};

export function slugifyUsername(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 24) || "user";
}

function toStoredUser(u: any): StoredUser {
  return {
    username: u.username,
    displayName: u.displayName || u.name || u.email.split("@")[0],
    email: u.email,
    avatarUrl: u.avatarUrl ?? undefined,
    bio: u.bio ?? undefined,
    createdAt: (u.createdAt instanceof Date ? u.createdAt : new Date(u.createdAt)).toISOString(),
    lastSeenAt: (u.lastSeenAt instanceof Date ? u.lastSeenAt : new Date(u.lastSeenAt ?? u.createdAt)).toISOString(),
  };
}

// ────────────── USERS ──────────────

export async function getAllUsers(): Promise<StoredUser[]> {
  const rows = await prisma.user.findMany({ orderBy: { createdAt: "desc" } });
  return rows.map(toStoredUser);
}

export async function upsertUser(input: {
  email: string;
  displayName: string;
  avatarUrl?: string;
}): Promise<StoredUser> {
  const email = input.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const updated = await prisma.user.update({
      where: { email },
      data: {
        displayName: input.displayName || existing.displayName,
        avatarUrl: input.avatarUrl ?? existing.avatarUrl,
        lastSeenAt: new Date(),
      },
    });
    return toStoredUser(updated);
  }
  // gera username único
  const base = slugifyUsername(email.split("@")[0]);
  let username = base;
  let n = 1;
  while (await prisma.user.findUnique({ where: { username } })) {
    n++;
    username = `${base}${n}`;
  }
  const created = await prisma.user.create({
    data: {
      username,
      displayName: input.displayName || email.split("@")[0],
      email,
      avatarUrl: input.avatarUrl,
    },
  });
  return toStoredUser(created);
}

export async function findUserByEmail(email: string): Promise<StoredUser | undefined> {
  const u = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  return u ? toStoredUser(u) : undefined;
}

export async function findUserByUsername(username: string): Promise<StoredUser | undefined> {
  const u = await prisma.user.findUnique({ where: { username: username.toLowerCase() } });
  return u ? toStoredUser(u) : undefined;
}

export async function searchUsersDB(q: string, excludeEmail?: string): Promise<StoredUser[]> {
  const term = q.toLowerCase().replace(/^@/, "").trim();
  const where: any = {};
  if (excludeEmail) where.email = { not: excludeEmail.toLowerCase() };
  if (term) {
    where.OR = [
      { username: { contains: term, mode: "insensitive" } },
      { displayName: { contains: term, mode: "insensitive" } },
      { email: { contains: term, mode: "insensitive" } },
    ];
  }
  const rows = await prisma.user.findMany({ where, take: 50, orderBy: { lastSeenAt: "desc" } });
  return rows.map(toStoredUser);
}

// ────────────── FRIENDSHIPS ──────────────
// Internamente Prisma armazena por User.id; API externa continua usando username.

async function usernameToId(username: string): Promise<string | null> {
  const u = await prisma.user.findUnique({ where: { username: username.toLowerCase() }, select: { id: true } });
  return u?.id ?? null;
}

async function idToUsername(id: string): Promise<string | null> {
  const u = await prisma.user.findUnique({ where: { id }, select: { username: true } });
  return u?.username ?? null;
}

export async function getAllFriendships(): Promise<Friendship[]> {
  const rows = await prisma.friendship.findMany({
    include: { from: { select: { username: true } }, to: { select: { username: true } } },
  });
  return rows.map((r) => ({
    id: r.id,
    from: r.from.username,
    to: r.to.username,
    status: r.status as "pending" | "accepted",
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function listFriendsFor(username: string): Promise<{
  friends: string[];
  requestsIn: string[];
  requestsOut: string[];
}> {
  const userId = await usernameToId(username);
  if (!userId) return { friends: [], requestsIn: [], requestsOut: [] };

  const rows = await prisma.friendship.findMany({
    where: { OR: [{ fromId: userId }, { toId: userId }] },
    include: { from: { select: { username: true } }, to: { select: { username: true } } },
  });

  const friends: string[] = [];
  const requestsIn: string[] = [];
  const requestsOut: string[] = [];
  for (const f of rows) {
    if (f.status === "accepted") {
      friends.push(f.fromId === userId ? f.to.username : f.from.username);
    } else if (f.status === "pending") {
      if (f.fromId === userId) requestsOut.push(f.to.username);
      else requestsIn.push(f.from.username);
    }
  }
  return { friends, requestsIn, requestsOut };
}

export async function requestFriendship(from: string, to: string): Promise<{ ok: boolean; reason?: string }> {
  if (from === to) return { ok: false, reason: "Você não pode adicionar você mesmo" };
  const [fromId, toId] = await Promise.all([usernameToId(from), usernameToId(to)]);
  if (!fromId || !toId) return { ok: false, reason: "Usuário não encontrado" };

  const existing = await prisma.friendship.findFirst({
    where: {
      OR: [
        { fromId, toId },
        { fromId: toId, toId: fromId },
      ],
    },
  });
  if (existing) {
    if (existing.status === "accepted") return { ok: false, reason: "Já são amigos" };
    if (existing.fromId === toId) {
      // o outro já pediu; aceita
      await prisma.friendship.update({
        where: { id: existing.id },
        data: { status: "accepted" },
      });
      return { ok: true };
    }
    return { ok: false, reason: "Pedido pendente" };
  }
  await prisma.friendship.create({
    data: { fromId, toId, status: "pending" },
  });
  return { ok: true };
}

export async function acceptFriendship(from: string, me: string): Promise<boolean> {
  const [fromId, meId] = await Promise.all([usernameToId(from), usernameToId(me)]);
  if (!fromId || !meId) return false;
  const f = await prisma.friendship.findFirst({
    where: { fromId, toId: meId, status: "pending" },
  });
  if (!f) return false;
  await prisma.friendship.update({ where: { id: f.id }, data: { status: "accepted" } });
  return true;
}

export async function rejectFriendship(from: string, me: string): Promise<boolean> {
  const [fromId, meId] = await Promise.all([usernameToId(from), usernameToId(me)]);
  if (!fromId || !meId) return false;
  const r = await prisma.friendship.deleteMany({
    where: { fromId, toId: meId, status: "pending" },
  });
  return r.count > 0;
}

export async function removeFriendship(a: string, b: string): Promise<boolean> {
  const [aId, bId] = await Promise.all([usernameToId(a), usernameToId(b)]);
  if (!aId || !bId) return false;
  const r = await prisma.friendship.deleteMany({
    where: {
      status: "accepted",
      OR: [
        { fromId: aId, toId: bId },
        { fromId: bId, toId: aId },
      ],
    },
  });
  return r.count > 0;
}
