// Compute "last time you did this exercise" from saved sessions.
// Returns the heaviest set + reps + date from the most recent session that
// contains this exercise — or null if it's never been logged.

function normalize(s) {
  return (s || '').toLowerCase().replace(/\s+/g, ' ').trim()
}

export function getLastForExercise(name, sessions = []) {
  const target = normalize(name)
  if (!target) return null

  // Sessions are stored newest-first
  for (const s of sessions) {
    const ex = (s.exercises || []).find((e) => normalize(e.name) === target)
    if (!ex) continue
    const doneSets = (ex.sets || []).filter((set) => set.done)
    if (!doneSets.length) continue

    // Pick set with highest weight (or most reps for bodyweight)
    let heaviest = { weight: 0, reps: 0 }
    for (const set of doneSets) {
      const w = Number(set.weight) || 0
      const r = Number(set.reps)   || 0
      if (w > heaviest.weight || (w === heaviest.weight && r > heaviest.reps)) {
        heaviest = { weight: w, reps: r }
      }
    }
    return {
      weight: heaviest.weight,
      reps:   heaviest.reps,
      date:   s.date,
      sets:   doneSets.length,
    }
  }
  return null
}

// Format date as e.g. "Apr 12" — short and readable.
export function formatShortDate(iso) {
  if (!iso) return ''
  const [y, m, d] = iso.split('-').map(Number)
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  return `${months[(m||1)-1]} ${d}`
}
