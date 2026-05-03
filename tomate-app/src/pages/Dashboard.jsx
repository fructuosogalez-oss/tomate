import { useNavigate } from 'react-router-dom'
import { ChevronRight, Play, Trophy, Check, RotateCcw } from 'lucide-react'
import CoachCard from '../components/CoachCard'
import StatCard from '../components/StatCard'
import Button from '../components/Button'
import BottomNav from '../components/BottomNav'
import { useStore } from '../store/useStore'
import {
  getDailyRecommendation, getMotivationalMessage,
  getWeeklyStats, getStreak, calcTargets,
} from '../utils/coach'
import { weightUnit } from '../utils/units'
import { generateDefaultPlan } from '../utils/workoutPlans'
import { todayLocal as today } from '../utils/date'
const dayShort   = ['SUN','MON','TUE','WED','THU','FRI','SAT']
const monthShort = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC']

function metaRow() {
  const d = new Date()
  return `${dayShort[d.getDay()]} · ${monthShort[d.getMonth()]} ${d.getDate()} · WEEK ${weekOfYear(d).toString().padStart(2, '0')}`
}
function weekOfYear(d) {
  const start = new Date(d.getFullYear(), 0, 1)
  return Math.ceil(((d - start) / 86400000 + start.getDay() + 1) / 7)
}

// Pick today's plan day. The user's routine has named days like
// "Monday · Quads" and "Wednesday · Upper". Match the day-of-week label.
function pickTodayPlanDay(plan) {
  if (!plan?.days?.length) return null
  const dow = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()
  const match = plan.days.find((d) => (d.name || '').toLowerCase().includes(dow))
  if (match) return match
  // Fallback: rotate through days based on day-of-week index
  const idx = new Date().getDay() % plan.days.length
  return plan.days[idx]
}

function dayHeadline(plan) {
  const day = pickTodayPlanDay(plan)
  if (!day) {
    const map = ['Rest', 'Quads', 'Easy', 'Upper', 'Easy', 'Recover', 'Easy']
    return map[new Date().getDay()]
  }
  // Strip leading day-of-week if present, e.g. "Monday · Quads" → "Quads"
  return day.name.replace(/^(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\s*·\s*/i, '')
}

function buildWeekStatus(sessions) {
  const today = new Date(); today.setHours(0, 0, 0, 0)
  const start = new Date(today); start.setDate(today.getDate() - today.getDay())
  const trainedDates = new Set(sessions.map((s) => s.date))
  const days = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(start); d.setDate(start.getDate() + i)
    const iso = d.toISOString().slice(0, 10)
    days.push({
      letter: ['S','M','T','W','T','F','S'][i],
      isToday: d.getTime() === today.getTime(),
      trained: trainedDates.has(iso),
    })
  }
  return days
}

function findRecentPR(sessions) {
  const seen = {}
  for (const s of sessions) {
    for (const ex of s.exercises || []) {
      for (const set of ex.sets || []) {
        const w = Number(set.weight); if (!w) continue
        const prev = seen[ex.name]
        if (!prev || w > prev.weight) {
          seen[ex.name] = { weight: w, reps: Number(set.reps) || 0, date: s.date, prev: prev?.weight || 0 }
        }
      }
    }
  }
  const entries = Object.entries(seen)
  if (!entries.length) return null
  entries.sort(([, a], [, b]) => b.date.localeCompare(a.date))
  const [name, data] = entries[0]
  return { name, weight: data.weight, reps: data.reps, date: data.date, delta: +(data.weight - data.prev).toFixed(1) }
}

