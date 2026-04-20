import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from 'recharts'
import { Settings, Flame, Award, Calendar } from 'lucide-react'
import Layout from '../components/Layout'
import CoachCard from '../components/CoachCard'
import { useStore } from '../store/useStore'
import { getWeeklyStats, getStreak, calcTargets, GOALS } from '../utils/coach'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function Progress() {
  const navigate = useNavigate()
  const { sessions, bodyLogs, nutritionLogs, profile, checkins } = useStore()
  const [tab, setTab] = useState('overview') // overview | strength | body | nutrition

  const { thisWeekCount, lastWeekCount, thisWeekSessions } = getWeeklyStats(sessions)
  const streak = getStreak(sessions)
  const targets = calcTargets(profile)

  // Weekly session days heatmap (last 8 weeks)
  const heatmapData = buildHeatmap(sessions)

  // Strength PRs per exercise
  const prs = buildPRs(sessions)

  // Last 10 weeks training volume
  const weeklyVolume = buildWeeklyVolume(sessions)

  // Weight history
  const weightData = [...bodyLogs]
    .sort((a, b) => a.date.localeCompare(b.date))
    .filter((l) => l.weight)
    .slice(-20)
    .map((l) => ({ date: l.date.slice(5), weight: l.weight }))

  // Calorie adherence last 14 days
  const nutritionAdherence = buildNutritionAdherence(nutritionLogs, targets)

  return (
    <Layout
      title="Progress"
      action={
        <button onClick={() => navigate('/settings')} className="text-zinc-400 hover:text-white p-1">
          <Settings size={20} />
        </button>
      }
    >
      {/* Tabs */}
      <div className="flex gap-1 bg-surface-card rounded-xl p-1 mb-4">
        {['overview', 'strength', 'body', 'nutrition'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
              tab === t ? 'bg-brand-500 text-white' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <OverviewTab
          streak={streak}
          thisWeekCount={thisWeekCount}
          lastWeekCount={lastWeekCount}
          heatmapData={heatmapData}
          weeklyVolume={weeklyVolume}
          sessions={sessions}
          profile={profile}
        />
      )}
      {tab === 'strength' && <StrengthTab prs={prs} sessions={sessions} />}
      {tab === 'body' && <BodyTab weightData={weightData} bodyLogs={bodyLogs} />}
      {tab === 'nutrition' && <NutritionTab adherence={nutritionAdherence} targets={targets} />}
    </Layout>
  )
}

