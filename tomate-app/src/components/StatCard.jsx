export default function StatCard({ label, value, unit, sub, className = '' }) {
  return (
    <div className={`bg-surface-card border border-surface-border p-4 ${className}`}>
      <p className="text-[9px] font-bold uppercase tracking-widest-x text-zinc-500 mb-2">{label}</p>
      <div className="flex items-baseline gap-1">
        <p className="text-3xl font-black text-white tabular-nums leading-none">
          {value ?? '—'}
        </p>
        {unit && (
          <span className="text-[10px] font-semibold uppercase tracking-wider-x text-zinc-500">
            {unit}
          </span>
        )}
      </div>
      {sub && <p className="text-[10px] uppercase tracking-wider-x text-zinc-600 mt-2">{sub}</p>}
    </div>
  )
}
