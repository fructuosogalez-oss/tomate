import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Play, X } from 'lucide-react'
import { useStore } from '../store/useStore'

/**
 * ResumeBanner — shown on Home and Train pages when an unfinished
 * workout exists in the store. Lets the user jump back into it.
 */
export default function ResumeBanner({ className = '' }) {
  const navigate = useNavigate()
  const { activeWorkout, finishWorkout } = useStore()
  const [confirmDiscard, setConfirmDiscard] = useState(false)
  const [now, setNow] = useState(Date.now())

  // Keep elapsed time fresh (ticks every second)
  useEffect(() => {
    if (!activeWorkout) return
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [activeWorkout])

  if (!activeWorkout) return null

  const total = activeWorkout.exercises.reduce((a, ex) => a + ex.sets.length, 0)
  const done  = activeWorkout.exercises.reduce((a, ex) => a + ex.sets.filter((s) => s.done).length, 0)
  const elapsedSec = Math.max(0, Math.floor((now - activeWorkout.startTime) / 1000))
  const mins = Math.floor(elapsedSec / 60)

  return (
    <div className={`bg-accent-soft border border-accent-line rounded-[16px] p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="w-1.5 h-1.5 rounded-full bg-accent breathe" />
        <p className="font-mono text-[10px] uppercase tracking-eyebrow text-accent">Active session</p>
      </div>
      <p className="text-ink text-[15px] font-medium truncate">{activeWorkout.planDayName}</p>
      <p className="font-mono text-[11px] tabular-nums text-ink-2 mt-0.5">
        {done} / {total} sets · {mins}m elapsed
      </p>

      <div className="flex gap-2 mt-3">
        <button
          onClick={() => navigate('/workout/log')}
          className="flex-[2] bg-accent text-white rounded-md py-3 font-mono uppercase tracking-eyebrow-2 text-[11px] flex items-center justify-center gap-2 active:scale-[0.98]"
        >
          <Play size={14} fill="currentColor" /> Resume
        </button>
        <button
          onClick={() => setConfirmDiscard(true)}
          className="px-4 bg-surface-elev text-ink-2 border border-surface-line-soft rounded-md font-mono uppercase tracking-eyebrow-2 text-[11px] hover:text-ink"
          title="Discard"
        >
          <X size={14} />
        </button>
      </div>

      {confirmDiscard && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-end" onClick={() => setConfirmDiscard(false)}>
          <div
            className="bg-surface-raised border-t border-surface-line w-full max-w-[480px] mx-auto rounded-t-[28px] p-6"
            style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))' }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="font-mono text-[10px] uppercase tracking-eyebrow text-accent mb-2">Discard</p>
            <h2 className="font-display text-[28px] italic text-ink leading-none tracking-display mb-1">Throw away session?</h2>
            <p className="text-ink-2 text-[13px] mb-5">
              {done} sets won't be saved. This can't be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirmDiscard(false)}
                className="flex-1 bg-surface-elev text-ink border border-surface-line-soft rounded-lg py-3.5 font-mono uppercase tracking-eyebrow-2 text-xs"
              >
                Keep
              </button>
              <button
                onClick={() => { finishWorkout(); setConfirmDiscard(false) }}
                className="flex-[2] bg-accent text-white rounded-lg py-3.5 font-mono uppercase tracking-eyebrow-2 text-xs"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