export default function Dashboard() {
  const navigate = useNavigate()
  const {
    profile, sessions, bodyLogs, nutritionLogs,
    activePlanId, workoutPlans, addWorkoutPlan, setActivePlan,
  } = useStore()

  const todayKey = today()
  const todayNutrition = nutritionLogs[todayKey] || { calories: 0, protein: 0 }
  const latestBody = bodyLogs[0] || null
  const activePlan = workoutPlans.find((p) => p.id === activePlanId) || null

  const rec = getDailyRecommendation({ profile, lastSessions: sessions })
  const { thisWeekCount } = getWeeklyStats(sessions)
  const streak = getStreak(sessions)
  const targets = calcTargets(profile)
  const wUnit = weightUnit(profile)

  const todayDay = pickTodayPlanDay(activePlan)

  const week = buildWeekStatus(sessions)
  const pr = findRecentPR(sessions)
  const initial = (profile.name || 'A').trim().charAt(0).toUpperCase()

  // Onboarding
  if (!profile.setupDone) {
    return (
      <div className="flex flex-col min-h-full items-center justify-center px-6 pb-10 bg-surface">
        <p className="font-mono text-[10px] uppercase tracking-eyebrow text-accent mb-6">● Coach</p>
        <h1 className="font-display text-display-1 italic text-ink mb-4 text-center leading-none">
          Built for<br/><span className="text-ink-3">your grind.</span>
        </h1>
        <p className="text-ink-2 text-center text-[14px] mb-10 leading-relaxed max-w-[280px]">
          Personal trainer that adapts to your life. Set up your profile to begin.
        </p>
        <Button size="lg" className="w-full max-w-xs" onClick={() => navigate('/settings')}>
          <Play size={16} fill="currentColor" /> Set Up Profile
        </Button>
      </div>
    )
  }

  // Suggest applying user's routine if no plan exists
  const applyMyRoutine = () => {
    const plan = generateDefaultPlan(profile.goal, profile.trainingDays)
    addWorkoutPlan(plan)
    setActivePlan(plan.id)
  }

  const totalExercises = todayDay?.exercises?.length || 0
  const estTime = totalExercises ? Math.round(totalExercises * 9) + 'm' : '—'
  const estVolume = computeEstVolume(todayDay, wUnit)
  const isTrainingDay = !!todayDay && totalExercises > 0

  return (
    <div className="flex flex-col min-h-full bg-surface">
      <main className="flex-1 px-5 pb-32 pt-10 page-enter">
        {/* Meta row */}
        <div className="flex items-center justify-between mb-7">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-eyebrow text-ink-3 mb-1">{metaRow()}</p>
            <p className="font-mono text-[10px] uppercase tracking-eyebrow text-ink-2">
              {labelGoal(profile.goal)}
            </p>
          </div>
          <button
            onClick={() => navigate('/settings')}
            className="w-[38px] h-[38px] rounded-full flex items-center justify-center font-display text-[20px] italic text-ink"
            style={{ background: 'linear-gradient(135deg, #2a2a30 0%, #17171A 100%)' }}
          >
            {initial}
          </button>
        </div>

        {/* Hero */}
        <div className="mb-7">
          <p className="font-mono text-[10px] uppercase tracking-eyebrow text-accent mb-3 flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-accent breathe" />
            Session {sessions.length + 1} · Today
          </p>
          <h1 className="font-display text-[64px] italic text-ink leading-none tracking-display-tight">
            {dayHeadline(activePlan)}<br/>
            <span className="text-ink-3">Day.</span>
          </h1>
        </div>

        {/* 3-up stat strip */}
        <div className="flex items-stretch gap-0 border-y border-surface-line-soft py-5 mb-5">
          <Stat3 label="Exercises" value={totalExercises || '—'} />
          <span className="w-px bg-surface-line-soft" />
          <Stat3 label="Est · Time" value={estTime} />
          <span className="w-px bg-surface-line-soft" />
          <Stat3 label="Volume" value={estVolume.value} unit={estVolume.unit} />
        </div>

        {/* Coach */}
        <CoachCard label={rec.label} message={rec.message} color={rec.color} className="mb-4" />

        {/* Primary CTA */}
        {activePlan && isTrainingDay ? (
          <button
            onClick={() => navigate('/workout')}
            className="relative w-full bg-accent text-white py-[22px] rounded-[20px] font-mono uppercase tracking-eyebrow-2 text-[14px] flex items-center justify-center gap-3 mb-5 shadow-[0_12px_32px_-8px_rgba(255,45,45,0.4)] active:scale-[0.98] transition-transform"
          >
            <Play size={18} fill="currentColor" />
            Start Workout
          </button>
        ) : !activePlan ? (
          <Button variant="secondary" size="lg" className="w-full mb-5" onClick={applyMyRoutine}>
            Apply My Routine
          </Button>
        ) : (
          <div className="bg-surface-card border border-surface-line-soft rounded-[16px] p-4 mb-5 text-center">
            <p className="font-mono text-[10px] uppercase tracking-eyebrow text-ink-3 mb-1">Today</p>
            <p className="text-ink text-[15px] font-medium">Rest day · No session scheduled</p>
            <button
              onClick={() => navigate('/workout')}
              className="font-mono text-[10px] uppercase tracking-eyebrow text-accent mt-2"
            >
              View Plan →
            </button>
          </div>
        )}

        {/* Exercise preview */}
        {todayDay && totalExercises > 0 && (
          <div className="bg-surface-card border border-surface-line-soft rounded-[20px] p-1 mb-5">
            {todayDay.exercises.map((ex, i) => (
              <div key={ex.id || i} className={`flex items-center gap-4 px-[14px] py-3.5 ${i < totalExercises - 1 ? 'border-b border-surface-line-soft' : ''}`}>
                <span className="font-mono text-[12px] tabular-nums text-ink-3 w-7">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-ink text-[15px] font-medium truncate">{ex.name}</p>
                  <p className="font-mono text-[11px] tabular-nums text-ink-3 mt-0.5">
                    {ex.sets} × {ex.reps}
                  </p>
                </div>
                {ex.weight ? (
                  <span className="font-mono text-[13px] tabular-nums text-ink-2">{ex.weight}{wUnit}</span>
                ) : null}
              </div>
            ))}
          </div>
        )}

        {/* Week strip */}
        <div className="flex items-center justify-between mb-3 mt-2">
          <p className="font-mono text-[10px] uppercase tracking-eyebrow text-ink-3">This Week</p>
          <p className="font-mono text-[10px] uppercase tracking-eyebrow text-ink-2 tabular-nums">
            {thisWeekCount} / {profile.trainingDays || 5} Sessions
          </p>
        </div>
        <div className="grid grid-cols-7 gap-1.5 mb-7">
          {week.map((d, i) => (
            <div key={i} className={`h-[44px] rounded-[10px] flex flex-col items-center justify-center gap-1 ${
              d.isToday ? 'bg-accent' : d.trained ? 'bg-surface-elev' : 'bg-surface-card'
            }`}>
              <span className={`font-mono text-[9px] uppercase tracking-eyebrow ${
                d.isToday ? 'text-white' : d.trained ? 'text-ink-2' : 'text-ink-4'
              }`}>{d.letter}</span>
              {d.isToday ? (
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
              ) : d.trained ? (
                <Check size={12} strokeWidth={2.4} className="text-ink-2" />
              ) : (
                <span className="font-mono text-[10px] text-ink-4">·</span>
              )}
            </div>
          ))}
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <StatCard label={`Streak · ${streak} days`} value={streak} unit="Days" accent />
          <StatCard label="Body weight" value={latestBody?.weight ?? '—'} unit={wUnit} sub={latestBody?.date || 'Not logged'} />
          <StatCard label="Calories" value={todayNutrition.calories || 0} unit={`/ ${targets.calories}`} sub={`${todayNutrition.protein || 0}g protein`} />
          <StatCard
            label={`Protein · ${todayNutrition.protein || 0} / ${targets.protein} g`}
            value={todayNutrition.protein || 0}
            unit="g"
            progress={Math.min(100, ((todayNutrition.protein || 0) / Math.max(1, targets.protein)) * 100)}
          />
        </div>

        {/* Recent PR */}
        {pr && (
          <div className="bg-surface-card border border-surface-line-soft rounded-[20px] p-[18px] mb-5 relative overflow-hidden">
            <span className="absolute -top-12 -right-12 w-32 h-32 rounded-full" style={{ background: 'radial-gradient(circle, rgba(255,45,45,0.18) 0%, transparent 70%)' }} />
            <div className="flex items-center gap-2 mb-2 relative">
              <span className="font-mono text-[10px] uppercase tracking-eyebrow text-accent">
                ◆ New PR · {ageDays(pr.date)} ago
              </span>
              <Trophy size={12} className="text-accent" />
            </div>
            <p className="text-ink text-[15px] font-medium relative">{pr.name}</p>
            <div className="flex items-baseline gap-2 mt-2 relative">
              <span className="font-mono text-[28px] font-medium tabular-nums text-ink leading-none">
                {pr.weight}<span className="text-ink-3 text-[14px] ml-1">{wUnit} × {pr.reps}</span>
              </span>
              {pr.delta > 0 && (
                <span className="font-mono text-[12px] tabular-nums text-accent">+{pr.delta}</span>
              )}
            </div>
          </div>
        )}

        {/* Apply my routine — shown if user has any auto-generated plan but wants to reset */}
        {activePlan && activePlan.name !== 'My Routine' && (
          <button
            onClick={applyMyRoutine}
            className="w-full bg-surface-card border border-surface-line-soft rounded-[16px] px-4 py-3 flex items-center justify-between mb-5 hover:bg-surface-elev"
          >
            <div className="flex items-center gap-3">
              <RotateCcw size={14} className="text-accent" />
              <div className="text-left">
                <p className="font-mono text-[10px] uppercase tracking-eyebrow text-ink-3 mb-0.5">Reset</p>
                <p className="text-ink text-[13px]">Apply my routine</p>
              </div>
            </div>
            <ChevronRight size={14} className="text-ink-3" />
          </button>
        )}

        <p className="font-mono text-[10px] text-center mt-3 leading-relaxed px-4 uppercase tracking-eyebrow text-ink-3">
          {getMotivationalMessage(profile, sessions)}
        </p>
      </main>
      <BottomNav />
    </div>
  )
}

