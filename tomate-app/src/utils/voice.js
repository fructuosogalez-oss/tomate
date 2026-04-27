// Voice utilities — STT (Web Speech API), TTS (ElevenLabs), Claude API

// ─── ElevenLabs TTS ──────────────────────────────────────────────────────────
export async function speak(text, { apiKey, voiceId, model = 'eleven_flash_v2_5' }) {
  if (!apiKey) throw new Error('ElevenLabs API key missing')
  if (!voiceId) throw new Error('Voice ID missing')

  const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
      'Accept': 'audio/mpeg',
    },
    body: JSON.stringify({
      text,
      model_id: model,
      voice_settings: { stability: 0.45, similarity_boost: 0.85, style: 0.3 },
    }),
  })

  if (!res.ok) {
    const err = await res.text().catch(() => '')
    throw new Error(`ElevenLabs ${res.status}: ${err.slice(0, 120)}`)
  }

  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const audio = new Audio(url)
  audio.onended = () => URL.revokeObjectURL(url)

  await audio.play()
  return audio
}

// ─── Web Speech API STT ──────────────────────────────────────────────────────
export function isSTTSupported() {
  return !!(window.SpeechRecognition || window.webkitSpeechRecognition)
}

export class SpeechRecognizer {
  constructor({ lang = 'es-ES', onPartial, onFinal, onError, onEnd } = {}) {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) throw new Error('SpeechRecognition not supported in this browser')
    const rec = new SR()
    rec.lang = lang
    rec.interimResults = true
    rec.maxAlternatives = 1
    rec.continuous = true
    rec.onresult = (e) => {
      let final = '', partial = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i]
        if (r.isFinal) final += r[0].transcript
        else partial += r[0].transcript
      }
      if (partial) onPartial?.(partial)
      if (final)   onFinal?.(final)
    }
    rec.onerror = (e) => onError?.(e.error || 'unknown')
    rec.onend = () => onEnd?.()
    this.rec = rec
    this._stopped = false
  }
  start() { try { this.rec.start() } catch (e) {} }
  stop()  { this._stopped = true; try { this.rec.stop() } catch (e) {} }
}

// ─── Claude API ──────────────────────────────────────────────────────────────
export async function askCoach({ apiKey, messages, system, model = 'claude-haiku-4-5', maxTokens = 400 }) {
  if (!apiKey) throw new Error('Claude API key missing')

  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      system,
      messages,
    }),
  })

  if (!res.ok) {
    const err = await res.text().catch(() => '')
    throw new Error(`Claude ${res.status}: ${err.slice(0, 200)}`)
  }
  const data = await res.json()
  const text = data.content?.[0]?.text || ''
  return { text, raw: data }
}

// ─── Coach prompt builder ────────────────────────────────────────────────────
export function buildCoachSystem({ profile, weightUnit = 'lbs', language = 'es-MX' }) {
  const name = profile?.name || 'compa'
  const lang = (language || '').toLowerCase()
  const isMexican = lang === 'es-mx' || lang === 'es-us'
  const isSpanish = lang.startsWith('es')

  let langLine
  if (isMexican) {
    langLine = `CRÍTICO: Responde SIEMPRE en ESPAÑOL MEXICANO dentro de <say>. Nada de inglés ni de español de España.
Habla como entrenador mexicano de gimnasio: directo, motivador, con energía. Usa expresiones naturales como "vámonos", "échale ganas", "ya casi", "una más", "tú puedes", "no te rajes", "dale duro", "qué chido", "buena rola". Tutea siempre. Nada de "vale", "tío", "molar".`
  } else if (isSpanish) {
    langLine = 'CRÍTICO: Responde SIEMPRE en ESPAÑOL dentro de <say>. Nada de inglés.'
  } else {
    langLine = 'IMPORTANT: Respond ONLY in English inside <say>.'
  }

  const sayExample = isMexican
    ? 'Vámonos ' + name + ', esa serie estuvo cabrona. Descansa 90 segundos y vamos a la siguiente.'
    : isSpanish
    ? 'Vamos ' + name + ', otra serie sólida. Descansa 90 segundos.'
    : 'Solid set, ' + name + '. Rest 90 seconds.'

  return `You are an elite personal trainer talking to ${name} during a workout.
Speak like a real coach — warm, direct, hyped when they hit a set, calm when correcting form.
Keep responses to 1–2 short sentences (under 25 words) — they're mid-workout.

${langLine}

When they tell you what they did, extract structured data and respond in this exact format:

<updates>
[{"exercise":"<name as said>","weight":<number>,"reps":<number>}]
</updates>
<say>
${sayExample}
</say>

If they ask a question or want advice (no set logging), just respond with <say>...</say> and skip <updates>.
Weight unit is ${weightUnit}. Today's profile: goal=${profile?.goal||'general'}, units=${profile?.units||'imperial'}.`
}

// Parse Claude reply into { updates, say }
export function parseCoachReply(text) {
  const updatesMatch = text.match(/<updates>([\s\S]*?)<\/updates>/i)
  const sayMatch     = text.match(/<say>([\s\S]*?)<\/say>/i)
  let updates = []
  if (updatesMatch) {
    try {
      updates = JSON.parse(updatesMatch[1].trim())
      if (!Array.isArray(updates)) updates = []
    } catch {}
  }
  const say = sayMatch ? sayMatch[1].trim() : text.trim()
  return { updates, say }
}

// Apply Claude updates to active workout exercises
export function applyUpdates(exercises, updates) {
  if (!updates?.length) return { exercises, applied: [] }
  const applied = []
  const next = exercises.map((ex) => ({ ...ex, sets: ex.sets.map((s) => ({ ...s })) }))

  for (const u of updates) {
    const exName = (u.exercise || '').toLowerCase().trim()
    if (!exName) continue
    // Best-match by name
    const idx = next.findIndex((ex) => (ex.name || '').toLowerCase().includes(exName) || exName.includes((ex.name || '').toLowerCase()))
    if (idx === -1) continue
    const ex = next[idx]
    // Find first not-done set, or append a new one
    let setIdx = ex.sets.findIndex((s) => !s.done)
    if (setIdx === -1) {
      ex.sets.push({ id: Math.random().toString(36).slice(2, 10), index: ex.sets.length + 1, reps: '', weight: '', done: false })
      setIdx = ex.sets.length - 1
    }
    if (u.weight != null) ex.sets[setIdx].weight = String(u.weight)
    if (u.reps   != null) ex.sets[setIdx].reps   = String(u.reps)
    ex.sets[setIdx].done = true
    applied.push({ exercise: ex.name, set: setIdx + 1, weight: u.weight, reps: u.reps })
  }
  return { exercises: next, applied }
}
