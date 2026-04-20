import BottomNav from './BottomNav'

export default function Layout({ children, title, action }) {
  return (
    <div className="flex flex-col min-h-full">
      {title && (
        <header className="flex items-center justify-between px-4 pt-12 pb-4">
          <h1 className="text-xl font-semibold text-white tracking-tight">{title}</h1>
          {action && <div>{action}</div>}
        </header>
      )}
      <main className="flex-1 px-4 pb-24 page-enter">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
