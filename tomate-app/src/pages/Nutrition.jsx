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

  const filteredQuick = QUICK_MEALS.filter((m) => !quickFilter || m.name.toLowerCase().includes(quickFilter.toLowerCase()))

  return (
    <Layout
      eyebrow="Fuel"
      title="Nutrition."
      action={
        <button
          onClick={() => setShowAdd(true)}
          className="w-9 h-9 rounded-md bg-surface-elev border border-surface-line-soft flex items-center justify-center text-ink-2 hover:text-ink"
        >
          <Plus size={16} />
        </button>
      }
    >
      <input
        type="date"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
        className="w-full bg-surface-elev border border-surface-line-soft rounded-md px-3.5 py-3 text-ink text-[14px] focus:outline-none focus:border-accent mb-4 font-mono tabular-nums"
      />

      <div className="bg-surface-card border border-surface-line-soft rounded-[20px] p-5 mb-4">
        <div className="grid grid-cols-2 gap-5 mb-4">
          <MacroBar
            label="Calories"
            current={calories}
            target={targets.calories}
            pct={calPct}
            color="#FF2D2D"
            icon={<Flame size={12} className="text-accent" />}
          />
          <MacroBar
            label="Protein"
            current={`${protein}g`}
            target={`${targets.protein}g`}
            pct={protPct}
            color="#FF2D2D"
            icon={<Beef size={12} className="text-accent" />}
          />
        </div>

        {calories > 0 && (
          <p className="font-mono text-[10px] uppercase tracking-eyebrow text-ink-3 leading-relaxed bg-surface-elev rounded-md px-3 py-2.5">
            {calPct >= 100
              ? `Target hit. ${protPct < 80 ? `${targets.protein - protein}g protein left.` : 'Solid day.'}`
              : `${targets.calories - calories} kcal left · ${Math.max(0, targets.protein - protein)}g protein`}
          </p>
        )}
      </div>

      {meals.length > 0 ? (
        <div>
          <p className="font-mono text-[10px] uppercase tracking-eyebrow text-ink-3 mb-3">Meals</p>
          <div className="space-y-2">
            {meals.map((m) => (
              <div key={m.id} className="bg-surface-card border border-surface-line-soft rounded-[14px] px-4 py-3 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-ink text-[14px] font-medium truncate">{m.name}</p>
                  <p className="font-mono text-[11px] tabular-nums text-ink-3 mt-0.5">
                    {m.calories} kcal · {m.protein}g protein
                  </p>
                </div>
                <button onClick={() => removeMeal(selectedDate, m.id)} className="text-ink-3 hover:text-accent p-2">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-10">
          <p className="text-ink-2 text-[14px]">No meals logged for this day.</p>
          <button onClick={() => setShowAdd(true)} className="font-mono text-[11px] uppercase tracking-eyebrow text-accent mt-2">+ Add meal</button>
        </div>
      )}

      {showAdd && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-end" onClick={() => setShowAdd(false)}>
          <div className="bg-surface-raised border-t border-surface-line w-full max-w-[480px] mx-auto rounded-t-[28px] p-5 max-h-[88vh] overflow-y-auto" style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))' }} onClick={(e) => e.stopPropagation()}>
            <p className="font-mono text-[10px] uppercase tracking-eyebrow text-accent mb-2">Add</p>
            <h2 className="font-display text-[28px] italic text-ink leading-none tracking-display mb-5">Meal.</h2>

            <div className="space-y-3 mb-5">
              <Input label="Meal Name" placeholder="e.g. Grilled chicken" value={form.name} onChange={(e) => set('name', e.target.value)} />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Calories · kcal" type="number" inputMode="numeric" placeholder="400" value={form.calories} onChange={(e) => set('calories', e.target.value)} />
                <Input label="Protein · g"     type="number" inputMode="numeric" placeholder="35"  value={form.protein}  onChange={(e) => set('protein', e.target.value)} />
              </div>
              <Button className="w-full" onClick={() => saveMeal(form)} disabled={!form.name}>Add Meal</Button>
            </div>

            <div className="border-t border-surface-line-soft pt-4">
              <p className="font-mono text-[10px] uppercase tracking-eyebrow text-ink-3 mb-3">Quick Add</p>
              <input
                className="w-full bg-surface-elev border border-surface-line-soft rounded-md px-3.5 py-3 text-ink text-[14px] placeholder:text-ink-4 focus:outline-none focus:border-accent mb-3"
                placeholder="Search foods…"
                value={quickFilter}
                onChange={(e) => setQuickFilter(e.target.value)}
              />
              <div className="space-y-2">
                {filteredQuick.map((m, i) => (
                  <button
                    key={i}
                    onClick={() => saveMeal(m)}
                    className="w-full bg-surface-elev border border-surface-line-soft hover:bg-surface-card rounded-md px-4 py-3 flex items-center justify-between text-left transition-colors"
                  >
                    <span className="text-ink text-[13px]">{m.name}</span>
                    <span className="font-mono text-[11px] tabular-nums text-ink-3">{m.calories} kcal · {m.protein}g</span>
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
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        {icon}
        <span className="font-mono text-[10px] uppercase tracking-eyebrow text-ink-3">{label}</span>
      </div>
      <p className="font-mono text-[24px] tabular-nums text-ink leading-none">{current}</p>
      <p className="font-mono text-[10px] tabular-nums text-ink-3 mt-1">/ {target}</p>
      <div className="h-1 bg-surface-line rounded-full mt-2 overflow-hidden">
        <div className="h-full transition-all" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  )
}
