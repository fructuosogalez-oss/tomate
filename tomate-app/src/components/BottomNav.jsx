import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Dumbbell, Scale, Utensils, TrendingUp } from 'lucide-react'

const tabs = [
  { to: '/',          icon: LayoutDashboard, label: 'Home'      },
  { to: '/workout',   icon: Dumbbell,        label: 'Workout'   },
  { to: '/body',      icon: Scale,           label: 'Body'      },
  { to: '/nutrition', icon: Utensils,        label: 'Fuel'      },
  { to: '/progress',  icon: TrendingUp,      label: 'Progress'  },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-50 bg-black/95 backdrop-blur border-t border-surface-border flex">
      {tabs.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center py-2.5 gap-1 text-[9px] font-bold uppercase tracking-wider-x transition-colors relative ${
              isActive ? 'text-white' : 'text-zinc-600'
            }`
          }
        >
          {({ isActive }) => (
            <>
              {isActive && <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-brand-500" />}
              <Icon size={18} strokeWidth={isActive ? 2.4 : 1.8} />
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
