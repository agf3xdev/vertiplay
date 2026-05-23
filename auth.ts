// NextAuth v5 (Auth.js) — config central do Vertiplay
// Provider: Google. Sessão: JWT (sem DB no MVP).
// Em prod, trocar pra Prisma adapter quando o User model estiver em uso.

import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { upsertUser, findUserByEmail } from "@/lib/social-store";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: { params: { prompt: "select_account" } },
    }),
  ],
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 30 }, // 30 dias
  pages: { signIn: "/auth" },
  events: {
    // Registra usuário no users.json quando logar (busca/amizades funcionam)
    async signIn({ profile }) {
      if (!profile?.email) return;
      try {
        await upsertUser({
          email: profile.email,
          displayName: profile.name ?? profile.email.split("@")[0],
          avatarUrl: (profile as any).picture,
        });
      } catch (e) {
        console.error("[auth] upsertUser failed:", e);
      }
    },
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account && profile) {
        token.email = profile.email;
        token.name = profile.name;
        token.picture = (profile as any).picture;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.email = (token.email as string) ?? session.user.email;
        session.user.name = (token.name as string) ?? session.user.name;
        session.user.image = (token.picture as string) ?? session.user.image;
        // Anexa username derivado da base de usuários
        const email = session.user.email;
        if (email) {
          const stored = await findUserByEmail(email);
          if (stored) (session.user as any).username = stored.username;
        }
      }
      return session;
    },
  },
  trustHost: true,
});
