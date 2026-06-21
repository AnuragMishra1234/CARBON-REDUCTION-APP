import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useDashboard } from '../context/DashboardContext'
import toast from 'react-hot-toast'
import api from '../lib/api'

const DEMO_CHALLENGES = [
  { _id: '1', icon: '🚲', title: 'No Car Friday', category: 'transport', difficulty: 'easy', rewardPoints: 150, description: 'Replace at least one car trip with walking, cycling, or public transport.', co2SavedEstimate: 4.2, participantCount: 1247, isJoined: false, myProgress: 0 },
  { _id: '2', icon: '🥗', title: 'Green Meal Week', category: 'food', difficulty: 'medium', rewardPoints: 200, description: 'Choose plant-based meals every day for a full week.', co2SavedEstimate: 28, participantCount: 894, isJoined: true, myProgress: 57 },
  { _id: '3', icon: '⚡', title: 'Energy Saver Challenge', category: 'energy', difficulty: 'easy', rewardPoints: 120, description: 'Reduce household energy usage by 10% this week.', co2SavedEstimate: 8, participantCount: 2103, isJoined: false, myProgress: 0 },
  { _id: '4', icon: '♻️', title: 'Zero Waste Week', category: 'waste', difficulty: 'hard', rewardPoints: 250, description: 'Minimize waste by refusing single-use plastics and composting.', co2SavedEstimate: 4, participantCount: 542, isJoined: false, myProgress: 0 },
  { _id: '5', icon: '🌍', title: 'Community Clean-Up', category: 'community', difficulty: 'medium', rewardPoints: 300, description: 'Participate in a local environmental clean-up event.', co2SavedEstimate: 0, participantCount: 318, isJoined: false, myProgress: 0 },
]

const BADGES = [
  { icon: '🌱', name: 'First Steps', desc: 'Logged first activity' },
  { icon: '🔥', name: 'Week Warrior', desc: '7-day streak' },
  { icon: '⚡', name: 'Energy Guardian', desc: '5 energy logs' },
  { icon: '🚌', name: 'Eco Commuter', desc: '10 transport logs' },
  { icon: '🥗', name: 'Plant Power', desc: '5 vegan meals' },
  { icon: '💚', name: 'Century Saver', desc: '100 kg CO₂ saved' },
  { icon: '🏆', name: 'Challenge Hero', desc: '5 challenges done' },
  { icon: '⭐', name: 'Community Star', desc: 'Top 100 rank' },
]

const DIFF_COLORS = { easy: 'text-green border-green/25 bg-green/10', medium: 'text-amber border-amber/25 bg-amber/10', hard: 'text-pink border-pink/25 bg-pink/10' }

