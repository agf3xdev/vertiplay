// Logo Vertiplay
// - Símbolo V: PNG transparente (processado via rembg do JPG oficial)
// - Wordmark "Verti" + "play": texto HTML, nítido em qualquer tamanho

import Image from "next/image";
import { cn } from "@/lib/cn";

type Props = {
  size?: number;          // altura do símbolo em px
  iconOnly?: boolean;     // só o V (favicon, profile avatar)
  className?: string;
};

export function Logo({ size = 32, iconOnly = false, className }: Props) {
  if (iconOnly) {
    return (
      <Image
        src="/logo-v.png"
        alt="Vertiplay"
        width={size}
        height={size}
        className={className}
        priority
        unoptimized
      />
    );
  }

  // V symbol é ~271x210 → ratio 1.29
  const symbolWidth = Math.round(size * 1.29);

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <Image
        src="/logo-v.png"
        alt=""
        width={symbolWidth}
        height={size}
        priority
        unoptimized
        aria-hidden
      />
      <span
        className="font-extrabold tracking-tight text-white leading-none"
        style={{ fontSize: size * 0.85 }}
      >
        Verti<span className="font-light">play</span>
      </span>
    </div>
  );
}
