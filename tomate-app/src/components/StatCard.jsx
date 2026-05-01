/**
 * StatTile — eyebrow label, big mono number, optional unit, optional sub line.
 * Matches Gym IA spec — used in 2x2 grid on Home.
 */
export default function StatCard({ label, value, unit, sub, accent = false, progress = null, className = '' }) {
  return (
    <div className={`bg-surface-card border border-surface-line-soft rounded-[20px] p-[18px] ${className}`}>
      <p className={`font-mono text-[10px] uppercase tracking-eyebrow ${accent ? 'text-accent' : 'text-ink-3'} mb-3`}>
        {label}
      </p>
      <div className="flex items-baseline gap-2">
        <p className={`font-mono text-[32px] font-medium tabular-nums leading-none tracking-display ${accent ? 'text-accent' : 'text-ink'}`}>
          {value ?? '—'}
        </p>
        {unit && (
          <span className="font-mono text-[11px] uppercase tracking-eyebrow text-ink-3">
            {unit}
          </span>
        )}
      </div>
      {sub && (
        <p className="font-mono text-[10px] uppercase tracking-eyebrow text-ink-3 mt-3 truncate">
          {sub}
        </p>
      )}
      {progress != null && (
        <div className="mt-3 h-0.5 bg-surface-line rounded-full overflow-hidden">
          <div
            className="h-full bg-accent transition-all"
            style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          />
        </div>
      )}
    </div>
  )
}
