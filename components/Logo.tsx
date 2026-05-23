// Logo oficial do Vertiplay — usa a imagem JPG enviada pelo cliente
// (/public/logo.jpg). Para ícone quadrado (favicon, profile), /public/icon.jpg.

import Image from "next/image";

type Props = {
  size?: number;
  iconOnly?: boolean;
  className?: string;
};

export function Logo({ size = 36, iconOnly = false, className }: Props) {
  if (iconOnly) {
    return (
      <Image
        src="/icon.jpg"
        alt="Vertiplay"
        width={size}
        height={size}
        className={className}
        priority
        unoptimized
      />
    );
  }

  // Proporção do arquivo original: 1008x419 ≈ 2.4 : 1
  return (
    <Image
      src="/logo.jpg"
      alt="Vertiplay"
      width={Math.round(size * 2.4)}
      height={size}
      className={className}
      priority
      unoptimized
    />
  );
}
