export default function Input({ label, hint, className = '', ...props }) {
  return (
    <div className={className}>
      {label && (
        <label className="block font-mono text-[10px] uppercase tracking-eyebrow text-ink-3 mb-2">
          {label}
        </label>
      )}
      <input
        className="w-full bg-surface-elev border border-surface-line-soft rounded-md px-3.5 py-3.5 text-ink text-[15px] placeholder:text-ink-4 focus:outline-none focus:border-accent transition-colors"
        {...props}
      />
      {hint && <p className="text-[11px] text-ink-3 mt-1.5">{hint}</p>}
    </div>
  )
}

export function Select({ label, children, className = '', ...props }) {
  return (
    <div className={className}>
      {label && (
        <label className="block font-mono text-[10px] uppercase tracking-eyebrow text-ink-3 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          className="w-full bg-surface-elev border border-surface-line-soft rounded-md px-3.5 py-3.5 pr-9 text-ink text-[15px] focus:outline-none focus:border-accent transition-colors appearance-none"
          {...props}
        >
          {children}
        </select>
        <svg
          className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-3 pointer-events-none"
          width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
    </div>
  )
}
