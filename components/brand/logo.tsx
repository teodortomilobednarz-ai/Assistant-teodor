/**
 * Draidly brand mark — a custom geometric "D" monogram with an orbiting spark,
 * rendered as crisp, themeable SVG (no raster assets, scales perfectly).
 * The gradient echoes the product's neon indigo → violet → cyan identity.
 *
 * A single static gradient id is safe: duplicate identical defs across multiple
 * marks resolve to the first one in document order — visually identical — and it
 * avoids any SSR/hydration id mismatch.
 */
export function LogoMark({ className = "size-8" }: { className?: string }) {
  return (
    <span
      className={`relative inline-flex items-center justify-center ${className}`}
      aria-hidden
    >
      <svg viewBox="0 0 40 40" className="size-full" role="presentation">
        <defs>
          <linearGradient
            id="draidly-mark"
            x1="6"
            y1="4"
            x2="34"
            y2="36"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0" stopColor="#6d5cf0" />
            <stop offset="0.55" stopColor="#8b5cf6" />
            <stop offset="1" stopColor="#22d3ee" />
          </linearGradient>
        </defs>
        {/* Rounded tile */}
        <rect x="1.5" y="1.5" width="37" height="37" rx="11" fill="url(#draidly-mark)" />
        {/* "D" counter, cut from the tile */}
        <path
          d="M13 11.5h7.2c5 0 8.3 3.4 8.3 8.5s-3.3 8.5-8.3 8.5H13V11.5zm5 4.2v8.6h2.1c2.4 0 3.9-1.6 3.9-4.3s-1.5-4.3-3.9-4.3H18z"
          fill="#ffffff"
        />
        {/* Orbiting spark — the "AI" cue */}
        <circle cx="30.5" cy="9.5" r="2.4" fill="#ffffff" />
      </svg>
    </span>
  );
}

export function Logo({ className = "" }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark className="size-8" />
      <span className="text-lg font-semibold tracking-tight">Draidly</span>
    </span>
  );
}
