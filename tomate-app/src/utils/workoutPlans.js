// Default starter plans indexed by goal and training days
export function generateDefaultPlan(goal, trainingDays) {
  const days = Number(trainingDays) || 4

  const plans = {
    fat_loss: buildFatLossPlan(days),
    muscle:   buildMusclePlan(days),
    recomp:   buildRecompPlan(days),
    endurance:buildEndurancePlan(days),
  }

  return plans[goal] || plans.muscle
}

function ex(name, sets, reps, weight = 0) {
  return { id: nanoid(), name, sets, reps, weight, notes: '' }
}

function buildMusclePlan(days) {
  const full = [
    { name: 'Push — Chest & Triceps', exercises: [
      ex('Bench Press', 4, '8-10'), ex('Incline DB Press', 3, '10-12'),
      ex('Cable Fly', 3, '12-15'), ex('Overhead Tricep Extension', 3, '12'),
      ex('Tricep Pushdown', 3, '15'),
    ]},
    { name: 'Pull — Back & Biceps', exercises: [
      ex('Deadlift', 4, '5-6'), ex('Barbell Row', 4, '8-10'),
      ex('Lat Pulldown', 3, '10-12'), ex('Seated Cable Row', 3, '12'),
      ex('Barbell Curl', 3, '12'),
    ]},
    { name: 'Legs', exercises: [
      ex('Squat', 4, '6-8'), ex('Romanian Deadlift', 3, '10-12'),
      ex('Leg Press', 3, '12-15'), ex('Leg Curl', 3, '12'),
      ex('Calf Raise', 4, '15-20'),
    ]},
    { name: 'Shoulders & Arms', exercises: [
      ex('Overhead Press', 4, '8-10'), ex('Lateral Raise', 4, '15'),
      ex('Face Pull', 3, '15'), ex('Barbell Curl', 3, '10'),
      ex('Skull Crusher', 3, '12'),
    ]},
    { name: 'Upper Body', exercises: [
      ex('Bench Press', 3, '8-10'), ex('Barbell Row', 3, '8-10'),
      ex('Overhead Press', 3, '10'), ex('Pull-Up', 3, '8-10'),
      ex('Lateral Raise', 3, '15'),
    ]},
    { name: 'Lower Body', exercises: [
      ex('Squat', 4, '6-8'), ex('Romanian Deadlift', 3, '10'),
      ex('Walking Lunge', 3, '12 each'), ex('Leg Curl', 3, '12'),
      ex('Calf Raise', 3, '20'),
    ]},
  ]

  return makePlan('Muscle Builder', days, full)
}

function buildFatLossPlan(days) {
  const full = [
    { name: 'Full Body A', exercises: [
      ex('Squat', 4, '10-12'), ex('Bench Press', 3, '10-12'),
      ex('Barbell Row', 3, '10-12'), ex('Overhead Press', 3, '12'),
      ex('Romanian Deadlift', 3, '12'),
    ]},
    { name: 'HIIT Cardio + Core', exercises: [
      ex('Burpees', 4, '15'), ex('Mountain Climbers', 3, '30s'),
      ex('Jump Squat', 3, '15'), ex('Plank', 3, '45s'),
      ex('Russian Twist', 3, '20'),
    ]},
    { name: 'Full Body B', exercises: [
      ex('Deadlift', 4, '6-8'), ex('Incline DB Press', 3, '12'),
      ex('Lat Pulldown', 3, '12'), ex('Walking Lunge', 3, '12 each'),
      ex('Cable Fly', 3, '15'),
    ]},
    { name: 'Upper Circuit', exercises: [
      ex('Push-Up', 4, '15-20'), ex('Dumbbell Row', 4, '12'),
      ex('Lateral Raise', 3, '15'), ex('Tricep Dip', 3, '12'),
      ex('Barbell Curl', 3, '12'),
    ]},
  ]

  return makePlan('Fat Loss Program', days, full)
}

function buildRecompPlan(days) {
  const full = [
    { name: 'Upper Power', exercises: [
      ex('Bench Press', 5, '5'), ex('Barbell Row', 5, '5'),
      ex('Overhead Press', 3, '8'), ex('Weighted Pull-Up', 3, '6'),
      ex('Face Pull', 3, '15'),
    ]},
    { name: 'Lower Power', exercises: [
      ex('Squat', 5, '5'), ex('Romanian Deadlift', 4, '8'),
      ex('Leg Press', 3, '12'), ex('Leg Curl', 3, '12'),
      ex('Calf Raise', 4, '15'),
    ]},
    { name: 'Upper Hypertrophy', exercises: [
      ex('Incline DB Press', 4, '10-12'), ex('Cable Row', 4, '12'),
      ex('Lateral Raise', 4, '15'), ex('Tricep Pushdown', 3, '15'),
      ex('Barbell Curl', 3, '12'),
    ]},
    { name: 'Lower Hypertrophy', exercises: [
      ex('Front Squat', 4, '10'), ex('Walking Lunge', 3, '12'),
      ex('Leg Curl', 3, '15'), ex('Hip Thrust', 3, '12'),
      ex('Calf Raise', 4, '20'),
    ]},
  ]

  return makePlan('Recomposition Plan', days, full)
}

function buildEndurancePlan(days) {
  const full = [
    { name: 'Strength Base', exercises: [
      ex('Squat', 3, '12'), ex('Deadlift', 3, '10'),
      ex('Bench Press', 3, '12'), ex('Pull-Up', 3, '10'),
      ex('Plank', 3, '60s'),
    ]},
    { name: 'Tempo Run / Cardio', exercises: [
      ex('Warm-up Jog', 1, '5 min'), ex('Tempo Intervals', 6, '3 min hard'),
      ex('Cool-down Walk', 1, '5 min'),
    ]},
    { name: 'Functional Circuit', exercises: [
      ex('Box Jump', 4, '10'), ex('KB Swing', 4, '15'),
      ex('Battle Ropes', 4, '30s'), ex('Sled Push', 4, '20m'),
      ex('Rowing Machine', 3, '500m'),
    ]},
    { name: 'Long Run / Aerobic', exercises: [
      ex('Easy Run / Bike', 1, '40–60 min'),
    ]},
  ]

  return makePlan('Endurance Training', days, full)
}

function makePlan(name, days, allDays) {
  return {
    id: nanoid(),
    name,
    days: allDays.slice(0, days),
    createdAt: new Date().toISOString(),
  }
}

export function nanoid() {
  return Math.random().toString(36).slice(2, 10)
}
