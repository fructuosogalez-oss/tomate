import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft, ChevronRight, Mic, Volume2, Eye, EyeOff,
  Plus, Target, Edit3, X, Activity
} from 'lucide-react'
import Button from '../components/Button'
import Input, { Select } from '../components/Input'
import { useStore } from '../store/useStore'
import { calcTargets, GOALS } from '../utils/coach'
import { generateDefaultPlan } from '../utils/workoutPlans'
import { speak, isSTTSupported } from '../utils/voice'
import BottomNav from '../components/BottomNav'

export default function Settings() {
  const navigate = useNavigate()
  const { profile, setProfile, addWorkoutPlan, setActivePlan, workoutPlans, voice, setVoice } = useStore()
  const [tab, setTab] = useState(profile.setupDone ? 'profile' : 'edit')   // profile | edit
  const [form, setForm] = useState({ units: 'imperial', ...profile })
  const [voiceForm, setVoiceForm] = useState({ ...voice })
  const [showElev, setShowElev] = useState(false)
  const [showClaude, setShowClaude] = useState(false)
  const [voiceOpen, setVoiceOpen] = useState(false)
  const [testStatus, setTestStatus] = useState('')

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))
  const setV = (k, v) => setVoiceForm((f) => ({ ...f, [k]: v }))
  const isImperial = form.units !== 'metric'

  const isNew = !profile.setupDone

  const save = () => {
    if (!form.name?.trim()) {
      alert('Please enter your name'); return
    }
    const targets = calcTargets(form)
    setProfile({ ...form, ...targets, setupDone: true })
    setVoice(voiceForm)
    if (workoutPlans.length === 0) {
      const plan = generateDefaultPlan(form.goal, form.trainingDays)
      addWorkoutPlan(plan); setActivePlan(plan.id)
    }
    navigate('/')
  }

  const testVoice = async () => {
    setTestStatus('Speaking…')
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
      await speak(greeting, { apiKey: voiceForm.elevenlabsKey, voiceId: voiceForm.voiceId, model: voiceForm.ttsModel })
      setTestStatus('OK'); setTimeout(() => setTestStatus(''), 2000)
    } catch (e) {
      setTestStatus(e.message); setTimeout(() => setTestStatus(''), 4000)
    }
  }

  const targets = calcTargets(form)
  const initial = (form.name || 'A').trim().charAt(0).toUpperCase() || 'A'

  // ── EDIT MODE ─────────────────────────────────────────────────────────
  if (tab === 'edit' || isNew) {
    return (
      <div className="flex flex-col min-h-full bg-surface">
        <main className="flex-1 px-5 pb-32 pt-12 page-enter">
          <div className="flex items-center justify-between mb-7">
            <button
              onClick={() => isNew ? null : setTab('profile')}
              className="w-9 h-9 rounded-md bg-surface-elev border border-surface-line-soft flex items-center justify-center text-ink-2 hover:text-ink"
            >
              <ArrowLeft size={16} />
            </button>
            <p className="font-mono text-[10px] uppercase tracking-eyebrow text-ink-3">
              {isNew ? 'Welcome' : 'Edit Profile'}
            </p>
            <div className="w-9" />
          </div>

          {isNew && (
            <>
              <p className="font-mono text-[10px] uppercase tracking-eyebrow text-accent mb-3">● Setup</p>
              <h1 className="font-display text-[44px] italic text-ink leading-none tracking-display mb-3">Tell me<br/><span className="text-ink-3">about you.</span></h1>
              <p className="text-ink-2 text-[13px] leading-relaxed mb-6">
                I use this to build the right plan and dial in your numbers. Stays on this device — nothing sent to a server.
              </p>
            </>
          )}

          <div className="space-y-4">
            <Input label="Name" placeholder="Your name" value={form.name || ''} onChange={(e) => set('name', e.target.value)} />

            {/* Units toggle */}
            <div>
              <label className="block font-mono text-[10px] uppercase tracking-eyebrow text-ink-3 mb-2">Units</label>
              <div className="flex bg-surface-elev border border-surface-line-soft rounded-md p-1 gap-1">
                <button type="button" onClick={() => set('units', 'imperial')} className={`flex-1 py-2.5 rounded-sm font-mono text-[11px] uppercase tracking-eyebrow transition-colors ${isImperial ? 'bg-accent text-white' : 'text-ink-2'}`}>
                  Imperial · lbs · ft/in
                </button>
                <button type="button" onClick={() => set('units', 'metric')} className={`flex-1 py-2.5 rounded-sm font-mono text-[11px] uppercase tracking-eyebrow transition-colors ${!isImperial ? 'bg-accent text-white' : 'text-ink-2'}`}>
                  Metric · kg · cm
                </button>
              </div>
            </div>

            <Input label="Age" type="number" inputMode="numeric" placeholder="30" value={form.age || ''} onChange={(e) => set('age', e.target.value)} />

            <Input label={isImperial ? 'Weight · lbs' : 'Weight · kg'} type="number" inputMode="decimal" placeholder={isImperial ? '180' : '80'} value={form.weight || ''} onChange={(e) => set('weight', e.target.value)} />

            {isImperial ? (
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-eyebrow text-ink-3 mb-2">Height</label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="relative">
                    <input type="number" inputMode="numeric" placeholder="5" value={form.heightFt || ''} onChange={(e) => set('heightFt', e.target.value)} className="w-full bg-surface-elev border border-surface-line-soft rounded-md px-3.5 py-3.5 pr-10 text-ink text-[15px] placeholder:text-ink-4 focus:outline-none focus:border-accent" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10px] uppercase text-ink-3">ft</span>
                  </div>
                  <div className="relative">
                    <input type="number" inputMode="numeric" placeholder="10" value={form.heightIn || ''} onChange={(e) => set('heightIn', e.target.value)} className="w-full bg-surface-elev border border-surface-line-soft rounded-md px-3.5 py-3.5 pr-10 text-ink text-[15px] placeholder:text-ink-4 focus:outline-none focus:border-accent" />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[10px] uppercase text-ink-3">in</span>
                  </div>
                </div>
              </div>
            ) : (
              <Input label="Height · cm" type="number" inputMode="decimal" placeholder="175" value={form.height || ''} onChange={(e) => set('height', e.target.value)} />
            )}

            <Select label="Primary Goal" value={form.goal || 'fat_loss'} onChange={(e) => set('goal', e.target.value)}>
              {Object.entries(GOALS).map(([k, v]) => (
                <option key={k} value={k}>{v.label}</option>
              ))}
            </Select>

            <Select label="Activity Level" value={form.activityLevel || 'moderate'} onChange={(e) => set('activityLevel', e.target.value)}>
              <option value="sedentary">Sedentary · desk job</option>
              <option value="light">Light · 1–3 days/week</option>
              <option value="moderate">Moderate · 3–5 days/week</option>
              <option value="active">Active · 6–7 days/week</option>
              <option value="very_active">Very Active · 2x/day or physical job</option>
            </Select>

            <Select label="Training Days · Week" value={form.trainingDays || 4} onChange={(e) => set('trainingDays', Number(e.target.value))}>
              {[2,3,4,5,6].map((d) => <option key={d} value={d}>{d} days</option>)}
            </Select>

            {/* Targets preview */}
            {(targets.calories !== 2000 || targets.protein !== 150) && (
              <div className="bg-surface-card border border-surface-line-soft rounded-[16px] p-4 grid grid-cols-2 gap-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-eyebrow text-ink-3 mb-1.5">Calories</p>
                  <p className="font-mono text-[24px] tabular-nums text-ink leading-none">{targets.calories}<span className="text-ink-3 text-[11px] ml-1">kcal</span></p>
                </div>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-eyebrow text-ink-3 mb-1.5">Protein</p>
                  <p className="font-mono text-[24px] tabular-nums text-ink leading-none">{targets.protein}<span className="text-ink-3 text-[11px] ml-1">g</span></p>
                </div>
              </div>
            )}

            {/* Voice section */}
            <div className="bg-surface-card border border-surface-line-soft rounded-[16px] overflow-hidden">
              <button type="button" onClick={() => setVoiceOpen(!voiceOpen)} className="w-full flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Mic size={16} className={voiceForm.enabled ? 'text-accent' : 'text-ink-3'} />
                  <div className="text-left">
                    <p className="text-ink text-[14px] font-medium">Voice Coach</p>
                    <p className="font-mono text-[10px] uppercase tracking-eyebrow text-ink-3 mt-0.5">
                      {voiceForm.enabled ? 'Configured' : 'Optional'}
                    </p>
                  </div>
                </div>
                <ChevronRight size={14} className={`text-ink-3 transition-transform ${voiceOpen ? 'rotate-90' : ''}`} />
              </button>

              {voiceOpen && (
                <div className="px-4 pb-4 border-t border-surface-line-soft pt-4 space-y-3">
                  <p className="font-mono text-[10px] text-ink-3 leading-relaxed">
                    Keys live in this device's localStorage only.<br/>
                    · ElevenLabs → elevenlabs.io/app/settings/api-keys<br/>
                    · Claude → console.anthropic.com/settings/keys
                  </p>

                  <label className="flex items-center justify-between bg-surface-elev rounded-md px-3 py-2.5 cursor-pointer">
                    <span className="text-ink text-[13px]">Enable voice coach</span>
                    <input type="checkbox" checked={!!voiceForm.enabled} onChange={(e) => setV('enabled', e.target.checked)} className="w-4 h-4 accent-[#FF2D2D]" />
                  </label>

                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-eyebrow text-ink-3 mb-2">ElevenLabs API Key</label>
                    <div className="relative">
                      <input type={showElev ? 'text' : 'password'} placeholder="sk_..." value={voiceForm.elevenlabsKey || ''} onChange={(e) => setV('elevenlabsKey', e.target.value)} className="w-full bg-surface-elev border border-surface-line-soft rounded-md px-3.5 py-3.5 pr-10 text-ink text-[14px] placeholder:text-ink-4 focus:outline-none focus:border-accent" />
                      <button type="button" onClick={() => setShowElev(!showElev)} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-ink-3 hover:text-ink">
                        {showElev ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <Input label="Voice ID" placeholder="QjreVJyDygkOqCMjZyDF" value={voiceForm.voiceId || ''} onChange={(e) => setV('voiceId', e.target.value)} />

                  <div>
                    <label className="block font-mono text-[10px] uppercase tracking-eyebrow text-ink-3 mb-2">Claude API Key</label>
                    <div className="relative">
                      <input type={showClaude ? 'text' : 'password'} placeholder="sk-ant-..." value={voiceForm.claudeKey || ''} onChange={(e) => setV('claudeKey', e.target.value)} className="w-full bg-surface-elev border border-surface-line-soft rounded-md px-3.5 py-3.5 pr-10 text-ink text-[14px] placeholder:text-ink-4 focus:outline-none focus:border-accent" />
                      <button type="button" onClick={() => setShowClaude(!showClaude)} className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-ink-3 hover:text-ink">
                        {showClaude ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <Select label="Voice Recognition Language" value={voiceForm.sttLang || 'es-MX'} onChange={(e) => setV('sttLang', e.target.value)}>
                    <option value="es-MX">Español · México</option>
                    <option value="es-US">Español · US</option>
                    <option value="es-ES">Español · España</option>
                    <option value="en-US">English · US</option>
                    <option value="en-GB">English · UK</option>
                  </Select>

                  <Button variant="secondary" type="button" className="w-full" onClick={testVoice} disabled={!voiceForm.elevenlabsKey || !voiceForm.voiceId}>
                    <Volume2 size={14} /> {testStatus || 'Test Voice'}
                  </Button>

                  {!isSTTSupported() && (
                    <p className="font-mono text-[10px] text-warn text-center bg-warn/10 border border-warn/30 rounded-md p-2">
                      Speech recognition not supported here. Use Chrome or Safari.
                    </p>
                  )}
                </div>
              )}
            </div>

            <Button size="lg" className="w-full mt-2" onClick={save}>
              {isNew ? 'Create Profile' : 'Save Changes'}
            </Button>
          </div>
        </main>
        <BottomNav />
      </div>
    )
  }

  // ── PROFILE VIEW MODE ─────────────────────────────────────────────────
  const heightDisplay = isImperial
    ? `${form.heightFt || '—'}'${form.heightIn || 0}"`
    : `${form.height || '—'} cm`
  const weightDisplay = `${form.weight || '—'} ${isImperial ? 'lbs' : 'kg'}`
  const goalLabel = (GOALS[form.goal] || GOALS.fat_loss).label
  const activeGoalCaption = `${form.trainingDays || 4}-day split`

  return (
    <div className="flex flex-col min-h-full bg-surface">
      <main className="flex-1 px-5 pb-32 pt-12 page-enter">
        <p className="font-mono text-[10px] uppercase tracking-eyebrow text-ink-3 mb-3">You</p>
        <h1 className="font-display text-display-3 italic text-ink leading-none tracking-display mb-6">Profile.</h1>

        {/* Identity */}
        <div className="bg-surface-card border border-surface-line-soft rounded-[20px] p-5 mb-3">
          <div className="flex items-center gap-4 mb-5">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center font-display text-[32px] italic text-ink"
              style={{ background: 'linear-gradient(135deg, #2a2a30 0%, #17171A 100%)' }}
            >
              {initial}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-ink text-[20px] font-medium truncate">{form.name || 'Athlete'}</p>
              <p className="font-mono text-[10px] uppercase tracking-eyebrow text-ink-3 mt-1">Member · this device</p>
            </div>
            <button
              onClick={() => setTab('edit')}
              className="font-mono text-[10px] uppercase tracking-eyebrow text-ink-2 border border-surface-line-soft rounded-pill px-3 py-1.5 hover:text-ink"
            >
              Edit
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-4 border-t border-surface-line-soft">
            <Stat3 label="Age"    value={form.age || '—'} />
            <Stat3 label="Height" value={heightDisplay} />
            <Stat3 label="Weight" value={weightDisplay} />
          </div>
        </div>

        {/* Active goal */}
        <div className="bg-surface-card border border-surface-line-soft rounded-[20px] p-5 mb-3 relative overflow-hidden">
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-eyebrow text-accent mb-2">● Active Goal</p>
              <h3 className="font-display text-[28px] italic text-ink leading-none tracking-display">{goalLabel}.</h3>
              <p className="font-mono text-[10px] uppercase tracking-eyebrow text-ink-3 mt-3">{activeGoalCaption}</p>
            </div>
            <Target size={28} className="text-accent shrink-0" />
          </div>
        </div>

        {/* Nutrition targets */}
        <div className="bg-surface-card border border-surface-line-soft rounded-[20px] p-5 mb-3">
          <p className="font-mono text-[10px] uppercase tracking-eyebrow text-ink-3 mb-3">Nutrition Targets</p>
          <NutRow label="Calories" value={targets.calories} unit="kcal" />
          <NutRow label="Protein"  value={targets.protein}  unit="g" accent />
          <NutRow label="Carbs"    value={Math.round((targets.calories * 0.4) / 4)} unit="g" />
          <NutRow label="Fat"      value={Math.round((targets.calories * 0.25) / 9)} unit="g" last />
        </div>

        {/* Preferences */}
        <div className="bg-surface-card border border-surface-line-soft rounded-[20px] mb-3">
          <PrefRow label="Units" value={isImperial ? 'lbs · ft/in' : 'kg · cm'} onClick={() => setTab('edit')} />
          <PrefRow label="Voice Coach" value={voiceForm.enabled ? 'On' : 'Off'} accent={voiceForm.enabled} onClick={() => { setTab('edit'); setVoiceOpen(true) }} />
          <PrefRow label="Training Days" value={`${form.trainingDays || 4} days/week`} onClick={() => setTab('edit')} last />
        </div>

        {/* Reset / sign-out (clear local data) */}
        <button
          onClick={() => {
            if (confirm('This will clear your profile, plans, sessions, and all logs from this device. Continue?')) {
              localStorage.removeItem('fitness-coach-store')
              location.reload()
            }
          }}
          className="w-full bg-transparent text-ink-2 border border-surface-line-soft rounded-md py-3 font-mono text-[11px] uppercase tracking-eyebrow hover:text-ink hover:border-ink-3"
        >
          Clear All Local Data
        </button>
      </main>
      <BottomNav />
    </div>
  )
}

