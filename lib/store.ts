"use client";
// Estado global do app — wallet, watchlist, unlocks, check-in, social.
// Persiste em localStorage (MVP). No prod, sync com /api/wallet, /api/friends, /api/gifts.

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Gift, GiftKind } from "./social";

export type CartLine = { productId: string; qty: number };

export type WalletState = {
  coinsPaid: number;
  coinsBonus: number;
  isVip: boolean;
  vipExpiresAt: string | null;

  watchlist: string[]; // series ids
  unlocks: string[]; // `${seriesId}:${epNumber}`
  lastCheckin: string | null; // YYYY-MM-DD
  checkinStreak: number;

  // shop
  cart: CartLine[];
  brandFollows: string[]; // brand ids
  orderHistory: { id: string; total: number; at: string; items: CartLine[] }[];

  // actions
  hydrate: () => void;
  addCoins: (paid: number, bonus: number) => void;
  spendCoins: (amount: number) => boolean;
  toggleWatchlist: (seriesId: string) => void;
  isInWatchlist: (seriesId: string) => boolean;
  unlock: (seriesId: string, epNumber: number, cost: number) => boolean;
  isUnlocked: (seriesId: string, epNumber: number) => boolean;
  checkin: (reward: number) => boolean;
  activateVip: (days: number) => void;

  addToCart: (productId: string, qty?: number) => void;
  removeFromCart: (productId: string) => void;
  setQty: (productId: string, qty: number) => void;
  clearCart: () => void;
  cartCount: () => number;
  checkout: (total: number) => void;
  toggleBrandFollow: (brandId: string) => void;
  isFollowingBrand: (brandId: string) => boolean;

  // social
  friends: string[];                // usernames aceitos
  friendRequestsIn: string[];       // pediram pra ti
  friendRequestsOut: string[];      // você pediu
  giftsReceived: Gift[];
  giftsSent: Gift[];

  addFriend: (username: string) => void;
  acceptFriend: (username: string) => void;
  rejectFriend: (username: string) => void;
  removeFriend: (username: string) => void;
  sendGift: (gift: Omit<Gift, "id" | "createdAt" | "status" | "from">) => void;
  claimGift: (giftId: string) => Gift | null;
  pendingGiftCount: () => number;
};

