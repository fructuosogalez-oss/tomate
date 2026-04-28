export default function StatCard({ label, value, unit, sub, className = '' }) {
  return (
    <div className={`bg-surface-card border border-surface-border p-4 ${className}`}>
      <p className="text-xs font-bold uppercase tracking-widest-x text-zinc-500 mb-2">{label}</p>
      <div className="flex items-baseline gap-1.5">
        <p className="text-3xl font-black text-white tabular-nums leading-none">
          {value ?? '—'}
        </p>
        {unit && (
          <span className="text-xs font-bold uppercase tracking-wider-x text-zinc-500">
            {unit}
          </span>
        )}
      </div>
      {sub && <p className="text-xs uppercase tracking-wider-x text-zinc-500 mt-2 truncate">{sub}</p>}
    </div>
  )
}
