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
  const [form, setForm] = useState({ ...profile })
  const [saved, setSaved] = useState(false)

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const save = () => {
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
    setTimeout(() => {
      navigate('/')
    }, 800)
  }

  const isNew = !profile.setupDone

  return (
    <Layout
      title="Profile"
      action={
        !isNew && (
          <button onClick={() => navigate(-1)} className="text-zinc-400 hover:text-white p-1">
            <ArrowLeft size={20} />
          </button>
        )
      }
    >
      <div className="space-y-4 mt-2">
        <Input
          label="Your Name"
          placeholder="Enter your name"
          value={form.name}
          onChange={(e) => set('name', e.target.value)}
        />

        <div className="grid grid-cols-3 gap-3">
          <Input
            label="Age"
            type="number"
            placeholder="30"
            value={form.age}
            onChange={(e) => set('age', e.target.value)}
          />
          <Input
            label="Weight (kg)"
            type="number"
            placeholder="80"
            value={form.weight}
            onChange={(e) => set('weight', e.target.value)}
          />
          <Input
            label="Height (cm)"
            type="number"
            placeholder="175"
            value={form.height}
            onChange={(e) => set('height', e.target.value)}
          />
        </div>

        <Select
          label="Primary Goal"
          value={form.goal}
          onChange={(e) => set('goal', e.target.value)}
        >
          {Object.entries(GOALS).map(([k, v]) => (
            <option key={k} value={k}>{v.emoji} {v.label}</option>
          ))}
        </Select>

        <Select
          label="Activity Level"
          value={form.activityLevel}
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
          value={form.trainingDays}
          onChange={(e) => set('trainingDays', e.target.value)}
        >
          {[2, 3, 4, 5, 6].map((d) => (
            <option key={d} value={d}>{d} days</option>
          ))}
        </Select>

        {/* Calorie / protein preview */}
        {form.weight && form.height && form.age && (
          <div className="bg-surface-card rounded-2xl p-4 border border-surface-border">
            <p className="text-xs text-zinc-500 mb-2">Estimated Daily Targets</p>
            {(() => {
              const t = calcTargets(form)
              return (
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
              )
            })()}
          </div>
        )}

        <Button
          size="lg"
          className="w-full"
          onClick={save}
        >
          {saved ? '✓ Saved!' : isNew ? 'Create My Profile' : 'Save Changes'}
        </Button>
      </div>
    </Layout>
  )
}
