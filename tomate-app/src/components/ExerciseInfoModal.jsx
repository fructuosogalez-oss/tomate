import { X, Play, Info } from 'lucide-react'
import { lookupExercise, youtubeSearchUrl } from '../utils/exerciseLibrary'

/**
 * ExerciseInfoModal — bottom sheet showing form cues for an exercise plus
 * a button to watch a real demo on YouTube. Falls back gracefully when the
 * exercise isn't in the curated library.
 */
export default function ExerciseInfoModal({ exerciseName, onClose }) {
  const info = lookupExercise(exerciseName)
  const ytUrl = youtubeSearchUrl(exerciseName)

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-end" onClick={onClose}>
      <div
        className="bg-surface-raised border-t border-surface-line w-full max-w-[480px] mx-auto rounded-t-[28px] p-6 max-h-[88vh] overflow-y-auto"
        style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-1">
          <p className="font-mono text-[10px] uppercase tracking-eyebrow text-accent flex items-center gap-2">
            <Info size={12} /> Form Guide
          </p>
          <button onClick={onClose} className="p-2 -mr-2 -mt-1 text-ink-3 hover:text-ink">
            <X size={18} />
          </button>
        </div>
        <h2 className="font-display text-[28px] italic text-ink leading-none tracking-display mb-5">
          {exerciseName}.
        </h2>

        {info ? (
          <>
            <p className="font-mono text-[10px] uppercase tracking-eyebrow text-ink-3 mb-3">Key Cues</p>
            <ul className="space-y-2.5 mb-6">
              {info.cues.map((cue, i) => (
                <li key={i} className="flex gap-3 items-start">
                  <span className="font-mono text-[11px] tabular-nums text-accent mt-0.5 shrink-0">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="text-ink text-[14px] leading-snug">{cue}</span>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="text-ink-2 text-[13px] mb-6">
            No tengo cues guardados para este ejercicio. Mira un demo en YouTube abajo.
          </p>
        )}

        <a
          href={ytUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-accent text-white py-3.5 rounded-lg font-mono uppercase tracking-eyebrow-2 text-[12px] flex items-center justify-center gap-2 active:scale-[0.98] shadow-[0_8px_20px_-6px_rgba(255,45,45,0.5)]"
        >
          <Play size={14} fill="currentColor" /> Watch Demo on YouTube
        </a>

        <p className="font-mono text-[10px] uppercase tracking-eyebrow text-ink-4 text-center mt-4">
          Opens youtube.com in a new tab
        </p>
      </div>
    </div>
  )
}
