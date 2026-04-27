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
        className="bg-surface-card border-t border-surface-border w-full max-w-[480px] p-6 pb-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <span className="text-[10px] font-bold uppercase tracking-widest-x text-brand-500">Rest Timer</span>
          <button onClick={onClose} className="text-zinc-500 hover:text-white p-1">
            <X size={18} />
          </button>
        </div>

        {/* Presets */}
        <div className="flex gap-2 mb-6 justify-center">
          {PRESETS.map((s) => (
            <button
              key={s}
              onClick={() => pick(s)}
              className={`px-3 py-2 text-[10px] font-bold uppercase tracking-wider-x transition-colors border ${
                selected === s
                  ? 'bg-white text-black border-white'
                  : 'bg-transparent text-zinc-500 border-surface-border hover:text-white'
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
              <circle cx="60" cy="60" r={r} fill="none" stroke="#1f1f1f" strokeWidth="8" />
              <circle
                cx="60" cy="60" r={r} fill="none"
                stroke={done ? '#fff' : '#ef4444'}
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={offset}
                style={{ transition: 'stroke-dashoffset 0.9s linear' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`text-4xl font-black tabular-nums ${done ? 'text-white' : 'text-white'}`}>
                {mins}:{secs}
              </span>
            </div>
          </div>

          {done && (
            <p className="text-brand-500 font-bold text-xs uppercase tracking-widest-x animate-pulse">Rest Over — Go</p>
          )}

          {/* Controls */}
          <div className="flex gap-4 items-center">
            <button
              onClick={reset}
              className="w-12 h-12 border border-surface-border flex items-center justify-center text-zinc-500 hover:text-white"
            >
              <RotateCcw size={16} />
            </button>
            <button
              onClick={() => setRunning((r) => !r)}
              className="w-16 h-16 bg-brand-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/40 hover:bg-brand-600"
            >
              {running ? <Pause size={22} /> : <Play size={22} className="ml-1" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
