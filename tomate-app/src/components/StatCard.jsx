export default function StatCard({ label, value, unit, sub, className = '' }) {
  return (
    <div className={`bg-surface-card rounded-2xl p-4 ${className}`}>
      <p className="text-xs text-zinc-500 mb-1">{label}</p>
      <p className="text-2xl font-bold text-white">
        {value ?? '—'}
        {unit && <span className="text-sm font-normal text-zinc-400 ml-1">{unit}</span>}
      </p>
      {sub && <p className="text-xs text-zinc-500 mt-0.5">{sub}</p>}
    </div>
  )
}
