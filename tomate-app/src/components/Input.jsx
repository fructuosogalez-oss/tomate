export default function Input({ label, className = '', ...props }) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-xs text-zinc-400 mb-1.5 font-medium">{label}</label>
      )}
      <input
        className="w-full bg-surface-raised border border-surface-border rounded-xl px-3 py-3 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-brand-500 transition-colors"
        {...props}
      />
    </div>
  )
}

export function Select({ label, children, className = '', ...props }) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-xs text-zinc-400 mb-1.5 font-medium">{label}</label>
      )}
      <select
        className="w-full bg-surface-raised border border-surface-border rounded-xl px-3 py-3 text-white text-sm focus:outline-none focus:border-brand-500 transition-colors appearance-none"
        {...props}
      >
        {children}
      </select>
    </div>
  )
}
