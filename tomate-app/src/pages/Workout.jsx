import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, ChevronRight, Trash2, Dumbbell, Play, Pencil, Check, X, Info } from 'lucide-react'
import Layout from '../components/Layout'
import Button from '../components/Button'
import CoachCard from '../components/CoachCard'
import ResumeBanner from '../components/ResumeBanner'
import ExerciseInfoModal from '../components/ExerciseInfoModal'
import { getLastForExercise, formatShortDate } from '../utils/exerciseHistory'
import { useStore } from '../store/useStore'
import { getDailyRecommendation } from '../utils/coach'
import { generateDefaultPlan } from '../utils/workoutPlans'
import { weightUnit } from '../utils/units'
import { todayLocal as today } from '../utils/date'

function nanoid() { return Math.random().toString(36).slice(2, 10) }

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

  const todayCheckin = checkins[today()] || null
  const rec = getDailyRecommendation({ checkin: todayCheckin, profile, lastSessions: sessions })
  const wUnit = weightUnit(profile)

  const createPlan = () => {
    if (!newPlanName.trim()) return
    const plan = { id: nanoid(), name: newPlanName.trim(), days: [], createdAt: new Date().toISOString() }
    addWorkoutPlan(plan)
    if (!activePlanId) setActivePlan(plan.id)
    setNewPlanName(''); setShowNewPlan(false); setExpandedPlan(plan.id)
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
      eyebrow="Train"
      title="Workouts."
      action={
        <button
          onClick={() => setShowNewPlan(true)}
          className="w-9 h-9 rounded-md bg-surface-elev border border-surface-line-soft flex items-center justify-center text-ink-2 hover:text-ink"
        >
          <Plus size={16} />
        </button>
      }
    >
      <ResumeBanner className="mb-5" />

      {todayCheckin && (
        <CoachCard label={rec.label} message={rec.message} color={rec.color} className="mb-5" />
      )}

      {workoutPlans.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Dumbbell size={36} className="text-ink-4 mb-4" />
          <p className="text-ink-2 text-[14px] mb-6">No workout plans yet.</p>
          <Button onClick={autoGenerate} className="mb-3 w-full max-w-xs">
            Generate My Plan
          </Button>
          <Button variant="ghost" className="w-full max-w-xs" onClick={() => setShowNewPlan(true)}>
            Build From Scratch
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {workoutPlans.map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              wUnit={wUnit}
              sessions={sessions}
              isActive={plan.id === activePlanId}
              expanded={expandedPlan === plan.id}
              onToggleExpand={() => setExpandedPlan(expandedPlan === plan.id ? null : plan.id)}
              onSetActive={() => setActivePlan(plan.id)}
              onDelete={() => deleteWorkoutPlan(plan.id)}
              onLaunch={(idx) => launchSession(plan, idx)}
              onUpdate={(updates) => updateWorkoutPlan(plan.id, updates)}
            />
          ))}
        </div>
      )}

      {/* Recent sessions */}
      {sessions.length > 0 && (
        <div className="mt-7">
          <p className="font-mono text-[10px] uppercase tracking-eyebrow text-ink-3 mb-3">Recent Sessions · Tap to Edit</p>
          <div className="space-y-2">
            {sessions.slice(0, 8).map((s) => {
              const totalSets = (s.exercises || []).reduce((a, ex) => a + (ex.sets?.length || 0), 0)
              const doneSets  = (s.exercises || []).reduce((a, ex) => a + (ex.sets?.filter((set) => set.done)?.length || 0), 0)
              return (
                <button
                  key={s.id}
                  onClick={() => navigate(`/workout/session/${s.id}`)}
                  className="w-full text-left bg-surface-card border border-surface-line-soft rounded-[14px] px-4 py-3 flex items-center justify-between hover:bg-surface-elev active:bg-surface-elev transition-colors"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-ink text-[14px] font-medium truncate">{s.planDayName}</p>
                    <p className="font-mono text-[10px] uppercase tracking-eyebrow text-ink-3 mt-0.5 tabular-nums">
                      {s.date} · {s.exercises?.length || 0} ex · {doneSets}/{totalSets} sets
                    </p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {s.duration > 0 && (
                      <span className="font-mono text-[11px] tabular-nums text-ink-2">
                        {Math.round(s.duration / 60)}m
                      </span>
                    )}
                    <ChevronRight size={14} className="text-ink-3" />
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* New plan sheet */}
      {showNewPlan && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-end" onClick={() => setShowNewPlan(false)}>
          <div className="bg-surface-raised border-t border-surface-line w-full max-w-[480px] mx-auto rounded-t-[28px] p-6" style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))' }} onClick={(e) => e.stopPropagation()}>
            <p className="font-mono text-[10px] uppercase tracking-eyebrow text-accent mb-2">New</p>
            <h2 className="font-display text-[28px] italic text-ink leading-none tracking-display mb-5">Workout plan.</h2>
            <input
              autoFocus
              className="w-full bg-surface-elev border border-surface-line-soft rounded-md px-3.5 py-3.5 text-ink text-[15px] placeholder:text-ink-4 focus:outline-none focus:border-accent mb-4"
              placeholder="Plan name (e.g. Push Pull Legs)"
              value={newPlanName}
              onChange={(e) => setNewPlanName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && createPlan()}
            />
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setShowNewPlan(false)}>Cancel</Button>
              <Button className="flex-[2]" onClick={createPlan}>Create</Button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

function PlanCard({ plan, wUnit, sessions, isActive, expanded, onToggleExpand, onSetActive, onDelete, onLaunch, onUpdate }) {
  const [infoFor, setInfoFor] = useState(null)
  const [editingDay, setEditingDay] = useState(null)
  const [newDayName, setNewDayName] = useState('')
  const [showAddDay, setShowAddDay] = useState(false)
  const [addDayName, setAddDayName] = useState('')

  const addDay = () => {
    if (!addDayName.trim()) return
    onUpdate({ days: [...plan.days, { name: addDayName.trim(), exercises: [] }] })
    setAddDayName(''); setShowAddDay(false)
  }
  const deleteDay = (idx) => onUpdate({ days: plan.days.filter((_, i) => i !== idx) })
  const renameDay = (idx) => {
    if (!newDayName.trim()) { setEditingDay(null); return }
    onUpdate({ days: plan.days.map((d, i) => i === idx ? { ...d, name: newDayName } : d) })
    setEditingDay(null)
  }

  return (
    <div className={`rounded-[20px] border transition-colors ${isActive ? 'border-accent-line bg-accent-soft' : 'border-surface-line-soft bg-surface-card'}`}>
      <button className="w-full flex items-center justify-between p-4" onClick={onToggleExpand}>
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {isActive && <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />}
          <div className="min-w-0 text-left">
            <p className="text-ink text-[15px] font-medium truncate">{plan.name}</p>
            <p className="font-mono text-[10px] uppercase tracking-eyebrow text-ink-3 mt-0.5 tabular-nums">
              {plan.days.length} days
            </p>
          </div>
        </div>
        <ChevronRight size={16} className={`text-ink-3 transition-transform ${expanded ? 'rotate-90' : ''}`} />
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-surface-line-soft pt-3">
          {!isActive && (
            <Button variant="secondary" size="sm" className="w-full mb-3" onClick={onSetActive}>
              <Check size={14} /> Set Active
            </Button>
          )}

          <div className="space-y-2">
            {plan.days.map((day, idx) => (
              <div key={idx} className="bg-surface-elev border border-surface-line-soft rounded-[12px] p-3">
                <div className="flex items-center justify-between mb-2">
                  {editingDay === idx ? (
                    <input
                      autoFocus
                      className="flex-1 bg-transparent text-ink text-[14px] outline-none border-b border-accent mr-2"
                      value={newDayName}
                      onChange={(e) => setNewDayName(e.target.value)}
                      onBlur={() => renameDay(idx)}
                      onKeyDown={(e) => e.key === 'Enter' && renameDay(idx)}
                    />
                  ) : (
                    <button
                      className="text-ink text-[14px] font-medium flex-1 text-left truncate"
                      onDoubleClick={() => { setEditingDay(idx); setNewDayName(day.name) }}
                    >
                      {day.name}
                    </button>
                  )}
                  <div className="flex gap-1">
                    <button onClick={() => { setEditingDay(idx); setNewDayName(day.name) }} className="text-ink-3 hover:text-ink p-1.5">
                      <Pencil size={12} />
                    </button>
                    <button onClick={() => deleteDay(idx)} className="text-ink-3 hover:text-accent p-1.5">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
                <p className="font-mono text-[10px] uppercase tracking-eyebrow text-ink-3 tabular-nums mb-2">
                  {day.exercises?.length || 0} exercises
                </p>
                <div className="space-y-1.5">
                  {day.exercises?.map((ex, ei) => {
                    const last = getLastForExercise(ex.name, sessions)
                    return (
                      <div
                        key={ex.id || ei}
                        className="flex items-center gap-2 bg-surface-card border border-surface-line-soft rounded-md px-2.5 py-2"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-ink text-[13px] font-medium truncate">{ex.name}</p>
                          <p className="font-mono text-[10px] tabular-nums text-ink-3 mt-0.5">
                            {ex.sets}×{ex.reps}
                            {last
                              ? <span className="text-accent ml-2">· last: {last.weight}{wUnit} × {last.reps} on {formatShortDate(last.date)}</span>
                              : <span className="text-ink-4 ml-2">· no history</span>}
                          </p>
                        </div>
                        <button
                          onClick={(e) => { e.stopPropagation(); setInfoFor(ex.name) }}
                          className="text-ink-3 hover:text-accent p-1.5 shrink-0"
                          title="How to perform"
                        >
                          <Info size={13} />
                        </button>
                      </div>
                    )
                  })}
                </div>
                <button
                  onClick={() => onLaunch(idx)}
                  className="w-full mt-3 bg-accent text-white rounded-md py-2.5 font-mono text-[11px] uppercase tracking-eyebrow flex items-center justify-center gap-2 active:scale-[0.98]"
                >
                  <Play size={12} fill="currentColor" /> Start Session
                </button>
              </div>
            ))}
          </div>

          {showAddDay ? (
            <div className="mt-2 flex gap-2">
              <input
                autoFocus
                className="flex-1 bg-surface-elev border border-surface-line-soft rounded-md px-3 py-2.5 text-ink text-[14px] placeholder:text-ink-4 focus:outline-none focus:border-accent"
                placeholder="Day name"
                value={addDayName}
                onChange={(e) => setAddDayName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addDay()}
              />
              <Button size="sm" onClick={addDay}>Add</Button>
              <button onClick={() => setShowAddDay(false)} className="text-ink-3 p-2"><X size={14} /></button>
            </div>
          ) : (
            <button
              onClick={() => setShowAddDay(true)}
              className="w-full mt-3 py-2.5 rounded-md border border-dashed border-surface-line text-ink-3 font-mono text-[11px] uppercase tracking-eyebrow hover:border-accent-line hover:text-accent transition-colors"
            >
              + Add Day
            </button>
          )}

          <Button variant="ghost" size="sm" className="w-full mt-3 text-accent border-accent-line" onClick={onDelete}>
            <Trash2 size={12} /> Delete Plan
          </Button>
        </div>
      )}

      {infoFor && <ExerciseInfoModal exerciseName={infoFor} onClose={() => setInfoFor(null)} />}
    </div>
  )
}
