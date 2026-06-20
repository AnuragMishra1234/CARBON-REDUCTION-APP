import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useDashboard } from '../context/DashboardContext'

const GROUPS = [
  { icon: '🌆', name: 'Urban Sustainers', members: 2847 },
  { icon: '🌾', name: 'Rural Green Alliance', members: 1432 },
  { icon: '🏙️', name: 'Zero-Carbon Cities', members: 5102 },
  { icon: '🌊', name: 'Ocean Defenders', members: 3678 },
  { icon: '☀️', name: 'Solar Pioneers', members: 2103 },
  { icon: '🌲', name: 'Forest Guardians', members: 1876 },
]

export default function Community() {
  const { communityStats, feed, fetchCommunity } = useDashboard()
  const canvasRef = useRef(null)

  useEffect(() => { fetchCommunity() }, [])

  // Network canvas animation
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width  = canvas.offsetWidth
    const H = canvas.height = canvas.offsetHeight

    const nodes = Array.from({ length: 40 }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 3 + 1.5,
      color: ['rgba(0,255,136,', 'rgba(0,212,255,', 'rgba(124,58,237,'][Math.floor(Math.random() * 3)]
    }))

    let raf
    const draw = () => {
      ctx.clearRect(0, 0, W, H)
      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy
        if (n.x < 0 || n.x > W) n.vx *= -1
        if (n.y < 0 || n.y > H) n.vy *= -1
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2)
        ctx.fillStyle = n.color + '0.8)'; ctx.fill()
      })
      nodes.forEach((a, i) => {
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j]
          const d = Math.hypot(a.x - b.x, a.y - b.y)
          if (d < 100) {
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y)
            ctx.strokeStyle = `rgba(0,255,136,${(1 - d / 100) * 0.15})`
            ctx.lineWidth = 0.6; ctx.stroke()
          }
        }
      })
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => cancelAnimationFrame(raf)
  }, [])

  const stats = communityStats || { memberCount: 25847, activityCount: 543210, totalCO2SavedTons: 128.4 }

  return (
    <div>
      <div className="label-tag">◈ Community Hub</div>
      <h1 className="font-grotesk text-2xl font-bold mb-1">The <span className="glow-text">Green Community</span></h1>
      <p className="text-white/50 text-sm mb-7">Connect with 25K+ members making a global difference.</p>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { v: (stats.memberCount || 0).toLocaleString(), l: 'Members', icon: '👥' },
          { v: `${stats.totalCO2SavedTons?.toFixed(1) || 128.4}T`, l: 'CO₂ Saved', icon: '🌍' },
          { v: (stats.activityCount || 0).toLocaleString(), l: 'Activities', icon: '📊' },
        ].map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="glass-card p-4 text-center border-white/[0.07]">
            <div className="text-xl mb-1">{s.icon}</div>
            <div className="font-grotesk font-bold text-xl text-green">{s.v}</div>
            <div className="text-[11px] text-white/40">{s.l}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Network canvas */}
        <div className="lg:col-span-2">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="glass-card p-4">
            <div className="font-grotesk font-semibold mb-3 text-sm">🌐 Live Global Network</div>
            <canvas ref={canvasRef} className="w-full rounded-xl bg-white/[0.02]" style={{ height: 280 }} />
          </motion.div>
        </div>

        {/* Activity feed */}
        <div className="flex flex-col gap-4">
          <div className="glass-card p-4 flex-1">
            <div className="font-grotesk font-semibold mb-3 text-sm">⚡ Live Feed</div>
            <div className="space-y-2.5">
              {(feed?.length > 0 ? feed : [
                { user: { name: 'Alex C.', avatar: '🌱' }, category: 'transport', activityType: 'metro', emissionValue: 0.8, timeAgo: '2m ago' },
                { user: { name: 'Priya S.', avatar: '🌿' }, category: 'food', activityType: 'vegan', emissionValue: 0.9, timeAgo: '5m ago' },
                { user: { name: 'Marco R.', avatar: '🍃' }, category: 'energy', activityType: 'electricity_solar', emissionValue: 0.04, timeAgo: '12m ago' },
                { user: { name: 'Yuki T.', avatar: '🌾' }, category: 'transport', activityType: 'bike', emissionValue: 0, timeAgo: '18m ago' },
                { user: { name: 'Sara M.', avatar: '🌳' }, category: 'food', activityType: 'vegetarian', emissionValue: 2.0, timeAgo: '24m ago' },
              ]).slice(0, 5).map((f, i) => (
                <div key={i} className="flex gap-2.5 items-center">
                  <div className="w-7 h-7 rounded-full bg-green/10 flex items-center justify-center text-sm flex-shrink-0">{f.user?.avatar || '🌱'}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold">{f.user?.name || 'User'}</div>
                    <div className="text-[10px] text-white/40 capitalize">{f.activityType?.replace('_', ' ')} · {f.emissionValue?.toFixed(2)} kg</div>
                  </div>
                  <div className="text-[10px] text-white/25 flex-shrink-0">{f.timeAgo}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Eco Groups */}
      <div className="glass-card p-5 mt-5">
        <div className="font-grotesk font-semibold mb-4">🌿 Eco Groups</div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {GROUPS.map((g, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.06 }}
              className="flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-green/20 cursor-pointer transition-all group">
              <div className="w-10 h-10 rounded-xl bg-green/10 flex items-center justify-center text-xl flex-shrink-0 group-hover:bg-green/15 transition-colors">{g.icon}</div>
              <div>
                <div className="text-sm font-semibold group-hover:text-green transition-colors">{g.name}</div>
                <div className="text-[11px] text-white/35">{g.members.toLocaleString()} members</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
