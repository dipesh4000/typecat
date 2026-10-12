import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './Layout'
import PracticePage from '../pages/PracticePage/PracticePage'
import Leaderboard from '../chain/Leaderboard'

const StatsPage = lazy(() => import('../pages/StatsPage/StatsPage'))
const AchievementsPage = lazy(() => import('../pages/AchievementsPage/AchievementsPage'))
const SettingsPage = lazy(() => import('../pages/SettingsPage/SettingsPage'))

export function App() {
  return (
      <Layout>
        <Suspense>
          <Routes>
            <Route path="/" element={<PracticePage />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/achievements" element={<AchievementsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </Layout>
  )
}

export default App
