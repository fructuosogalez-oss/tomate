/**
 * CoachCard — small recommendation card with eyebrow and short body.
 * Color: brand (accent red), warn (amber), gray (rest), good (green).
 */
const COLOR_MAP = {
  brand:  { eyebrow: 'text-accent', dot: 'bg-accent' },
  yellow: { eyebrow: 'text-warn',   dot: 'bg-warn'   },
  red:    { eyebrow: 'text-accent', dot: 'bg-accent' },
  gray:   { eyebrow: 'text-ink-3',  dot: 'bg-ink-4'  },
  good:   { eyebrow: 'text-good',   dot: 'bg-good'   },
}

export default function CoachCard({ label, message, color = 'brand', className = '' }) {
  const c = COLOR_MAP[color] || COLOR_MAP.brand

  return (
    <div className={`bg-surface-card border border-surface-line-soft rounded-[20px] px-[18px] py-[18px] ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className={`block w-1.5 h-1.5 rounded-full ${c.dot} breathe`} />
        <p className={`font-mono text-[10px] uppercase tracking-eyebrow ${c.eyebrow}`}>
          {label}
        </p>
      </div>
      <p className="text-ink text-[14px] leading-snug">{message}</p>
    </div>
  )
}
