// Default starter plan — Fructuoso's personal routine
// Monday: Quads · Wednesday: Upper

export function generateDefaultPlan(/* goal, trainingDays */) {
  return {
    id: nanoid(),
    name: 'My Routine',
    days: [
      {
        name: 'Monday · Quads',
        exercises: [
          ex('Leg Press',   4, '8'),
          ex('Squat',       4, '8'),
          ex('Leg Extension', 4, '12'),
          ex('Calf Raise',  3, '20'),
        ],
      },
      {
        name: 'Wednesday · Upper',
        exercises: [
          ex('Lat Pulldown',          4, '10'),
          ex('Dumbbell Bench Press',  3, '10'),
          ex('Seated Row',            3, '10'),
          ex('Shoulder Press',        3, '10'),
          ex('Bicep Curl',            3, '10'),
          ex('Tricep Extension',      3, '10'),
        ],
      },
      {
        name: 'Friday · Hamstrings & Glutes',
        exercises: [
          ex('Romanian Deadlift', 3, '8'),
          ex('Leg Curl',          4, '12'),
          ex('Hip Thrust',        3, '10'),
        ],
      },
    ],
    createdAt: new Date().toISOString(),
  }
}

function ex(name, sets, reps, weight = '') {
  return { id: nanoid(), name, sets, reps, weight, notes: '' }
}

export function nanoid() {
  return Math.random().toString(36).slice(2, 10)
}
