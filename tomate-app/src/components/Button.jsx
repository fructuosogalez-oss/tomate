export default function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  const base = 'font-medium rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-40'
  const sizes = {
    sm: 'px-3 py-2 text-xs',
    md: 'px-4 py-3 text-sm',
    lg: 'px-5 py-3.5 text-base',
  }
  const variants = {
    primary:   'bg-brand-500 text-white hover:bg-brand-600 shadow-md shadow-brand-500/20',
    secondary: 'bg-surface-raised text-zinc-300 border border-surface-border hover:border-zinc-600 hover:text-white',
    danger:    'bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20',
    ghost:     'text-zinc-400 hover:text-white hover:bg-surface-raised',
  }
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}
