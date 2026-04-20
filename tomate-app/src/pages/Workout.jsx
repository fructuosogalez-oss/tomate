import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, ChevronRight, Trash2, Dumbbell, Play, Pencil, Check } from 'lucide-react'
import Layout from '../components/Layout'
import Button from '../components/Button'
import CoachCard from '../components/CoachCard'
import { useStore } from '../store/useStore'
import { getDailyRecommendation } from '../utils/coach'
import { generateDefaultPlan } from '../utils/workoutPlans'

function nanoid() { return Math.random().toString(36).slice(2, 10) }
const today = () => new Date().toISOString().slice(0, 10)

export default function Workout() {
  const navigate = useNavigate()
  const {
    workoutPlans, activePlanId, addWorkoutPlan, updateWorkoutPlan,
    deleteWorkoutPlan, setActivePlan, sessions, checkins, profile,
    startWorkout,
  } = useStore()

  const [showNewPlan, setShowNewPlan] = useState(false)
  const [newPlanName, setNewPlanName] = useState('')
  const [expandedPlan, setExpandedPlan] = useState(activePlanId)

  const activePlan = workoutPlans.find((p) => p.id === activePlanId) || null
  const todayCheckin = checkins[today()] || null
  const rec = getDailyRecommendation({ checkin: todayCheckin, profile, lastSessions: sessions })

  const createPlan = () => {
    if (!newPlanName.trim()) return
    const plan = { id: nanoid(), name: newPlanName.trim(), days: [], createdAt: new Date().toISOString() }
    addWorkoutPlan(plan)
    if (!activePlanId) setActivePlan(plan.id)
    setNewPlanName('')
    setShowNewPlan(false)
  }

  const autoGenerate = () => {
    const plan = generateDefaultPlan(profile.goal || 'muscle', profile.trainingDays || 4)
    addWorkoutPlan(plan)
    setActivePlan(plan.id)
    setExpandedPlan(plan.id)
  }

  const launchSession = (plan, dayIndex) => {
    const day = plan.days[dayIndex]
    const workout = {
      id: nanoid(),
      date: today(),
      planId: plan.id,
      planDayName: day.name,
      dayIndex,
      exercises: day.exercises.map((ex) => ({
        ...ex,
        sets: Array.from({ length: ex.sets || 3 }, (_, i) => ({
          id: nanoid(),
          index: i + 1,
          reps: '',
          weight: ex.weight || '',
          done: false,
        })),
      })),
      startTime: Date.now(),
      notes: '',
    }
    startWorkout(workout)
    navigate('/workout/log')
  }

  return (
    <Layout
      title="Workouts"
      action={
        <Button variant="ghost" size="sm" onClick={() => setShowNewPlan(true)}>
          <Plus size={16} /> New Plan
        </Button>
      }
    >
      {/* Coach tip */}
      {todayCheckin && (
        <CoachCard label={rec.label} message={rec.message} color={rec.color} className="mb-4" />
      )}

      {workoutPlans.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Dumbbell size={40} className="text-zinc-700 mb-4" />
          <p className="text-zinc-400 text-sm mb-6">No workout plans yet.</p>
          <Button onClick={autoGenerate} className="mb-3 w-full max-w-xs">
            Generate My Plan
          </Button>
          <Button variant="secondary" className="w-full max-w-xs" onClick={() => setShowNewPlan(true)}>
            Build From Scratch
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {workoutPlans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isActive={plan.id === activePlanId}
              expanded={expandedPlan === plan.id}
              onToggleExpand={() => setExpandedPlan(expandedPlan === plan.id ? null : plan.id)}
              onSetActive={() => setActivePlan(plan.id)}
              onDelete={() => deleteWorkoutPlan(plan.id)}
              onLaunch={(idx) => launchSession(plan, idx)}
              onUpdate={(updates) => updateWorkoutPlan(plan.id, updates)}
              rec={rec}
            />
          ))}
        </div>
      )}

      {/* Recent sessions */}
      {sessions.length > 0 && (
        <div className="mt-6">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Recent Sessions</p>
          <div className="space-y-2">
            {sessions.slice(0, 5).map((s) => (
              <div key={s.id} className="bg-surface-card rounded-xl px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">{s.planDayName}</p>
                  <p className="text-xs text-zinc-500">{s.date} · {s.exercises?.length || 0} exercises</p>
                </div>
                {s.duration && (
                  <span className="text-xs text-zinc-500">{Math.round(s.duration / 60)}m</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* New plan modal */}
      {showNewPlan && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end justify-center" onClick={() => setShowNewPlan(false)}>
          <div className="bg-surface-card w-full max-w-[480px] rounded-t-2xl p-6 pb-10" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-base font-semibold text-white mb-4">New Workout Plan</h2>
            <input
              autoFocus
              className="w-full bg-surface-raised border border-surface-border rounded-xl px-3 py-3 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-brand-500 mb-4"
              placeholder="Plan name (e.g. Push Pull Legs)"
              value={newPlanName}
              onChange={(e) => setNewPlanName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && createPlan()}
            />
            <Button className="w-full" onClick={createPlan}>Create Plan</Button>
          </div>
        </div>
      )}
    </Layout>
  )
}

function PlanCard({ plan, isActive, expanded, onToggleExpand, onSetActive, onDelete, onLaunch, onUpdate, rec }) {
  const [editingDay, setEditingDay] = useState(null)
  const [newDayName, setNewDayName] = useState('')
  const [showAddDay, setShowAddDay] = useState(false)
  const [addDayName, setAddDayName] = useState('')

  const addDay = () => {
    if (!addDayName.trim()) return
    const newDays = [...plan.days, { name: addDayName.trim(), exercises: [] }]
    onUpdate({ days: newDays })
    setAddDayName('')
    setShowAddDay(false)
  }

  const deleteDay = (idx) => {
    onUpdate({ days: plan.days.filter((_, i) => i !== idx) })
  }

  const renameDay = (idx) => {
    if (!newDayName.trim()) { setEditingDay(null); return }
    const days = plan.days.map((d, i) => i === idx ? { ...d, name: newDayName } : d)
    onUpdate({ days })
    setEditingDay(null)
  }

  return (
    <div className={`rounded-2xl border transition-colors ${isActive ? 'border-brand-500/40 bg-brand-500/5' : 'border-surface-border bg-surface-card'}`}>
      <button className="w-full flex items-center justify-between p-4" onClick={onToggleExpand}>
        <div className="flex items-center gap-3 min-w-0">
          {isActive && <span className="w-2 h-2 rounded-full bg-brand-400 shrink-0" />}
          <div className="min-w-0 text-left">
            <p className="text-sm font-semibold text-white truncate">{plan.name}</p>
            <p className="text-xs text-zinc-500">{plan.days.length} days</p>
          </div>
        </div>
        <ChevronRight size={16} className={`text-zinc-500 transition-transform ${expanded ? 'rotate-90' : ''}`} />
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-surface-border pt-3">
          {!isActive && (
            <Button variant="secondary" size="sm" className="w-full mb-3" onClick={onSetActive}>
              <Check size={14} /> Set as Active Plan
            </Button>
          )}

          <div className="space-y-2">
            {plan.days.map((day, idx) => (
              <div key={idx} className="bg-surface-raised rounded-xl p-3">
                <div className="flex items-center justify-between mb-1">
                  {editingDay === idx ? (
                    <input
                      autoFocus
                      className="flex-1 bg-transparent text-white text-sm outline-none border-b border-brand-500 mr-2"
                      value={newDayName}
                      onChange={(e) => setNewDayName(e.target.value)}
                      onBlur={() => renameDay(idx)}
                      onKeyDown={(e) => e.key === 'Enter' && renameDay(idx)}
                    />
                  ) : (
                    <button
                      className="text-sm font-medium text-white flex-1 text-left"
                      onDoubleClick={() => { setEditingDay(idx); setNewDayName(day.name) }}
                    >
                      {day.name}
                    </button>
                  )}
                  <div className="flex gap-1">
                    <button onClick={() => { setEditingDay(idx); setNewDayName(day.name) }} className="text-zinc-500 hover:text-white p-1">
                      <Pencil size={12} />
                    </button>
                    <button onClick={() => deleteDay(idx)} className="text-zinc-500 hover:text-red-400 p-1">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-zinc-500 mb-2">{day.exercises?.length || 0} exercises</p>
                {day.exercises?.slice(0, 3).map((ex, ei) => (
                  <p key={ei} className="text-xs text-zinc-400 truncate">· {ex.name} — {ex.sets}×{ex.reps}</p>
                ))}
                {(day.exercises?.length || 0) > 3 && (
                  <p className="text-xs text-zinc-600">+{day.exercises.length - 3} more</p>
                )}
                <Button
                  size="sm"
                  className="w-full mt-2"
                  onClick={() => onLaunch(idx)}
                >
                  <Play size={13} /> Start Session
                </Button>
              </div>
            ))}
          </div>

          {showAddDay ? (
            <div className="mt-2 flex gap-2">
              <input
                autoFocus
                className="flex-1 bg-surface-raised border border-surface-border rounded-xl px-3 py-2 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-brand-500"
                placeholder="Day name"
                value={addDayName}
                onChange={(e) => setAddDayName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addDay()}
              />
              <Button size="sm" onClick={addDay}>Add</Button>
            </div>
          ) : (
            <button
              onClick={() => setShowAddDay(true)}
              className="w-full mt-2 py-2 rounded-xl border border-dashed border-surface-border text-zinc-500 text-xs hover:border-brand-500/40 hover:text-brand-400 transition-colors"
            >
              + Add Training Day
            </button>
          )}

          <Button variant="danger" size="sm" className="w-full mt-3" onClick={onDelete}>
            <Trash2 size={13} /> Delete Plan
          </Button>
        </div>
      )}
    </div>
  )
}
