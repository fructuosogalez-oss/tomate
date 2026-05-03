// Local-timezone date helpers.
// We persist dates as 'YYYY-MM-DD' strings keyed by the user's LOCAL day,
// not UTC, so a meal logged at 11pm in Mexico stays on today (not tomorrow's UTC date).

export function todayLocal() {
  const d = new Date()
  const y  = d.getFullYear()
  const m  = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

export function localDateString(date = new Date()) {
  const d = (date instanceof Date) ? date : new Date(date)
  const y  = d.getFullYear()
  const m  = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

// Days between two ISO local-date strings (a > b means positive).
export function daysBetween(aIso, bIso) {
  const a = new Date(aIso + 'T00:00:00')
  const b = new Date(bIso + 'T00:00:00')
  return Math.round((a - b) / 86400000)
}
