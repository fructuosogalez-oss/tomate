const COLOR_MAP = {
  brand:  { bar: 'bg-brand-500',  text: 'text-brand-500',  bg: 'bg-surface-card' },
  yellow: { bar: 'bg-yellow-500', text: 'text-yellow-400', bg: 'bg-surface-card' },
  red:    { bar: 'bg-red-500',    text: 'text-red-400',    bg: 'bg-surface-card' },
  gray:   { bar: 'bg-zinc-600',   text: 'text-zinc-400',   bg: 'bg-surface-card' },
}

export default function CoachCard({ label, message, color = 'brand', className = '' }) {
  const c = COLOR_MAP[color] || COLOR_MAP.brand

  return (
    <div className={`relative ${c.bg} border border-surface-border overflow-hidden ${className}`}>
      <span className={`absolute left-0 top-0 bottom-0 w-1 ${c.bar}`} />
      <div className="pl-5 pr-4 py-4">
        <p className={`text-[10px] font-bold uppercase tracking-widest-x ${c.text} mb-1.5`}>
          {label}
        </p>
        <p className="text-sm text-white leading-snug font-medium">{message}</p>
      </div>
    </div>
  )
}
