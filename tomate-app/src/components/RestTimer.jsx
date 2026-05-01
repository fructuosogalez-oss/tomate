import { useState, useEffect, useRef } from 'react'

export default function RestTimer({ seconds = 90, next = null, unit = 'lbs', onClose }) {
  const [total, setTotal]     = useState(seconds)
  const [remaining, setRem]   = useState(seconds)
  const [running, setRunning] = useState(true)
  const intervalRef = useRef(null)
  const lastVibrateRef = useRef(null)

  useEffect(() => {
    setTotal(seconds); setRem(seconds); setRunning(true)
  }, [seconds])

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setRem((r) => {
          if (r <= 1) {
            clearInterval(intervalRef.current)
            setRunning(false)
            if (navigator.vibrate) navigator.vibrate([200, 100, 200])
            return 0
          }
          // last 3 seconds: tick haptics
          if (r <= 4 && r > 1 && lastVibrateRef.current !== r) {
            lastVibrateRef.current = r
            if (navigator.vibrate) navigator.vibrate(20)
          }
          return r - 1
        })
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [running])

  const adjust = (delta) => {
    setTotal((t) => Math.max(15, t + delta))
    setRem((r) => Math.max(0, r + delta))
  }

  const skip = () => onClose?.()

  // Ring math
  const r = 130
  const c = 2 * Math.PI * r
  const pct = total > 0 ? remaining / total : 0
  const offset = c * (1 - pct)

  const mins = Math.floor(remaining / 60)
  const secs = String(remaining % 60).padStart(2, '0')
  const finalDisplay = mins > 0 ? `${mins}:${secs}` : `0:${secs}`

  const phase = remaining === 0 ? 'GO' : remaining <= 10 ? 'GET READY' : 'BREATHE'

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{ background: 'rgba(10,10,11,0.92)', backdropFilter: 'blur(24px)' }}
    >
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-5 pt-12 pb-4">
        <p className="font-mono text-[10px] uppercase tracking-eyebrow text-accent flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-accent breathe" />
          Rest
        </p>
        <button
          onClick={skip}
          className="font-mono text-[11px] uppercase tracking-eyebrow text-ink-2 hover:text-ink bg-surface-elev border border-surface-line-soft rounded-pill px-3.5 py-1.5"
        >
          Skip →
        </button>
      </div>

      {/* Countdown ring */}
      <div className="relative w-[300px] h-[300px] flex items-center justify-center">
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 300 300" width="300" height="300">
          <circle cx="150" cy="150" r={r} fill="none" stroke="#24242A" strokeWidth="4" />
          <circle
            cx="150" cy="150" r={r} fill="none"
            stroke="#FF2D2D"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.95s linear' }}
          />
        </svg>

        <div className="text-center">
          <p className="font-mono text-[10px] uppercase tracking-eyebrow text-ink-3 mb-3">
            Rest · {total}s
          </p>
          <p className="font-mono text-[96px] font-normal tabular-nums text-ink leading-none tracking-display">
            {finalDisplay}
          </p>
          <p className={`font-mono text-[10px] uppercase tracking-eyebrow mt-3 ${remaining === 0 ? 'text-accent' : 'text-ink-3'} ${remaining === 0 ? 'breathe' : ''}`}>
            {phase}
          </p>
        </div>
      </div>

      {/* Adjust pills */}
      <div className="flex gap-3 mt-8">
        <button
          onClick={() => adjust(-15)}
          className="bg-surface-elev border border-surface-line-soft rounded-pill px-5 h-12 font-mono text-[12px] uppercase tracking-eyebrow text-ink-2 hover:text-ink active:scale-[0.97]"
        >
          −15s
        </button>
        <button
          onClick={() => setRunning((r) => !r)}
          className="bg-accent text-white rounded-pill px-6 h-12 font-mono text-[12px] uppercase tracking-eyebrow active:scale-[0.97]"
        >
          {running ? 'Pause' : 'Resume'}
        </button>
        <button
          onClick={() => adjust(+15)}
          className="bg-surface-elev border border-surface-line-soft rounded-pill px-5 h-12 font-mono text-[12px] uppercase tracking-eyebrow text-ink-2 hover:text-ink active:scale-[0.97]"
        >
          +15s
        </button>
      </div>

      {/* Up next */}
      {next && (
        <div className="absolute left-5 right-5 bottom-10">
          <div className="bg-surface-card border border-surface-line-soft rounded-[18px] p-[18px]" style={{ marginBottom: 'env(safe-area-inset-bottom)' }}>
            <div className="flex items-center justify-between mb-2">
              <p className="font-mono text-[10px] uppercase tracking-eyebrow text-ink-3">Up Next</p>
              <p className="font-mono text-[10px] uppercase tracking-eyebrow text-ink-2 tabular-nums">
                {next.setLabel}
              </p>
            </div>
            <p className="text-ink text-[18px] font-medium mb-2 truncate">{next.exerciseName}</p>
            <p className="font-mono text-[18px] tabular-nums text-ink">
              {next.weight || '—'}<span className="text-ink-3 text-[12px] ml-1">{unit}</span>
              <span className="mx-2 text-ink-3">×</span>
              {next.reps || '—'}<span className="text-ink-3 text-[12px] ml-1">reps</span>
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
