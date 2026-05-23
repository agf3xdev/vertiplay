// Persistência server-side de usuários e amizades em arquivos JSON (MVP).
// Em prod migrar pra Prisma (User, Friendship).
//
// users.json:
//   { username, displayName, email, avatarUrl, bio?, createdAt, lastSeenAt }
// friendships.json:
//   { id, from, to, status: "pending"|"accepted", createdAt }

import { promises as fs } from "node:fs";
import { join } from "node:path";

const DIR = join(process.cwd(), "prisma");
const USERS_FILE = join(DIR, "users.json");
const FRIENDS_FILE = join(DIR, "friendships.json");

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

async function ensureDir() {
  await fs.mkdir(DIR, { recursive: true });
}

async function readJSON<T>(path: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await fs.readFile(path, "utf8"));
  } catch {
    return fallback;
  }
}

async function writeJSON(path: string, data: unknown) {
  await ensureDir();
  await fs.writeFile(path, JSON.stringify(data, null, 2));
}

export function slugifyUsername(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "")
    .slice(0, 24) || "user";
}

// ────────────── USERS ──────────────

export async function getAllUsers(): Promise<StoredUser[]> {
  return readJSON<StoredUser[]>(USERS_FILE, []);
}

export async function upsertUser(input: {
  email: string;
  displayName: string;
  avatarUrl?: string;
}): Promise<StoredUser> {
  const all = await getAllUsers();
  const now = new Date().toISOString();
  const existing = all.find((u) => u.email.toLowerCase() === input.email.toLowerCase());
  if (existing) {
    existing.displayName = input.displayName;
    existing.avatarUrl = input.avatarUrl ?? existing.avatarUrl;
    existing.lastSeenAt = now;
    await writeJSON(USERS_FILE, all);
    return existing;
  }
  // gera username único a partir do email/displayname
  let base = slugifyUsername(input.email.split("@")[0]);
  let username = base;
  let n = 1;
  while (all.some((u) => u.username === username)) {
    n++;
    username = `${base}${n}`;
  }
  const user: StoredUser = {
    username,
    displayName: input.displayName,
    email: input.email,
    avatarUrl: input.avatarUrl,
    createdAt: now,
    lastSeenAt: now,
  };
  all.unshift(user);
  await writeJSON(USERS_FILE, all);
  return user;
}

export async function findUserByEmail(email: string): Promise<StoredUser | undefined> {
  const all = await getAllUsers();
  return all.find((u) => u.email.toLowerCase() === email.toLowerCase());
}

export async function findUserByUsername(username: string): Promise<StoredUser | undefined> {
  const all = await getAllUsers();
  return all.find((u) => u.username.toLowerCase() === username.toLowerCase());
}

export async function searchUsersDB(q: string, excludeEmail?: string): Promise<StoredUser[]> {
  const all = await getAllUsers();
  const term = q.toLowerCase().replace(/^@/, "").trim();
  return all
    .filter((u) => excludeEmail ? u.email.toLowerCase() !== excludeEmail.toLowerCase() : true)
    .filter((u) => {
      if (!term) return true;
      return (
        u.username.toLowerCase().includes(term) ||
        u.displayName.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term)
      );
    })
    .slice(0, 50);
}

// ────────────── FRIENDSHIPS ──────────────

export async function getAllFriendships(): Promise<Friendship[]> {
  return readJSON<Friendship[]>(FRIENDS_FILE, []);
}

export async function listFriendsFor(username: string): Promise<{
  friends: string[];
  requestsIn: string[];
  requestsOut: string[];
}> {
  const all = await getAllFriendships();
  const friends: string[] = [];
  const requestsIn: string[] = [];
  const requestsOut: string[] = [];
  for (const f of all) {
    if (f.status === "accepted") {
      if (f.from === username) friends.push(f.to);
      else if (f.to === username) friends.push(f.from);
    } else if (f.status === "pending") {
      if (f.from === username) requestsOut.push(f.to);
      else if (f.to === username) requestsIn.push(f.from);
    }
  }
  return { friends, requestsIn, requestsOut };
}

export async function requestFriendship(from: string, to: string): Promise<{ ok: boolean; reason?: string }> {
  if (from === to) return { ok: false, reason: "Você não pode adicionar você mesmo" };
  const all = await getAllFriendships();
  // já existe relação?
  const existing = all.find(
    (f) =>
      (f.from === from && f.to === to) ||
      (f.from === to && f.to === from)
  );
  if (existing) {
    if (existing.status === "accepted") return { ok: false, reason: "Já são amigos" };
    if (existing.from === to) {
      // o outro já tinha pedido; aceita
      existing.status = "accepted";
      await writeJSON(FRIENDS_FILE, all);
      return { ok: true };
    }
    return { ok: false, reason: "Pedido pendente" };
  }
  all.unshift({
    id: "fs_" + Math.random().toString(36).slice(2, 10),
    from,
    to,
    status: "pending",
    createdAt: new Date().toISOString(),
  });
  await writeJSON(FRIENDS_FILE, all);
  return { ok: true };
}

export async function acceptFriendship(from: string, me: string): Promise<boolean> {
  const all = await getAllFriendships();
  const f = all.find((x) => x.from === from && x.to === me && x.status === "pending");
  if (!f) return false;
  f.status = "accepted";
  await writeJSON(FRIENDS_FILE, all);
  return true;
}

export async function rejectFriendship(from: string, me: string): Promise<boolean> {
  const all = await getAllFriendships();
  const idx = all.findIndex((x) => x.from === from && x.to === me && x.status === "pending");
  if (idx < 0) return false;
  all.splice(idx, 1);
  await writeJSON(FRIENDS_FILE, all);
  return true;
}

export async function removeFriendship(a: string, b: string): Promise<boolean> {
  const all = await getAllFriendships();
  const idx = all.findIndex(
    (f) =>
      f.status === "accepted" &&
      ((f.from === a && f.to === b) || (f.from === b && f.to === a))
  );
  if (idx < 0) return false;
  all.splice(idx, 1);
  await writeJSON(FRIENDS_FILE, all);
  return true;
}
