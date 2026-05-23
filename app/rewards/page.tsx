"use client";
import { useWallet } from "@/lib/store";
import { DAILY_REWARDS } from "@/lib/catalog";
import { ChevronLeft, Gift, Sparkles, Tv, Share2, UserPlus, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/cn";

export default function RewardsPage() {
  const router = useRouter();
  const lastCheckin = useWallet((s) => s.lastCheckin);
  const streak = useWallet((s) => s.checkinStreak);
  const addCoins = useWallet((s) => s.addCoins);
  const checkin = useWallet((s) => s.checkin);

  const today = new Date().toISOString().slice(0, 10);
  const checkedToday = lastCheckin === today;
  const currentDay = Math.min(streak + (checkedToday ? 0 : 1), 7);

  function handleCheckin() {
    const reward = DAILY_REWARDS[(currentDay - 1 + 7) % 7];
    checkin(reward);
  }

  const tasks = [
    {
      id: "watch5",
      title: "Assistir 5 episódios",
      reward: 30,
      icon: Tv,
      desc: "Continue uma série até o 5º episódio",
    },
    {
      id: "share",
      title: "Compartilhar uma série",
      reward: 15,
      icon: Share2,
      desc: "Envie um link de série para um amigo",
    },
    {
      id: "invite",
      title: "Convidar 1 amigo",
      reward: 50,
      icon: UserPlus,
      desc: "Ganhe coins quando seu amigo entrar",
    },
  ];

  return (
    <div className="px-4 pt-4 safe-top pb-8">
      <div className="flex items-center gap-3 mb-4">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-bold">Prêmios</h1>
      </div>

      {/* Daily check-in */}
      <div className="vp-card rounded-3xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="font-bold text-lg flex items-center gap-2">
              <Gift className="w-5 h-5 text-[var(--color-vp-pink)]" /> Recompensa Diária
            </h2>
            <p className="text-xs text-white/55">Volte todo dia e ganhe mais coins</p>
          </div>
          <span className="vp-gradient px-3 py-1 rounded-full text-xs font-bold">
            Streak {streak}
          </span>
        </div>

        <div className="grid grid-cols-7 gap-1.5 mb-4">
          {DAILY_REWARDS.map((r, i) => {
            const isToday = i + 1 === currentDay;
            const claimed = i + 1 < currentDay || (checkedToday && i + 1 === currentDay);
            return (
              <div
                key={i}
                className={cn(
                  "aspect-square rounded-xl flex flex-col items-center justify-center text-[10px] border",
                  claimed && "bg-[var(--color-vp-pink)]/30 border-[var(--color-vp-pink)]",
                  isToday && !claimed && "vp-gradient border-transparent vp-glow",
                  !isToday && !claimed && "border-white/10 bg-white/5 text-white/55"
                )}
              >
                <p className="font-bold">D{i + 1}</p>
                <p className="font-semibold">+{r}</p>
                {claimed && <CheckCircle2 className="w-3 h-3 mt-0.5" />}
              </div>
            );
          })}
        </div>

        <button
          onClick={handleCheckin}
          disabled={checkedToday}
          className={cn(
            "w-full py-3 rounded-2xl font-bold",
            checkedToday ? "bg-white/10 text-white/45" : "vp-gradient vp-glow"
          )}
        >
          {checkedToday
            ? "✓ Já coletado hoje"
            : `Coletar +${DAILY_REWARDS[(currentDay - 1 + 7) % 7]} coins bônus`}
        </button>
      </div>

      {/* Tasks */}
      <h3 className="font-bold mt-6 mb-2 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-[var(--color-vp-pink)]" /> Missões
      </h3>
      <p className="text-xs text-white/55 mb-3">Tarefas que pagam coins bônus</p>

      <div className="space-y-2">
        {tasks.map((t) => {
          const Icon = t.icon;
          return (
            <div key={t.id} className="vp-card rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full vp-gradient flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">{t.title}</p>
                <p className="text-[11px] text-white/55">{t.desc}</p>
              </div>
              <button
                onClick={() => addCoins(0, t.reward)}
                className="px-3 py-1.5 rounded-full vp-gradient text-xs font-bold"
              >
                +{t.reward}
              </button>
            </div>
          );
        })}
      </div>

      <div className="vp-card rounded-3xl p-5 mt-6">
        <p className="font-semibold text-sm mb-1">Assistir + 30 min hoje</p>
        <p className="text-xs text-white/55 mb-3">
          Premiamos quem maratona. Ganhe +50 coins ao completar 30 min.
        </p>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div className="h-full vp-gradient" style={{ width: "0%" }} />
        </div>
        <p className="text-[10px] text-white/45 mt-1.5">0 / 30 min</p>
      </div>
    </div>
  );
}
