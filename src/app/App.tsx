import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './Layout'
import PracticePage from '../pages/PracticePage/PracticePage'

const StatsPage = lazy(() => import('../pages/StatsPage/StatsPage'))
const AchievementsPage = lazy(() => import('../pages/AchievementsPage/AchievementsPage'))
const SettingsPage = lazy(() => import('../pages/SettingsPage/SettingsPage'))

export function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Suspense>
          <Routes>
            <Route path="/" element={<PracticePage />} />
            <Route path="/stats" element={<StatsPage />} />
            <Route path="/achievements" element={<AchievementsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<PracticePage />} />
          </Routes>
        </Suspense>
      </Layout>
    </BrowserRouter>
  )
}

export default App