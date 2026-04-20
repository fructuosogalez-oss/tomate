import { useState, useEffect, useRef } from 'react'
import { X, Play, Pause, RotateCcw } from 'lucide-react'

const PRESETS = [30, 60, 90, 120, 180]

export default function RestTimer({ onClose }) {
  const [selected, setSelected] = useState(90)
  const [remaining, setRemaining] = useState(90)
  const [running, setRunning] = useState(false)
  const intervalRef = useRef(null)

  useEffect(() => {
    if (running) {
      intervalRef.current = setInterval(() => {
        setRemaining((r) => {
          if (r <= 1) {
            clearInterval(intervalRef.current)
            setRunning(false)
            // vibrate if supported
            if (navigator.vibrate) navigator.vibrate([200, 100, 200])
            return 0
          }
          return r - 1
        })
      }, 1000)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [running])

  const pick = (s) => {
    setSelected(s)
    setRemaining(s)
    setRunning(false)
  }

  const reset = () => {
    setRemaining(selected)
    setRunning(false)
  }

  const pct = remaining / selected
  const r = 54
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - pct)

  const mins = String(Math.floor(remaining / 60)).padStart(2, '0')
  const secs = String(remaining % 60).padStart(2, '0')
  const done = remaining === 0

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-end justify-center" onClick={onClose}>
      <div
        className="bg-surface-card w-full max-w-[480px] rounded-t-2xl p-6 pb-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-5">
          <span className="text-base font-semibold text-white">Rest Timer</span>
          <button onClick={onClose} className="text-zinc-400 hover:text-white p-1">
            <X size={20} />
          </button>
        </div>

        {/* Presets */}
        <div className="flex gap-2 mb-6 justify-center">
          {PRESETS.map((s) => (
            <button
              key={s}
              onClick={() => pick(s)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                selected === s
                  ? 'bg-brand-500 text-white'
                  : 'bg-surface-raised text-zinc-400 hover:text-white'
              }`}
            >
              {s < 60 ? `${s}s` : `${s / 60}m`}
            </button>
          ))}
        </div>

        {/* Ring */}
        <div className="flex flex-col items-center gap-5 mb-6">
          <div className="relative w-36 h-36">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r={r} fill="none" stroke="#2e2e2e" strokeWidth="8" />
              <circle
                cx="60" cy="60" r={r} fill="none"
                stroke={done ? '#ef4444' : '#22c55e'}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={offset}
                style={{ transition: 'stroke-dashoffset 0.9s linear' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-3xl font-bold tabular-nums ${done ? 'text-red-400' : 'text-white'}`}>
                {mins}:{secs}
              </span>
            </div>
          </div>

          {done && (
            <p className="text-brand-400 font-semibold text-sm animate-pulse">Rest over — time to go!</p>
          )}

          {/* Controls */}
          <div className="flex gap-4">
            <button
              onClick={reset}
              className="w-12 h-12 rounded-full bg-surface-raised flex items-center justify-center text-zinc-400 hover:text-white"
            >
              <RotateCcw size={18} />
            </button>
            <button
              onClick={() => setRunning((r) => !r)}
              className="w-16 h-16 rounded-full bg-brand-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/30"
            >
              {running ? <Pause size={22} /> : <Play size={22} className="ml-1" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
