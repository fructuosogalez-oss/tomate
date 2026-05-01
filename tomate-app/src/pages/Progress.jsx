import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { TrendingUp, TrendingDown } from 'lucide-react'
import Layout from '../components/Layout'
import { useStore } from '../store/useStore'
import { getWeeklyStats, getStreak, calcTargets, GOALS } from '../utils/coach'
import { weightUnit } from '../utils/units'

const RANGES = [
  { key: '1W', days: 7 },
  { key: '1M', days: 30 },
  { key: '3M', days: 90 },
  { key: '6M', days: 180 },
  { key: '1Y', days: 365 },
  { key: 'ALL', days: 99999 },
]

export default function Progress() {
  const navigate = useNavigate()
  const { sessions, bodyLogs, nutritionLogs, profile } = useStore()
  const [range, setRange] = useState('3M')
  const wUnit = weightUnit(profile)
  const targets = calcTargets(profile)

  const days = RANGES.find((r) => r.key === range)?.days || 90
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - days)

  const filteredSessions = sessions.filter((s) => new Date(s.date) >= cutoff)
  const filteredBody     = bodyLogs.filter((b) => new Date(b.date) >= cutoff)

  // Total volume
  const totalVolume = useMemo(() => {
    let total = 0
    for (const s of filteredSessions) {
      for (const ex of s.exercises || []) {
        for (const set of ex.sets || []) {
          if (set.done) total += (Number(set.weight) || 0) * (Number(set.reps) || 0)
        }
      }
    }
    return total
  }, [filteredSessions])

  // Volume per week (last N weeks)
  const weeklyVolume = useMemo(() => {
    const weeks = {}
    for (const s of filteredSessions) {
      const d = new Date(s.date); const wStart = new Date(d)
      wStart.setDate(d.getDate() - d.getDay()); wStart.setHours(0, 0, 0, 0)
      const key = wStart.toISOString().slice(0, 10)
      if (!weeks[key]) weeks[key] = 0
      for (const ex of s.exercises || []) {
        for (const set of ex.sets || []) {
          if (set.done) weeks[key] += (Number(set.weight) || 0) * (Number(set.reps) || 0)
        }
      }
    }
    return Object.entries(weeks).sort(([a], [b]) => a.localeCompare(b)).slice(-12)
  }, [filteredSessions])

  // Trend %
  const volumeTrend = useMemo(() => {
    if (weeklyVolume.length < 2) return null
    const first = weeklyVolume[0][1]
    const last = weeklyVolume[weeklyVolume.length - 1][1]
    if (first === 0) return null
    return Math.round(((last - first) / first) * 100)
  }, [weeklyVolume])

  // Big lifts
  const bigLifts = useMemo(() => buildBigLifts(filteredSessions), [filteredSessions])

  // Recent PRs
  const recentPRs = useMemo(() => buildRecentPRs(filteredSessions), [filteredSessions])

  // Body weight delta
  const bodyDelta = useMemo(() => {
    if (filteredBody.length < 2) return null
    const sorted = [...filteredBody].sort((a, b) => a.date.localeCompare(b.date))
    return {
      latest: sorted[sorted.length - 1].weight,
      delta:  +(sorted[sorted.length - 1].weight - sorted[0].weight).toFixed(1),
      sparkline: sorted.map((b) => b.weight),
    }
  }, [filteredBody])

  // Nutrition adherence — average protein
  const proteinAvg = useMemo(() => {
    const entries = Object.entries(nutritionLogs || {})
      .filter(([d]) => new Date(d) >= cutoff)
      .map(([, v]) => v.protein || 0)
      .filter((v) => v > 0)
    if (!entries.length) return null
    return Math.round(entries.reduce((a, b) => a + b, 0) / entries.length)
  }, [nutritionLogs, cutoff])

  return (
    <Layout eyebrow="Stats" title="Progress.">
      {/* Range pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 mb-5 -mx-1 px-1">
        {RANGES.map((r) => (
          <button
            key={r.key}
            onClick={() => setRange(r.key)}
            className={`shrink-0 h-[34px] px-3.5 rounded-[10px] font-mono text-[10px] uppercase tracking-eyebrow transition-colors ${
              range === r.key
                ? 'bg-ink text-surface'
                : 'bg-surface-elev text-ink-2 border border-surface-line-soft'
            }`}
          >
            {r.key}
          </button>
        ))}
      </div>

      {/* Hero — total volume */}
      <div className="bg-surface-card border border-surface-line-soft rounded-[20px] p-[18px] mb-3">
        <div className="flex items-center justify-between mb-3">
          <p className="font-mono text-[10px] uppercase tracking-eyebrow text-ink-3">
            Total Volume · {weeklyVolume.length}W
          </p>
          {volumeTrend != null && (
            <span className={`font-mono text-[11px] tabular-nums ${volumeTrend >= 0 ? 'text-good' : 'text-accent'}`}>
              {volumeTrend >= 0 ? '▲' : '▼'} {volumeTrend >= 0 ? '+' : ''}{volumeTrend}%
            </span>
          )}
        </div>
        <p className="font-mono text-[52px] font-medium tabular-nums text-ink leading-none tracking-display">
          {formatVolume(totalVolume)} <span className="text-[14px] text-ink-3 ml-1">· {wUnit}</span>
        </p>

        {/* Histogram */}
        {weeklyVolume.length > 0 && (() => {
          const max = Math.max(...weeklyVolume.map(([, v]) => v))
          return (
            <div className="mt-5">
              <div className="flex items-end gap-1 h-16">
                {weeklyVolume.map(([k, v], i) => {
                  const h = max > 0 ? Math.max(8, (v / max) * 100) : 8
                  const isLast = i === weeklyVolume.length - 1
                  return (
                    <div
                      key={k}
                      className="flex-1 rounded-[3px]"
                      style={{
                        height: `${h}%`,
                        background: isLast ? '#FF2D2D' : '#1E1E22',
                        border: isLast ? 'none' : '1px solid #24242A',
                      }}
                    />
                  )
                })}
              </div>
              <div className="flex justify-between mt-2">
                <span className="font-mono text-[9px] text-ink-3 tabular-nums">W1</span>
                <span className="font-mono text-[9px] text-ink-3 tabular-nums">W{Math.ceil(weeklyVolume.length / 2)}</span>
                <span className="font-mono text-[9px] text-accent tabular-nums">W{weeklyVolume.length}</span>
              </div>
            </div>
          )
        })()}
      </div>

      {/* Two-up metric cards */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        <MetricMini
          label="Body Weight"
          value={bodyDelta?.latest ?? '—'}
          unit={wUnit}
          delta={bodyDelta?.delta != null ? `${bodyDelta.delta > 0 ? '+' : ''}${bodyDelta.delta} · ${range}` : null}
          deltaGood={bodyDelta && bodyDelta.delta < 0}
          sparkline={bodyDelta?.sparkline || []}
        />
        <MetricMini
          label="Protein Avg"
          value={proteinAvg ?? '—'}
          unit="g · day"
          delta={proteinAvg && targets.protein ? `${proteinAvg >= targets.protein ? '+' : ''}${proteinAvg - targets.protein}` : null}
          deltaGood={proteinAvg && proteinAvg >= targets.protein}
          sparkline={[]}
        />
      </div>

      {/* Big lifts */}
      <div className="bg-surface-card border border-surface-line-soft rounded-[20px] p-[18px] mb-3">
        <p className="font-mono text-[10px] uppercase tracking-eyebrow text-ink-3 mb-3">Big Lifts</p>
        {bigLifts.length === 0 ? (
          <p className="font-mono text-[11px] text-ink-3 text-center py-3">Log workouts to track lifts.</p>
        ) : (
          <div className="space-y-3">
            {bigLifts.slice(0, 5).map((lift) => (
              <div key={lift.name} className="grid items-center" style={{ gridTemplateColumns: '1fr 80px 60px', gap: '12px' }}>
                <div className="min-w-0">
                  <p className="text-ink text-[14px] font-medium truncate">{lift.name}</p>
                  <p className="font-mono text-[10px] tabular-nums text-ink-3 mt-0.5">
                    {lift.delta > 0 ? `+${lift.delta} ${wUnit}` : 'No change'}
                  </p>
                </div>
                <Sparkline data={lift.history} />
                <p className="font-mono text-[18px] tabular-nums text-ink text-right leading-none">
                  {lift.pr}<span className="text-ink-3 text-[10px] ml-0.5">{wUnit}</span>
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent PRs */}
      {recentPRs.length > 0 && (
        <div>
          <p className="font-mono text-[10px] uppercase tracking-eyebrow text-ink-3 mb-3">Recent PRs</p>
          <div className="space-y-2">
            {recentPRs.slice(0, 3).map((pr, i) => (
              <div key={i} className="bg-surface-card border border-surface-line-soft rounded-[16px] p-4">
                <p className="font-mono text-[10px] uppercase tracking-eyebrow text-ink-3 tabular-nums mb-1">{pr.date}</p>
                <p className="text-ink text-[14px] font-medium mb-1">{pr.name}</p>
                <div className="flex items-baseline justify-between">
                  <p className="font-mono text-[26px] font-medium tabular-nums text-ink leading-none">
                    {pr.weight}<span className="text-ink-3 text-[12px] ml-1">{wUnit} × {pr.reps}</span>
                  </p>
                  {pr.delta > 0 && (
                    <span className="font-mono text-[12px] tabular-nums text-accent">◆ PR +{pr.delta}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Layout>
  )
}

function MetricMini({ label, value, unit, delta, deltaGood, sparkline }) {
  return (
    <div className="bg-surface-card border border-surface-line-soft rounded-[20px] p-[18px]">
      <p className="font-mono text-[10px] uppercase tracking-eyebrow text-ink-3 mb-2">{label}</p>
      <p className="font-mono text-[28px] font-medium tabular-nums text-ink leading-none">
        {value}<span className="text-ink-3 text-[11px] ml-1">{unit}</span>
      </p>
      {delta && (
        <p className={`font-mono text-[10px] tabular-nums mt-2 ${deltaGood ? 'text-good' : 'text-ink-3'}`}>
          {delta}
        </p>
      )}
      {sparkline.length > 1 && <Sparkline data={sparkline} className="mt-2" />}
    </div>
  )
}

function Sparkline({ data, className = '' }) {
  if (!data || data.length < 2) return <div className={`h-[30px] ${className}`} />
  const min = Math.min(...data)
  const max = Math.max(...data)
  const range = max - min || 1
  const w = 80, h = 30
  const points = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w
    const y = h - ((v - min) / range) * h
    return `${x},${y}`
  }).join(' ')
  return (
    <svg width={w} height={h} className={className}>
      <polyline points={points} fill="none" stroke="#FF2D2D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function formatVolume(v) {
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + 'M'
  if (v >= 1000)      return (v / 1000).toFixed(1) + 'K'
  return String(Math.round(v))
}

function buildBigLifts(sessions) {
  const map = {}
  for (const s of sessions) {
    for (const ex of s.exercises || []) {
      for (const set of ex.sets || []) {
        if (!set.done) continue
        const w = Number(set.weight)
        if (!w) continue
        const key = ex.name
        if (!map[key]) map[key] = { name: key, pr: 0, first: w, history: [] }
        if (w > map[key].pr) map[key].pr = w
        map[key].history.push(w)
      }
    }
  }
  return Object.values(map)
    .map((l) => ({ ...l, delta: +(l.pr - l.first).toFixed(1) }))
    .sort((a, b) => b.pr - a.pr)
}

function buildRecentPRs(sessions) {
  const seen = {}
  const prs = []
  const sorted = [...sessions].sort((a, b) => a.date.localeCompare(b.date))
  for (const s of sorted) {
    for (const ex of s.exercises || []) {
      for (const set of ex.sets || []) {
        if (!set.done) continue
        const w = Number(set.weight)
        if (!w) continue
        const prev = seen[ex.name] || 0
        if (w > prev) {
          prs.push({ name: ex.name, weight: w, reps: Number(set.reps) || 0, date: s.date, delta: +(w - prev).toFixed(1) })
          seen[ex.name] = w
        }
      }
    }
  }
  return prs.reverse()
}