function OverviewTab({ streak, thisWeekCount, lastWeekCount, heatmapData, weeklyVolume, sessions, profile }) {
  const goal = GOALS[profile.goal] || GOALS.fat_loss
  const trend = thisWeekCount >= lastWeekCount ? 'brand' : 'yellow'
  const trendMsg = thisWeekCount >= lastWeekCount
    ? `${thisWeekCount} sessions this week — ${thisWeekCount > lastWeekCount ? 'more than last week. Keep pushing.' : 'same as last week. Stay consistent.'}`
    : `${thisWeekCount} sessions vs ${lastWeekCount} last week. Let's pick it back up.`

  return (
    <div className="space-y-4">
      {/* Key stats */}
      <div className="grid grid-cols-3 gap-3">
        <StatBox icon={<Flame size={16} className="text-orange-400" />} value={streak} label="Day streak" />
        <StatBox icon={<Calendar size={16} className="text-blue-400" />} value={thisWeekCount} label="This week" />
        <StatBox icon={<Award size={16} className="text-yellow-400" />} value={sessions.length} label="Total" />
      </div>

      <CoachCard label="Weekly trend" message={trendMsg} color={trend} />

      {/* Weekly volume chart */}
      {weeklyVolume.length > 1 && (
        <div className="bg-surface-card rounded-2xl p-4">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Sessions per Week</p>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={weeklyVolume} barSize={20}>
              <XAxis dataKey="week" tick={{ fill: '#52525b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#52525b', fontSize: 10 }} axisLine={false} tickLine={false} width={20} allowDecimals={false} />
              <Tooltip
                contentStyle={{ background: '#1a1a1a', border: '1px solid #2e2e2e', borderRadius: 10, fontSize: 12 }}
                labelStyle={{ color: '#a1a1aa' }}
                itemStyle={{ color: '#4ade80' }}
              />
              <Bar dataKey="sessions" radius={[4, 4, 0, 0]}>
                {weeklyVolume.map((_, i) => (
                  <Cell key={i} fill={i === weeklyVolume.length - 1 ? '#22c55e' : '#2e2e2e'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Activity heatmap */}
      <div className="bg-surface-card rounded-2xl p-4">
        <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Activity — Last 8 Weeks</p>
        <div className="flex gap-1">
          {heatmapData.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-1 flex-1">
              {week.map((day, di) => (
                <div
                  key={di}
                  className="rounded-sm aspect-square"
                  style={{
                    background: day.trained
                      ? '#22c55e'
                      : day.future
                      ? 'transparent'
                      : '#2e2e2e',
                  }}
                  title={day.date}
                />
              ))}
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-2">
          <span className="flex items-center gap-1 text-[10px] text-zinc-600">
            <span className="w-2 h-2 rounded-sm bg-surface-raised" /> Rest
          </span>
          <span className="flex items-center gap-1 text-[10px] text-zinc-600">
            <span className="w-2 h-2 rounded-sm bg-brand-500" /> Trained
          </span>
        </div>
      </div>
    </div>
  )
}

function StrengthTab({ prs, sessions }) {
  const [selected, setSelected] = useState(prs[0]?.name || '')
  const selectedPR = prs.find((p) => p.name === selected)
  const history = selectedPR?.history || []

  return (
    <div className="space-y-4">
      {prs.length === 0 ? (
        <p className="text-zinc-500 text-sm text-center py-10">Log workouts to track strength PRs.</p>
      ) : (
        <>
          {/* Exercise selector */}
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {prs.slice(0, 8).map((p) => (
              <button
                key={p.name}
                onClick={() => setSelected(p.name)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  selected === p.name ? 'bg-brand-500 text-white' : 'bg-surface-card text-zinc-400 hover:text-white'
                }`}
              >
                {p.name}
              </button>
            ))}
          </div>

          {selectedPR && (
            <div className="bg-surface-card rounded-2xl p-4">
              <div className="flex items-baseline justify-between mb-3">
                <p className="text-sm font-semibold text-white">{selectedPR.name}</p>
                <div className="text-right">
                  <p className="text-xl font-bold text-white">{selectedPR.pr} kg</p>
                  <p className="text-xs text-zinc-500">Personal Record</p>
                </div>
              </div>
              {history.length > 1 && (
                <ResponsiveContainer width="100%" height={120}>
                  <LineChart data={history}>
                    <XAxis dataKey="date" tick={{ fill: '#52525b', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis domain={['dataMin - 5', 'dataMax + 5']} tick={{ fill: '#52525b', fontSize: 10 }} axisLine={false} tickLine={false} width={30} />
                    <Tooltip
                      contentStyle={{ background: '#1a1a1a', border: '1px solid #2e2e2e', borderRadius: 10, fontSize: 12 }}
                      labelStyle={{ color: '#a1a1aa' }}
                      itemStyle={{ color: '#4ade80' }}
                    />
                    <Line type="monotone" dataKey="weight" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e', r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          )}

          {/* PR grid */}
          <div className="grid grid-cols-2 gap-3">
            {prs.slice(0, 6).map((p) => (
              <button
                key={p.name}
                onClick={() => setSelected(p.name)}
                className={`bg-surface-card rounded-xl p-3 text-left border transition-colors ${selected === p.name ? 'border-brand-500/40' : 'border-surface-border'}`}
              >
                <p className="text-xs text-zinc-500 truncate mb-1">{p.name}</p>
                <p className="text-lg font-bold text-white">{p.pr} <span className="text-xs font-normal text-zinc-500">kg</span></p>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function BodyTab({ weightData, bodyLogs }) {
  const latest   = bodyLogs[0]
  const oldest   = bodyLogs[bodyLogs.length - 1]
  const weightChange = latest?.weight && oldest?.weight
    ? (latest.weight - oldest.weight).toFixed(1)
    : null

  return (
    <div className="space-y-4">
      {weightData.length > 1 ? (
        <>
          {weightChange !== null && (
            <CoachCard
              label={Number(weightChange) < 0 ? 'Weight Down' : Number(weightChange) > 0 ? 'Weight Up' : 'Weight Stable'}
              message={
                Number(weightChange) < 0
                  ? `You've dropped ${Math.abs(weightChange)} kg since you started tracking. Progress is real.`
                  : Number(weightChange) > 0
                  ? `You're up ${weightChange} kg. ${latest?.waist ? 'Check your waist trend to gauge body comp.' : 'Track your waist to understand if it\'s muscle or fat.'}`
                  : 'Your weight has been stable. Consistency is the foundation.'
              }
              color={Number(weightChange) < 0 ? 'brand' : Number(weightChange) > 0 ? 'yellow' : 'gray'}
            />
          )}

          <div className="bg-surface-card rounded-2xl p-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Weight History</p>
            <ResponsiveContainer width="100%" height={160}>
              <LineChart data={weightData}>
                <XAxis dataKey="date" tick={{ fill: '#52525b', fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis domain={['dataMin - 2', 'dataMax + 2']} tick={{ fill: '#52525b', fontSize: 10 }} axisLine={false} tickLine={false} width={32} />
                <Tooltip
                  contentStyle={{ background: '#1a1a1a', border: '1px solid #2e2e2e', borderRadius: 10, fontSize: 12 }}
                  labelStyle={{ color: '#a1a1aa' }}
                  itemStyle={{ color: '#4ade80' }}
                />
                <Line type="monotone" dataKey="weight" stroke="#22c55e" strokeWidth={2.5} dot={{ fill: '#22c55e', r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </>
      ) : (
        <p className="text-zinc-500 text-sm text-center py-10">Log body measurements to track trends.</p>
      )}
    </div>
  )
}

function NutritionTab({ adherence, targets }) {
  const avgCal  = adherence.length ? Math.round(adherence.reduce((a, d) => a + d.calories, 0) / adherence.length) : 0
  const avgProt = adherence.length ? Math.round(adherence.reduce((a, d) => a + d.protein,  0) / adherence.length) : 0
  const onTrackDays = adherence.filter((d) => d.calories >= targets.calories * 0.85 && d.calories <= targets.calories * 1.15).length

  return (
    <div className="space-y-4">
      {adherence.length === 0 ? (
        <p className="text-zinc-500 text-sm text-center py-10">Log meals to see nutrition trends.</p>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3">
            <StatBox value={avgCal}  label="Avg kcal/day" />
            <StatBox value={`${avgProt}g`}  label="Avg protein" />
            <StatBox value={`${onTrackDays}/${adherence.length}`} label="On-target days" />
          </div>

          <div className="bg-surface-card rounded-2xl p-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Daily Calories (last 14d)</p>
            <ResponsiveContainer width="100%" height={130}>
              <BarChart data={adherence} barSize={14}>
                <XAxis dataKey="date" tick={{ fill: '#52525b', fontSize: 9 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#52525b', fontSize: 10 }} axisLine={false} tickLine={false} width={32} />
                <Tooltip
                  contentStyle={{ background: '#1a1a1a', border: '1px solid #2e2e2e', borderRadius: 10, fontSize: 12 }}
                  labelStyle={{ color: '#a1a1aa' }}
                  itemStyle={{ color: '#fb923c' }}
                />
                <Bar dataKey="calories" radius={[3, 3, 0, 0]}>
                  {adherence.map((d, i) => (
                    <Cell key={i} fill={
                      d.calories >= targets.calories * 0.85 && d.calories <= targets.calories * 1.15
                        ? '#22c55e'
                        : '#3f3f46'
                    } />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
            <p className="text-[10px] text-zinc-600 mt-1">Target: {targets.calories} kcal · Green = on track</p>
          </div>
        </>
      )}
    </div>
  )
}

function StatBox({ icon, value, label }) {
  return (
    <div className="bg-surface-card rounded-xl p-3 text-center">
      {icon && <div className="flex justify-center mb-1">{icon}</div>}
      <p className="text-xl font-bold text-white">{value}</p>
      <p className="text-[10px] text-zinc-500 mt-0.5">{label}</p>
    </div>
  )
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function buildHeatmap(sessions) {
  const trainedSet = new Set(sessions.map((s) => s.date))
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Go back to the start of 8 weeks ago
  const start = new Date(today)
  start.setDate(start.getDate() - 7 * 8 + 1)

  const weeks = []
  let current = new Date(start)

  for (let w = 0; w < 8; w++) {
    const week = []
    for (let d = 0; d < 7; d++) {
      const dateStr = current.toISOString().slice(0, 10)
      week.push({
        date:    dateStr,
        trained: trainedSet.has(dateStr),
        future:  current > today,
      })
      current.setDate(current.getDate() + 1)
    }
    weeks.push(week)
  }

  return weeks
}

function buildWeeklyVolume(sessions) {
  const map = {}
  sessions.forEach((s) => {
    const d = new Date(s.date)
    const wStart = new Date(d)
    wStart.setDate(d.getDate() - d.getDay())
    const key = wStart.toISOString().slice(5, 10)
    map[key] = (map[key] || 0) + 1
  })
  return Object.entries(map)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-10)
    .map(([week, sessions]) => ({ week, sessions }))
}

function buildPRs(sessions) {
  const prMap = {}

  sessions.forEach((s) => {
    ;(s.exercises || []).forEach((ex) => {
      if (!ex.name) return
      ;(ex.sets || []).forEach((set) => {
        const w = Number(set.weight)
        if (!w) return
        const key = ex.name
        if (!prMap[key]) prMap[key] = { name: key, pr: 0, history: [] }
        if (w > prMap[key].pr) prMap[key].pr = w
        prMap[key].history.push({ date: s.date.slice(5), weight: w })
      })
    })
  })

  return Object.values(prMap)
    .sort((a, b) => b.pr - a.pr)
    .map((p) => ({
      ...p,
      history: p.history
        .sort((a, b) => a.date.localeCompare(b.date))
        .reduce((acc, cur) => {
          const last = acc[acc.length - 1]
          if (!last || last.weight !== cur.weight) acc.push(cur)
          return acc
        }, []),
    }))
}

function buildNutritionAdherence(logs, targets) {
  const days = []
  const today = new Date()
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    const data = logs[key] || { calories: 0, protein: 0 }
    if (data.calories > 0) {
      days.push({ date: key.slice(5), calories: data.calories, protein: data.protein })
    }
  }
  return days
}
