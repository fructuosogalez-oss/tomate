import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import Layout from '../components/Layout'
import Input, { Select } from '../components/Input'
import Button from '../components/Button'
import { useStore } from '../store/useStore'
import { calcTargets, GOALS } from '../utils/coach'
import { generateDefaultPlan } from '../utils/workoutPlans'

export default function Settings() {
  const navigate = useNavigate()
  const { profile, setProfile, addWorkoutPlan, setActivePlan, workoutPlans } = useStore()
  const [form, setForm] = useState({
    units: 'imperial',
    ...profile,
  })
  const [saved, setSaved] = useState(false)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const isImperial = form.units !== 'metric'

  const save = () => {
    if (!form.name?.trim()) {
      alert('Please enter your name')
      return
    }
    const targets = calcTargets(form)
    const updated = { ...form, ...targets, setupDone: true }
    setProfile(updated)

    // Auto-generate a starter plan if none exists
    if (workoutPlans.length === 0) {
      const plan = generateDefaultPlan(form.goal, form.trainingDays)
      addWorkoutPlan(plan)
      setActivePlan(plan.id)
    }

    setSaved(true)
    setTimeout(() => navigate('/'), 700)
  }

  const isNew = !profile.setupDone

  return (
    <Layout
      title={isNew ? 'Welcome' : 'Profile'}
      action={
        !isNew && (
          <button onClick={() => navigate(-1)} className="text-zinc-400 hover:text-white p-1">
            <ArrowLeft size={20} />
          </button>
        )
      }
    >
      {isNew && (
        <p className="text-zinc-400 text-sm -mt-2 mb-4 leading-relaxed">
          Tell me about yourself so I can build the right plan for you. Your data
          stays on this device — nothing is sent to a server.
        </p>
      )}

      <div className="space-y-4 mt-2">
        <Input
          label="Your Name"
          placeholder="Enter your name"
          value={form.name || ''}
          onChange={(e) => set('name', e.target.value)}
        />

        {/* Units toggle */}
        <div>
          <label className="block text-xs text-zinc-400 mb-1.5 font-medium">Units</label>
          <div className="flex bg-surface-raised border border-surface-border rounded-xl p-1 gap-1">
            <button
              type="button"
              onClick={() => set('units', 'imperial')}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
                isImperial ? 'bg-brand-500 text-white' : 'text-zinc-400'
              }`}
            >
              Imperial (lbs · ft/in)
            </button>
            <button
              type="button"
              onClick={() => set('units', 'metric')}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
                !isImperial ? 'bg-brand-500 text-white' : 'text-zinc-400'
              }`}
            >
              Metric (kg · cm)
            </button>
          </div>
        </div>

        {/* Age */}
        <Input
          label="Age"
          type="number"
          inputMode="numeric"
          placeholder="30"
          value={form.age || ''}
          onChange={(e) => set('age', e.target.value)}
        />

        {/* Weight */}
        <Input
          label={isImperial ? 'Weight (lbs)' : 'Weight (kg)'}
          type="number"
          inputMode="decimal"
          placeholder={isImperial ? '180' : '80'}
          value={form.weight || ''}
          onChange={(e) => set('weight', e.target.value)}
        />

        {/* Height */}
        {isImperial ? (
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5 font-medium">Height</label>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="5"
                  value={form.heightFt || ''}
                  onChange={(e) => set('heightFt', e.target.value)}
                  className="w-full bg-surface-raised border border-surface-border rounded-xl px-3 py-3 pr-10 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-brand-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500">ft</span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="10"
                  value={form.heightIn || ''}
                  onChange={(e) => set('heightIn', e.target.value)}
                  className="w-full bg-surface-raised border border-surface-border rounded-xl px-3 py-3 pr-10 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-brand-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500">in</span>
              </div>
            </div>
          </div>
        ) : (
          <Input
            label="Height (cm)"
            type="number"
            inputMode="decimal"
            placeholder="175"
            value={form.height || ''}
            onChange={(e) => set('height', e.target.value)}
          />
        )}

        <Select
          label="Primary Goal"
          value={form.goal || 'fat_loss'}
          onChange={(e) => set('goal', e.target.value)}
        >
          {Object.entries(GOALS).map(([k, v]) => (
            <option key={k} value={k}>{v.emoji} {v.label}</option>
          ))}
        </Select>

        <Select
          label="Activity Level"
          value={form.activityLevel || 'moderate'}
          onChange={(e) => set('activityLevel', e.target.value)}
        >
          <option value="sedentary">Sedentary (desk job, no exercise)</option>
          <option value="light">Light (1–3 days/week)</option>
          <option value="moderate">Moderate (3–5 days/week)</option>
          <option value="active">Active (6–7 days/week)</option>
          <option value="very_active">Very Active (2x/day or physical job)</option>
        </Select>

        <Select
          label="Training Days per Week"
          value={form.trainingDays || 4}
          onChange={(e) => set('trainingDays', Number(e.target.value))}
        >
          {[2, 3, 4, 5, 6].map((d) => (
            <option key={d} value={d}>{d} days</option>
          ))}
        </Select>

        {/* Calorie / protein preview */}
        {(() => {
          const t = calcTargets(form)
          if (t.calories === 2000 && t.protein === 150) return null
          return (
            <div className="bg-surface-card rounded-2xl p-4 border border-surface-border">
              <p className="text-xs text-zinc-500 mb-2">Estimated Daily Targets</p>
              <div className="flex gap-6">
                <div>
                  <p className="text-xl font-bold text-white">{t.calories}</p>
                  <p className="text-xs text-zinc-400">calories</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-white">{t.protein}g</p>
                  <p className="text-xs text-zinc-400">protein</p>
                </div>
              </div>
            </div>
          )
        })()}

        <Button size="lg" className="w-full" onClick={save}>
          {saved ? 'Saved!' : isNew ? 'Create My Profile' : 'Save Changes'}
        </Button>

        {!isNew && (
          <p className="text-[11px] text-zinc-600 text-center mt-1">
            Your profile, plans, sessions, body logs and meals are stored privately on this device.
          </p>
        )}
      </div>
    </Layout>
  )
}
