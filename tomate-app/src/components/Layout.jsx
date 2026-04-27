import BottomNav from './BottomNav'

export default function Layout({ children, title, action, eyebrow }) {
  return (
    <div className="flex flex-col min-h-full bg-surface">
      {(title || eyebrow) && (
        <header className="px-5 pt-12 pb-4">
          <div className="flex items-start justify-between">
            <div>
              {eyebrow && (
                <p className="text-[10px] font-semibold uppercase tracking-widest-x text-brand-500 mb-1">
                  {eyebrow}
                </p>
              )}
              {title && (
                <h1 className="text-2xl font-black text-white tracking-tight leading-none">
                  {title}
                </h1>
              )}
            </div>
            {action && <div className="pt-1">{action}</div>}
          </div>
        </header>
      )}
      <main className="flex-1 px-5 pb-24 page-enter">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
