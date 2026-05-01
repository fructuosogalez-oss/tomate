// Coach engine — produces daily recommendations based on check-in data
import { getMetricWeight, getMetricHeight } from './units'

export const GOALS = {
  fat_loss: { label: 'Fat Loss',      emoji: '🔥' },
  muscle:   { label: 'Build Muscle',  emoji: '💪' },
  recomp:   { label: 'Recomposition', emoji: '⚖️' },
  endurance:{ label: 'Endurance',     emoji: '🏃' },
}

export const ACTIVITY_MULTIPLIERS = {
  sedentary:    1.2,
  light:        1.375,
  moderate:     1.55,
  active:       1.725,
  very_active:  1.9,
}

// Harris-Benedict BMR
export function calcBMR(weight, height, age, sex = 'm') {
  if (sex === 'm') return 88.362 + 13.397 * weight + 4.799 * height - 5.677 * age
  return 447.593 + 9.247 * weight + 3.098 * height - 4.330 * age
}

export function calcTDEE(weight, height, age, activityLevel, sex = 'm') {
  const bmr = calcBMR(weight, height, age, sex)
  return Math.round(bmr * (ACTIVITY_MULTIPLIERS[activityLevel] || 1.55))
}

export function calcTargets(profile) {
  const { age, activityLevel, goal } = profile
  const weightKg = getMetricWeight(profile)
  const heightCm = getMetricHeight(profile)

  if (!weightKg || !heightCm || !age) return { calories: 2000, protein: 150 }

  const tdee = calcTDEE(weightKg, heightCm, Number(age), activityLevel)
  let calories = tdee
  let protein  = Math.round(weightKg * 2.0) // 2g/kg baseline

  if (goal === 'fat_loss') {
    calories = tdee - 400
    protein  = Math.round(weightKg * 2.2)
  } else if (goal === 'muscle') {
    calories = tdee + 250
    protein  = Math.round(weightKg * 2.0)
  } else if (goal === 'recomp') {
    calories = tdee - 100
    protein  = Math.round(weightKg * 2.4)
  } else if (goal === 'endurance') {
    calories = tdee + 100
    protein  = Math.round(weightKg * 1.6)
  }

  return { calories: Math.max(1200, Math.round(calories)), protein }
}

// Returns a coach recommendation object based on recent training only
export function getDailyRecommendation({ profile, lastSessions = [] }) {
  const today = new Date().toISOString().slice(0, 10)
  const trainedToday = lastSessions.some((s) => s.date === today)

  // Count consecutive training days back from today
  const dates = [...new Set(lastSessions.map((s) => s.date))].sort().reverse()
  let consecutive = 0
  let cur = new Date(); cur.setHours(0, 0, 0, 0)
  for (const d of dates) {
    const sd = new Date(d); sd.setHours(0, 0, 0, 0)
    const diff = Math.round((cur - sd) / 86400000)
    if (diff <= 1) { consecutive++; cur = sd } else break
  }

  if (trainedToday) {
    return {
      intensity: 'recover',
      label: 'Done Today',
      message: "Today's session is logged. Stretch, hydrate, and recover.",
      color: 'good',
      shouldTrain: false,
    }
  }

  if (consecutive >= 3) {
    return {
      intensity: 'light',
      label: 'Active Recovery',
      message: `${consecutive} days in a row. A lighter session or rest day is smart today.`,
      color: 'yellow',
      shouldTrain: true,
    }
  }

  if (consecutive === 0 && lastSessions.length > 0) {
    const last = new Date(dates[0])
    const days = Math.round((cur - last) / 86400000)
    if (days >= 3) {
      return {
        intensity: 'normal',
        label: 'Get Back',
        message: `Last session ${days} days ago. Time to get back under the bar.`,
        color: 'brand',
        shouldTrain: true,
      }
    }
  }

  return {
    intensity: 'normal',
    label: "Today's Session",
    message: 'Hit your planned session at full effort. Move with intent.',
    color: 'brand',
    shouldTrain: true,
  }
}

export function getMotivationalMessage(profile, sessions) {
  const name = profile.name || 'Coach'
  const count = sessions.length

  if (count === 0) return `Ready when you are, ${name}. Let's get your first session in.`
  if (count < 5) return `${count} sessions down. The habit is forming — keep going.`
  if (count < 15) return `You've trained ${count} times. That's real consistency.`
  if (count < 30) return `${count} sessions strong. You're building something real here.`
  return `${count} sessions logged. You're not just working out — you're becoming someone who does.`
}

export function getWeeklyStats(sessions) {
  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay())
  startOfWeek.setHours(0, 0, 0, 0)

  const thisWeek = sessions.filter((s) => new Date(s.date) >= startOfWeek)
  const lastWeekStart = new Date(startOfWeek)
  lastWeekStart.setDate(lastWeekStart.getDate() - 7)
  const lastWeek = sessions.filter(
    (s) => new Date(s.date) >= lastWeekStart && new Date(s.date) < startOfWeek
  )

  return {
    thisWeekCount: thisWeek.length,
    lastWeekCount: lastWeek.length,
    thisWeekSessions: thisWeek,
  }
}

// Streak = consecutive days with at least 1 session
export function getStreak(sessions) {
  if (!sessions.length) return 0
  const dates = [...new Set(sessions.map((s) => s.date))].sort().reverse()
  let streak = 0
  let cur = new Date()
  cur.setHours(0, 0, 0, 0)

  for (const d of dates) {
    const sd = new Date(d)
    sd.setHours(0, 0, 0, 0)
    const diff = Math.round((cur - sd) / 86400000)
    if (diff <= 1) {
      streak++
      cur = sd
    } else {
      break
    }
  }
  return streak
}