export default function Challenges() {
  const { challenges, challengesLoaded, fetchChallenges } = useDashboard()

  useEffect(() => { fetchChallenges() }, [])

  // Only use real DB data. Demo data shown as non-joinable preview ONLY before load.
  const isLoaded = challengesLoaded
  const data = challenges?.length > 0
    ? challenges
    : (isLoaded ? [] : DEMO_CHALLENGES) // if loaded & empty → show empty state

  const isDemo = !isLoaded || challenges.length === 0

  const isValidObjectId = (id) => /^[a-f\d]{24}$/i.test(String(id))

  const handleJoin = async (id) => {
    if (!isValidObjectId(id)) {
      toast.error('⚡ Start the backend server (npm run dev in /server) to join challenges!')
      return
    }
    try {
      await api.post(`/api/challenges/join/${id}`)
      toast.success('Challenge joined! 🌱 Good luck!')
      fetchChallenges()
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Could not join challenge')
    }
  }

  return (
    <div>
      <div className="label-tag">◈ Eco Challenges</div>
      <h1 className="font-grotesk text-2xl font-bold mb-1">Take the <span className="glow-text">Eco Challenge</span></h1>
      <p className="text-white/50 text-sm mb-7">Join community missions, earn points, and make real impact.</p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-7">
        {[
          { v: data.length, l: 'Active Challenges', icon: '🏆' },
          { v: data.filter(c => c.isJoined).length, l: 'Joined', icon: '🌱' },
          { v: data.filter(c => c.isCompleted).length, l: 'Completed', icon: '✅' }
        ].map((s, i) => (
          <div key={i} className="glass-card p-4 text-center border-white/[0.07]">
            <div className="text-xl mb-1">{s.icon}</div>
            <div className="font-grotesk font-bold text-2xl text-green">{s.v}</div>
            <div className="text-[11px] text-white/40">{s.l}</div>
          </div>
        ))}
      </div>

      {/* Skeleton while loading */}
      {!isLoaded && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
          {[1,2,3].map(i => (
            <div key={i} className="glass-card p-5 border-white/[0.07] animate-pulse">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.06] mb-4" />
              <div className="h-4 bg-white/[0.06] rounded mb-2 w-3/4" />
              <div className="h-3 bg-white/[0.04] rounded mb-1" />
              <div className="h-3 bg-white/[0.04] rounded w-2/3" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state when DB loaded but no challenges seeded */}
      {isLoaded && data.length === 0 && (
        <div className="glass-card p-12 text-center border-white/[0.07] mb-8">
          <div className="text-5xl mb-4">🏆</div>
          <div className="font-grotesk font-semibold text-lg mb-2">No Challenges Yet</div>
          <div className="text-white/40 text-sm mb-5">Seed the database to add eco challenges!</div>
          <code className="block bg-white/[0.04] border border-white/10 rounded-xl px-4 py-3 text-green text-sm font-mono">
            cd server &amp;&amp; node seed/seedData.js
          </code>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">
        {data.map((ch, i) => (
          <motion.div key={ch._id || i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="glass-card p-5 flex flex-col gap-3 hover:border-green/20 border-white/[0.07]">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-green/10 border border-green/20 flex items-center justify-center text-2xl">{ch.icon}</div>
              <div className="flex gap-2">
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border capitalize ${DIFF_COLORS[ch.difficulty] || DIFF_COLORS.medium}`}>
                  {ch.difficulty}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple/10 border border-purple/25 text-purple-400">
                  +{ch.rewardPoints} pts
                </span>
              </div>
            </div>

            <div>
              <div className="font-grotesk font-semibold text-base mb-1">{ch.title}</div>
              <div className="text-xs text-white/50 leading-relaxed">{ch.description}</div>
            </div>

            {/* CO2 save */}
            {ch.co2SavedEstimate > 0 && (
              <div className="flex items-center gap-1.5 text-[11px]">
                <span className="text-green">🌍</span>
                <span className="text-white/50">Estimated savings:</span>
                <span className="text-green font-bold">{ch.co2SavedEstimate} kg CO₂</span>
              </div>
            )}

            {/* Progress bar (if joined) */}
            {ch.isJoined && (
              <div>
                <div className="flex justify-between text-[11px] text-white/40 mb-1">
                  <span>Progress</span><span>{ch.myProgress || 0}%</span>
                </div>
                <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                  <motion.div className="h-full bg-gradient-to-r from-green to-cyan rounded-full"
                    initial={{ width: 0 }} animate={{ width: `${ch.myProgress || 0}%` }} transition={{ duration: 0.8 }} />
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/[0.06]">
              <div className="text-[11px] text-white/30">👥 {(ch.participantCount || ch.participants?.length || 0).toLocaleString()} joined</div>
              {ch.isJoined ? (
                <span className="text-[11px] font-bold text-green">✓ Joined</span>
              ) : (
                <button className="btn-primary text-xs px-4 py-1.5" onClick={() => handleJoin(ch._id)}>Join →</button>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Achievement Badges */}
      <div className="glass-card p-5">
        <div className="font-grotesk font-semibold mb-4">🏅 Achievement Badges</div>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
          {BADGES.map((b, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-green/20 transition-colors cursor-pointer group">
              <span className="text-2xl group-hover:scale-110 transition-transform">{b.icon}</span>
              <div className="text-[10px] text-center text-white/50 leading-tight">{b.name}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
