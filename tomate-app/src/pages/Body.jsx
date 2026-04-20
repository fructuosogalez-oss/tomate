import { useState } from 'react'
import { Plus, Trash2, TrendingDown, TrendingUp, Minus } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import Layout from '../components/Layout'
import Button from '../components/Button'
import Input from '../components/Input'
import { useStore } from '../store/useStore'

function nanoid() { return Math.random().toString(36).slice(2, 10) }
const today = () => new Date().toISOString().slice(0, 10)

export default function Body() {
  const { bodyLogs, addBodyLog, deleteBodyLog } = useStore()
  const [showLog, setShowLog] = useState(false)
  const [form, setForm] = useState({ date: today(), weight: '', waist: '', bodyFat: '', note: '' })

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const save = () => {
    if (!form.weight && !form.waist) return
    addBodyLog({ id: nanoid(), ...form, weight: Number(form.weight) || undefined, waist: Number(form.waist) || undefined, bodyFat: Number(form.bodyFat) || undefined })
    setForm({ date: today(), weight: '', waist: '', bodyFat: '', note: '' })
    setShowLog(false)
  }

  const sorted = [...bodyLogs].sort((a, b) => a.date.localeCompare(b.date))
  const weightData = sorted.filter((l) => l.weight).map((l) => ({ date: l.date.slice(5), weight: l.weight }))
  const waistData  = sorted.filter((l) => l.waist).map((l) => ({ date: l.date.slice(5), waist: l.waist }))

  const latest    = bodyLogs[0] || null
  const previous  = bodyLogs[1] || null
  const weightDiff = latest?.weight && previous?.weight ? (latest.weight - previous.weight).toFixed(1) : null

  return (
    <Layout
      title="Body"
      action={
        <Button variant="ghost" size="sm" onClick={() => setShowLog(true)}>
          <Plus size={16} /> Log
        </Button>
      }
    >
      {/* Latest snapshot */}
      {latest ? (
        <div className="bg-surface-card rounded-2xl p-4 mb-4">
          <p className="text-xs text-zinc-500 mb-3">Latest — {latest.date}</p>
          <div className="grid grid-cols-3 gap-4">
            <Metric label="Weight" value={latest.weight} unit="kg" diff={weightDiff} />
            <Metric label="Waist" value={latest.waist} unit="cm" />
            <Metric label="Body Fat" value={latest.bodyFat} unit="%" />
          </div>
          {latest.note && <p className="text-xs text-zinc-500 mt-3 italic">{latest.note}</p>}
        </div>
      ) : (
        <div className="flex flex-col items-center py-12 text-center">
          <p className="text-zinc-400 text-sm mb-4">No body measurements yet.</p>
          <Button onClick={() => setShowLog(true)}>
            <Plus size={16} /> Log First Entry
          </Button>
        </div>
      )}

      {/* Weight chart */}
      {weightData.length > 1 && (
        <div className="bg-surface-card rounded-2xl p-4 mb-4">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Weight Trend</p>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={weightData}>
              <XAxis dataKey="date" tick={{ fill: '#52525b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis domain={['dataMin - 2', 'dataMax + 2']} tick={{ fill: '#52525b', fontSize: 10 }} axisLine={false} tickLine={false} width={32} />
              <Tooltip
                contentStyle={{ background: '#1a1a1a', border: '1px solid #2e2e2e', borderRadius: 10, fontSize: 12 }}
                labelStyle={{ color: '#a1a1aa' }}
                itemStyle={{ color: '#4ade80' }}
              />
              <Line type="monotone" dataKey="weight" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Waist chart */}
      {waistData.length > 1 && (
        <div className="bg-surface-card rounded-2xl p-4 mb-4">
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Waist Trend</p>
          <ResponsiveContainer width="100%" height={120}>
            <LineChart data={waistData}>
              <XAxis dataKey="date" tick={{ fill: '#52525b', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis domain={['dataMin - 2', 'dataMax + 2']} tick={{ fill: '#52525b', fontSize: 10 }} axisLine={false} tickLine={false} width={32} />
              <Tooltip
                contentStyle={{ background: '#1a1a1a', border: '1px solid #2e2e2e', borderRadius: 10, fontSize: 12 }}
                labelStyle={{ color: '#a1a1aa' }}
                itemStyle={{ color: '#60a5fa' }}
              />
              <Line type="monotone" dataKey="waist" stroke="#60a5fa" strokeWidth={2} dot={{ fill: '#60a5fa', r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Log history */}
      {bodyLogs.length > 0 && (
        <div>
          <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">History</p>
          <div className="space-y-2">
            {bodyLogs.slice(0, 20).map((log) => (
              <div key={log.id} className="bg-surface-card rounded-xl px-4 py-3 flex items-center justify-between">
                <div>
                  <p className="text-xs text-zinc-500">{log.date}</p>
                  <div className="flex gap-3 mt-0.5">
                    {log.weight && <span className="text-sm font-semibold text-white">{log.weight} kg</span>}
                    {log.waist  && <span className="text-sm text-zinc-400">{log.waist} cm</span>}
                    {log.bodyFat && <span className="text-sm text-zinc-400">{log.bodyFat}%</span>}
                  </div>
                </div>
                <button onClick={() => deleteBodyLog(log.id)} className="text-zinc-600 hover:text-red-400 p-1">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Log sheet */}
      {showLog && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-end justify-center" onClick={() => setShowLog(false)}>
          <div className="bg-surface-card w-full max-w-[480px] rounded-t-2xl p-6 pb-10" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-base font-semibold text-white mb-4">Log Body Metrics</h2>
            <div className="space-y-3">
              <Input label="Date" type="date" value={form.date} onChange={(e) => set('date', e.target.value)} />
              <div className="grid grid-cols-3 gap-3">
                <Input label="Weight (kg)" type="number" placeholder="80.5" value={form.weight} onChange={(e) => set('weight', e.target.value)} inputMode="decimal" />
                <Input label="Waist (cm)" type="number" placeholder="85" value={form.waist} onChange={(e) => set('waist', e.target.value)} inputMode="decimal" />
                <Input label="Body Fat %" type="number" placeholder="18" value={form.bodyFat} onChange={(e) => set('bodyFat', e.target.value)} inputMode="decimal" />
              </div>
              <Input label="Notes" placeholder="How you're feeling..." value={form.note} onChange={(e) => set('note', e.target.value)} />
              <Button className="w-full" onClick={save}>Save</Button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}

function Metric({ label, value, unit, diff }) {
  const TrendIcon = diff > 0 ? TrendingUp : diff < 0 ? TrendingDown : Minus
  const trendColor = diff < 0 ? 'text-brand-400' : diff > 0 ? 'text-red-400' : 'text-zinc-500'

  return (
    <div>
      <p className="text-xs text-zinc-500 mb-0.5">{label}</p>
      {value ? (
        <>
          <p className="text-xl font-bold text-white">{value}<span className="text-xs font-normal text-zinc-500 ml-0.5">{unit}</span></p>
          {diff !== null && (
            <div className={`flex items-center gap-0.5 text-xs ${trendColor}`}>
              <TrendIcon size={11} />
              {Math.abs(diff)}{unit}
            </div>
          )}
        </>
      ) : (
        <p className="text-xl font-bold text-zinc-700">—</p>
      )}
    </div>
  )
}
