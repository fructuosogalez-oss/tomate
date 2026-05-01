/**
 * Button variants matching the Gym IA design language:
 * - primary: solid red, mono uppercase, glow shadow
 * - secondary: bg-elev with hairline, used for chips/secondary actions
 * - ghost: transparent, line border (sign-out style)
 * - outline: pill, bg-elev, used for inline actions
 */
export default function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
  const base = 'font-mono uppercase tracking-eyebrow-2 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-30 select-none'
  const sizes = {
    sm: 'px-3 py-2.5 text-[11px] rounded-md',
    md: 'px-4 py-3.5 text-[12px] rounded-lg',
    lg: 'px-5 py-5 text-[13px] rounded-[20px] font-medium',
    xl: 'px-6 py-6 text-[14px] rounded-[20px] font-medium',
  }
  const variants = {
    primary:   'bg-accent text-white shadow-[0_12px_32px_-8px_rgba(255,45,45,0.4)] hover:bg-accent-dim',
    secondary: 'bg-surface-elev text-ink border border-surface-line-soft hover:bg-surface-card',
    ghost:     'bg-transparent text-ink border border-surface-line hover:bg-surface-elev',
    outline:   'bg-surface-elev text-ink-2 border border-surface-line-soft rounded-pill hover:text-ink',
    accent:    'bg-accent-soft text-accent border border-accent-line hover:bg-accent/20',
  }
  return (
    <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}
