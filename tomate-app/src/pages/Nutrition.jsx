import { useState, useMemo, useEffect, useRef } from 'react'
import { Plus, Trash2, Flame, Beef, X, Search, Minus, Clock, Mic, Sparkles, Loader2 } from 'lucide-react'
import Layout from '../components/Layout'
import Button from '../components/Button'
import Input from '../components/Input'
import VoiceFoodLog from '../components/VoiceFoodLog'
import { useStore } from '../store/useStore'
import { calcTargets } from '../utils/coach'
import { FOODS, searchFoods, macrosFor } from '../utils/foods'
import { estimateMacros } from '../utils/voice'

import { todayLocal as today } from '../utils/date'
function nanoid() { return Math.random().toString(36).slice(2, 10) }
const FOOD_BY_ID = Object.fromEntries(FOODS.map((f) => [f.id, f]))

export default function Nutrition() {
  const { nutritionLogs, addMeal, removeMeal, profile, recentFoods = [], voice } = useStore()
  const [selectedDate, setSelectedDate] = useState(today())
  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [selectedFood, setSelectedFood] = useState(null)  // food + grams editable
  const [showCustom, setShowCustom] = useState(false)
  const [estimating, setEstimating] = useState(false)
  const [estimateError, setEstimateError] = useState('')
  const [estimated, setEstimated] = useState(false)
  const autoRunRef = useRef(false)
  const [showVoice, setShowVoice]   = useState(false)
  const [customForm, setCustomForm] = useState({ name: '', portion: '', calories: '', protein: '', carbs: '', fat: '' })

  const voiceReady = voice?.claudeKey  // mic only needs Claude — TTS confirmation is optional

  // Debounce query so the list doesn't flicker on every keystroke
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 120)
    return () => clearTimeout(t)
  }, [query])

  const targets = calcTargets(profile)
  const day = nutritionLogs[selectedDate] || { calories: 0, protein: 0, carbs: 0, fat: 0, meals: [] }
  const { calories, protein, carbs = 0, fat = 0, meals = [] } = day
  const calPct  = Math.min(100, Math.round((calories / targets.calories) * 100))
  const protPct = Math.min(100, Math.round((protein  / targets.protein)  * 100))

  // Search results
  const results = useMemo(() => {
    if (!debouncedQuery) return []
    return searchFoods(debouncedQuery, 20)
  }, [debouncedQuery])

  // Recent foods (when no query)
  const recentFoodList = useMemo(() => {
    return recentFoods
      .map((r) => ({ ...FOOD_BY_ID[r.foodId], lastGrams: r.grams }))
      .filter((f) => f && f.id)
      .slice(0, 8)
  }, [recentFoods])

  const openPortionSheet = (food, presetGrams) => {
    setSelectedFood({
      ...food,
      grams: presetGrams ?? food.defaultGrams ?? 100,
    })
  }

  const logFood = () => {
    if (!selectedFood) return
    const m = macrosFor(selectedFood, selectedFood.grams)
    addMeal(selectedDate, {
      id: nanoid(),
      foodId: selectedFood.id,
      name: nameWithPortion(selectedFood, selectedFood.grams),
      grams: selectedFood.grams,
      calories: m.kcal,
      protein:  m.p,
      carbs:    m.c,
      fat:      m.f,
    })
    setSelectedFood(null)
    setQuery('')
  }

  const logFoodsFromVoice = (parsed) => {
    for (const f of parsed) {
      addMeal(selectedDate, {
        id: nanoid(),
        name: f.portion ? `${f.name} · ${f.portion}` : f.name,
        grams: f.grams,
        calories: f.kcal,
        protein:  f.protein,
        carbs:    f.carbs,
        fat:      f.fat,
      })
    }
  }

  const logCustom = () => {
    if (!customForm.name.trim()) return
    const fullName = customForm.portion.trim()
      ? `${customForm.name.trim()} · ${customForm.portion.trim()}`
      : customForm.name.trim()
    addMeal(selectedDate, {
      id: nanoid(),
      name: fullName,
      calories: Number(customForm.calories) || 0,
      protein:  Number(customForm.protein)  || 0,
      carbs:    Number(customForm.carbs)    || 0,
      fat:      Number(customForm.fat)      || 0,
    })
    setCustomForm({ name: '', portion: '', calories: '', protein: '', carbs: '', fat: '' })
    setShowCustom(false)
    setEstimated(false); setEstimateError(''); autoRunRef.current = false
  }

  const closeCustom = () => {
    setShowCustom(false)
    setEstimated(false); setEstimateError(''); autoRunRef.current = false
    setCustomForm({ name: '', portion: '', calories: '', protein: '', carbs: '', fat: '' })
  }

  const runEstimate = async () => {
    if (!customForm.name.trim()) return
    if (!voice?.claudeKey) {
      setEstimateError('Falta tu Claude API key. Configúrala en Settings → Voice Coach.')
      return
    }
    setEstimating(true)
    setEstimateError('')
    try {
      const result = await estimateMacros({
        apiKey: voice.claudeKey,
        name: customForm.name,
        portion: customForm.portion,
        language: voice.sttLang || 'es-MX',
        model: voice.claudeModel,
      })
      if (!result) {
        setEstimateError('No pude estimar. Llena los macros manualmente.')
      } else {
        setCustomForm((c) => ({
          ...c,
          // Update portion only if user didn't enter one
          portion:  c.portion || result.portion || '',
          calories: String(result.kcal),
          protein:  String(result.protein),
          carbs:    String(result.carbs),
          fat:      String(result.fat),
        }))
        setEstimated(true)
      }
    } catch (e) {
      setEstimateError(e.message || 'Falló la estimación')
    } finally {
      setEstimating(false)
    }
  }

  // When the sheet opens with a pre-filled name (from "+ Add «xxx»" in search),
  // auto-run Claude estimate once.
  useEffect(() => {
    if (!showCustom) return
    if (autoRunRef.current) return
    if (!customForm.name.trim()) return
    if (!voice?.claudeKey) return
    autoRunRef.current = true
    runEstimate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showCustom])

  return (
    <Layout
      eyebrow="Fuel"
      title="Nutrition."
      action={
        <button
          onClick={() => setShowCustom(true)}
          className="w-9 h-9 rounded-md bg-surface-elev border border-surface-line-soft flex items-center justify-center text-ink-2 hover:text-ink"
          title="Add custom food"
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

      {/* Day Summary — big + clear */}
      <DaySummary
        calories={calories}
        protein={protein}
        carbs={carbs}
        fat={fat}
        targets={targets}
        mealCount={meals.length}
      />

      {/* Quick Log search */}
      <div className="mb-4">
        <p className="font-mono text-[10px] uppercase tracking-eyebrow text-accent mb-2">● Quick Log</p>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3 pointer-events-none" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="What did you eat? · ¿Qué comiste?"
              className="w-full bg-surface-elev border border-surface-line-soft rounded-md pl-9 pr-9 py-3.5 text-ink text-[15px] placeholder:text-ink-4 focus:outline-none focus:border-accent"
            />
            {query && (
              <button onClick={() => setQuery('')} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-ink-3 hover:text-ink">
                <X size={14} />
              </button>
            )}
          </div>
          <button
            onClick={() => {
              if (!voiceReady) {
                alert('Activa Voice Coach en Settings y pega tu Claude API key.')
                return
              }
              setShowVoice(true)
            }}
            title="Voice log"
            className={`shrink-0 w-[52px] rounded-md flex items-center justify-center transition-colors ${
              voiceReady ? 'bg-accent text-white shadow-[0_8px_20px_-6px_rgba(255,45,45,0.5)] active:scale-95' : 'bg-surface-elev text-ink-3 border border-surface-line-soft'
            }`}
          >
            <Mic size={18} strokeWidth={2.2} />
          </button>
        </div>
        {!voiceReady && (
          <p className="font-mono text-[9px] uppercase tracking-eyebrow text-ink-3 mt-2">
            Mic disabled · configure in Settings → Voice Coach
          </p>
        )}
      </div>

      {/* Results / recent */}
      {query.trim() ? (
        <div className="space-y-1.5 mb-5">
          {results.length === 0 ? (
            <p className="font-mono text-[11px] text-ink-3 text-center py-4">
              No matches. Try a different word, or add it custom.
            </p>
          ) : (
            results.map((f) => (
              <FoodRow key={f.id} food={f} onClick={() => openPortionSheet(f)} />
            ))
          )}
          <button
            onClick={() => { setCustomForm((c) => ({ ...c, name: query })); setShowCustom(true) }}
            className="w-full text-left bg-surface-elev border border-dashed border-surface-line rounded-md px-4 py-3 text-ink-2 hover:text-accent hover:border-accent-line"
          >
            <span className="font-mono text-[10px] uppercase tracking-eyebrow text-ink-3 mr-2">+ Add</span>
            <span className="text-[13px]">"{query}" as custom</span>
          </button>
        </div>
      ) : recentFoodList.length > 0 ? (
        <div className="mb-5">
          <p className="font-mono text-[10px] uppercase tracking-eyebrow text-ink-3 mb-2 flex items-center gap-1.5">
            <Clock size={10} /> Recent
          </p>
          <div className="space-y-1.5">
            {recentFoodList.map((f) => (
              <FoodRow key={f.id} food={f} portion={f.lastGrams} onClick={() => openPortionSheet(f, f.lastGrams)} />
            ))}
          </div>
        </div>
      ) : null}

      {/* Today's meals */}
      <div className="mb-5">
        <p className="font-mono text-[10px] uppercase tracking-eyebrow text-ink-3 mb-3">Today's Meals</p>
        {meals.length === 0 ? (
          <p className="font-mono text-[11px] text-ink-3 text-center py-4">No meals yet. Search above.</p>
        ) : (
          <div className="space-y-2">
            {meals.map((m) => (
              <div key={m.id} className="bg-surface-card border border-surface-line-soft rounded-[14px] px-4 py-3 flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-ink text-[14px] font-medium truncate">{m.name}</p>
                  <p className="font-mono text-[11px] tabular-nums text-ink-3 mt-0.5">
                    {m.calories} kcal · {m.protein}p · {Math.round(m.carbs || 0)}c · {Math.round(m.fat || 0)}f
                  </p>
                </div>
                <button onClick={() => removeMeal(selectedDate, m.id)} className="text-ink-3 hover:text-accent p-2">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Portion sheet */}
      {selectedFood && (
        <PortionSheet
          food={selectedFood}
          onChangeGrams={(g) => setSelectedFood((s) => ({ ...s, grams: g }))}
          onClose={() => setSelectedFood(null)}
          onLog={logFood}
        />
      )}

      {/* Voice food log overlay */}
      {showVoice && (
        <VoiceFoodLog
          voice={voice}
          onLog={logFoodsFromVoice}
          onClose={() => setShowVoice(false)}
        />
      )}

      {/* Custom food sheet */}
      {showCustom && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-end" onClick={closeCustom}>
          <div className="bg-surface-raised border-t border-surface-line w-full max-w-[480px] mx-auto rounded-t-[28px] p-5 max-h-[90vh] overflow-y-auto" style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))' }} onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-1">
              <p className="font-mono text-[10px] uppercase tracking-eyebrow text-accent">Custom</p>
              <button onClick={closeCustom} className="p-2 -mr-2 -mt-1 text-ink-3 hover:text-ink"><X size={18} /></button>
            </div>
            <h2 className="font-display text-[28px] italic text-ink leading-none tracking-display mb-1">Add meal.</h2>
            <p className="font-mono text-[10px] uppercase tracking-eyebrow text-ink-3 mb-5">
              Type what you ate — Claude fills the macros for you.
            </p>

            <div className="space-y-3">
              <Input
                label="Name"
                placeholder="e.g. lasaña, pollo asado, ensalada cesar"
                value={customForm.name}
                onChange={(e) => setCustomForm((c) => ({ ...c, name: e.target.value }))}
              />
              <Input
                label="Portion (optional)"
                placeholder="1 plato · 200g · 1 rebanada"
                value={customForm.portion}
                onChange={(e) => setCustomForm((c) => ({ ...c, portion: e.target.value }))}
              />

              {/* Estimate button — primary action */}
              <button
                onClick={runEstimate}
                disabled={!customForm.name.trim() || estimating}
                className="w-full bg-accent text-white py-3.5 rounded-lg font-mono uppercase tracking-eyebrow-2 text-[12px] flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-30 shadow-[0_8px_20px_-6px_rgba(255,45,45,0.5)]"
              >
                {estimating ? (
                  <><Loader2 size={14} className="animate-spin" /> Estimating…</>
                ) : estimated ? (
                  <><Sparkles size={14} /> Re-estimate</>
                ) : (
                  <><Sparkles size={14} /> Estimate Macros with Claude</>
                )}
              </button>

              {estimateError && (
                <p className="font-mono text-[10px] text-warn text-center bg-warn/10 border border-warn/30 rounded-md p-2">
                  {estimateError}
                </p>
              )}

              {!voice?.claudeKey && (
                <p className="font-mono text-[10px] text-ink-3 text-center">
                  Tip: configure Claude in Settings → Voice Coach to skip macro research forever.
                </p>
              )}

              <div className="flex items-center gap-2 mt-2 mb-1">
                <span className="h-px bg-surface-line-soft flex-1" />
                <span className="font-mono text-[9px] uppercase tracking-eyebrow text-ink-3">{estimated ? 'Estimated · edit if needed' : 'Or fill manually'}</span>
                <span className="h-px bg-surface-line-soft flex-1" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Input label="Calories · kcal" type="number" inputMode="numeric" placeholder="400" value={customForm.calories} onChange={(e) => setCustomForm((c) => ({ ...c, calories: e.target.value }))} />
                <Input label="Protein · g" type="number" inputMode="numeric" placeholder="35" value={customForm.protein} onChange={(e) => setCustomForm((c) => ({ ...c, protein: e.target.value }))} />
                <Input label="Carbs · g"   type="number" inputMode="numeric" placeholder="40" value={customForm.carbs}   onChange={(e) => setCustomForm((c) => ({ ...c, carbs:   e.target.value }))} />
                <Input label="Fat · g"     type="number" inputMode="numeric" placeholder="15" value={customForm.fat}     onChange={(e) => setCustomForm((c) => ({ ...c, fat:     e.target.value }))} />
              </div>

              <Button size="lg" className="w-full mt-2" onClick={logCustom} disabled={!customForm.name.trim() || !customForm.calories}>
                Add Meal
              </Button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

// ─── Components ──────────────────────────────────────────────────────────
function FoodRow({ food, portion, onClick }) {
  const grams = portion ?? food.defaultGrams ?? 100
  const m = macrosFor(food, grams)
  const portionLabel = food.unit
    ? `${Math.round(grams / food.unitGrams)} ${food.unit} · ${grams}g`
    : `${grams}g`
  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-surface-card border border-surface-line-soft hover:bg-surface-elev rounded-md px-4 py-3 flex items-center gap-3 transition-colors"
    >
      {food.emoji && <span className="text-[20px] shrink-0">{food.emoji}</span>}
      <div className="flex-1 min-w-0">
        <p className="text-ink text-[14px] font-medium truncate">{food.name}</p>
        <p className="font-mono text-[10px] uppercase tracking-eyebrow text-ink-3 tabular-nums mt-0.5">
          {portionLabel} · {m.kcal} kcal · {m.p}p
        </p>
      </div>
      <Plus size={14} className="text-ink-3 shrink-0" />
    </button>
  )
}

function PortionSheet({ food, onChangeGrams, onClose, onLog }) {
  const [g, setG] = useState(food.grams)
  useEffect(() => { setG(food.grams) }, [food.grams])

  const m = macrosFor(food, g)
  const isUnit = !!food.unit
  const stepUnit = food.unitGrams || 10
  const units = isUnit ? +(g / food.unitGrams).toFixed(2) : null

  const update = (val) => {
    setG(val); onChangeGrams(val)
  }
  const adjust = (delta) => {
    const next = Math.max(0, Math.round((g + delta) * 10) / 10)
    update(next)
  }

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-end" onClick={onClose}>
      <div
        className="bg-surface-raised border-t border-surface-line w-full max-w-[480px] mx-auto rounded-t-[28px] p-5 max-h-[90vh] overflow-y-auto"
        style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-1">
          <p className="font-mono text-[10px] uppercase tracking-eyebrow text-accent">Portion</p>
          <button onClick={onClose} className="p-2 -mr-2 -mt-1 text-ink-3 hover:text-ink">
            <X size={18} />
          </button>
        </div>
        <h2 className="font-display text-[28px] italic text-ink leading-none tracking-display mb-1 truncate">
          {food.emoji} {food.name}
        </h2>
        <p className="font-mono text-[10px] uppercase tracking-eyebrow text-ink-3 mb-5">
          {food.nameEn} · {food.category}
        </p>

        {/* Stepper */}
        <div className="bg-surface-elev border border-surface-line-soft rounded-[14px] px-4 py-4 mb-4">
          <p className="font-mono text-[10px] uppercase tracking-eyebrow text-ink-3 mb-3">
            {isUnit ? `Portion · ${food.unit}` : 'Portion · grams'}
          </p>
          <div className="flex items-center justify-between gap-2">
            <button
              onClick={() => adjust(-stepUnit)}
              className="w-12 h-12 rounded-md bg-surface flex items-center justify-center text-ink-2 active:scale-95"
            >
              <Minus size={16} strokeWidth={2.4} />
            </button>
            <input
              type="number"
              inputMode="decimal"
              value={g}
              onChange={(e) => update(Math.max(0, Number(e.target.value) || 0))}
              className="flex-1 min-w-0 bg-transparent text-center font-mono text-[28px] tabular-nums text-ink focus:outline-none leading-none"
            />
            <button
              onClick={() => adjust(stepUnit)}
              className="w-12 h-12 rounded-md bg-surface flex items-center justify-center text-ink-2 active:scale-95"
            >
              <Plus size={16} strokeWidth={2.4} />
            </button>
          </div>
          <p className="font-mono text-[11px] tabular-nums text-ink-3 text-center mt-2">
            {isUnit ? `${units} ${food.unit} · ${g}g` : `${g} g`}
          </p>

          {/* Quick steps */}
          <div className="flex gap-2 mt-3 justify-center">
            {(isUnit
              ? [-1, 1].map((d) => ({ delta: d * food.unitGrams, label: d > 0 ? `+1 ${food.unit}` : `−1 ${food.unit}` }))
              : [
                  { delta: -50,  label: '−50g' },
                  { delta: -10,  label: '−10g' },
                  { delta: +10,  label: '+10g' },
                  { delta: +50,  label: '+50g' },
                ]
            ).map((s, i) => (
              <button
                key={i}
                onClick={() => adjust(s.delta)}
                className="font-mono text-[10px] uppercase tracking-eyebrow text-ink-2 bg-surface border border-surface-line-soft rounded-pill px-3 py-1.5"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Macros */}
        <div className="grid grid-cols-4 gap-2 mb-5">
          <Macro label="kcal"    value={m.kcal} accent />
          <Macro label="Protein" value={`${m.p}g`} />
          <Macro label="Carbs"   value={`${m.c}g`} />
          <Macro label="Fat"     value={`${m.f}g`} />
        </div>

        <Button size="lg" className="w-full" onClick={onLog} disabled={g <= 0}>
          Add to Today
        </Button>
      </div>
    </div>
  )
}

function Macro({ label, value, accent }) {
  return (
    <div className="bg-surface-elev rounded-md px-2 py-2.5 text-center">
      <p className="font-mono text-[9px] uppercase tracking-eyebrow text-ink-3 mb-1">{label}</p>
      <p className={`font-mono text-[16px] tabular-nums leading-none ${accent ? 'text-accent' : 'text-ink'}`}>{value}</p>
    </div>
  )
}

// ─── DaySummary: big readable end-of-day status ────────────────────────────
function DaySummary({ calories, protein, carbs, fat, targets, mealCount }) {
  const kcalLeft = Math.max(0, targets.calories - calories)
  const calPct   = Math.min(100, Math.round((calories / Math.max(1, targets.calories)) * 100))
  const protPct  = Math.min(100, Math.round((protein  / Math.max(1, targets.protein))  * 100))
  const proteinLeft = Math.max(0, Math.round(targets.protein - protein))

  // Status string + color
  let status, statusColor
  if (calories === 0) {
    status = 'No meals logged'; statusColor = 'text-ink-3'
  } else if (calPct >= 95 && calPct <= 110 && protPct >= 90) {
    status = 'On target — solid day'; statusColor = 'text-good'
  } else if (calPct >= 110) {
    status = `${calories - targets.calories} kcal over · ease back`; statusColor = 'text-warn'
  } else if (protPct < 60) {
    status = `Protein low · ${proteinLeft}g to go`; statusColor = 'text-warn'
  } else {
    status = `${kcalLeft} kcal left · ${proteinLeft}g protein left`; statusColor = 'text-ink-2'
  }

  // Calories ring math
  const r = 56
  const c = 2 * Math.PI * r
  const offset = c * (1 - Math.min(1, calPct / 100))

  return (
    <div className="bg-surface-card border border-surface-line-soft rounded-[20px] p-5 mb-4">
      <div className="flex items-center gap-5 mb-5">
        {/* Big calories ring */}
        <div className="relative w-[136px] h-[136px] shrink-0">
          <svg className="absolute inset-0 -rotate-90" viewBox="0 0 136 136">
            <circle cx="68" cy="68" r={r} fill="none" stroke="#1B1B20" strokeWidth="8" />
            <circle
              cx="68" cy="68" r={r} fill="none"
              stroke="#FF2D2D"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={c}
              strokeDashoffset={offset}
              style={{ transition: 'stroke-dashoffset 0.4s ease' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="font-mono text-[28px] font-medium tabular-nums text-ink leading-none tracking-display">
              {calories}
            </p>
            <p className="font-mono text-[9px] uppercase tracking-eyebrow text-ink-3 mt-1">
              of {targets.calories}
            </p>
          </div>
        </div>

        {/* Right side: status + protein */}
        <div className="flex-1 min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-eyebrow text-ink-3 mb-2">Today</p>
          <p className={`text-[14px] font-medium leading-snug ${statusColor} mb-4`}>
            {status}
          </p>

          {/* Protein bar */}
          <div className="flex items-center gap-1.5 mb-1">
            <Beef size={11} className="text-accent" />
            <span className="font-mono text-[9px] uppercase tracking-eyebrow text-ink-3 flex-1">Protein</span>
            <span className="font-mono text-[12px] tabular-nums text-ink">{Math.round(protein)}<span className="text-ink-3 text-[10px] ml-0.5">/{targets.protein}g</span></span>
          </div>
          <div className="h-1 bg-surface-line rounded-full overflow-hidden">
            <div className="h-full bg-accent transition-all" style={{ width: `${protPct}%` }} />
          </div>
        </div>
      </div>

      {/* 3-up tiles below: kcal left, carbs, fat */}
      <div className="grid grid-cols-3 gap-2">
        <SmallStat label="kcal left"    value={kcalLeft} accent={kcalLeft <= 200} />
        <SmallStat label="Carbs"        value={`${Math.round(carbs)}g`} />
        <SmallStat label="Fat"          value={`${Math.round(fat)}g`} />
      </div>

      {mealCount > 0 && (
        <p className="font-mono text-[9px] uppercase tracking-eyebrow text-ink-3 text-center mt-4 tabular-nums">
          {mealCount} {mealCount === 1 ? 'meal' : 'meals'} logged
        </p>
      )}
    </div>
  )
}

function SmallStat({ label, value, accent }) {
  return (
    <div className="bg-surface-elev rounded-md px-3 py-2.5 text-center">
      <p className="font-mono text-[9px] uppercase tracking-eyebrow text-ink-3 mb-1">{label}</p>
      <p className={`font-mono text-[15px] tabular-nums leading-none ${accent ? 'text-accent' : 'text-ink'}`}>{value}</p>
    </div>
  )
}

function nameWithPortion(food, grams) {
  if (food.unit) {
    const u = +(grams / food.unitGrams).toFixed(2)
    const uLabel = u === 1 ? food.unit : (food.unit + (food.unit.endsWith('s') ? '' : 's'))
    return `${food.name} · ${u} ${uLabel}`
  }
  return `${food.name} · ${grams}g`
}
