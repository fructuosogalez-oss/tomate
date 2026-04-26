import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Timer, Plus, Trash2, Check, X, ChevronDown, ChevronUp,
  ArrowLeft, CheckCircle2, Dumbbell
} from 'lucide-react'
import RestTimer from '../components/RestTimer'
import Button from '../components/Button'
import { useStore } from '../store/useStore'
import { weightUnit } from '../utils/units'

function nanoid() { return Math.random().toString(36).slice(2, 10) }

export default function WorkoutLogger() {
  const navigate = useNavigate()
  const { activeWorkout, updateActiveWorkout, finishWorkout, addSession, sessions, profile } = useStore()
  const wUnit = weightUnit(profile).toUpperCase()
  const [showTimer, setShowTimer] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [showFinish, setShowFinish] = useState(false)
  const [sessionNote, setSessionNote] = useState('')
  const [expandedEx, setExpandedEx] = useState(null)
  const [showAddEx, setShowAddEx] = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (!activeWorkout) return
    intervalRef.current = setInterval(() => {
      setElapsed(Math.floor((Date.now() - activeWorkout.startTime) / 1000))
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [activeWorkout])

  if (!activeWorkout) {
    return (
      <div className="flex flex-col min-h-full items-center justify-center px-6 pb-10">
        <Dumbbell size={40} className="text-zinc-700 mb-4" />
        <p className="text-zinc-400 text-sm mb-6">No active workout session.</p>
        <Button onClick={() => navigate('/workout')}>Go to Workouts</Button>
      </div>
    )
  }

  const { exercises } = activeWorkout
  const totalSets = exercises.reduce((a, ex) => a + ex.sets.length, 0)
  const doneSets  = exercises.reduce((a, ex) => a + ex.sets.filter((s) => s.done).length, 0)

  const mins = String(Math.floor(elapsed / 60)).padStart(2, '0')
  const secs = String(elapsed % 60).padStart(2, '0')

  const updateSet = (exIdx, setIdx, field, value) => {
    const exs = exercises.map((ex, ei) => {
      if (ei !== exIdx) return ex
      return {
        ...ex,
        sets: ex.sets.map((s, si) => si === setIdx ? { ...s, [field]: value } : s),
      }
    })
    updateActiveWorkout({ exercises: exs })
  }

  const addSet = (exIdx) => {
    const exs = exercises.map((ex, ei) => {
      if (ei !== exIdx) return ex
      const last = ex.sets[ex.sets.length - 1] || {}
      return {
        ...ex,
        sets: [...ex.sets, { id: nanoid(), index: ex.sets.length + 1, reps: last.reps || '', weight: last.weight || '', done: false }],
      }
    })
    updateActiveWorkout({ exercises: exs })
  }

  const removeSet = (exIdx, setIdx) => {
    const exs = exercises.map((ex, ei) => {
      if (ei !== exIdx) return ex
      if (ex.sets.length <= 1) return ex
      return { ...ex, sets: ex.sets.filter((_, si) => si !== setIdx) }
    })
    updateActiveWorkout({ exercises: exs })
  }

  const addExercise = (name) => {
    if (!name.trim()) return
    const newEx = {
      id: nanoid(), name: name.trim(), notes: '',
      sets: [{ id: nanoid(), index: 1, reps: '', weight: '', done: false }],
    }
    updateActiveWorkout({ exercises: [...exercises, newEx] })
  }

  const removeExercise = (exIdx) => {
    updateActiveWorkout({ exercises: exercises.filter((_, i) => i !== exIdx) })
  }

  const finish = () => {
    const duration = elapsed
    const session = {
      ...activeWorkout,
      id: nanoid(),
      duration,
      notes: sessionNote,
      intensity: 'normal',
    }
    addSession(session)
    finishWorkout()
    navigate('/workout')
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* Sticky header */}
      <div className="sticky top-0 z-40 bg-surface/90 backdrop-blur px-4 pt-12 pb-3 border-b border-surface-border">
        <div className="flex items-center justify-between mb-2">
          <button onClick={() => setShowFinish(true)} className="text-zinc-400 hover:text-white p-1">
            <ArrowLeft size={20} />
          </button>
          <div className="text-center">
            <p className="text-xs text-zinc-500 truncate max-w-[180px]">{activeWorkout.planDayName}</p>
            <p className="text-lg font-bold text-white tabular-nums">{mins}:{secs}</p>
          </div>
          <button
            onClick={() => setShowTimer(true)}
            className="flex items-center gap-1.5 bg-surface-raised px-3 py-1.5 rounded-full text-xs text-zinc-300 hover:text-white"
          >
            <Timer size={14} /> Rest
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-surface-raised rounded-full overflow-hidden">
          <div
            className="h-full bg-brand-500 transition-all"
            style={{ width: totalSets ? `${(doneSets / totalSets) * 100}%` : '0%' }}
          />
        </div>
        <p className="text-right text-[10px] text-zinc-600 mt-1">{doneSets}/{totalSets} sets</p>
      </div>

      <div className="flex-1 px-4 pb-32 pt-4 space-y-4">
        {exercises.map((ex, ei) => (
          <ExerciseCard
            key={ex.id}
            ex={ex}
            exIdx={ei}
            expanded={expandedEx === ei}
            onToggle={() => setExpandedEx(expandedEx === ei ? null : ei)}
            onUpdateSet={updateSet}
            onAddSet={addSet}
            onRemoveSet={removeSet}
            onRemoveEx={removeExercise}
            onTimerOpen={() => setShowTimer(true)}
            weightLabel={wUnit}
          />
        ))}

        <AddExerciseButton onAdd={addExercise} show={showAddEx} setShow={setShowAddEx} />
      </div>

      {/* Finish button */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] px-4 pb-6 pt-2 bg-gradient-to-t from-surface via-surface/90 to-transparent z-30">
        <Button
          size="lg"
          className="w-full"
          onClick={() => setShowFinish(true)}
          disabled={doneSets === 0}
        >
          <CheckCircle2 size={18} /> Finish Workout
        </Button>
      </div>

      {/* Rest timer */}
      {showTimer && <RestTimer onClose={() => setShowTimer(false)} />}

      {/* Finish confirm */}
      {showFinish && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end justify-center" onClick={() => setShowFinish(false)}>
          <div className="bg-surface-card w-full max-w-[480px] rounded-t-2xl p-6 pb-10" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-base font-semibold text-white mb-1">Finish Workout?</h2>
            <p className="text-xs text-zinc-500 mb-4">{doneSets} sets done · {mins}:{secs} elapsed</p>
            <textarea
              className="w-full bg-surface-raised border border-surface-border rounded-xl px-3 py-3 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-brand-500 resize-none mb-4"
              rows={2}
              placeholder="Session notes (optional)"
              value={sessionNote}
              onChange={(e) => setSessionNote(e.target.value)}
            />
            <Button size="lg" className="w-full mb-2" onClick={finish}>Save Session</Button>
            <Button variant="secondary" size="lg" className="w-full" onClick={() => setShowFinish(false)}>
              Keep Going
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

function ExerciseCard({ ex, exIdx, expanded, onToggle, onUpdateSet, onAddSet, onRemoveSet, onRemoveEx, onTimerOpen, weightLabel = 'KG' }) {
  const doneSets = ex.sets.filter((s) => s.done).length

  return (
    <div className="bg-surface-card rounded-2xl overflow-hidden">
      {/* Header */}
      <button className="w-full flex items-center justify-between px-4 py-3" onClick={onToggle}>
        <div className="flex items-center gap-3 min-w-0">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${doneSets === ex.sets.length ? 'bg-brand-500/20 text-brand-400' : 'bg-surface-raised text-zinc-500'}`}>
            {doneSets}/{ex.sets.length}
          </span>
          <p className="text-sm font-semibold text-white truncate">{ex.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={(e) => { e.stopPropagation(); onRemoveEx(exIdx) }} className="text-zinc-600 hover:text-red-400 p-1">
            <Trash2 size={14} />
          </button>
          {expanded ? <ChevronUp size={16} className="text-zinc-500" /> : <ChevronDown size={16} className="text-zinc-500" />}
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-surface-border pt-3">
          {/* Set headers */}
          <div className="grid grid-cols-[2rem_1fr_1fr_2.5rem] gap-2 mb-2">
            <span className="text-[10px] text-zinc-600 text-center">SET</span>
            <span className="text-[10px] text-zinc-600 text-center">{weightLabel}</span>
            <span className="text-[10px] text-zinc-600 text-center">REPS</span>
            <span />
          </div>

          {ex.sets.map((set, si) => (
            <div key={set.id} className="grid grid-cols-[2rem_1fr_1fr_2.5rem] gap-2 mb-2 items-center">
              <span className={`text-xs font-bold text-center ${set.done ? 'text-brand-400' : 'text-zinc-500'}`}>{si + 1}</span>
              <input
                type="number"
                inputMode="decimal"
                className={`bg-surface-raised border rounded-lg px-2 py-2 text-sm text-white text-center focus:outline-none focus:border-brand-500 transition-colors ${set.done ? 'border-brand-500/30' : 'border-surface-border'}`}
                placeholder="—"
                value={set.weight}
                onChange={(e) => onUpdateSet(exIdx, si, 'weight', e.target.value)}
              />
              <input
                type="number"
                inputMode="numeric"
                className={`bg-surface-raised border rounded-lg px-2 py-2 text-sm text-white text-center focus:outline-none focus:border-brand-500 transition-colors ${set.done ? 'border-brand-500/30' : 'border-surface-border'}`}
                placeholder="—"
                value={set.reps}
                onChange={(e) => onUpdateSet(exIdx, si, 'reps', e.target.value)}
              />
              <button
                onClick={() => {
                  onUpdateSet(exIdx, si, 'done', !set.done)
                  if (!set.done) onTimerOpen()
                }}
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                  set.done ? 'bg-brand-500 text-white' : 'bg-surface-raised text-zinc-500 hover:text-white border border-surface-border'
                }`}
              >
                <Check size={15} />
              </button>
            </div>
          ))}

          <div className="flex gap-2 mt-3">
            <button
              onClick={() => onAddSet(exIdx)}
              className="flex-1 py-2 rounded-xl border border-dashed border-surface-border text-zinc-500 text-xs hover:border-brand-500/40 hover:text-brand-400 transition-colors flex items-center justify-center gap-1"
            >
              <Plus size={13} /> Add Set
            </button>
            {ex.sets.length > 1 && (
              <button
                onClick={() => onRemoveSet(exIdx, ex.sets.length - 1)}
                className="px-3 rounded-xl border border-surface-border text-zinc-600 hover:text-red-400 transition-colors"
              >
                <X size={14} />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function AddExerciseButton({ onAdd, show, setShow }) {
  const [name, setName] = useState('')

  const submit = () => {
    onAdd(name)
    setName('')
    setShow(false)
  }

  if (!show) {
    return (
      <button
        onClick={() => setShow(true)}
        className="w-full py-3 rounded-2xl border border-dashed border-surface-border text-zinc-500 text-sm hover:border-brand-500/40 hover:text-brand-400 transition-colors flex items-center justify-center gap-2"
      >
        <Plus size={16} /> Add Exercise
      </button>
    )
  }

  return (
    <div className="bg-surface-card rounded-2xl p-4 flex gap-2">
      <input
        autoFocus
        className="flex-1 bg-surface-raised border border-surface-border rounded-xl px-3 py-2 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-brand-500"
        placeholder="Exercise name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
      />
      <Button size="sm" onClick={submit}>Add</Button>
      <button onClick={() => setShow(false)} className="text-zinc-500 p-1"><X size={16} /></button>
    </div>
  )
}
