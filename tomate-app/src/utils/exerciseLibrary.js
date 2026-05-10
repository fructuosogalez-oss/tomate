// Exercise library — form cues + YouTube search query for each exercise in
// the routine. Used by ExerciseInfoModal to show how to do the movement.

const ENTRIES = [
  // ─── Quads / Legs ────────────────────────────────────────────────────────
  {
    name: 'Leg Press',
    aliases: ['leg press', 'press de piernas', 'horizontal leg press', '45 degree leg press'],
    cues: [
      'Pies a la altura de los hombros, ligeramente arriba del centro',
      'Bajar controlado hasta ~90° en rodillas',
      'Empujar con los talones, no con la punta',
      'No bloquear las rodillas arriba',
    ],
    youtubeQuery: 'leg press proper form tutorial',
  },
  {
    name: 'Squat',
    aliases: ['squat', 'sentadilla', 'back squat', 'barbell squat'],
    cues: [
      'Barra apoyada en trapecios, no en cuello',
      'Pies un poco más anchos que hombros, puntas ligeramente afuera',
      'Bajar como si te sentaras, rodillas siguiendo dirección de los pies',
      'Pecho arriba, mirada al frente',
      'Bajar al menos hasta paralelo, subir empujando con piso',
    ],
    youtubeQuery: 'how to back squat proper form jeff nippard',
  },
  {
    name: 'Leg Extension',
    aliases: ['leg extension', 'extension de piernas', 'quad extension'],
    cues: [
      'Espalda completamente apoyada, agarrar laterales',
      'Rodillas alineadas con eje de la máquina',
      'Extender hasta casi recto, contraer cuádriceps',
      'Bajar controlado, no soltar de golpe',
    ],
    youtubeQuery: 'leg extension proper form',
  },
  {
    name: 'Calf Raise',
    aliases: ['calf raise', 'standing calf raise', 'pantorrilla parado', 'calf'],
    cues: [
      'Pies separados al ancho de cadera',
      'Subir lo más alto posible sobre puntas',
      'Pausa 1 segundo arriba',
      'Bajar con control hasta estiramiento completo',
    ],
    youtubeQuery: 'standing calf raise proper form',
  },
  {
    name: 'Seated Calf Raise',
    aliases: ['seated calf raise', 'pantorrilla sentado'],
    cues: [
      'Almohadilla justo arriba de las rodillas',
      'Pies a la altura del hombro, paralelos',
      'Subir alto, pausa arriba',
      'Bajar lento, máximo rango de movimiento',
    ],
    youtubeQuery: 'seated calf raise proper form',
  },

  // ─── Posterior chain ─────────────────────────────────────────────────────
  {
    name: 'Romanian Deadlift',
    aliases: ['romanian deadlift', 'rdl', 'peso muerto rumano', 'stiff leg deadlift'],
    cues: [
      'Barra cerca del cuerpo todo el tiempo',
      'Espalda neutra, no redondear lumbar',
      'Cadera atrás, rodillas ligeramente flexionadas',
      'Bajar hasta sentir estiramiento en isquios (~media canilla)',
      'Empujar cadera hacia adelante para subir',
    ],
    youtubeQuery: 'romanian deadlift proper form',
  },
  {
    name: 'Leg Curl',
    aliases: ['leg curl', 'lying leg curl', 'seated leg curl', 'femoral'],
    cues: [
      'Almohadilla justo arriba del talón',
      'Cadera apoyada, no levantar',
      'Doblar rodilla todo el rango',
      'Bajar controlado, no rebotar',
    ],
    youtubeQuery: 'leg curl proper form',
  },
  {
    name: 'Hip Thrust',
    aliases: ['hip thrust', 'glute bridge', 'empuje de cadera'],
    cues: [
      'Espalda alta apoyada en banca',
      'Pies plantados, rodillas a ~90° arriba',
      'Empujar cadera hacia el techo apretando glúteos',
      'Pausa 1 segundo arriba',
      'No hiperextender lumbar',
    ],
    youtubeQuery: 'hip thrust proper form bret contreras',
  },
  {
    name: 'Hip Adduction',
    aliases: ['hip adduction', 'aduccion de cadera', 'adductor machine'],
    cues: [
      'Sentado erguido, espalda apoyada',
      'Cerrar piernas controlado contra resistencia',
      'Apretar al final del rango',
      'Abrir lentamente, no soltar',
    ],
    youtubeQuery: 'hip adduction machine proper form',
  },
  {
    name: 'Hip Abduction',
    aliases: ['hip abduction', 'abduccion de cadera', 'abductor machine'],
    cues: [
      'Sentado erguido, espalda apoyada',
      'Abrir piernas hacia afuera contra resistencia',
      'Apretar glúteo medio al final',
      'Cerrar lento, controlado',
    ],
    youtubeQuery: 'hip abduction machine proper form',
  },

  // ─── Upper body ──────────────────────────────────────────────────────────
  {
    name: 'Lat Pulldown',
    aliases: ['lat pulldown', 'jalon dorsal', 'pulldown'],
    cues: [
      'Agarre un poco más ancho que los hombros',
      'Pecho arriba, ligero arco lumbar',
      'Tirar barra al pecho alto, codos hacia abajo',
      'Apretar dorsales en la parte baja',
      'Subir controlado, no soltar',
    ],
    youtubeQuery: 'lat pulldown proper form',
  },
  {
    name: 'Dumbbell Bench Press',
    aliases: ['dumbbell bench press', 'db bench press', 'press con mancuernas', 'bench press dumbbell'],
    cues: [
      'Mancuernas a los lados del pecho, codos a ~45°',
      'Bajar hasta sentir estiramiento (cerca del pecho)',
      'Empujar arriba sin chocar mancuernas',
      'Hombros pegados a la banca todo el tiempo',
    ],
    youtubeQuery: 'dumbbell bench press proper form',
  },
  {
    name: 'Seated Row',
    aliases: ['seated row', 'cable row', 'remo sentado', 'low row'],
    cues: [
      'Pies plantados, rodillas ligeramente flexionadas',
      'Pecho arriba, no encorvar espalda',
      'Tirar al abdomen bajo, codos atrás cerca del torso',
      'Apretar escápulas al final',
      'Soltar controlado al frente',
    ],
    youtubeQuery: 'seated cable row proper form',
  },
  {
    name: 'Shoulder Press',
    aliases: ['shoulder press', 'overhead press', 'press de hombros', 'military press'],
    cues: [
      'Mancuernas/barra a la altura de hombros',
      'Codos ligeramente al frente del cuerpo',
      'Empujar arriba directo, no al frente',
      'No bloquear codos al final, sin arquear lumbar',
    ],
    youtubeQuery: 'shoulder press dumbbell proper form',
  },
  {
    name: 'Bicep Curl',
    aliases: ['bicep curl', 'curl', 'biceps curl', 'dumbbell curl', 'barbell curl'],
    cues: [
      'Codos pegados al torso, no moverlos',
      'Subir controlado, apretar bíceps arriba',
      'Bajar lento, controlar la negativa',
      'No usar momentum del cuerpo',
    ],
    youtubeQuery: 'bicep curl proper form',
  },
  {
    name: 'Tricep Extension',
    aliases: ['tricep extension', 'tricep pushdown', 'extension de triceps', 'overhead tricep extension'],
    cues: [
      'Codos fijos a los lados o sobre la cabeza (según variante)',
      'Solo el antebrazo se mueve',
      'Extender completo, apretar tríceps',
      'Bajar controlado a ~90°',
    ],
    youtubeQuery: 'tricep extension proper form',
  },
]

// Lookup an exercise by name (handles aliases + casing + extra words).
export function lookupExercise(name) {
  if (!name) return null
  const n = name.toLowerCase().trim()
  // Exact name match first
  let hit = ENTRIES.find((e) => e.name.toLowerCase() === n)
  if (hit) return hit
  // Alias match
  hit = ENTRIES.find((e) => e.aliases.some((a) => a === n))
  if (hit) return hit
  // Substring match on aliases (e.g. "Dumbbell Bench Press · 1 rebanada" → "dumbbell bench press")
  hit = ENTRIES.find((e) =>
    e.aliases.some((a) => n.includes(a)) ||
    n.includes(e.name.toLowerCase())
  )
  return hit || null
}

// Build a YouTube search URL for an exercise (works as fallback even when
// the exercise isn't in the library).
export function youtubeSearchUrl(name) {
  const hit = lookupExercise(name)
  const q = hit?.youtubeQuery || `how to do ${name} proper form`
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`
}
