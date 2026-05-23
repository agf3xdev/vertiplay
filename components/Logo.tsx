export function Logo({ size = 32, withText = true }: { size?: number; withText?: boolean }) {
  return (
    <div className="inline-flex items-center gap-2">
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Vertiplay"
      >
        <defs>
          <linearGradient id="vp-grad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#FF2E92" />
            <stop offset="0.6" stopColor="#7C3AED" />
            <stop offset="1" stopColor="#2563EB" />
          </linearGradient>
        </defs>
        <rect x="4" y="4" width="56" height="56" rx="16" fill="url(#vp-grad)" />
        {/* Triângulo "play" mais alto que largo — alusão ao vertical */}
        <path d="M24 18 L44 32 L24 46 Z" fill="white" />
      </svg>
      {withText && (
        <span className="font-bold text-lg tracking-tight">
          Verti<span className="vp-gradient-text">play</span>
        </span>
      )}
    </div>
  );
}
