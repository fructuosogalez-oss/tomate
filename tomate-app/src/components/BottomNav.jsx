import { NavLink, useLocation } from 'react-router-dom'

const tabs = [
  { to: '/',          label: 'Today' },
  { to: '/workout',   label: 'Train' },
  { to: '/progress',  label: 'Stats' },
  { to: '/settings',  label: 'You'   },
]

export default function BottomNav() {
  const { pathname } = useLocation()

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-50 flex"
      style={{
        background: 'linear-gradient(180deg, rgba(10,10,11,0) 0%, rgba(10,10,11,1) 30%)',
        paddingBottom: 'env(safe-area-inset-bottom)',
        paddingTop: '14px',
      }}
    >
      {tabs.map(({ to, label }) => {
        const isActive = to === '/' ? pathname === '/' : pathname.startsWith(to)
        return (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className="flex-1 flex flex-col items-center justify-center pt-2 pb-3 gap-1.5 group"
          >
            <span
              className={`block w-1.5 h-1.5 rounded-full ${isActive ? 'bg-accent' : 'bg-surface-line'}`}
              style={{ transition: 'background 150ms ease' }}
            />
            <span
              className={`font-mono text-[10px] uppercase tracking-eyebrow ${
                isActive ? 'text-ink' : 'text-ink-3'
              }`}
            >
              {label}
            </span>
          </NavLink>
        )
      })}
    </nav>
  )
}
