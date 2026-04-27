import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Flame, Zap, Moon, Briefcase, ChevronRight, CheckCircle2 } from 'lucide-react'
import Layout from '../components/Layout'
import CoachCard from '../components/CoachCard'
import StatCard from '../components/StatCard'
import Button from '../components/Button'
import { useStore } from '../store/useStore'
import { getDailyRecommendation, getMotivationalMessage, getWeeklyStats, getStreak, calcTargets } from '../utils/coach'
import { weightUnit } from '../utils/units'

const today = () => new Date().toISOString().slice(0, 10)
const dayName = () => new Date().toLocaleDateString('en-US', { weekday: 'long' })
const dateStr = () => new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

export default function Dashboard() {
  const navigate = useNavigate()
  const { profile, checkins, saveCheckin, sessions, bodyLogs, nutritionLogs, activePlanId, workoutPlans } = useStore()
  const [showCheckin, setShowCheckin] = useState(false)
  const [form, setForm] = useState({ fatigue: 3, sleep: 3, workDemand: 2 })

  const todayKey = today()
  const todayCheckin = checkins[todayKey] || null
  const todayNutrition = nutritionLogs[todayKey] || { calories: 0, protein: 0 }
  const latestBody = bodyLogs[0] || null
  const activePlan = workoutPlans.find((p) => p.id === activePlanId) || null

  const rec = getDailyRecommendation({ checkin: todayCheckin, profile, lastSessions: sessions })
  const { thisWeekCount } = getWeeklyStats(sessions)
  const streak = getStreak(sessions)
  const targets = calcTargets(profile)

  const submitCheckin = () => {
    saveCheckin(todayKey, form)
    setShowCheckin(false)
  }

  if (!profile.setupDone) {
    return (
      <div className="flex flex-col min-h-full items-center justify-center px-6 pb-10 bg-surface">
        <div className="mb-2">
          <span className="text-[10px] font-bold uppercase tracking-widest-x text-brand-500">Coach</span>
        </div>
        <h1 className="text-4xl font-black text-white mb-3 text-center tracking-tight leading-none">
          BUILT FOR<br/>YOUR GRIND
        </h1>
        <p className="text-zinc-400 text-center text-sm mb-8 leading-relaxed max-w-[280px]">
          Personal trainer that adapts to your life. Set up your profile to begin.
        </p>
        <Button size="lg" className="w-full max-w-xs" onClick={() => navigate('/settings')}>
          Set Up Profile
        </Button>
      </div>
    )
  }

  return (
    <Layout
      eyebrow={dateStr()}
      title={`${dayName()}, ${profile.name || 'Athlete'}`}
    >

      {/* Coach recommendation */}
      <CoachCard
        label={rec.label}
        message={rec.message}
        color={rec.color}
        className="mb-3"
      />

      {/* Check-in CTA */}
      {!todayCheckin ? (
        <button
          onClick={() => setShowCheckin(true)}
          className="w-full bg-surface-card border border-surface-border p-4 flex items-center justify-between mb-3 active:bg-surface-raised transition-colors"
        >
          <div>
            <p className="text-xs font-bold uppercase tracking-wider-x text-white">Daily Check-in</p>
            <p className="text-[10px] text-zinc-500 mt-1 uppercase tracking-wider-x">Fatigue · Sleep · Workload</p>
          </div>
          <ChevronRight size={18} className="text-zinc-600" />
        </button>
      ) : (
        <div className="bg-surface-card border border-surface-border p-4 flex items-center gap-3 mb-3">
          <CheckCircle2 size={18} className="text-brand-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold uppercase tracking-wider-x text-white">Check-in Done</p>
            <p className="text-[10px] text-zinc-500 mt-1 tabular-nums">F {todayCheckin.fatigue}/5 · S {todayCheckin.sleep}/5 · W {todayCheckin.workDemand}/5</p>
          </div>
          <button onClick={() => setShowCheckin(true)} className="text-[10px] font-bold uppercase tracking-wider-x text-brand-500">Edit</button>
        </div>
      )}

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-px bg-surface-border mb-3">
        <StatCard label="This Week" value={thisWeekCount} unit="Sessions" sub={`${streak} Day Streak`} />
        <StatCard label="Body Weight" value={latestBody?.weight} unit={weightUnit(profile)} sub={latestBody ? latestBody.date : 'Not Logged'} />
        <StatCard
          label="Calories"
          value={todayNutrition.calories || 0}
          unit={`/ ${targets.calories}`}
          sub={`${todayNutrition.protein || 0}g / ${targets.protein}g Protein`}
        />
        <StatCard
          label="Plan"
          value={activePlan ? (activePlan.days?.length || 0) : '—'}
          unit={activePlan ? 'Days' : ''}
          sub={activePlan ? activePlan.name : 'Setup In Workout'}
          className="cursor-pointer"
        />
      </div>

      {/* Workout CTA */}
      {rec.shouldTrain && activePlan && (
        <Button
          size="lg"
          className="w-full mb-3"
          onClick={() => navigate('/workout')}
        >
          <Zap size={16} />
          Start Today's Session
        </Button>
      )}

      {/* Motivation */}
      <p className="text-[11px] text-zinc-500 text-center mt-3 leading-relaxed px-4 uppercase tracking-wider-x font-medium">
        {getMotivationalMessage(profile, sessions)}
      </p>

      {/* Check-in sheet */}
      {showCheckin && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end justify-center" onClick={() => setShowCheckin(false)}>
          <div className="bg-surface-card border-t border-surface-border w-full max-w-[480px] p-6 pb-10" onClick={(e) => e.stopPropagation()}>
            <p className="text-[10px] font-bold uppercase tracking-widest-x text-brand-500 mb-1">Check-in</p>
            <h2 className="text-2xl font-black text-white mb-6 tracking-tight leading-none">How Are You Today?</h2>

            <SliderRow
              icon={<Flame size={16} className="text-orange-400" />}
              label="Fatigue"
              value={form.fatigue}
              onChange={(v) => setForm((f) => ({ ...f, fatigue: v }))}
              left="Fresh" right="Exhausted"
            />
            <SliderRow
              icon={<Moon size={16} className="text-blue-400" />}
              label="Sleep Quality"
              value={form.sleep}
              onChange={(v) => setForm((f) => ({ ...f, sleep: v }))}
              left="Terrible" right="Great"
            />
            <SliderRow
              icon={<Briefcase size={16} className="text-yellow-400" />}
              label="Work Demand"
              value={form.workDemand}
              onChange={(v) => setForm((f) => ({ ...f, workDemand: v }))}
              left="Easy day" right="Brutal"
            />

            <Button className="w-full mt-2" onClick={submitCheckin}>Save Check-in</Button>
          </div>
        </div>
      )}
    </Layout>
  )
}

function SliderRow({ icon, label, value, onChange, left, right }) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-[11px] font-bold uppercase tracking-wider-x text-white">{label}</span>
        <span className="ml-auto text-2xl font-black text-brand-500 tabular-nums leading-none">{value}<span className="text-xs text-zinc-600">/5</span></span>
      </div>
      <input
        type="range" min="1" max="5" step="1"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-red-500 h-2"
      />
      <div className="flex justify-between text-[9px] text-zinc-700 mt-1 uppercase tracking-wider-x">
        <span>{left}</span><span>{right}</span>
      </div>
    </div>
  )
}
