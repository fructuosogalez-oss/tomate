import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Dumbbell, Scale, Utensils, TrendingUp } from 'lucide-react'

const tabs = [
  { to: '/',          icon: LayoutDashboard, label: 'Home'      },
  { to: '/workout',   icon: Dumbbell,        label: 'Workout'   },
  { to: '/body',      icon: Scale,           label: 'Body'      },
  { to: '/nutrition', icon: Utensils,        label: 'Nutrition' },
  { to: '/progress',  icon: TrendingUp,      label: 'Progress'  },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] z-50 bg-surface-card border-t border-surface-border flex">
      {tabs.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          end
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-[10px] font-medium transition-colors ${
              isActive ? 'text-brand-400' : 'text-zinc-500'
            }`
          }
        >
          <Icon size={20} strokeWidth={1.8} />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
