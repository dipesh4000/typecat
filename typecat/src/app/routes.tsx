import { Routes, Route } from 'react-router-dom'
import PracticePage from '../pages/PracticePage/PracticePage'
import StatsPage from '../pages/StatsPage/StatsPage'
import AchievementsPage from '../pages/AchievementsPage/AchievementsPage'
import SettingsPage from '../pages/SettingsPage/SettingsPage'

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PracticePage />} />
      <Route path="/stats" element={<StatsPage />} />
      <Route path="/achievements" element={<AchievementsPage />} />
      <Route path="/settings" element={<SettingsPage />} />
    </Routes>
  )
}