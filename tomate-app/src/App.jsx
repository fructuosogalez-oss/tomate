import { HashRouter, Routes, Route } from 'react-router-dom'
import Dashboard    from './pages/Dashboard'
import Workout      from './pages/Workout'
import WorkoutLogger from './pages/WorkoutLogger'
import Body         from './pages/Body'
import Nutrition    from './pages/Nutrition'
import Progress     from './pages/Progress'
import Settings     from './pages/Settings'

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/"             element={<Dashboard />} />
        <Route path="/workout"      element={<Workout />} />
        <Route path="/workout/log"  element={<WorkoutLogger />} />
        <Route path="/body"         element={<Body />} />
        <Route path="/nutrition"    element={<Nutrition />} />
        <Route path="/progress"     element={<Progress />} />
        <Route path="/settings"     element={<Settings />} />
      </Routes>
    </HashRouter>
  )
}
