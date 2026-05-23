// Logo oficial do Vertiplay. Reproduz o V (2 play-triangles arredondados)
// com gradiente magenta→violeta. Funciona como:
//   <Logo />           — símbolo + wordmark (320x110)
//   <Logo iconOnly />  — só o símbolo quadrado, ótimo pra avatares e splash

type Props = {
  size?: number;
  iconOnly?: boolean;
  className?: string;
};

export function Logo({ size = 36, iconOnly = false, className }: Props) {
  if (iconOnly) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        aria-label="Vertiplay"
      >
        <defs>
          <linearGradient id="vp-i-bg" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#0a0612" />
            <stop offset="1" stopColor="#1a0a1f" />
          </linearGradient>
          <linearGradient id="vp-i-a" x1="0" y1="0" x2="80" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#5a1c8a" />
            <stop offset="0.5" stopColor="#9c2bc8" />
            <stop offset="1" stopColor="#ff2e92" />
          </linearGradient>
          <linearGradient id="vp-i-b" x1="20" y1="20" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#7a2caa" />
            <stop offset="0.6" stopColor="#c93a98" />
            <stop offset="1" stopColor="#ff4aaa" />
          </linearGradient>
          <linearGradient id="vp-i-sh" x1="0" y1="0" x2="0" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="white" stopOpacity="0.35" />
            <stop offset="0.5" stopColor="white" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect width="100" height="100" rx="22" fill="url(#vp-i-bg)" />
        <g transform="translate(8, 4)">
          <path d="M 4 12 Q 4 4 12 9 L 50 44 Q 58 50 50 56 L 12 91 Q 4 96 4 88 Z" fill="url(#vp-i-a)" />
          <path d="M 28 12 Q 28 4 36 9 L 74 44 Q 82 50 74 56 L 36 91 Q 28 96 28 88 Z" fill="url(#vp-i-b)" />
          <path d="M 28 12 Q 28 4 36 9 L 74 44 Q 82 50 74 56 L 36 91 Q 28 96 28 88 Z" fill="url(#vp-i-sh)" />
        </g>
      </svg>
    );
  }

  return (
    <svg
      width={size * (320 / 110)}
      height={size}
      viewBox="0 0 320 110"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Vertiplay"
    >
      <defs>
        <linearGradient id="vp-l-a" x1="0" y1="0" x2="80" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#5a1c8a" />
          <stop offset="0.5" stopColor="#9c2bc8" />
          <stop offset="1" stopColor="#ff2e92" />
        </linearGradient>
        <linearGradient id="vp-l-b" x1="20" y1="20" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#7a2caa" />
          <stop offset="0.6" stopColor="#c93a98" />
          <stop offset="1" stopColor="#ff4aaa" />
        </linearGradient>
        <linearGradient id="vp-l-sh" x1="0" y1="0" x2="0" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="white" stopOpacity="0.35" />
          <stop offset="0.5" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>

      <g transform="translate(8, 8)">
        <path
          d="M 6 12 Q 6 4 14 9 L 56 44 Q 64 50 56 56 L 14 91 Q 6 96 6 88 Z"
          fill="url(#vp-l-a)"
        />
        <path
          d="M 30 12 Q 30 4 38 9 L 80 44 Q 88 50 80 56 L 38 91 Q 30 96 30 88 Z"
          fill="url(#vp-l-b)"
        />
        <path
          d="M 30 12 Q 30 4 38 9 L 80 44 Q 88 50 80 56 L 38 91 Q 30 96 30 88 Z"
          fill="url(#vp-l-sh)"
        />
      </g>

      <text
        x="115"
        y="74"
        fontFamily="-apple-system, 'SF Pro Display', system-ui, sans-serif"
        fontWeight="800"
        fontSize="64"
        fill="white"
        letterSpacing="-2.5"
      >
        Verti
      </text>
      <text
        x="240"
        y="74"
        fontFamily="-apple-system, 'SF Pro Display', system-ui, sans-serif"
        fontWeight="300"
        fontSize="64"
        fill="white"
        letterSpacing="-1.5"
      >
        play
      </text>
    </svg>
  );
}