function Stat3({ label, value, unit }) {
  return (
    <div className="flex-1 px-2">
      <p className="font-mono text-[9px] uppercase tracking-eyebrow text-ink-3 mb-1.5">{label}</p>
      <p className="font-mono text-[20px] tabular-nums text-ink leading-none">
        {value}{unit && <span className="text-ink-3 text-[11px] ml-1 align-middle">{unit}</span>}
      </p>
    </div>
  )
}

function labelGoal(g) {
  return ({
    fat_loss: 'Fat Loss · 3-day split',
    muscle:   'Muscle Gain · 3-day split',
    recomp:   'Recomp · 3-day split',
    endurance:'Endurance · 3-day split',
  })[g] || 'Train'
}
function ageDays(dateIso) {
  const d = new Date(dateIso); const today = new Date()
  const diff = Math.max(0, Math.round((today - d) / 86400000))
  if (diff === 0) return 'today'
  if (diff === 1) return '1d'
  return `${diff}d`
}
function computeEstVolume(day, unit) {
  if (!day?.exercises) return { value: '—', unit }
  let total = 0
  for (const ex of day.exercises) {
    const reps = parseInt(String(ex.reps).split('-')[0]) || 8
    const w = Number(ex.weight) || 0
    total += (Number(ex.sets) || 0) * reps * w
  }
  if (total >= 1000) return { value: (total / 1000).toFixed(1) + 'k', unit }
  return { value: String(total || '—'), unit }
}
