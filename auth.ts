// NextAuth v5 (Auth.js) — config central do Vertiplay
// Provider: Google. Sessão: JWT (sem DB no MVP).
// Em prod, trocar pra Prisma adapter quando o User model estiver em uso.

import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { OAuth2Client } from "google-auth-library";
import { upsertUser, findUserByEmail } from "@/lib/social-store";
import { verifyOtp } from "@/lib/email";

const googleClient = new OAuth2Client();

export const { handlers, signIn, signOut, auth } = NextAuth({
  useSecureCookies: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: { params: { prompt: "select_account" } },
      checks: ["state"],
    }),
    // Google Sign-In nativo (Capacitor) — recebe idToken do plugin nativo
    Credentials({
      id: "google-native",
      name: "Google (native)",
      credentials: { idToken: { type: "text" } },
      async authorize(credentials) {
        const idToken = String(credentials?.idToken ?? "");
        if (!idToken) return null;
        const audiences = [
          process.env.GOOGLE_CLIENT_ID,
          process.env.GOOGLE_IOS_CLIENT_ID,
          process.env.GOOGLE_ANDROID_CLIENT_ID,
        ].filter(Boolean) as string[];
        try {
          const ticket = await googleClient.verifyIdToken({ idToken, audience: audiences });
          const payload = ticket.getPayload();
          const email = payload?.email?.toLowerCase();
          if (!email || !payload?.email_verified) return null;
          const user = await upsertUser({
            email,
            displayName: payload.name ?? email.split("@")[0],
            avatarUrl: payload.picture,
          });
          return {
            id: user.username,
            email: user.email,
            name: user.displayName,
            image: user.avatarUrl,
          };
        } catch (e) {
          console.error("[auth] google-native verifyIdToken failed:", (e as Error).message);
          return null;
        }
      },
    }),
    // Login por email via código OTP
    Credentials({
      id: "email-otp",
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        code: { label: "Código", type: "text" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "").trim().toLowerCase();
        const code = String(credentials?.code ?? "").trim();
        if (!email || !code) return null;
        const r = await verifyOtp(email, code);
        if (!r.ok) return null;
        // upsert no banco social pra ficar buscável
        const user = await upsertUser({
          email,
          displayName: email.split("@")[0],
        });
        return {
          id: user.username,
          email: user.email,
          name: user.displayName,
          image: user.avatarUrl,
        };
      },
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
