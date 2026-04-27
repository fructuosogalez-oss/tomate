export default function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  const base = 'font-bold transition-all active:scale-[0.97] flex items-center justify-center gap-2 disabled:opacity-30 uppercase tracking-wider-x'
  const sizes = {
    sm: 'px-3 py-2 text-[11px] rounded-lg',
    md: 'px-4 py-3 text-xs rounded-lg',
    lg: 'px-5 py-4 text-sm rounded-lg',
  }
  const variants = {
    primary:   'bg-brand-500 text-white hover:bg-brand-600 shadow-lg shadow-brand-500/30',
    secondary: 'bg-surface-raised text-white border border-surface-border hover:border-zinc-600',
    danger:    'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20',
    ghost:     'text-zinc-300 hover:text-white hover:bg-surface-raised',
    outline:   'bg-transparent text-white border border-white hover:bg-white hover:text-black',
  }
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}
