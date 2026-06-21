import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './Layout'
import PracticePage from '../pages/PracticePage/PracticePage'
import StatsPage from '../pages/StatsPage/StatsPage'
import AchievementsPage from '../pages/AchievementsPage/AchievementsPage'
import SettingsPage from '../pages/SettingsPage/SettingsPage'

export function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<PracticePage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/achievements" element={<AchievementsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="*" element={<PracticePage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}

export default App