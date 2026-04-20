const COLOR_MAP = {
  brand:  { bg: 'bg-brand-500/10 border-brand-500/30',  text: 'text-brand-400',  dot: 'bg-brand-400'  },
  yellow: { bg: 'bg-yellow-500/10 border-yellow-500/30', text: 'text-yellow-400', dot: 'bg-yellow-400' },
  red:    { bg: 'bg-red-500/10 border-red-500/30',       text: 'text-red-400',    dot: 'bg-red-400'    },
  gray:   { bg: 'bg-zinc-800/60 border-zinc-700',        text: 'text-zinc-400',   dot: 'bg-zinc-400'   },
}

export default function CoachCard({ label, message, color = 'brand', className = '' }) {
  const c = COLOR_MAP[color] || COLOR_MAP.brand

  return (
    <div className={`rounded-2xl border p-4 ${c.bg} ${className}`}>
      <div className="flex items-center gap-2 mb-1.5">
        <span className={`w-2 h-2 rounded-full ${c.dot}`} />
        <span className={`text-xs font-semibold uppercase tracking-wider ${c.text}`}>{label}</span>
      </div>
      <p className="text-sm text-zinc-300 leading-relaxed">{message}</p>
    </div>
  )
}
