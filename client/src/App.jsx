import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

// Pages
import LandingPage     from './pages/LandingPage'
import Login           from './pages/Login'
import Register        from './pages/Register'
import Dashboard       from './pages/Dashboard'
import ActivityTracker from './pages/ActivityTracker'
import FootprintQuiz   from './pages/FootprintQuiz'
import AICoach         from './pages/AICoach'
import Challenges      from './pages/Challenges'
import Leaderboard     from './pages/Leaderboard'
import Community       from './pages/Community'
import Profile         from './pages/Profile'
import Settings        from './pages/Settings'

// Layout
import DashboardLayout from './components/Layout/DashboardLayout'

// Protected route wrapper
const Protected = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return (
    <div className="min-h-screen bg-dark flex items-center justify-center">
      <div className="text-center">
        <div className="text-4xl mb-3 animate-pulse">◈</div>
        <div className="text-green font-grotesk font-bold text-xl">CARBON AI</div>
        <div className="text-white/40 text-sm mt-1 tracking-widest uppercase">Loading...</div>
      </div>
    </div>
  )
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

// Public route (redirect if authenticated)
const Public = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return null
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : children
}

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"        element={<LandingPage />} />
      <Route path="/login"   element={<Public><Login /></Public>} />
      <Route path="/register"element={<Public><Register /></Public>} />

      {/* Protected Dashboard */}
      <Route path="/dashboard" element={<Protected><DashboardLayout /></Protected>}>
        <Route index          element={<Dashboard />} />
        <Route path="footprint" element={<FootprintQuiz />} />
        <Route path="activity"  element={<ActivityTracker />} />
        <Route path="ai"        element={<AICoach />} />
        <Route path="challenges"element={<Challenges />} />
        <Route path="leaderboard" element={<Leaderboard />} />
        <Route path="community" element={<Community />} />
        <Route path="profile"   element={<Profile />} />
        <Route path="settings"  element={<Settings />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
