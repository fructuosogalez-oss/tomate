import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Timer, MoreHorizontal, Mic, ArrowRightLeft, SkipForward, RotateCcw,
  Check, X, Minus, Plus, ChevronRight, Dumbbell
} from 'lucide-react'
import RestTimer from '../components/RestTimer'
import Button from '../components/Button'
import { useStore } from '../store/useStore'
import { weightUnit } from '../utils/units'

function nanoid() { return Math.random().toString(36).slice(2, 10) }

const COMPOUND_RX = /(bench|squat|deadlift|overhead press|press|row)/i
const restForExercise = (name) => COMPOUND_RX.test(name || '') ? 120 : 90

export default function WorkoutLogger() {
  const navigate = useNavigate()
  const { activeWorkout, updateActiveWorkout, finishWorkout, addSession, profile } = useStore()
  const wUnit = weightUnit(profile)
  const [showTimer, setShowTimer] = useState(false)
  const [restSeconds, setRestSeconds] = useState(90)
  const [restNext, setRestNext] = useState(null)  // {exerciseName, weight, reps, setLabel}
  const [showFinish, setShowFinish] = useState(false)
  const [sessionNote, setSessionNote] = useState('')
  const [elapsed, setElapsed] = useState(0)
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
      <div className="flex flex-col min-h-full items-center justify-center px-6 pb-10 bg-surface">
        <Dumbbell size={36} className="text-ink-4 mb-4" />
        <p className="text-ink-2 text-[14px] mb-6">No active workout session.</p>
        <Button onClick={() => navigate('/workout')}>Go to Workouts</Button>
      </div>
    )
  }

  // Identify the active exercise + active set (skipping any marked skipped)
  const exercises = activeWorkout.exercises
  const exIdx = exercises.findIndex((ex) => !ex.skipped && ex.sets.some((s) => !s.done))
  const safeExIdx = exIdx === -1 ? exercises.length - 1 : exIdx
  const cur = exercises[safeExIdx] || exercises[0]
  const setIdx = cur ? Math.max(0, cur.sets.findIndex((s) => !s.done)) : 0
  const curSet = cur?.sets?.[setIdx]

  const totalSets = exercises.reduce((a, ex) => a + ex.sets.length, 0)
  const doneSets  = exercises.reduce((a, ex) => a + ex.sets.filter((s) => s.done).length, 0)
  const setsPct   = totalSets ? Math.round((doneSets / totalSets) * 100) : 0
  const allDone   = doneSets === totalSets && totalSets > 0

  // Auto-fill weight + reps from previous set if blank
  const prevDoneSet = cur?.sets?.slice(0, setIdx).reverse().find((s) => s.done)
  const displayWeight = curSet?.weight !== '' && curSet?.weight != null ? curSet.weight : (prevDoneSet?.weight ?? cur?.weight ?? '')
  const displayReps   = curSet?.reps   !== '' && curSet?.reps   != null ? curSet.reps   : (prevDoneSet?.reps   ?? parseInt(String(cur?.reps).split('-')[0]) ?? '')

  const mins = String(Math.floor(elapsed / 60)).padStart(2, '0')
  const secs = String(elapsed % 60).padStart(2, '0')

  // ── Handlers ──────────────────────────────────────────────────────────
  const updateActiveSet = (field, value) => {
    const next = exercises.map((ex, ei) => {
      if (ei !== safeExIdx) return ex
      return { ...ex, sets: ex.sets.map((s, si) => si === setIdx ? { ...s, [field]: value } : s) }
    })
    updateActiveWorkout({ exercises: next })
  }

  const adjustWeight = (delta) => {
    const cur = Number(displayWeight) || 0
    updateActiveSet('weight', String(Math.max(0, +(cur + delta).toFixed(2))))
  }

  const adjustReps = (delta) => {
    const cur = Number(displayReps) || 0
    updateActiveSet('reps', String(Math.max(0, cur + delta)))
  }

  const logSet = () => {
    if (!cur || !curSet) return
    // make sure weight + reps are persisted (in case user never typed but used auto-fill)
    const next = exercises.map((ex, ei) => {
      if (ei !== safeExIdx) return ex
      return {
        ...ex,
        sets: ex.sets.map((s, si) =>
          si === setIdx
            ? { ...s, weight: String(displayWeight ?? ''), reps: String(displayReps ?? ''), done: true }
            : s
        ),
      }
    })
    updateActiveWorkout({ exercises: next })

    // Determine next set + rest preview
    const updatedEx = next[safeExIdx]
    const nextSetIdx = updatedEx.sets.findIndex((s) => !s.done)
    let nextEx, nextSet, nextSetLabel
    if (nextSetIdx !== -1) {
      nextEx = updatedEx
      nextSet = updatedEx.sets[nextSetIdx]
      nextSetLabel = `Set ${nextSetIdx + 1} / ${updatedEx.sets.length}`
    } else {
      const nextExIdx = next.findIndex((ex, i) => i > safeExIdx && ex.sets.some((s) => !s.done))
      if (nextExIdx !== -1) {
        nextEx = next[nextExIdx]
        nextSet = nextEx.sets.find((s) => !s.done)
        nextSetLabel = `Set 1 / ${nextEx.sets.length}`
      }
    }

    if (nextEx && nextSet) {
      setRestNext({
        exerciseName: nextEx.name,
        weight: nextSet.weight || displayWeight,
        reps:   nextSet.reps   || displayReps,
        setLabel: nextSetLabel,
      })
      setRestSeconds(restForExercise(updatedEx.name))
      setShowTimer(true)
      if (navigator.vibrate) navigator.vibrate(40)
    } else {
      // workout complete
      if (navigator.vibrate) navigator.vibrate([30, 60, 30, 60, 80])
    }
  }

  const skipCurrent = () => {
    if (!cur) return
    const next = exercises.map((ex, ei) => ei === safeExIdx ? { ...ex, skipped: true } : ex)
    updateActiveWorkout({ exercises: next })
    if (navigator.vibrate) navigator.vibrate(20)
  }

  const unskip = (i) => {
    const next = exercises.map((ex, ei) => ei === i ? { ...ex, skipped: false } : ex)
    updateActiveWorkout({ exercises: next })
  }

  const finish = () => {
    const session = {
      ...activeWorkout,
      id: nanoid(),
      duration: elapsed,
      notes: sessionNote,
      intensity: 'normal',
    }
    addSession(session)
    finishWorkout()
    navigate('/workout')
  }

  const planDayName = activeWorkout.planDayName || 'Workout'

  return (
    <div className="flex flex-col min-h-full bg-surface">
      {/* ── Sticky header ─────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 bg-surface/95 backdrop-blur px-5 pt-12 pb-4 border-b border-surface-line-soft">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setShowFinish(true)}
            className="flex items-center gap-2 bg-surface-elev px-3 py-1.5 rounded-pill border border-surface-line-soft"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-accent breathe" />
            <span className="font-mono text-[11px] uppercase tracking-eyebrow text-ink tabular-nums">
              Live · {mins}:{secs}
            </span>
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={() => { setRestNext(null); setRestSeconds(90); setShowTimer(true) }}
              className="w-9 h-9 rounded-md flex items-center justify-center text-ink-2 hover:text-ink hover:bg-surface-elev"
            >
              <Timer size={18} />
            </button>
            <button
              onClick={() => setShowFinish(true)}
              className="w-9 h-9 rounded-md flex items-center justify-center text-ink-2 hover:text-ink hover:bg-surface-elev"
            >
              <MoreHorizontal size={18} />
            </button>
          </div>
        </div>

        {/* Multi-segment progress bar */}
        <div className="flex gap-1 h-[3px] mb-2">
          {exercises.map((ex, i) => {
            const ed = ex.sets.filter((s) => s.done).length
            const pct = ex.sets.length ? (ed / ex.sets.length) * 100 : 0
            const isActive = i === safeExIdx
            const allEx = ed === ex.sets.length && ex.sets.length > 0
            return (
              <div
                key={i}
                className="flex-1 rounded-full overflow-hidden"
                style={{
                  flexGrow: ex.sets.length || 1,
                  background: allEx
                    ? '#FF2D2D'
                    : isActive
                      ? `linear-gradient(90deg, #FF2D2D ${pct}%, rgba(255,45,45,0.18) ${pct}%)`
                      : pct > 0
                        ? `linear-gradient(90deg, #FF2D2D ${pct}%, #24242A ${pct}%)`
                        : '#24242A',
                  border: isActive && !allEx ? '1px solid rgba(255,45,45,0.35)' : 'none',
                }}
              />
            )
          })}
        </div>

        <div className="flex items-center justify-between">
          <p className="font-mono text-[10px] uppercase tracking-eyebrow text-ink-3 truncate flex-1">
            Ex · {String(safeExIdx + 1).padStart(2, '0')} / {String(exercises.length).padStart(2, '0')} · {planDayName}
          </p>
          <p className="font-mono text-[10px] uppercase tracking-eyebrow text-ink-2 tabular-nums">
            {doneSets} / {totalSets} Sets · {setsPct}%
          </p>
        </div>
      </div>

      {/* ── Hero block ───────────────────────────────────────────────── */}
      <div className="px-5 pt-5">
        {!allDone && cur && curSet ? (
          <div
            className="relative rounded-[20px] p-5 border border-surface-line-soft overflow-hidden"
            style={{ background: 'linear-gradient(180deg, rgba(255,45,45,0.06) 0%, transparent 50%)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="font-mono text-[10px] uppercase tracking-eyebrow text-accent flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-accent breathe" />
                Now · Set {setIdx + 1} of {cur.sets.length}
              </p>
              <p className="font-mono text-[10px] uppercase tracking-eyebrow text-ink-3 tabular-nums">
                Target {cur.reps || '—'} reps
              </p>
            </div>

            <h2 className="font-display text-[32px] italic text-ink leading-none tracking-display truncate mb-1">
              {cur.name}
            </h2>
            <p className="font-mono text-[11px] uppercase tracking-eyebrow text-ink-3 mb-5">
              {inferCue(cur.name)}
            </p>

            {/* Stepper chips */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <Stepper
                label={`Weight · ${wUnit.toUpperCase()}`}
                value={displayWeight}
                onMinus={() => adjustWeight(-2.5)}
                onPlus={() => adjustWeight(+2.5)}
                onChange={(v) => updateActiveSet('weight', v)}
                prev={prevDoneSet?.weight}
              />
              <Stepper
                label="Reps"
                value={displayReps}
                onMinus={() => adjustReps(-1)}
                onPlus={() => adjustReps(+1)}
                onChange={(v) => updateActiveSet('reps', v)}
                prev={prevDoneSet?.reps}
              />
            </div>

            {/* Giant LOG SET button */}
            <button
              onClick={logSet}
              className="relative w-full bg-accent text-white py-5 rounded-[20px] active:scale-[0.98] transition-transform shadow-[0_12px_32px_-8px_rgba(255,45,45,0.5)]"
            >
              <span
                aria-hidden
                className="absolute inset-0 rounded-[20px] border-2 border-white/15 animate-pulse-ring pointer-events-none"
              />
              <div className="flex items-center justify-center gap-3 relative">
                <Check size={28} strokeWidth={2.4} />
                <div className="text-left">
                  <p className="font-sans font-semibold text-[19px] leading-none">Log Set</p>
                  <p className="font-mono text-[12px] tabular-nums text-white/85 mt-1">
                    {displayWeight || '—'}{wUnit} × {displayReps || '—'}
                  </p>
                </div>
              </div>
            </button>

            {/* Secondary actions */}
            <div className="flex gap-2 mt-3">
              <SecondaryAction icon={<Mic size={14} />} label="Voice" onClick={() => alert('Voice logging is configured in Settings → Voice Coach')} />
              <SecondaryAction icon={<SkipForward size={14} />} label="Skip" onClick={skipCurrent} />
              <SecondaryAction icon={<ArrowRightLeft size={14} />} label="Swap" onClick={() => alert('Exercise swap coming soon')} />
            </div>
          </div>
        ) : (
          <div className="bg-surface-card border border-surface-line-soft rounded-[20px] p-6 text-center">
            <Check size={32} strokeWidth={2.4} className="text-accent mx-auto mb-3" />
            <h2 className="font-display text-[28px] italic text-ink mb-2">All sets done.</h2>
            <p className="text-ink-2 text-[14px] mb-4">Great session. Ready to wrap up?</p>
            <Button onClick={() => setShowFinish(true)} className="w-full">Finish Workout</Button>
          </div>
        )}
      </div>

      {/* ── Sets table ───────────────────────────────────────────────── */}
      {cur && (
        <div className="px-5 mt-5">
          <p className="font-mono text-[10px] uppercase tracking-eyebrow text-ink-3 mb-2">All Sets · {cur.name}</p>
          <div className="bg-surface-card border border-surface-line-soft rounded-[20px] overflow-hidden">
            {cur.sets.map((set, si) => {
              const isCurrent = si === setIdx && !allDone
              const isDone = set.done
              const isUpcoming = !isDone && !isCurrent
              return (
                <div
                  key={set.id || si}
                  className="grid items-center px-4 py-3.5"
                  style={{
                    gridTemplateColumns: '36px 1fr 1fr 44px',
                    gap: '8px',
                    background: isCurrent ? 'rgba(255,45,45,0.06)' : 'transparent',
                    borderBottom: si < cur.sets.length - 1 ? '1px solid #1B1B20' : 'none',
                    boxShadow: isCurrent ? 'inset 2px 0 0 #FF2D2D' : 'none',
                  }}
                >
                  <span className={`font-mono text-[11px] tabular-nums ${isCurrent ? 'text-accent' : isDone ? 'text-ink' : 'text-ink-3'}`}>
                    {String(si + 1).padStart(2, '0')}
                  </span>
                  <span className={`font-mono text-[16px] tabular-nums ${isUpcoming ? 'text-ink-3' : 'text-ink'}`}>
                    {set.weight || (isCurrent ? displayWeight || '—' : '—')}<span className="text-ink-3 text-[11px] ml-1">{wUnit}</span>
                  </span>
                  <span className={`font-mono text-[16px] tabular-nums ${isUpcoming ? 'text-ink-3' : 'text-ink'}`}>
                    {set.reps || (isCurrent ? displayReps || '—' : '—')}<span className="text-ink-3 text-[11px] ml-1">reps</span>
                  </span>
                  <button
                    onClick={() => {
                      const next = exercises.map((ex, ei) => {
                        if (ei !== safeExIdx) return ex
                        return { ...ex, sets: ex.sets.map((s, i) => i === si ? { ...s, done: !s.done } : s) }
                      })
                      updateActiveWorkout({ exercises: next })
                    }}
                    className="w-7 h-7 rounded-md flex items-center justify-center transition-colors"
                    style={{
                      background: isDone ? '#FF2D2D' : 'transparent',
                      border: isDone ? 'none' : isCurrent ? '1.5px dashed rgba(255,45,45,0.7)' : '1.5px solid #24242A',
                    }}
                  >
                    {isDone && <Check size={14} strokeWidth={3} className="text-white check-pop" />}
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── All exercises (review + skip control) ─────────────────────── */}
      <div className="px-5 mt-5 mb-6">
        <p className="font-mono text-[10px] uppercase tracking-eyebrow text-ink-3 mb-3">All Exercises</p>
        <div className="bg-surface-card border border-surface-line-soft rounded-[20px] overflow-hidden">
          {exercises.map((ex, i) => {
            const ed = ex.sets.filter((s) => s.done).length
            const total = ex.sets.length
            const isCurrent  = i === safeExIdx && !ex.skipped
            const isComplete = total > 0 && ed === total && !ex.skipped
            const isSkipped  = !!ex.skipped
            const isUpcoming = !isCurrent && !isComplete && !isSkipped

            const status = isComplete ? '✓' : isSkipped ? 'Tap to resume' : isCurrent ? 'Active' : 'Upcoming'
            const statusColor = isComplete ? 'text-good' : isSkipped ? 'text-accent' : isCurrent ? 'text-accent' : 'text-ink-3'

            const Wrapper = isSkipped ? 'button' : 'div'

            return (
              <Wrapper
                key={ex.id || i}
                {...(isSkipped ? { onClick: () => unskip(i), type: 'button' } : {})}
                className={`w-full text-left px-4 py-3 ${i < exercises.length - 1 ? 'border-b border-surface-line-soft' : ''} ${isCurrent ? 'bg-accent-soft' : ''} ${isSkipped ? 'cursor-pointer hover:bg-surface-elev active:bg-surface-elev' : ''}`}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="font-mono text-[11px] tabular-nums text-ink-3 w-6 shrink-0">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[14px] font-medium truncate ${isSkipped ? 'text-ink-2' : isUpcoming ? 'text-ink-2' : 'text-ink'}`}>
                      {ex.name}
                    </p>
                    <p className="font-mono text-[10px] uppercase tracking-eyebrow text-ink-3 mt-0.5 tabular-nums">
                      {ed}/{total} sets · target {ex.reps || '—'} reps
                    </p>
                  </div>
                  <span className={`font-mono text-[10px] uppercase tracking-eyebrow ${statusColor} shrink-0 flex items-center gap-1`}>
                    {isSkipped && <RotateCcw size={10} />}
                    {status}
                  </span>
                </div>

                {/* Set chips — show what was logged */}
                <div className="flex flex-wrap gap-1.5 ml-9">
                  {ex.sets.map((s, si) => (
                    <span
                      key={s.id || si}
                      className={`font-mono text-[11px] tabular-nums px-2 py-1 rounded ${
                        s.done
                          ? 'bg-surface-elev text-ink border border-surface-line-soft'
                          : isSkipped
                            ? 'bg-transparent text-ink-4 border border-dashed border-surface-line'
                            : 'bg-transparent text-ink-3 border border-dashed border-surface-line'
                      }`}
                    >
                      {s.done
                        ? `${s.weight || '—'}${wUnit} × ${s.reps || '—'}`
                        : `set ${si + 1}`}
                    </span>
                  ))}
                </div>
              </Wrapper>
            )
          })}
        </div>
      </div>

      {/* ── Rest timer overlay ───────────────────────────────────────── */}
      {showTimer && (
        <RestTimer
          seconds={restSeconds}
          next={restNext}
          unit={wUnit}
          onClose={() => setShowTimer(false)}
        />
      )}

      {/* ── Finish dialog ────────────────────────────────────────────── */}
      {showFinish && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-end" onClick={() => setShowFinish(false)}>
          <div
            className="bg-surface-raised border-t border-surface-line w-full max-w-[480px] mx-auto rounded-t-[28px] p-6"
            style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))' }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-mono text-[10px] uppercase tracking-eyebrow text-accent mb-2">Wrap Up</p>
            <h2 className="font-display text-[28px] italic text-ink leading-none tracking-display mb-1">Finish workout?</h2>
            <p className="font-mono text-[11px] uppercase tracking-eyebrow text-ink-3 mb-4 tabular-nums">
              {doneSets} of {totalSets} Sets · {mins}:{secs}
            </p>
            <textarea
              className="w-full bg-surface-elev border border-surface-line-soft rounded-md px-3 py-3 text-ink text-[15px] placeholder:text-ink-4 focus:outline-none focus:border-accent resize-none mb-4"
              rows={2}
              placeholder="Session notes (optional)"
              value={sessionNote}
              onChange={(e) => setSessionNote(e.target.value)}
            />
            <Button size="lg" className="w-full mb-2" onClick={finish}>Save Session</Button>
            <Button variant="ghost" size="lg" className="w-full" onClick={() => setShowFinish(false)}>
              Keep Going
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Subcomponents ────────────────────────────────────────────────────────
function Stepper({ label, value, onMinus, onPlus, onChange, prev }) {
  return (
    <div className="bg-surface-elev border border-surface-line-soft rounded-[14px] px-3 py-3">
      <p className="font-mono text-[9px] uppercase tracking-eyebrow text-ink-3 mb-2">{label}</p>
      <div className="flex items-center justify-between gap-1">
        <button
          onClick={onMinus}
          className="w-8 h-8 rounded-md bg-surface flex items-center justify-center text-ink-2 active:scale-95 active:bg-surface-card"
          style={{ touchAction: 'manipulation' }}
        >
          <Minus size={14} strokeWidth={2.4} />
        </button>
        <input
          type="number"
          inputMode="decimal"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 min-w-0 bg-transparent text-center font-mono text-[24px] tabular-nums text-ink focus:outline-none leading-none"
          placeholder="—"
        />
        <button
          onClick={onPlus}
          className="w-8 h-8 rounded-md bg-surface flex items-center justify-center text-ink-2 active:scale-95 active:bg-surface-card"
          style={{ touchAction: 'manipulation' }}
        >
          <Plus size={14} strokeWidth={2.4} />
        </button>
      </div>
      <p className="font-mono text-[10px] tabular-nums text-ink-4 text-center mt-1.5">
        prev {prev != null && prev !== '' ? prev : '—'}
      </p>
    </div>
  )
}

function SecondaryAction({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex-1 h-11 rounded-pill bg-surface-elev border border-surface-line-soft flex items-center justify-center gap-1.5 text-ink-2 hover:text-ink active:scale-[0.98] transition-all"
    >
      {icon}
      <span className="font-mono text-[11px] uppercase tracking-eyebrow">{label}</span>
    </button>
  )
}

function inferCue(name) {
  const n = (name || '').toLowerCase()
  if (n.includes('bench')) return 'Flat · Barbell'
  if (n.includes('squat')) return 'Back · Barbell'
  if (n.includes('deadlift')) return 'Conventional · Barbell'
  if (n.includes('overhead') || n.includes('ohp')) return 'Standing · Barbell'
  if (n.includes('row')) return 'Bent over'
  if (n.includes('curl')) return 'Strict form'
  if (n.includes('press')) return 'Controlled'
  if (n.includes('pull')) return 'Full range'
  return 'Focus on form'
}
