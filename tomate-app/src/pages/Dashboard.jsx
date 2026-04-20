import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Flame, Zap, Moon, Briefcase, ChevronRight, CheckCircle2 } from 'lucide-react'
import Layout from '../components/Layout'
import CoachCard from '../components/CoachCard'
import StatCard from '../components/StatCard'
import Button from '../components/Button'
import { useStore } from '../store/useStore'
import { getDailyRecommendation, getMotivationalMessage, getWeeklyStats, getStreak, calcTargets } from '../utils/coach'

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
      <div className="flex flex-col min-h-full items-center justify-center px-6 pb-10">
        <div className="text-5xl mb-4">💪</div>
        <h1 className="text-2xl font-bold text-white mb-2 text-center">Welcome to Coach</h1>
        <p className="text-zinc-400 text-center text-sm mb-8 leading-relaxed">
          Your personal trainer that adapts to your life. Set up your profile to get started.
        </p>
        <Button size="lg" className="w-full max-w-xs" onClick={() => navigate('/settings')}>
          Set Up My Profile
        </Button>
      </div>
    )
  }

  return (
    <Layout title={`${dayName()}, ${profile.name || 'Coach'}`}>
      <p className="text-zinc-500 text-sm -mt-2 mb-5">{dateStr()}</p>

      {/* Coach recommendation */}
      <CoachCard
        label={rec.label}
        message={rec.message}
        color={rec.color}
        className="mb-4"
      />

      {/* Check-in CTA */}
      {!todayCheckin ? (
        <button
          onClick={() => setShowCheckin(true)}
          className="w-full bg-surface-card border border-surface-border rounded-2xl p-4 flex items-center justify-between mb-4 active:bg-surface-raised transition-colors"
        >
          <div>
            <p className="text-sm font-medium text-white">Daily Check-in</p>
            <p className="text-xs text-zinc-500 mt-0.5">Log fatigue, sleep & workload</p>
          </div>
          <ChevronRight size={18} className="text-zinc-500" />
        </button>
      ) : (
        <div className="bg-surface-card border border-surface-border rounded-2xl p-4 flex items-center gap-3 mb-4">
          <CheckCircle2 size={18} className="text-brand-400 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white">Check-in done</p>
            <p className="text-xs text-zinc-500">Fatigue {todayCheckin.fatigue}/5 · Sleep {todayCheckin.sleep}/5 · Work {todayCheckin.workDemand}/5</p>
          </div>
          <button onClick={() => setShowCheckin(true)} className="text-xs text-brand-400">Edit</button>
        </div>
      )}

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <StatCard label="This Week" value={thisWeekCount} unit="sessions" sub={`${streak} day streak`} />
        <StatCard label="Body Weight" value={latestBody?.weight} unit="kg" sub={latestBody ? latestBody.date : 'Not logged yet'} />
        <StatCard
          label="Calories Today"
          value={todayNutrition.calories || 0}
          unit={`/ ${targets.calories}`}
          sub={`${todayNutrition.protein || 0}g / ${targets.protein}g protein`}
        />
        <StatCard
          label="Active Plan"
          value={activePlan ? null : '—'}
          sub={activePlan ? activePlan.name : 'Set up in Workout'}
          className="cursor-pointer"
        />
      </div>

      {/* Workout CTA */}
      {rec.shouldTrain && activePlan && (
        <Button
          size="lg"
          className="w-full mb-4"
          onClick={() => navigate('/workout')}
        >
          <Zap size={18} />
          Start Today's Session
        </Button>
      )}

      {/* Motivation */}
      <p className="text-xs text-zinc-500 text-center mt-2 leading-relaxed px-2">
        {getMotivationalMessage(profile, sessions)}
      </p>

      {/* Check-in sheet */}
      {showCheckin && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end justify-center" onClick={() => setShowCheckin(false)}>
          <div className="bg-surface-card w-full max-w-[480px] rounded-t-2xl p-6 pb-10" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-base font-semibold text-white mb-5">How are you today?</h2>

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
        <span className="text-sm font-medium text-white">{label}</span>
        <span className="ml-auto text-sm font-bold text-brand-400">{value}/5</span>
      </div>
      <input
        type="range" min="1" max="5" step="1"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-green-500 h-2"
      />
      <div className="flex justify-between text-[10px] text-zinc-600 mt-1">
        <span>{left}</span><span>{right}</span>
      </div>
    </div>
  )
}
