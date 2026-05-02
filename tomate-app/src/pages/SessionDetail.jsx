import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Trash2, Check, Plus, X, Save } from 'lucide-react'
import Button from '../components/Button'
import { useStore } from '../store/useStore'
import { weightUnit } from '../utils/units'

function nanoid() { return Math.random().toString(36).slice(2, 10) }

export default function SessionDetail() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { sessions, updateSession, deleteSession, profile } = useStore()
  const wUnit = weightUnit(profile)

  const original = sessions.find((s) => s.id === id)
  const [exercises, setExercises]   = useState(() => deepClone(original?.exercises || []))
  const [notes, setNotes]           = useState(original?.notes || '')
  const [duration, setDuration]     = useState(original?.duration || 0)
  const [showDelete, setShowDelete] = useState(false)
  const [saved, setSaved]           = useState(false)
  const [dirty, setDirty]           = useState(false)

  if (!original) {
    return (
      <div className="flex flex-col min-h-full items-center justify-center px-6 pb-10 bg-surface">
        <p className="text-ink-2 text-[14px] mb-6">Session not found.</p>
        <Button onClick={() => navigate('/workout')}>Back to Workouts</Button>
      </div>
    )
  }

  const totalSets = exercises.reduce((a, ex) => a + ex.sets.length, 0)
  const doneSets  = exercises.reduce((a, ex) => a + ex.sets.filter((s) => s.done).length, 0)
  const totalVolume = exercises.reduce((a, ex) =>
    a + ex.sets.reduce((b, s) => b + (s.done ? (Number(s.weight) || 0) * (Number(s.reps) || 0) : 0), 0)
  , 0)

  const updateSet = (exIdx, setIdx, field, value) => {
    setExercises((prev) => prev.map((ex, ei) => {
      if (ei !== exIdx) return ex
      return { ...ex, sets: ex.sets.map((s, si) => si === setIdx ? { ...s, [field]: value } : s) }
    }))
    setDirty(true)
  }

  const addSet = (exIdx) => {
    setExercises((prev) => prev.map((ex, ei) => {
      if (ei !== exIdx) return ex
      const last = ex.sets[ex.sets.length - 1] || {}
      return {
        ...ex,
        sets: [
          ...ex.sets,
          { id: nanoid(), index: ex.sets.length + 1, reps: last.reps || '', weight: last.weight || '', done: false },
        ],
      }
    }))
    setDirty(true)
  }

  const removeSet = (exIdx, setIdx) => {
    setExercises((prev) => prev.map((ex, ei) => {
      if (ei !== exIdx) return ex
      if (ex.sets.length <= 1) return ex
      return { ...ex, sets: ex.sets.filter((_, i) => i !== setIdx) }
    }))
    setDirty(true)
  }

  const removeExercise = (exIdx) => {
    if (exercises.length <= 1) return
    setExercises((prev) => prev.filter((_, i) => i !== exIdx))
    setDirty(true)
  }

  const save = () => {
    updateSession(id, { exercises, notes, duration })
    setSaved(true)
    setDirty(false)
    setTimeout(() => setSaved(false), 1500)
  }

  const handleDelete = () => {
    deleteSession(id)
    navigate('/workout')
  }

  const mins = Math.floor((duration || 0) / 60)

  return (
    <div className="flex flex-col min-h-full bg-surface">
      {/* Sticky header */}
      <div className="sticky top-0 z-30 bg-surface/95 backdrop-blur px-5 pt-12 pb-3 border-b border-surface-line-soft">
        <div className="flex items-center justify-between mb-2">
          <button
            onClick={() => {
              if (dirty && !confirm('Discard unsaved changes?')) return
              navigate(-1)
            }}
            className="w-9 h-9 rounded-md bg-surface-elev border border-surface-line-soft flex items-center justify-center text-ink-2 hover:text-ink"
          >
            <ArrowLeft size={16} />
          </button>
          <div className="text-center min-w-0 flex-1 px-2">
            <p className="font-mono text-[10px] uppercase tracking-eyebrow text-ink-3 truncate">
              {original.date}
            </p>
            <p className="text-ink text-[13px] font-medium truncate">{original.planDayName}</p>
          </div>
          <button
            onClick={() => setShowDelete(true)}
            className="w-9 h-9 rounded-md bg-surface-elev border border-surface-line-soft flex items-center justify-center text-ink-2 hover:text-accent"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Stats strip */}
      <div className="px-5 pt-4">
        <div className="flex items-stretch gap-0 border-y border-surface-line-soft py-4 mb-5">
          <Stat3 label="Sets" value={`${doneSets}/${totalSets}`} />
          <span className="w-px bg-surface-line-soft" />
          <Stat3 label="Duration" value={`${mins}m`} />
          <span className="w-px bg-surface-line-soft" />
          <Stat3 label="Volume" value={formatVol(totalVolume)} unit={wUnit} />
        </div>
      </div>

      {/* Exercises */}
      <div className="px-5 space-y-4 pb-32">
        {exercises.map((ex, ei) => (
          <div key={ex.id || ei} className="bg-surface-card border border-surface-line-soft rounded-[20px] overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3.5 border-b border-surface-line-soft">
              <p className="text-ink text-[15px] font-medium truncate">{ex.name}</p>
              <button
                onClick={() => removeExercise(ei)}
                disabled={exercises.length <= 1}
                className="text-ink-3 hover:text-accent p-1.5 disabled:opacity-30"
              >
                <Trash2 size={13} />
              </button>
            </div>

            <div className="p-4">
              {/* Set headers */}
              <div className="grid items-center mb-2.5" style={{ gridTemplateColumns: '32px 1fr 1fr 36px 32px', gap: '8px' }}>
                <span className="font-mono text-[9px] uppercase tracking-eyebrow text-ink-3 text-center">Set</span>
                <span className="font-mono text-[9px] uppercase tracking-eyebrow text-ink-3 text-center">{wUnit.toUpperCase()}</span>
                <span className="font-mono text-[9px] uppercase tracking-eyebrow text-ink-3 text-center">Reps</span>
                <span />
                <span />
              </div>

              {ex.sets.map((set, si) => (
                <div
                  key={set.id || si}
                  className="grid items-center mb-2"
                  style={{ gridTemplateColumns: '32px 1fr 1fr 36px 32px', gap: '8px' }}
                >
                  <span className={`font-mono text-[14px] tabular-nums text-center ${set.done ? 'text-accent' : 'text-ink-3'}`}>
                    {String(si + 1).padStart(2, '0')}
                  </span>
                  <input
                    type="number"
                    inputMode="decimal"
                    placeholder="—"
                    value={set.weight}
                    onChange={(e) => updateSet(ei, si, 'weight', e.target.value)}
                    className="bg-surface-elev border border-surface-line-soft rounded-md px-2 py-2.5 text-center font-mono text-[16px] tabular-nums text-ink focus:outline-none focus:border-accent"
                  />
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder="—"
                    value={set.reps}
                    onChange={(e) => updateSet(ei, si, 'reps', e.target.value)}
                    className="bg-surface-elev border border-surface-line-soft rounded-md px-2 py-2.5 text-center font-mono text-[16px] tabular-nums text-ink focus:outline-none focus:border-accent"
                  />
                  <button
                    onClick={() => updateSet(ei, si, 'done', !set.done)}
                    className="w-9 h-9 rounded-md flex items-center justify-center transition-colors"
                    style={{
                      background: set.done ? '#FF2D2D' : 'transparent',
                      border: set.done ? 'none' : '1.5px solid #24242A',
                    }}
                  >
                    {set.done && <Check size={14} strokeWidth={3} className="text-white" />}
                  </button>
                  {ex.sets.length > 1 ? (
                    <button onClick={() => removeSet(ei, si)} className="text-ink-4 hover:text-accent p-1.5">
                      <X size={12} />
                    </button>
                  ) : <span />}
                </div>
              ))}

              <button
                onClick={() => addSet(ei)}
                className="w-full mt-2 py-2.5 rounded-md border border-dashed border-surface-line text-ink-3 font-mono text-[10px] uppercase tracking-eyebrow hover:border-accent-line hover:text-accent flex items-center justify-center gap-1"
              >
                <Plus size={12} /> Add Set
              </button>
            </div>
          </div>
        ))}

        {/* Notes */}
        <div className="bg-surface-card border border-surface-line-soft rounded-[20px] p-4">
          <p className="font-mono text-[10px] uppercase tracking-eyebrow text-ink-3 mb-2">Session Notes</p>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => { setNotes(e.target.value); setDirty(true) }}
            placeholder="How did it feel? Anything to remember next time…"
            className="w-full bg-surface-elev border border-surface-line-soft rounded-md px-3 py-3 text-ink text-[14px] placeholder:text-ink-4 focus:outline-none focus:border-accent resize-none"
          />
        </div>
      </div>

      {/* Sticky save button */}
      <div
        className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[480px] px-5 pt-3 bg-gradient-to-t from-surface via-surface/95 to-transparent z-30"
        style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}
      >
        <Button size="lg" className="w-full" onClick={save} disabled={!dirty && !saved}>
          {saved ? (<><Check size={16}/> Saved</>) : dirty ? (<><Save size={16}/> Save Changes</>) : (<>No Changes</>)}
        </Button>
      </div>

      {/* Delete confirm */}
      {showDelete && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-end" onClick={() => setShowDelete(false)}>
          <div className="bg-surface-raised border-t border-surface-line w-full max-w-[480px] mx-auto rounded-t-[28px] p-6"
               style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))' }}
               onClick={(e) => e.stopPropagation()}>
            <p className="font-mono text-[10px] uppercase tracking-eyebrow text-accent mb-2">Delete</p>
            <h2 className="font-display text-[28px] italic text-ink leading-none tracking-display mb-1">Remove session?</h2>
            <p className="text-ink-2 text-[13px] mb-5">
              {original.date} · {original.planDayName}. This can't be undone.
            </p>
            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setShowDelete(false)}>Keep</Button>
              <button
                onClick={handleDelete}
                className="flex-[2] bg-accent text-white py-3.5 rounded-lg font-mono uppercase tracking-eyebrow-2 text-xs"
              >
                <Trash2 size={14} className="inline mr-2" /> Delete Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Stat3({ label, value, unit }) {
  return (
    <div className="flex-1 px-2">
      <p className="font-mono text-[9px] uppercase tracking-eyebrow text-ink-3 mb-1.5">{label}</p>
      <p className="font-mono text-[18px] tabular-nums text-ink leading-none">
        {value}{unit && <span className="text-ink-3 text-[10px] ml-1">{unit}</span>}
      </p>
    </div>
  )
}

function deepClone(arr) {
  return arr.map((ex) => ({ ...ex, sets: ex.sets.map((s) => ({ ...s })) }))
}
function formatVol(v) {
  if (v >= 1000) return (v / 1000).toFixed(1) + 'k'
  return String(Math.round(v))
}
