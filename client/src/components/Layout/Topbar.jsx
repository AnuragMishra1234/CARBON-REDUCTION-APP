import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useDashboard } from '../../context/DashboardContext'

const PAGE_TITLES = {
  '/dashboard': 'Dashboard',
  '/dashboard/footprint': 'Carbon Calculator',
  '/dashboard/activity': 'Activity Tracker',
  '/dashboard/ai': 'AI Carbon Coach',
  '/dashboard/challenges': 'Eco Challenges',
  '/dashboard/leaderboard': 'Leaderboard',
  '/dashboard/community': 'Community Hub',
  '/dashboard/profile': 'My Profile',
  '/dashboard/settings': 'Settings',
}

export default function Topbar({ onMenuClick }) {
  const { user } = useAuth()
  const { footprint } = useDashboard()
  const location = useLocation()
  const navigate = useNavigate()
  const title = PAGE_TITLES[location.pathname] || 'Dashboard'

  return (
    <header className="fixed top-0 left-0 right-0 lg:left-[240px] h-16 z-[140]
      bg-dark/80 border-b border-white/[0.07] backdrop-blur-[24px]
      flex items-center px-4 lg:px-7 gap-4">

      {/* Mobile hamburger */}
      <button onClick={onMenuClick} className="lg:hidden p-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white transition-colors">
        ☰
      </button>

      {/* Title */}
      <div className="flex-1">
        <h1 className="font-grotesk font-semibold text-base lg:text-lg leading-tight">{title}</h1>
        <div className="text-white/35 text-xs hidden lg:block">Carbon AI Platform</div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 lg:gap-3">
        {/* Streak */}
        {user?.currentStreak > 0 && (
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber/10 border border-amber/20 text-amber text-xs font-bold">
            🔥 {user.currentStreak} Day Streak
          </div>
        )}

        {/* CO2 Footprint indicator */}
        {footprint && (
          <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green/10 border border-green/20 text-green text-xs font-bold">
            🌍 {footprint.annualTons} T/yr
          </div>
        )}

        {/* Log Activity CTA */}
        <button
          className="btn-primary text-xs px-4 py-2"
          onClick={() => navigate('/dashboard/activity')}
        >
          + Log Activity
        </button>

        {/* Notification dot */}
        <div className="relative w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center cursor-pointer hover:border-green/30 transition-colors">
          <span className="text-base">🔔</span>
          <div className="absolute top-1.5 right-1.5 w-2 h-2 bg-green rounded-full shadow-glow-green animate-pulse-glow" />
        </div>
      </div>
    </header>
  )
}
