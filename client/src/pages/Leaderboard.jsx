import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useDashboard } from '../context/DashboardContext'
import { useAuth } from '../context/AuthContext'

const DEMO_LEADERS = Array.from({ length: 12 }, (_, i) => ({
  _id: `u${i}`, rank: i + 1,
  name: ['Alex Chen', 'Priya Sharma', 'Marco Rossi', 'Yuki Tanaka', 'Sara Müller', 'Lena Park', 'David Okonkwo', 'Emma Johansson', 'Carlos Rivera', 'Aisha Patel', 'Tom Wilson', 'Nina Petrov'][i],
  avatar: ['🌱','🌿','🍃','🌾','🌳','🌲','🌴','🌵','🌻','🌺','🌸','🌼'][i],
  totalCO2Saved: [980, 875, 740, 680, 590, 510, 445, 380, 310, 250, 190, 125][i],
  totalPoints: [9800, 8750, 7400, 6800, 5900, 5100, 4450, 3800, 3100, 2500, 1900, 1250][i],
  currentStreak: [45, 38, 30, 28, 22, 18, 15, 12, 9, 8, 7, 6][i],
  location: ['India','India','Italy','Japan','Germany','Korea','Nigeria','Sweden','Mexico','India','UK','Russia'][i],
}))

const PODIUM_CONFIG = [
  { rank: 2, scale: 'h-24', medal: '🥈', color: 'from-gray-400/20 to-gray-600/20', border: 'border-gray-400/25' },
  { rank: 1, scale: 'h-32', medal: '🥇', color: 'from-amber/20 to-amber/10',       border: 'border-amber/30',   glow: 'shadow-glow-amber' },
  { rank: 3, scale: 'h-20', medal: '🥉', color: 'from-orange-800/20 to-orange-900/20', border: 'border-orange-700/25' },
]

export default function Leaderboard() {
  const { leaderboard, myRank, fetchLeaderboard } = useDashboard()
  const { user } = useAuth()

  useEffect(() => { fetchLeaderboard() }, [])

  const data = leaderboard?.length > 0 ? leaderboard : DEMO_LEADERS

  return (
    <div>
      <div className="label-tag">◈ Global Leaderboard</div>
      <h1 className="font-grotesk text-2xl font-bold mb-1">Planet <span className="glow-text">Champions</span></h1>
      <p className="text-white/50 text-sm mb-7">Top carbon reducers worldwide. Where do you rank?</p>

      {/* Your rank */}
      {myRank && (
        <div className="glass-card p-4 mb-6 border-green/20 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-green/10 border border-green/25 flex items-center justify-center font-grotesk font-black text-xl text-green">
            #{myRank}
          </div>
          <div className="flex-1">
            <div className="font-semibold text-sm">Your Current Rank</div>
            <div className="text-xs text-white/40 mt-0.5">
              Save {Math.max(0, (data[myRank - 2]?.totalCO2Saved || 0) - (user?.totalCO2Saved || 0)).toFixed(0)} kg more to reach rank #{myRank - 1}
            </div>
          </div>
          <div className="text-right">
            <div className="text-green font-bold">{user?.totalCO2Saved?.toFixed(0) || 0} kg</div>
            <div className="text-[11px] text-white/30">CO₂ saved</div>
          </div>
        </div>
      )}

      {/* Podium */}
      <div className="glass-card p-6 mb-6">
        <div className="text-center font-grotesk font-semibold mb-6 text-sm text-white/50 uppercase tracking-widest">Top 3 Champions</div>
        <div className="flex items-end justify-center gap-4">
          {PODIUM_CONFIG.map(({ rank, scale, medal, color, border, glow }) => {
            const leader = data.find(d => d.rank === rank)
            if (!leader) return null
            return (
              <motion.div key={rank} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: rank * 0.1 }}
                className="flex flex-col items-center gap-2">
                <div className="text-2xl">{leader.avatar || '🌱'}</div>
                <div className="text-xs font-semibold">{leader.name.split(' ')[0]}</div>
                <div className="text-[11px] text-green font-bold">{leader.totalCO2Saved} kg</div>
                <div className={`${scale} w-20 rounded-t-2xl bg-gradient-to-t ${color} border ${border} ${glow || ''} flex flex-col items-center justify-start pt-3 gap-1`}>
                  <div className="text-2xl">{medal}</div>
                  <div className="font-grotesk font-black text-lg text-white/80">#{rank}</div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Full list */}
      <div className="glass-card p-5">
        <div className="font-grotesk font-semibold mb-4">Full Rankings</div>
        <div className="space-y-2">
          {data.map((leader, i) => {
            const isMe = leader._id === user?._id || leader.name === user?.name
            return (
              <motion.div key={leader._id || i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-colors
                  ${isMe ? 'bg-green/10 border-green/25' : 'bg-white/[0.02] border-white/[0.05] hover:border-green/15'}`}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-grotesk font-bold text-sm flex-shrink-0
                  ${leader.rank <= 3 ? 'bg-amber/15 text-amber' : 'bg-white/[0.05] text-white/40'}`}>
                  {leader.rank}
                </div>
                <div className="text-xl flex-shrink-0">{leader.avatar || '🌱'}</div>
                <div className="flex-1 min-w-0">
                  <div className={`text-sm font-semibold ${isMe ? 'text-green' : 'text-white'}`}>{leader.name} {isMe && '(You)'}</div>
                  <div className="text-[11px] text-white/30">{leader.location || 'Global'} · 🔥 {leader.currentStreak}d</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-bold text-green">{leader.totalCO2Saved?.toFixed ? leader.totalCO2Saved.toFixed(0) : leader.totalCO2Saved} kg</div>
                  <div className="text-[11px] text-white/30">{(leader.totalPoints || 0).toLocaleString()} pts</div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
