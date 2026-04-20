import { useState } from 'react'
import { Plus, Trash2, Flame, Beef } from 'lucide-react'
import Layout from '../components/Layout'
import Button from '../components/Button'
import Input from '../components/Input'
import { useStore } from '../store/useStore'
import { calcTargets } from '../utils/coach'

function nanoid() { return Math.random().toString(36).slice(2, 10) }
const today = () => new Date().toISOString().slice(0, 10)

const QUICK_MEALS = [
  { name: 'Chicken breast 200g',   calories: 330, protein: 62 },
  { name: 'Eggs × 3',              calories: 225, protein: 18 },
  { name: 'Greek yogurt 200g',     calories: 130, protein: 20 },
  { name: 'Rice 100g (dry)',       calories: 360, protein: 7  },
  { name: 'Oats 80g',              calories: 300, protein: 10 },
  { name: 'Protein shake',         calories: 160, protein: 30 },
  { name: 'Salmon 150g',           calories: 280, protein: 42 },
  { name: 'Tuna can 150g',         calories: 175, protein: 38 },
  { name: 'Cottage cheese 200g',   calories: 160, protein: 28 },
  { name: 'Banana',                calories: 105, protein: 1  },
  { name: 'Sweet potato 200g',     calories: 180, protein: 4  },
  { name: 'Mixed nuts 30g',        calories: 180, protein: 5  },
]

export default function Nutrition() {
  const { nutritionLogs, addMeal, removeMeal, profile } = useStore()
  const [showAdd, setShowAdd] = useState(false)
  const [selectedDate, setSelectedDate] = useState(today())
  const [form, setForm] = useState({ name: '', calories: '', protein: '' })
  const [quickFilter, setQuickFilter] = useState('')

  const targets = calcTargets(profile)
  const dayData = nutritionLogs[selectedDate] || { calories: 0, protein: 0, meals: [] }
  const { calories, protein, meals = [] } = dayData

  const calPct  = Math.min(100, Math.round((calories / targets.calories) * 100))
  const protPct = Math.min(100, Math.round((protein  / targets.protein)  * 100))

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const saveMeal = (meal) => {
    addMeal(selectedDate, { id: nanoid(), ...meal, calories: Number(meal.calories) || 0, protein: Number(meal.protein) || 0 })
    setForm({ name: '', calories: '', protein: '' })
    setShowAdd(false)
  }

  const filteredQuick = QUICK_MEALS.filter((m) =>
    !quickFilter || m.name.toLowerCase().includes(quickFilter.toLowerCase())
  )

  return (
    <Layout
      title="Nutrition"
      action={
        <Button variant="ghost" size="sm" onClick={() => setShowAdd(true)}>
          <Plus size={16} /> Add Meal
        </Button>
      }
    >
      {/* Date selector */}
      <input
        type="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
        className="w-full bg-surface-card border border-surface-border rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-brand-500 mb-4"
      />

      {/* Macros ring summary */}
      <div className="bg-surface-card rounded-2xl p-4 mb-4">
        <div className="flex justify-between mb-4">
          <MacroBar
            label="Calories"
            current={calories}
            target={targets.calories}
            pct={calPct}
            color="bg-orange-500"
            icon={<Flame size={14} className="text-orange-400" />}
          />
          <MacroBar
            label="Protein"
            current={`${protein}g`}
            target={`${targets.protein}g`}
            pct={protPct}
            color="bg-brand-500"
            icon={<Beef size={14} className="text-brand-400" />}
          />
        </div>

        {/* Coach feedback */}
        {calories > 0 && (
          <p className="text-xs text-zinc-400 bg-surface-raised rounded-xl px-3 py-2">
            {calPct >= 100
              ? `You've hit your calorie target. ${protPct < 80 ? 'Keep pushing on protein.' : 'Great job today!'}`
              : calPct >= 70
              ? `${targets.calories - calories} kcal left. ${protPct < 80 ? `Still need ${targets.protein - protein}g protein.` : 'Protein looking good!'}`
              : `${targets.calories - calories} kcal remaining. Make sure to hit your protein first.`}
          </p>
        )}
      </div>

      {/* Meals list */}
      {meals.length > 0 ? (
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Meals</p>
          <div className="space-y-2">
            {meals.map((m) => (
              <div key={m.id} className="bg-surface-card rounded-xl px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">{m.name}</p>
                  <p className="text-xs text-zinc-500">{m.calories} kcal · {m.protein}g protein</p>
                </div>
                <button onClick={() => removeMeal(selectedDate, m.id)} className="text-zinc-600 hover:text-red-400 p-1">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-zinc-500 text-sm">No meals logged for this day.</p>
          <button onClick={() => setShowAdd(true)} className="text-brand-400 text-sm mt-1">+ Add your first meal</button>
        </div>
      )}

      {/* Add meal sheet */}
      {showAdd && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end justify-center" onClick={() => setShowAdd(false)}>
          <div className="bg-surface-card w-full max-w-[480px] rounded-t-2xl p-5 pb-10 max-h-[85vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-base font-semibold text-white mb-4">Add Meal</h2>

            {/* Custom form */}
            <div className="space-y-3 mb-4">
              <Input
                label="Meal Name"
                placeholder="e.g. Grilled chicken"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
              />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Calories (kcal)" type="number" inputMode="numeric" placeholder="400" value={form.calories} onChange={(e) => set('calories', e.target.value)} />
                <Input label="Protein (g)" type="number" inputMode="numeric" placeholder="35" value={form.protein} onChange={(e) => set('protein', e.target.value)} />
              </div>
              <Button className="w-full" onClick={() => saveMeal(form)} disabled={!form.name}>Add Meal</Button>
            </div>

            <div className="border-t border-surface-border pt-4">
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Quick Add</p>
              <input
                className="w-full bg-surface-raised border border-surface-border rounded-xl px-3 py-2 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-brand-500 mb-3"
                placeholder="Search foods..."
                value={quickFilter}
                onChange={(e) => setQuickFilter(e.target.value)}
              />
              <div className="space-y-2">
                {filteredQuick.map((m, i) => (
                  <button
                    key={i}
                    onClick={() => saveMeal(m)}
                    className="w-full bg-surface-raised hover:bg-surface-border rounded-xl px-4 py-3 flex items-center justify-between text-left transition-colors"
                  >
                    <span className="text-sm text-white">{m.name}</span>
                    <span className="text-xs text-zinc-500">{m.calories} kcal · {m.protein}g</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

function MacroBar({ label, current, target, pct, color, icon }) {
  return (
    <div className="flex-1 mr-4 last:mr-0">
      <div className="flex items-center gap-1.5 mb-1">
        {icon}
        <span className="text-xs text-zinc-500">{label}</span>
      </div>
      <p className="text-xl font-bold text-white mb-1">{current}</p>
      <p className="text-xs text-zinc-500 mb-2">/ {target}</p>
      <div className="h-2 bg-surface-raised rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <p className="text-[10px] text-zinc-600 mt-1">{pct}%</p>
    </div>
  )
}