function Stat3({ label, value }) {
  return (
    <div>
      <p className="font-mono text-[9px] uppercase tracking-eyebrow text-ink-3 mb-1.5">{label}</p>
      <p className="font-mono text-[15px] tabular-nums text-ink leading-none">{value}</p>
    </div>
  )
}

function NutRow({ label, value, unit, accent, last }) {
  return (
    <div className={`flex items-center justify-between py-3 ${!last ? 'border-b border-surface-line-soft' : ''}`}>
      <p className={`text-[14px] ${accent ? 'text-accent font-medium' : 'text-ink-2'}`}>{label}</p>
      <p className={`font-mono text-[18px] tabular-nums leading-none ${accent ? 'text-accent' : 'text-ink'}`}>
        {value}<span className="text-ink-3 text-[10px] ml-1">{unit}</span>
      </p>
    </div>
  )
}

function PrefRow({ label, value, accent, last, onClick }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center justify-between py-4 px-5 ${!last ? 'border-b border-surface-line-soft' : ''} hover:bg-surface-elev`}>
      <p className="text-ink text-[14px]">{label}</p>
      <div className="flex items-center gap-2">
        <p className={`font-mono text-[12px] tabular-nums ${accent ? 'text-accent' : 'text-ink-2'}`}>{value}</p>
        <ChevronRight size={14} className="text-ink-3" />
      </div>
    </button>
  )
}
