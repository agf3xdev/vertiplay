"use client";
import { useWallet } from "@/lib/store";
import { SERIES, formatBRL } from "@/lib/catalog";
import { BRANDS, PRODUCTS } from "@/lib/shop";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from "next/image";
import { Logo } from "@/components/Logo";
import {
  Crown,
  ChevronRight,
  Bookmark,
  History,
  ShoppingBag,
  Settings,
  HelpCircle,
  LogOut,
  Coins,
  LogIn,
} from "lucide-react";

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const paid = useWallet((s) => s.coinsPaid);
  const bonus = useWallet((s) => s.coinsBonus);
  const watchlist = useWallet((s) => s.watchlist);
  const isVip = useWallet((s) => s.isVip);
  const orderHistory = useWallet((s) => s.orderHistory);
  const brandFollows = useWallet((s) => s.brandFollows);

  const saved = SERIES.filter((s) => watchlist.includes(s.id));
  const followedBrands = BRANDS.filter((b) => brandFollows.includes(b.id));

  const userName = session?.user?.name ?? "Convidado";
  const userEmail = session?.user?.email ?? "Não logado";
  const userInitial = (session?.user?.name?.[0] ?? "V").toUpperCase();

  return (
    <div className="pb-8">
      <div className="px-4 pt-4 safe-top">
        <Logo />
      </div>

      {/* Card de perfil */}
      <div className="px-4 mt-4">
        <div className="vp-card rounded-3xl p-5 flex items-center gap-3">
          {session?.user?.image ? (
            <Image
              src={session.user.image}
              alt={userName}
              width={64}
              height={64}
              className="w-16 h-16 rounded-full object-cover"
              unoptimized
            />
          ) : (
            <div className="w-16 h-16 rounded-full vp-gradient flex items-center justify-center text-2xl font-bold">
              {userInitial}
            </div>
          )}
          <div className="flex-1">
            <p className="font-bold text-lg">{userName}</p>
            <p className="text-xs text-white/55">{userEmail}</p>
            {isVip && (
              <span className="inline-flex items-center gap-1 text-[10px] vp-gradient px-2 py-0.5 rounded-full mt-1 font-bold">
                <Crown className="w-3 h-3" /> VIP
              </span>
            )}
          </div>
          {status !== "authenticated" && (
            <Link
              href="/auth"
              className="vp-gradient text-xs font-bold px-3 py-2 rounded-xl"
            >
              Entrar
            </Link>
          )}
        </div>

        <Link
          href="/wallet"
          className="vp-card rounded-3xl p-4 mt-3 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <Coins className="w-6 h-6 text-[var(--color-vp-gold)]" />
            <div>
              <p className="text-xs text-white/55">Saldo total</p>
              <p className="font-bold text-lg">{paid + bonus} coins</p>
            </div>
          </div>
          <span className="vp-gradient text-xs font-bold px-3 py-1.5 rounded-full">
            Recarregar
          </span>
        </Link>
      </div>

      {/* Salvas */}
      <Section
        title="Minhas séries"
        href="/profile/watchlist"
        icon={Bookmark}
      >
        {saved.length === 0 ? (
          <p className="text-xs text-white/45 px-4">Você ainda não salvou nenhuma série.</p>
        ) : (
          <div className="flex gap-3 overflow-x-auto no-scrollbar px-4">
            {saved.map((s) => (
              <Link key={s.id} href={`/series/${s.slug}`} className="shrink-0 w-24">
                <div className="relative w-24 aspect-poster rounded-xl overflow-hidden">
                  <Image src={s.posterUrl} alt={s.title} fill className="object-cover" unoptimized />
                </div>
                <p className="text-[11px] mt-1 line-clamp-2">{s.title}</p>
              </Link>
            ))}
          </div>
        )}
      </Section>

      {/* Marcas seguidas */}
      <Section
        title="Lojas que sigo"
        href="/shop"
        icon={ShoppingBag}
      >
        {followedBrands.length === 0 ? (
          <p className="text-xs text-white/45 px-4">
            Siga marcas patrocinadoras das séries para acompanhar lançamentos.
          </p>
        ) : (
          <div className="flex gap-3 overflow-x-auto no-scrollbar px-4">
            {followedBrands.map((b) => (
              <Link key={b.id} href={`/shop/brand/${b.slug}`} className="shrink-0 w-20 text-center">
                <Image
                  src={b.logoUrl}
                  alt={b.name}
                  width={64}
                  height={64}
                  className="w-16 h-16 rounded-full object-cover mx-auto"
                  unoptimized
                />
                <p className="text-[11px] mt-1 line-clamp-2">{b.name}</p>
              </Link>
            ))}
          </div>
        )}
      </Section>

      {/* Pedidos */}
      <Section title="Meus pedidos" href="#" icon={History}>
        {orderHistory.length === 0 ? (
          <p className="text-xs text-white/45 px-4">Nenhum pedido ainda.</p>
        ) : (
          <div className="px-4 space-y-2">
            {orderHistory.slice(0, 5).map((o) => (
              <div key={o.id} className="vp-card rounded-xl p-3 flex justify-between items-center">
                <div>
                  <p className="text-xs font-semibold">#{o.id.slice(-6).toUpperCase()}</p>
                  <p className="text-[10px] text-white/45">
                    {new Date(o.at).toLocaleString("pt-BR")}
                  </p>
                </div>
                <p className="font-bold vp-gradient-text">{formatBRL(o.total)}</p>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Menu */}
      <div className="px-4 mt-6 space-y-1">
        <MenuItem icon={Crown} label="Assinar VIP" href="/wallet" />
        <MenuItem icon={Settings} label="Configurações" href="#" />
        <MenuItem icon={HelpCircle} label="Ajuda & suporte" href="#" />
        {status === "authenticated" ? (
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-3 vp-card rounded-2xl px-4 py-3 w-full text-left"
          >
            <LogOut className="w-4 h-4 text-red-400" />
            <span className="flex-1 text-red-400">Sair</span>
            <ChevronRight className="w-4 h-4 text-white/30" />
          </button>
        ) : (
          <MenuItem icon={LogIn} label="Entrar com Google" href="/auth" />
        )}
      </div>

      <p className="text-center text-[10px] text-white/35 mt-6">
        Vertiplay v0.1 · made by F3X
      </p>
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  href,
  children,
}: {
  title: string;
  icon: any;
  href?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mt-6">
      <div className="flex items-center justify-between px-4 mb-2">
        <h3 className="flex items-center gap-2 font-bold">
          <Icon className="w-4 h-4 text-[var(--color-vp-pink)]" /> {title}
        </h3>
        {href && (
          <Link href={href} className="text-xs text-white/55 flex items-center gap-1">
            Ver tudo <ChevronRight className="w-3 h-3" />
          </Link>
        )}
      </div>
      {children}
    </section>
  );
}

function MenuItem({
  icon: Icon,
  label,
  href,
  danger,
}: {
  icon: any;
  label: string;
  href: string;
  danger?: boolean;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 vp-card rounded-2xl px-4 py-3"
    >
      <Icon className={`w-4 h-4 ${danger ? "text-red-400" : "text-white/65"}`} />
      <span className={`flex-1 ${danger ? "text-red-400" : ""}`}>{label}</span>
      <ChevronRight className="w-4 h-4 text-white/30" />
    </Link>
  );
}