export const useWallet = create<WalletState>()(
  persist(
    (set, get) => ({
      coinsPaid: 0,
      coinsBonus: 50,
      isVip: false,
      vipExpiresAt: null,
      watchlist: [],
      unlocks: [],
      lastCheckin: null,
      checkinStreak: 0,

      hydrate: () => {},

      addCoins: (paid, bonus) =>
        set((s) => ({ coinsPaid: s.coinsPaid + paid, coinsBonus: s.coinsBonus + bonus })),

      spendCoins: (amount) => {
        const s = get();
        if (s.isVip) return true;
        const total = s.coinsPaid + s.coinsBonus;
        if (total < amount) return false;
        // gasta bonus primeiro (estratégia DramaBox: queima reward antes do pago)
        let bonusUsed = Math.min(s.coinsBonus, amount);
        let paidUsed = amount - bonusUsed;
        set({ coinsBonus: s.coinsBonus - bonusUsed, coinsPaid: s.coinsPaid - paidUsed });
        return true;
      },

      toggleWatchlist: (id) =>
        set((s) => ({
          watchlist: s.watchlist.includes(id)
            ? s.watchlist.filter((x) => x !== id)
            : [...s.watchlist, id],
        })),

      isInWatchlist: (id) => get().watchlist.includes(id),

      unlock: (sid, ep, cost) => {
        const key = `${sid}:${ep}`;
        const s = get();
        if (s.unlocks.includes(key)) return true;
        if (!s.spendCoins(cost)) return false;
        set({ unlocks: [...get().unlocks, key] });
        return true;
      },

      isUnlocked: (sid, ep) => get().unlocks.includes(`${sid}:${ep}`),

      checkin: (reward) => {
        const today = new Date().toISOString().slice(0, 10);
        const s = get();
        if (s.lastCheckin === today) return false;
        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
        const streak = s.lastCheckin === yesterday ? s.checkinStreak + 1 : 1;
        set({
          lastCheckin: today,
          checkinStreak: streak,
          coinsBonus: s.coinsBonus + reward,
        });
        return true;
      },

      activateVip: (days) => {
        const expires = new Date(Date.now() + days * 86400000).toISOString();
        set({ isVip: true, vipExpiresAt: expires });
      },

      // ── Shop ──
      cart: [],
      brandFollows: [],
      orderHistory: [],

      addToCart: (productId, qty = 1) =>
        set((s) => {
          const existing = s.cart.find((l) => l.productId === productId);
          if (existing) {
            return {
              cart: s.cart.map((l) =>
                l.productId === productId ? { ...l, qty: l.qty + qty } : l
              ),
            };
          }
          return { cart: [...s.cart, { productId, qty }] };
        }),

      removeFromCart: (productId) =>
        set((s) => ({ cart: s.cart.filter((l) => l.productId !== productId) })),

      setQty: (productId, qty) =>
        set((s) => ({
          cart:
            qty <= 0
              ? s.cart.filter((l) => l.productId !== productId)
              : s.cart.map((l) => (l.productId === productId ? { ...l, qty } : l)),
        })),

      clearCart: () => set({ cart: [] }),

      cartCount: () => get().cart.reduce((acc, l) => acc + l.qty, 0),

      checkout: (total) =>
        set((s) => ({
          cart: [],
          orderHistory: [
            {
              id: "ord_" + Math.random().toString(36).slice(2, 9),
              total,
              at: new Date().toISOString(),
              items: s.cart,
            },
            ...s.orderHistory,
          ],
        })),

      toggleBrandFollow: (brandId) =>
        set((s) => ({
          brandFollows: s.brandFollows.includes(brandId)
            ? s.brandFollows.filter((b) => b !== brandId)
            : [...s.brandFollows, brandId],
        })),

      isFollowingBrand: (brandId) => get().brandFollows.includes(brandId),

      // ── Social ──
      // Pré-popula com 3 amigos pra demo + 2 gifts recebidos
      friends: ["bia", "rafa", "anacarol"],
      friendRequestsIn: ["joao_alfa"],
      friendRequestsOut: [],
      giftsReceived: [
        {
          id: "gift_demo1",
          from: "bia",
          to: "voce",
          kind: "coins",
          coinsAmount: 50,
          message: "Pra você não parar de assistir 💕",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          status: "pending",
        },
        {
          id: "gift_demo2",
          from: "rafa",
          to: "voce",
          kind: "episode",
          seriesSlug: "noiva-cativa-da-mafia",
          episodeNumber: 4,
          message: "PRECISA ver esse cliffhanger",
          createdAt: new Date(Date.now() - 3600000).toISOString(),
          status: "pending",
        },
      ],
      giftsSent: [],

      addFriend: (username) =>
        set((s) => {
          if (s.friends.includes(username) || s.friendRequestsOut.includes(username))
            return {};
          return { friendRequestsOut: [...s.friendRequestsOut, username] };
        }),

      acceptFriend: (username) =>
        set((s) => ({
          friends: [...s.friends, username],
          friendRequestsIn: s.friendRequestsIn.filter((u) => u !== username),
        })),

      rejectFriend: (username) =>
        set((s) => ({
          friendRequestsIn: s.friendRequestsIn.filter((u) => u !== username),
        })),

      removeFriend: (username) =>
        set((s) => ({ friends: s.friends.filter((u) => u !== username) })),

      sendGift: (g) =>
        set((s) => ({
          giftsSent: [
            {
              id: "gift_" + Math.random().toString(36).slice(2, 9),
              from: "voce",
              createdAt: new Date().toISOString(),
              status: "pending" as const,
              ...g,
            },
            ...s.giftsSent,
          ],
        })),

      claimGift: (giftId) => {
        const s = get();
        const gift = s.giftsReceived.find((g) => g.id === giftId);
        if (!gift || gift.status !== "pending") return null;
        // aplica o presente
        if (gift.kind === "coins" && gift.coinsAmount) {
          set({ coinsBonus: s.coinsBonus + gift.coinsAmount });
        } else if (gift.kind === "vip" && gift.vipDays) {
          const expires = new Date(Date.now() + gift.vipDays * 86400000).toISOString();
          set({ isVip: true, vipExpiresAt: expires });
        } else if (gift.kind === "episode" && gift.seriesSlug && gift.episodeNumber) {
          // desbloqueia o ep (precisa do id da série; usa slug como fallback)
          set({ unlocks: [...s.unlocks, `${gift.seriesSlug}:${gift.episodeNumber}`] });
        }
        set({
          giftsReceived: s.giftsReceived.map((g) =>
            g.id === giftId
              ? { ...g, status: "claimed" as const, claimedAt: new Date().toISOString() }
              : g
          ),
        });
        return gift;
      },

      pendingGiftCount: () =>
        get().giftsReceived.filter((g) => g.status === "pending").length,
    }),
    { name: "vertiplay-wallet" }
  )
);
