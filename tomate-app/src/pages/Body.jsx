import { useState } from 'react'
import { Plus, Trash2, TrendingDown, TrendingUp } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import Layout from '../components/Layout'
import Button from '../components/Button'
import Input from '../components/Input'
import { useStore } from '../store/useStore'
import { weightUnit, isImperial } from '../utils/units'
import { todayLocal as today } from '../utils/date'

function nanoid() { return Math.random().toString(36).slice(2, 10) }

export default function Body() {
  const { bodyLogs, addBodyLog, deleteBodyLog, profile } = useStore()
  const [showLog, setShowLog] = useState(false)
  const [form, setForm] = useState({ date: today(), weight: '', waist: '', bodyFat: '', note: '' })
  const wUnit = weightUnit(profile)
  const lUnit = isImperial(profile) ? 'in' : 'cm'
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const save = () => {
    if (!form.weight && !form.waist) return
    addBodyLog({ id: nanoid(), ...form, weight: Number(form.weight) || undefined, waist: Number(form.waist) || undefined, bodyFat: Number(form.bodyFat) || undefined })
    setForm({ date: today(), weight: '', waist: '', bodyFat: '', note: '' })
    setShowLog(false)
  }

  const sorted = [...bodyLogs].sort((a, b) => a.date.localeCompare(b.date))
  const weightData = sorted.filter((l) => l.weight).map((l) => ({ date: l.date.slice(5), weight: l.weight }))

  const latest    = bodyLogs[0] || null
  const previous  = bodyLogs[1] || null
  const weightDiff = latest?.weight && previous?.weight ? +(latest.weight - previous.weight).toFixed(1) : null

  return (
    <Layout
      eyebrow="Body"
      title="Composition."
      action={
        <button
          onClick={() => setShowLog(true)}
          className="w-9 h-9 rounded-md bg-surface-elev border border-surface-line-soft flex items-center justify-center text-ink-2 hover:text-ink"
        >
          <Plus size={16} />
        </button>
      }
    >
      {/* Latest snapshot */}
      {latest ? (
        <div className="bg-surface-card border border-surface-line-soft rounded-[20px] p-5 mb-4">
          <p className="font-mono text-[10px] uppercase tracking-eyebrow text-ink-3 mb-4 tabular-nums">
            Latest · {latest.date}
          </p>
          <div className="grid grid-cols-3 gap-2">
            <Metric label="Weight" value={latest.weight} unit={wUnit} diff={weightDiff} />
            <Metric label="Waist" value={latest.waist} unit={lUnit} />
            <Metric label="Body Fat" value={latest.bodyFat} unit="%" />
          </div>
          {latest.note && <p className="text-ink-2 text-[12px] italic mt-4">"{latest.note}"</p>}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-ink-2 text-[14px] mb-5">No body measurements yet.</p>
          <Button onClick={() => setShowLog(true)}>
            <Plus size={14} /> Log First Entry
          </Button>
        </div>
      )}

      {/* Weight chart */}
      {weightData.length > 1 && (
        <div className="bg-surface-card border border-surface-line-soft rounded-[20px] p-5 mb-4">
          <p className="font-mono text-[10px] uppercase tracking-eyebrow text-ink-3 mb-3">Weight Trend</p>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={weightData}>
              <XAxis dataKey="date" tick={{ fill: '#62626A', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
              <YAxis domain={['dataMin - 2', 'dataMax + 2']} tick={{ fill: '#62626A', fontSize: 10, fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} width={32} />
              <Tooltip contentStyle={{ background: '#17171A', border: '1px solid #24242A', borderRadius: 10, fontSize: 12, fontFamily: 'JetBrains Mono' }} labelStyle={{ color: '#A1A1A8' }} itemStyle={{ color: '#FF2D2D' }} />
              <Line type="monotone" dataKey="weight" stroke="#FF2D2D" strokeWidth={2} dot={{ fill: '#FF2D2D', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* History */}
      {bodyLogs.length > 0 && (
        <div>
          <p className="font-mono text-[10px] uppercase tracking-eyebrow text-ink-3 mb-3">History</p>
          <div className="space-y-2">
            {bodyLogs.slice(0, 20).map((log) => (
              <div key={log.id} className="bg-surface-card border border-surface-line-soft rounded-[14px] px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-eyebrow text-ink-3 tabular-nums">{log.date}</p>
                  <div className="flex gap-3 mt-1">
                    {log.weight  && <span className="font-mono text-[15px] tabular-nums text-ink">{log.weight}<span className="text-ink-3 text-[10px] ml-0.5">{wUnit}</span></span>}
                    {log.waist   && <span className="font-mono text-[15px] tabular-nums text-ink-2">{log.waist}<span className="text-ink-3 text-[10px] ml-0.5">{lUnit}</span></span>}
                    {log.bodyFat && <span className="font-mono text-[15px] tabular-nums text-ink-2">{log.bodyFat}<span className="text-ink-3 text-[10px] ml-0.5">%</span></span>}
                  </div>
                </div>
                <button onClick={() => deleteBodyLog(log.id)} className="text-ink-3 hover:text-accent p-2">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Log sheet */}
      {showLog && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-end" onClick={() => setShowLog(false)}>
          <div className="bg-surface-raised border-t border-surface-line w-full max-w-[480px] mx-auto rounded-t-[28px] p-6" style={{ paddingBottom: 'calc(2rem + env(safe-area-inset-bottom))' }} onClick={(e) => e.stopPropagation()}>
            <p className="font-mono text-[10px] uppercase tracking-eyebrow text-accent mb-2">Log</p>
            <h2 className="font-display text-[28px] italic text-ink leading-none tracking-display mb-5">Body metrics.</h2>
            <div className="space-y-3">
              <Input label="Date" type="date" value={form.date} onChange={(e) => set('date', e.target.value)} />
              <div className="grid grid-cols-3 gap-3">
                <Input label={`Weight · ${wUnit}`} type="number" placeholder={isImperial(profile) ? '180' : '80'} value={form.weight} onChange={(e) => set('weight', e.target.value)} inputMode="decimal" />
                <Input label={`Waist · ${lUnit}`}  type="number" placeholder={isImperial(profile) ? '34' : '85'} value={form.waist}  onChange={(e) => set('waist', e.target.value)} inputMode="decimal" />
                <Input label="Body Fat %"           type="number" placeholder="18" value={form.bodyFat} onChange={(e) => set('bodyFat', e.target.value)} inputMode="decimal" />
              </div>
              <Input label="Notes" placeholder="How you're feeling…" value={form.note} onChange={(e) => set('note', e.target.value)} />
              <Button className="w-full mt-2" onClick={save}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

function Metric({ label, value, unit, diff }) {
  const TrendIcon = diff > 0 ? TrendingUp : diff < 0 ? TrendingDown : null
  const trendColor = diff < 0 ? 'text-good' : diff > 0 ? 'text-accent' : 'text-ink-3'

  return (
    <div>
      <p className="font-mono text-[9px] uppercase tracking-eyebrow text-ink-3 mb-2">{label}</p>
      {value ? (
        <>
          <p className="font-mono text-[20px] tabular-nums text-ink leading-none">
            {value}<span className="text-ink-3 text-[10px] ml-0.5">{unit}</span>
          </p>
          {diff != null && diff !== 0 && (
            <div className={`flex items-center gap-0.5 text-[10px] mt-1 ${trendColor}`}>
              {TrendIcon && <TrendIcon size={10} />}
              <span className="font-mono tabular-nums">{Math.abs(diff)}{unit}</span>
            </div>
          )}
        </>
      ) : (
        <p className="font-mono text-[20px] text-ink-4">—</p>
      )}
    </div>
  )
}
