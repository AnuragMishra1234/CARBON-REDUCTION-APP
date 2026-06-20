import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useDashboard } from '../context/DashboardContext'

const BREAKDOWN_BARS = [
  { label: 'Transport', pct: 55, color: '#00ff88' },
  { label: 'Food',      pct: 22, color: '#00d4ff' },
  { label: 'Energy',    pct: 15, color: '#7c3aed' },
  { label: 'Shopping',  pct: 8,  color: '#f59e0b' },
]

export default function Profile() {
  const { user } = useAuth()
  const { footprint } = useDashboard()

  const achievements = user?.achievements?.length > 0 ? user.achievements : [
    { icon: '🌱', badgeName: 'First Steps', unlockedAt: new Date() },
    { icon: '🔥', badgeName: 'Week Warrior', unlockedAt: new Date() },
    { icon: '🚌', badgeName: 'Eco Commuter', unlockedAt: new Date() },
  ]

  return (
    <div>
      <div className="label-tag">◈ My Profile</div>
      <h1 className="font-grotesk text-2xl font-bold mb-7">Your <span className="glow-text">Sustainability Profile</span></h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Profile card */}
        <div className="lg:col-span-1">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 text-center animate-float">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green to-cyan flex items-center justify-center text-5xl mx-auto mb-4 shadow-glow-green">
              {user?.avatar || '🌱'}
            </div>
            <h2 className="font-grotesk font-bold text-xl mb-0.5">{user?.name || 'Green Hero'}</h2>
            <div className="text-white/40 text-sm mb-1">{user?.email}</div>
            {user?.location && <div className="text-white/30 text-xs">📍 {user.location}</div>}

            <div className="mt-4 p-3 rounded-xl bg-green/10 border border-green/20">
              <div className="font-grotesk font-black text-3xl text-green">{user?.sustainabilityScore ?? 68}</div>
              <div className="text-xs text-white/50 mt-0.5">Sustainability Score</div>
              <div className="mt-2 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                <motion.div className="h-full bg-gradient-to-r from-green to-cyan rounded-full"
                  initial={{ width: 0 }} animate={{ width: `${user?.sustainabilityScore ?? 68}%` }} transition={{ duration: 1.2 }} />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mt-4">
              {[
                { v: `${user?.currentFootprint ?? 3.2}T`, l: 'Footprint' },
                { v: `${user?.currentStreak ?? 0}d`, l: 'Streak' },
                { v: `#${user?.rank ?? '—'}`, l: 'Rank' },
              ].map((s, i) => (
                <div key={i} className="p-2 rounded-xl bg-white/[0.03]">
                  <div className="font-grotesk font-bold text-green text-sm">{s.v}</div>
                  <div className="text-[10px] text-white/30">{s.l}</div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex gap-2">
              <div className="flex-1 p-2 rounded-xl bg-white/[0.03] text-center">
                <div className="text-green font-bold">{user?.totalCO2Saved?.toFixed(0) ?? 125} kg</div>
                <div className="text-[10px] text-white/30">CO₂ Saved</div>
              </div>
              <div className="flex-1 p-2 rounded-xl bg-white/[0.03] text-center">
                <div className="text-green font-bold">{(user?.totalPoints ?? 2450).toLocaleString()}</div>
                <div className="text-[10px] text-white/30">Points</div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Stats + breakdown */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* Emission breakdown */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-5">
            <div className="font-grotesk font-semibold mb-4">📊 Emission Breakdown</div>
            <div className="space-y-3">
              {BREAKDOWN_BARS.map((b, i) => (
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1"><span className="text-white/60">{b.label}</span><span className="font-bold" style={{ color: b.color }}>{b.pct}%</span></div>
                  <div className="h-2 bg-white/[0.05] rounded-full overflow-hidden">
                    <motion.div className="h-full rounded-full"
                      initial={{ width: 0 }} animate={{ width: `${b.pct}%` }}
                      transition={{ duration: 0.8, delay: i * 0.1 }}
                      style={{ background: `linear-gradient(to right, ${b.color}, ${b.color}88)` }} />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Joined challenges */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-5">
            <div className="font-grotesk font-semibold mb-3">🏆 My Challenges</div>
            {(user?.joinedChallenges || []).length === 0 ? (
              <div className="text-center py-5 text-white/30 text-sm">No challenges joined yet. Check out the Challenges page!</div>
            ) : (
              <div className="space-y-2">
                {user.joinedChallenges.slice(0, 5).map((c, i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                    <div className="text-xl">{c.challengeId?.icon || '🌱'}</div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold">{c.challengeId?.title || 'Challenge'}</div>
                      <div className="h-1 bg-white/[0.05] rounded-full mt-1"><div className="h-full bg-green rounded-full" style={{ width: `${c.progress || 0}%` }} /></div>
                    </div>
                    {c.completed && <span className="text-green text-xs font-bold">✓ Done</span>}
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Achievements */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-5">
            <div className="font-grotesk font-semibold mb-4">🏅 Achievements Unlocked</div>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {achievements.map((a, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-green/10 border border-green/20">
                  <span className="text-2xl">{a.icon || '🌱'}</span>
                  <span className="text-[10px] text-center text-white/60 leading-tight">{a.badgeName}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
