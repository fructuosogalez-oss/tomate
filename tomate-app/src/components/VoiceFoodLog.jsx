import { useState, useEffect, useRef } from 'react'
import { Mic, MicOff, X, Loader2, Check, Trash2, Volume2 } from 'lucide-react'
import {
  SpeechRecognizer, isSTTSupported,
  parseFoodFromVoice, speak,
} from '../utils/voice'

/**
 * VoiceFoodLog — full-screen overlay that listens, parses with Claude,
 * shows a checklist of detected foods, then logs the selected ones.
 *
 * Props:
 *   voice — { elevenlabsKey, voiceId, claudeKey, sttLang, ttsModel, claudeModel }
 *   onLog(foods) — called with the list of foods the user confirmed
 *   onClose() — close the overlay
 */
export default function VoiceFoodLog({ voice, onLog, onClose }) {
  // phases: 'idle' (haven't started), 'listening', 'thinking', 'preview', 'error'
  const [phase, setPhase]          = useState('idle')
  const [transcript, setTranscript] = useState('')
  const [foods, setFoods]          = useState([])    // [{...food, _checked: true}]
  const [error, setError]          = useState('')
  const recognizerRef = useRef(null)
  const finalTranscriptRef = useRef('')

  // Auto-start listening on mount
  useEffect(() => {
    start()
    return () => recognizerRef.current?.stop()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const start = () => {
    setError('')
    setTranscript('')
    setFoods([])
    finalTranscriptRef.current = ''

    if (!isSTTSupported()) {
      setError('Tu navegador no soporta micrófono. Usa Safari o Chrome.')
      setPhase('error'); return
    }
    if (!voice?.claudeKey) {
      setError('Falta tu Claude API key. Configúrala en Settings → Voice Coach.')
      setPhase('error'); return
    }

    setPhase('listening')
    try {
      const rec = new SpeechRecognizer({
        lang: voice.sttLang || 'es-MX',
        onPartial: (t) => setTranscript((finalTranscriptRef.current + ' ' + t).trim()),
        onFinal:   (t) => {
          finalTranscriptRef.current = (finalTranscriptRef.current + ' ' + t).trim()
          setTranscript(finalTranscriptRef.current)
        },
        onError:   (e) => { setError(`Mic: ${e}`); setPhase('error') },
        onEnd:     () => {
          // If the recognizer ended on its own and we have content, parse it
          if (finalTranscriptRef.current.trim()) parse(finalTranscriptRef.current.trim())
        },
      })
      recognizerRef.current = rec
      rec.start()
    } catch (e) {
      setError(e.message || 'No pude iniciar el micrófono')
      setPhase('error')
    }
  }

  const stopAndParse = () => {
    recognizerRef.current?.stop()
    // onEnd will fire and call parse()
  }

  const parse = async (text) => {
    setPhase('thinking')
    try {
      const parsed = await parseFoodFromVoice({
        apiKey: voice.claudeKey,
        transcript: text,
        language: voice.sttLang || 'es-MX',
        model: voice.claudeModel,
      })
      if (!parsed.length) {
        setError('No detecté comida en lo que dijiste. Intenta de nuevo.')
        setPhase('error'); return
      }
      setFoods(parsed.map((f) => ({ ...f, _checked: true })))
      setPhase('preview')

      // Optional voice confirmation if ElevenLabs is configured
      if (voice.elevenlabsKey && voice.voiceId) {
        const total = parsed.reduce((a, b) => a + b.kcal, 0)
        const protein = parsed.reduce((a, b) => a + b.protein, 0)
        const msg = `Detecté ${parsed.length === 1 ? 'una comida' : `${parsed.length} comidas`}: ${total} calorías y ${Math.round(protein)} gramos de proteína. Revisa y confirma.`
        speak(msg, { apiKey: voice.elevenlabsKey, voiceId: voice.voiceId, model: voice.ttsModel || 'eleven_flash_v2_5' }).catch(() => {})
      }
    } catch (e) {
      setError(e.message || 'No pude procesar lo que dijiste')
      setPhase('error')
    }
  }

  const toggleFood = (i) => {
    setFoods((prev) => prev.map((f, idx) => idx === i ? { ...f, _checked: !f._checked } : f))
  }

  const removeFood = (i) => {
    setFoods((prev) => prev.filter((_, idx) => idx !== i))
  }

  const logSelected = () => {
    const selected = foods.filter((f) => f._checked)
    if (!selected.length) return
    onLog(selected)
    onClose()
  }

  const totals = foods.filter((f) => f._checked).reduce(
    (a, f) => ({ kcal: a.kcal + f.kcal, p: a.p + f.protein, c: a.c + f.carbs, f: a.f + f.fat }),
    { kcal: 0, p: 0, c: 0, f: 0 }
  )

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col"
      style={{ background: 'rgba(10,10,11,0.96)', backdropFilter: 'blur(24px)' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-12 pb-4">
        <p className="font-mono text-[10px] uppercase tracking-eyebrow text-accent flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-accent breathe" />
          Voice Log
        </p>
        <button
          onClick={onClose}
          className="w-9 h-9 rounded-md bg-surface-elev border border-surface-line-soft flex items-center justify-center text-ink-2 hover:text-ink"
        >
          <X size={18} />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-5">
        {/* Phase: listening */}
        {phase === 'listening' && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="relative w-32 h-32 mb-7">
              <span className="absolute inset-0 rounded-full bg-accent opacity-30 animate-pulse-ring" />
              <span className="absolute inset-2 rounded-full bg-accent opacity-50 animate-pulse-ring" style={{ animationDelay: '0.4s' }} />
              <div className="absolute inset-0 flex items-center justify-center bg-accent rounded-full">
                <Mic size={42} className="text-white" />
              </div>
            </div>
            <p className="font-mono text-[10px] uppercase tracking-eyebrow text-accent breathe mb-2">● Listening</p>
            <p className="text-ink-2 text-[13px] text-center max-w-[280px] leading-relaxed mb-6">
              Dime lo que comiste — por ejemplo: <em>"Dos huevos con una tortilla y un plátano"</em>
            </p>
            {transcript && (
              <div className="w-full bg-surface-card border border-surface-line-soft rounded-[14px] px-4 py-3 mb-5">
                <p className="font-mono text-[10px] uppercase tracking-eyebrow text-ink-3 mb-1">You said</p>
                <p className="text-ink text-[14px] leading-snug">{transcript}<span className="animate-pulse">|</span></p>
              </div>
            )}
            <button
              onClick={stopAndParse}
              className="bg-accent text-white px-6 py-3.5 rounded-pill font-mono uppercase tracking-eyebrow-2 text-[12px] flex items-center gap-2 active:scale-95"
            >
              <MicOff size={14} /> Stop & Parse
            </button>
          </div>
        )}

        {/* Phase: thinking */}
        {phase === 'thinking' && (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 size={32} className="text-accent animate-spin mb-4" />
            <p className="font-mono text-[10px] uppercase tracking-eyebrow text-accent">Coach is thinking…</p>
            {transcript && (
              <p className="text-ink-2 text-[13px] mt-6 text-center max-w-[280px] italic">
                "{transcript}"
              </p>
            )}
          </div>
        )}

        {/* Phase: preview */}
        {phase === 'preview' && (
          <div className="pb-32">
            <p className="font-mono text-[10px] uppercase tracking-eyebrow text-accent mb-2">● Detected</p>
            <h2 className="font-display text-[28px] italic text-ink leading-none tracking-display mb-1">
              Looks like…
            </h2>
            {transcript && (
              <p className="text-ink-3 text-[12px] mb-5 italic">"{transcript}"</p>
            )}

            <div className="space-y-2 mb-5">
              {foods.map((f, i) => (
                <div
                  key={i}
                  className={`bg-surface-card border rounded-[14px] px-4 py-3 flex items-center gap-3 transition-colors ${
                    f._checked ? 'border-accent-line bg-accent-soft' : 'border-surface-line-soft opacity-60'
                  }`}
                >
                  <button
                    onClick={() => toggleFood(i)}
                    className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-colors ${
                      f._checked ? 'bg-accent text-white' : 'border-2 border-surface-line bg-transparent'
                    }`}
                  >
                    {f._checked && <Check size={14} strokeWidth={3} />}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className="text-ink text-[14px] font-medium truncate">{f.name}</p>
                    <p className="font-mono text-[10px] uppercase tracking-eyebrow text-ink-3 mt-0.5 tabular-nums">
                      {f.portion} · {f.kcal} kcal · {f.protein}p · {Math.round(f.carbs)}c · {Math.round(f.fat)}f
                    </p>
                  </div>
                  <button onClick={() => removeFood(i)} className="text-ink-3 hover:text-accent p-1.5 shrink-0">
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="bg-surface-elev border border-surface-line-soft rounded-[14px] px-4 py-3 mb-3">
              <p className="font-mono text-[10px] uppercase tracking-eyebrow text-ink-3 mb-2">Total · Selected</p>
              <div className="grid grid-cols-4 gap-2 text-center">
                <Total label="kcal" value={totals.kcal} accent />
                <Total label="P"    value={`${totals.p.toFixed(1)}g`} />
                <Total label="C"    value={`${totals.c.toFixed(1)}g`} />
                <Total label="F"    value={`${totals.f.toFixed(1)}g`} />
              </div>
            </div>

            <button
              onClick={start}
              className="w-full font-mono text-[10px] uppercase tracking-eyebrow text-ink-2 bg-surface-card border border-surface-line-soft rounded-md py-3 mb-3 hover:text-ink"
            >
              <Mic size={12} className="inline mr-1.5" /> Try again
            </button>
          </div>
        )}

        {/* Phase: error */}
        {phase === 'error' && (
          <div className="flex flex-col items-center justify-center py-20">
            <p className="font-mono text-[10px] uppercase tracking-eyebrow text-accent mb-3">● Error</p>
            <p className="text-ink-2 text-[14px] text-center max-w-[280px] leading-relaxed mb-6">
              {error}
            </p>
            <button
              onClick={start}
              className="bg-accent text-white px-6 py-3.5 rounded-pill font-mono uppercase tracking-eyebrow-2 text-[12px] flex items-center gap-2 active:scale-95"
            >
              <Mic size={14} /> Try again
            </button>
          </div>
        )}
      </div>

      {/* Footer — sticky log button (preview phase only) */}
      {phase === 'preview' && (
        <div
          className="px-5 pt-3 border-t border-surface-line-soft bg-surface flex gap-3"
          style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))' }}
        >
          <button
            onClick={onClose}
            className="flex-1 bg-surface-elev text-ink border border-surface-line-soft rounded-lg py-3.5 font-mono uppercase tracking-eyebrow-2 text-xs"
          >
            Cancel
          </button>
          <button
            onClick={logSelected}
            disabled={!foods.some((f) => f._checked)}
            className="flex-[2] bg-accent text-white rounded-lg py-3.5 font-mono uppercase tracking-eyebrow-2 text-xs flex items-center justify-center gap-2 disabled:opacity-30 active:scale-[0.98]"
          >
            <Check size={14} strokeWidth={3} /> Log {foods.filter((f) => f._checked).length}
          </button>
        </div>
      )}
    </div>
  )
}

function Total({ label, value, accent }) {
  return (
    <div>
      <p className="font-mono text-[9px] uppercase tracking-eyebrow text-ink-3 mb-0.5">{label}</p>
      <p className={`font-mono text-[16px] tabular-nums leading-none ${accent ? 'text-accent' : 'text-ink'}`}>{value}</p>
    </div>
  )
}
