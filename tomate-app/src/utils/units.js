// Unit conversion helpers — imperial <-> metric

export function lbsToKg(lbs) { return Number(lbs || 0) * 0.453592 }
export function kgToLbs(kg)  { return Number(kg  || 0) / 0.453592 }

export function ftInToCm(ft, inches) {
  return (Number(ft || 0) * 12 + Number(inches || 0)) * 2.54
}

export function cmToFtIn(cm) {
  const totalIn = Number(cm || 0) / 2.54
  const ft = Math.floor(totalIn / 12)
  const inches = Math.round(totalIn - ft * 12)
  return { ft, inches }
}

// Always return metric values for internal calculations
export function getMetricWeight(profile) {
  if (!profile) return 0
  return profile.units === 'metric'
    ? Number(profile.weight || 0)
    : lbsToKg(profile.weight)
}

export function getMetricHeight(profile) {
  if (!profile) return 0
  if (profile.units === 'metric') return Number(profile.height || 0)
  return ftInToCm(profile.heightFt, profile.heightIn)
}

// Display helpers
export function weightUnit(profile) {
  return profile?.units === 'metric' ? 'kg' : 'lbs'
}

export function isImperial(profile) {
  return profile?.units !== 'metric'
}

export function formatHeight(profile) {
  if (profile?.units === 'metric') return `${profile.height || 0} cm`
  return `${profile?.heightFt || 0}'${profile?.heightIn || 0}"`
}
