export default function Input({ label, className = '', ...props }) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-[10px] font-bold uppercase tracking-widest-x text-zinc-500 mb-1.5">
          {label}
        </label>
      )}
      <input
        className="w-full bg-surface-raised border border-surface-border rounded-sm px-3 py-3 text-white text-sm placeholder:text-zinc-700 focus:outline-none focus:border-brand-500 transition-colors"
        {...props}
      />
    </div>
  )
}

export function Select({ label, children, className = '', ...props }) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-[10px] font-bold uppercase tracking-widest-x text-zinc-500 mb-1.5">
          {label}
        </label>
      )}
      <select
        className="w-full bg-surface-raised border border-surface-border rounded-sm px-3 py-3 text-white text-sm focus:outline-none focus:border-brand-500 transition-colors appearance-none"
        {...props}
      >
        {children}
      </select>
    </div>
  )
}
