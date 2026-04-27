import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const today = () => new Date().toISOString().slice(0, 10)

export const useStore = create(
  persist(
    (set, get) => ({
      // ── Profile ────────────────────────────────────────────────────────────
      profile: {
        name: '',
        age: '',
        units: 'imperial', // 'imperial' (lbs, ft/in) | 'metric' (kg, cm)
        weight: '',        // value in user's chosen unit
        height: '',        // cm — used only when units === 'metric'
        heightFt: '',      // imperial feet
        heightIn: '',      // imperial inches
        goal: 'fat_loss',  // fat_loss | muscle | recomp | endurance
        activityLevel: 'moderate', // sedentary | light | moderate | active | very_active
        trainingDays: 4,
        calorieTarget: 0,
        proteinTarget: 0,
        setupDone: false,
      },
      setProfile: (updates) =>
        set((s) => ({ profile: { ...s.profile, ...updates } })),

      // ── Voice & AI Coach ───────────────────────────────────────────────────
      voice: {
        enabled:        false,
        elevenlabsKey:  '',
        voiceId:        'QjreVJyDygkOqCMjZyDF',
        claudeKey:      '',
        sttLang:        'es-MX',
        ttsModel:       'eleven_flash_v2_5',
        claudeModel:    'claude-haiku-4-5',
      },
      setVoice: (updates) =>
        set((s) => ({ voice: { ...s.voice, ...updates } })),

      // ── Daily Check-in ─────────────────────────────────────────────────────
      checkins: {},  // { 'YYYY-MM-DD': { fatigue: 1-5, workDemand: 1-5, sleep: 1-5, note: '' } }
      saveCheckin: (date, data) =>
        set((s) => ({ checkins: { ...s.checkins, [date]: data } })),
      getTodayCheckin: () => get().checkins[today()] || null,

      // ── Workout Plans ──────────────────────────────────────────────────────
      workoutPlans: [],   // [{ id, name, days: [{ name, exercises: [{name,sets,reps,weight,notes}] }] }]
      activePlanId: null,
      addWorkoutPlan: (plan) =>
        set((s) => ({ workoutPlans: [...s.workoutPlans, plan] })),
      updateWorkoutPlan: (id, updates) =>
        set((s) => ({
          workoutPlans: s.workoutPlans.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        })),
      deleteWorkoutPlan: (id) =>
        set((s) => ({
          workoutPlans: s.workoutPlans.filter((p) => p.id !== id),
          activePlanId: s.activePlanId === id ? null : s.activePlanId,
        })),
      setActivePlan: (id) => set({ activePlanId: id }),
      getActivePlan: () => {
        const { workoutPlans, activePlanId } = get()
        return workoutPlans.find((p) => p.id === activePlanId) || null
      },

      // ── Workout Sessions (logged workouts) ─────────────────────────────────
      sessions: [],  // [{ id, date, planDayName, exercises:[{name,sets:[{reps,weight,done}],notes}], duration, intensity, notes }]
      addSession: (session) =>
        set((s) => ({ sessions: [session, ...s.sessions] })),
      updateSession: (id, updates) =>
        set((s) => ({
          sessions: s.sessions.map((s2) => (s2.id === id ? { ...s2, ...updates } : s2)),
        })),
      deleteSession: (id) =>
        set((s) => ({ sessions: s.sessions.filter((s2) => s2.id !== id) })),

      // ── Body Metrics ───────────────────────────────────────────────────────
      bodyLogs: [], // [{ id, date, weight, waist, bodyFat, note }]
      addBodyLog: (entry) =>
        set((s) => ({ bodyLogs: [entry, ...s.bodyLogs] })),
      updateBodyLog: (id, updates) =>
        set((s) => ({
          bodyLogs: s.bodyLogs.map((e) => (e.id === id ? { ...e, ...updates } : e)),
        })),
      deleteBodyLog: (id) =>
        set((s) => ({ bodyLogs: s.bodyLogs.filter((e) => e.id !== id) })),
      getLatestBody: () => {
        const logs = get().bodyLogs
        return logs.length ? logs[0] : null
      },

      // ── Nutrition ──────────────────────────────────────────────────────────
      nutritionLogs: {}, // { 'YYYY-MM-DD': { calories: 0, protein: 0, meals: [{name,calories,protein}] } }
      saveDayNutrition: (date, data) =>
        set((s) => ({
          nutritionLogs: {
            ...s.nutritionLogs,
            [date]: { ...(s.s?.nutritionLogs?.[date] || {}), ...data },
          },
        })),
      addMeal: (date, meal) =>
        set((s) => {
          const day = s.nutritionLogs[date] || { calories: 0, protein: 0, meals: [] }
          const meals = [...(day.meals || []), meal]
          const calories = meals.reduce((a, m) => a + (m.calories || 0), 0)
          const protein  = meals.reduce((a, m) => a + (m.protein  || 0), 0)
          return {
            nutritionLogs: {
              ...s.nutritionLogs,
              [date]: { ...day, meals, calories, protein },
            },
          }
        }),
      removeMeal: (date, mealId) =>
        set((s) => {
          const day = s.nutritionLogs[date]
          if (!day) return s
          const meals = day.meals.filter((m) => m.id !== mealId)
          const calories = meals.reduce((a, m) => a + (m.calories || 0), 0)
          const protein  = meals.reduce((a, m) => a + (m.protein  || 0), 0)
          return {
            nutritionLogs: {
              ...s.nutritionLogs,
              [date]: { ...day, meals, calories, protein },
            },
          }
        }),
      getTodayNutrition: () => get().nutritionLogs[today()] || { calories: 0, protein: 0, meals: [] },

      // ── Active Workout State (in-progress session) ─────────────────────────
      activeWorkout: null,
      startWorkout: (workout) => set({ activeWorkout: workout }),
      updateActiveWorkout: (updates) =>
        set((s) => ({ activeWorkout: s.activeWorkout ? { ...s.activeWorkout, ...updates } : null })),
      finishWorkout: () => set({ activeWorkout: null }),
    }),
    {
      name: 'fitness-coach-store',
      version: 1,
    }
  )
)
