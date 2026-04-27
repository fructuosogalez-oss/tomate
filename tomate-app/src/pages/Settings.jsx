import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Mic, Volume2, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react'
import Layout from '../components/Layout'
import Input, { Select } from '../components/Input'
import Button from '../components/Button'
import { useStore } from '../store/useStore'
import { calcTargets, GOALS } from '../utils/coach'
import { generateDefaultPlan } from '../utils/workoutPlans'
import { speak, isSTTSupported } from '../utils/voice'

export default function Settings() {
  const navigate = useNavigate()
  const { profile, setProfile, addWorkoutPlan, setActivePlan, workoutPlans, voice, setVoice } = useStore()
  const [form, setForm] = useState({
    units: 'imperial',
    ...profile,
  })
  const [saved, setSaved] = useState(false)
  const [voiceOpen, setVoiceOpen]   = useState(false)
  const [showElev, setShowElev]     = useState(false)
  const [showClaude, setShowClaude] = useState(false)
  const [voiceForm, setVoiceForm]   = useState({ ...voice })
  const [testStatus, setTestStatus] = useState('')

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const setV = (k, v) => setVoiceForm((f) => ({ ...f, [k]: v }))
  const isImperial = form.units !== 'metric'

  const save = () => {
    if (!form.name?.trim()) {
      alert('Please enter your name')
      return
    }
    const targets = calcTargets(form)
    const updated = { ...form, ...targets, setupDone: true }
    setProfile(updated)
    setVoice(voiceForm)

    // Auto-generate a starter plan if none exists
    if (workoutPlans.length === 0) {
      const plan = generateDefaultPlan(form.goal, form.trainingDays)
      addWorkoutPlan(plan)
      setActivePlan(plan.id)
    }

    setSaved(true)
    setTimeout(() => navigate('/'), 700)
  }

  const testVoice = async () => {
    setTestStatus('Speaking...')
    try {
      const lang = (voiceForm.sttLang || 'es-MX').toLowerCase()
      const isMx = lang === 'es-mx' || lang === 'es-us'
      const isEs = lang.startsWith('es')
      const who = form.name || 'compa'
      const greeting = isMx
        ? `Qué onda ${who}, soy tu entrenador. Vámonos a darle duro hoy.`
        : isEs
        ? `Hola ${who}, soy tu entrenador. Vamos a entrenar duro hoy.`
        : `Hey ${who}, this is your coach. Let's go hard today.`
      await speak(greeting, {
        apiKey: voiceForm.elevenlabsKey,
        voiceId: voiceForm.voiceId,
        model: voiceForm.ttsModel,
      })
      setTestStatus('OK')
      setTimeout(() => setTestStatus(''), 2000)
    } catch (e) {
      setTestStatus(`Error: ${e.message}`)
      setTimeout(() => setTestStatus(''), 4000)
    }
  }

  const isNew = !profile.setupDone

  return (
    <Layout
      title={isNew ? 'Welcome' : 'Profile'}
      action={
        !isNew && (
          <button onClick={() => navigate(-1)} className="text-zinc-400 hover:text-white p-1">
            <ArrowLeft size={20} />
          </button>
        )
      }
    >
      {isNew && (
        <p className="text-zinc-400 text-sm -mt-2 mb-4 leading-relaxed">
          Tell me about yourself so I can build the right plan for you. Your data
          stays on this device — nothing is sent to a server.
        </p>
      )}

      <div className="space-y-4 mt-2">
        <Input
          label="Your Name"
          placeholder="Enter your name"
          value={form.name || ''}
          onChange={(e) => set('name', e.target.value)}
        />

        {/* Units toggle */}
        <div>
          <label className="block text-xs text-zinc-400 mb-1.5 font-medium">Units</label>
          <div className="flex bg-surface-raised border border-surface-border rounded-xl p-1 gap-1">
            <button
              type="button"
              onClick={() => set('units', 'imperial')}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
                isImperial ? 'bg-brand-500 text-white' : 'text-zinc-400'
              }`}
            >
              Imperial (lbs · ft/in)
            </button>
            <button
              type="button"
              onClick={() => set('units', 'metric')}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
                !isImperial ? 'bg-brand-500 text-white' : 'text-zinc-400'
              }`}
            >
              Metric (kg · cm)
            </button>
          </div>
        </div>

        {/* Age */}
        <Input
          label="Age"
          type="number"
          inputMode="numeric"
          placeholder="30"
          value={form.age || ''}
          onChange={(e) => set('age', e.target.value)}
        />

        {/* Weight */}
        <Input
          label={isImperial ? 'Weight (lbs)' : 'Weight (kg)'}
          type="number"
          inputMode="decimal"
          placeholder={isImperial ? '180' : '80'}
          value={form.weight || ''}
          onChange={(e) => set('weight', e.target.value)}
        />

        {/* Height */}
        {isImperial ? (
          <div>
            <label className="block text-xs text-zinc-400 mb-1.5 font-medium">Height</label>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="5"
                  value={form.heightFt || ''}
                  onChange={(e) => set('heightFt', e.target.value)}
                  className="w-full bg-surface-raised border border-surface-border rounded-xl px-3 py-3 pr-10 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-brand-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500">ft</span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="10"
                  value={form.heightIn || ''}
                  onChange={(e) => set('heightIn', e.target.value)}
                  className="w-full bg-surface-raised border border-surface-border rounded-xl px-3 py-3 pr-10 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-brand-500"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500">in</span>
              </div>
            </div>
          </div>
        ) : (
          <Input
            label="Height (cm)"
            type="number"
            inputMode="decimal"
            placeholder="175"
            value={form.height || ''}
            onChange={(e) => set('height', e.target.value)}
          />
        )}

        <Select
          label="Primary Goal"
          value={form.goal || 'fat_loss'}
          onChange={(e) => set('goal', e.target.value)}
        >
          {Object.entries(GOALS).map(([k, v]) => (
            <option key={k} value={k}>{v.emoji} {v.label}</option>
          ))}
        </Select>

        <Select
          label="Activity Level"
          value={form.activityLevel || 'moderate'}
          onChange={(e) => set('activityLevel', e.target.value)}
        >
          <option value="sedentary">Sedentary (desk job, no exercise)</option>
          <option value="light">Light (1–3 days/week)</option>
          <option value="moderate">Moderate (3–5 days/week)</option>
          <option value="active">Active (6–7 days/week)</option>
          <option value="very_active">Very Active (2x/day or physical job)</option>
        </Select>

        <Select
          label="Training Days per Week"
          value={form.trainingDays || 4}
          onChange={(e) => set('trainingDays', Number(e.target.value))}
        >
          {[2, 3, 4, 5, 6].map((d) => (
            <option key={d} value={d}>{d} days</option>
          ))}
        </Select>

        {/* Calorie / protein preview */}
        {(() => {
          const t = calcTargets(form)
          if (t.calories === 2000 && t.protein === 150) return null
          return (
            <div className="bg-surface-card rounded-2xl p-4 border border-surface-border">
              <p className="text-xs text-zinc-500 mb-2">Estimated Daily Targets</p>
              <div className="flex gap-6">
                <div>
                  <p className="text-xl font-bold text-white">{t.calories}</p>
                  <p className="text-xs text-zinc-400">calories</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-white">{t.protein}g</p>
                  <p className="text-xs text-zinc-400">protein</p>
                </div>
              </div>
            </div>
          )
        })()}

        {/* Voice Coach Section */}
        <div className="bg-surface-card border border-surface-border rounded-2xl overflow-hidden">
          <button
            type="button"
            onClick={() => setVoiceOpen(!voiceOpen)}
            className="w-full flex items-center justify-between p-4"
          >
            <div className="flex items-center gap-3">
              <Mic size={18} className={voiceForm.enabled ? 'text-brand-400' : 'text-zinc-500'} />
              <div className="text-left">
                <p className="text-sm font-semibold text-white">Voice Coach</p>
                <p className="text-[11px] text-zinc-500">
                  {voiceForm.enabled ? 'Enabled — keys configured' : 'Talk to your coach during workouts'}
                </p>
              </div>
            </div>
            {voiceOpen ? <ChevronUp size={16} className="text-zinc-500" /> : <ChevronDown size={16} className="text-zinc-500" />}
          </button>

          {voiceOpen && (
            <div className="px-4 pb-4 border-t border-surface-border pt-4 space-y-3">
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                Your keys live only on this device's local storage. Get them at:
                <br/>· ElevenLabs → elevenlabs.io/app/settings/api-keys
                <br/>· Claude → console.anthropic.com/settings/keys
              </p>

              {/* Enabled toggle */}
              <label className="flex items-center justify-between bg-surface-raised rounded-xl px-3 py-2.5 cursor-pointer">
                <span className="text-sm text-white">Enable voice coach</span>
                <input
                  type="checkbox"
                  checked={!!voiceForm.enabled}
                  onChange={(e) => setV('enabled', e.target.checked)}
                  className="w-4 h-4 accent-green-500"
                />
              </label>

              {/* ElevenLabs key */}
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5 font-medium">ElevenLabs API Key</label>
                <div className="relative">
                  <input
                    type={showElev ? 'text' : 'password'}
                    placeholder="sk_..."
                    value={voiceForm.elevenlabsKey || ''}
                    onChange={(e) => setV('elevenlabsKey', e.target.value)}
                    className="w-full bg-surface-raised border border-surface-border rounded-xl px-3 py-3 pr-10 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-brand-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowElev(!showElev)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-zinc-500 hover:text-white"
                  >
                    {showElev ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* Voice ID */}
              <Input
                label="Voice ID (your cloned voice)"
                placeholder="QjreVJyDygkOqCMjZyDF"
                value={voiceForm.voiceId || ''}
                onChange={(e) => setV('voiceId', e.target.value)}
              />

              {/* Claude key */}
              <div>
                <label className="block text-xs text-zinc-400 mb-1.5 font-medium">Claude API Key (Anthropic)</label>
                <div className="relative">
                  <input
                    type={showClaude ? 'text' : 'password'}
                    placeholder="sk-ant-..."
                    value={voiceForm.claudeKey || ''}
                    onChange={(e) => setV('claudeKey', e.target.value)}
                    className="w-full bg-surface-raised border border-surface-border rounded-xl px-3 py-3 pr-10 text-white text-sm placeholder:text-zinc-600 focus:outline-none focus:border-brand-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowClaude(!showClaude)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-zinc-500 hover:text-white"
                  >
                    {showClaude ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {/* Language */}
              <Select
                label="Voice Recognition Language"
                value={voiceForm.sttLang || 'es-MX'}
                onChange={(e) => setV('sttLang', e.target.value)}
              >
                <option value="es-MX">Español (México) — recomendado</option>
                <option value="es-US">Español (US)</option>
                <option value="es-ES">Español (España)</option>
                <option value="en-US">English (US)</option>
                <option value="en-GB">English (UK)</option>
              </Select>

              {/* Test voice button */}
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                onClick={testVoice}
                disabled={!voiceForm.elevenlabsKey || !voiceForm.voiceId}
              >
                <Volume2 size={16} /> {testStatus || 'Test Voice'}
              </Button>

              {!isSTTSupported() && (
                <p className="text-[11px] text-yellow-400 text-center bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-2">
                  Speech recognition isn't supported in this browser. Use Chrome or Safari for voice input.
                </p>
              )}
            </div>
          )}
        </div>

        <Button size="lg" className="w-full" onClick={save}>
          {saved ? 'Saved!' : isNew ? 'Create My Profile' : 'Save Changes'}
        </Button>

        {!isNew && (
          <p className="text-[11px] text-zinc-600 text-center mt-1">
            Your profile, plans, sessions, body logs and meals are stored privately on this device.
          </p>
        )}
      </div>
    </Layout>
  )
}
