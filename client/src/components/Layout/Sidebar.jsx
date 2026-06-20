import { NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'

const NAV = [
  { label: 'Main',     items: [
    { to: '/dashboard',            icon: '⬡', label: 'Dashboard' },
    { to: '/dashboard/footprint',  icon: '🌍', label: 'Footprint Quiz' },
  ]},
  { label: 'Trackers', items: [
    { to: '/dashboard/activity',   icon: '📊', label: 'Activity Tracker', badge: '3' },
    { to: '/dashboard/ai',         icon: '🤖', label: 'AI Coach',          badge: 'AI' },
  ]},
  { label: 'Social',   items: [
    { to: '/dashboard/challenges', icon: '🏆', label: 'Challenges',        badge: '2' },
    { to: '/dashboard/leaderboard',icon: '🥇', label: 'Leaderboard' },
    { to: '/dashboard/community',  icon: '🌐', label: 'Community' },
  ]},
  { label: 'Account',  items: [
    { to: '/dashboard/profile',    icon: '👤', label: 'Profile' },
    { to: '/dashboard/settings',   icon: '⚙',  label: 'Settings' },
  ]}
]

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <AnimatePresence>
      <motion.aside
        initial={false}
        animate={{ x: open || window.innerWidth >= 1024 ? 0 : -260 }}
        className={`fixed top-0 left-0 bottom-0 w-[240px] z-[160] flex flex-col
          bg-dark-2/90 border-r border-white/[0.07] backdrop-blur-[30px]
          ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} 
          transition-transform duration-300 lg:transition-none`}
      >
        {/* Glow overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-green/[0.03] via-transparent to-cyan/[0.02] pointer-events-none" />

        {/* Logo */}
        <div className="px-5 pt-6 pb-4 border-b border-white/[0.07] flex-shrink-0">
          <div className="font-grotesk font-bold text-xl glow-text leading-none">◈ CARBON</div>
          <div className="text-white/30 text-xs mt-1">Sustainability Dashboard</div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 scrollbar-none">
          {NAV.map(section => (
            <div key={section.label} className="mb-5">
              <div className="text-[9px] font-bold text-white/20 uppercase tracking-[2.5px] px-2 mb-2">{section.label}</div>
              {section.items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/dashboard'}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `nav-item mb-0.5 ${isActive ? 'active' : ''}`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-[60%] bg-green rounded-r-full shadow-glow-green" />
                      )}
                      <span className="w-5 text-center text-base">{item.icon}</span>
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <span className="text-[10px] font-bold bg-green/10 border border-green/25 text-green px-1.5 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        {/* User footer */}
        <div className="p-4 border-t border-white/[0.07] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green to-cyan flex items-center justify-center text-black font-bold text-sm shadow-glow-green flex-shrink-0">
              {user?.avatar || user?.name?.[0] || '🌱'}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold truncate">{user?.name || 'Guest'}</div>
              <div className="text-[11px] text-green truncate">🌿 Rank #{user?.rank || '—'}</div>
            </div>
            <button onClick={handleLogout} className="text-white/30 hover:text-red-400 transition-colors text-lg" title="Logout">↩</button>
          </div>
        </div>
      </motion.aside>
    </AnimatePresence>
  )
}
