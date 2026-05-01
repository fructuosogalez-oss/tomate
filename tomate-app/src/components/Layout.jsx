import BottomNav from './BottomNav'

/**
 * Layout — full-bleed dark canvas with optional eyebrow + display headline.
 * Use eyebrow + title together for the standard page header (e.g. "Today." with a date eyebrow).
 */
export default function Layout({ children, eyebrow, title, action, hideNav = false }) {
  return (
    <div className="flex flex-col min-h-full bg-surface">
      {(eyebrow || title || action) && (
        <header className="px-5 pt-12 pb-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              {eyebrow && (
                <p className="font-mono text-[10px] uppercase tracking-eyebrow text-ink-3 mb-3 truncate">
                  {eyebrow}
                </p>
              )}
              {title && (
                <h1 className="font-display text-display-3 text-ink leading-none">
                  {title}
                </h1>
              )}
            </div>
            {action && <div className="pt-1 shrink-0">{action}</div>}
          </div>
        </header>
      )}
      <main className="flex-1 px-5 pb-32 page-enter">
        {children}
      </main>
      {!hideNav && <BottomNav />}
    </div>
  )
}
