import { motion } from 'framer-motion'
import { useDashboard } from '../context/DashboardContext'
import { useAuth } from '../context/AuthContext'
import MetricCard from '../components/UI/MetricCard'
import EarthHologram from '../components/UI/EarthHologram'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const COLORS = ['#00ff88', '#00d4ff', '#7c3aed', '#f59e0b', '#ec4899']

const DEMO_WEEKLY = [
  { date: 'Mon', total: 8.2 }, { date: 'Tue', total: 7.1 },
  { date: 'Wed', total: 9.4 }, { date: 'Thu', total: 6.8 },
  { date: 'Fri', total: 8.1 }, { date: 'Sat', total: 5.2 },
  { date: 'Sun', total: 4.8 }
]

const DEMO_BREAKDOWN = [
  { category: 'transport', total: 55, percentage: 55 },
  { category: 'food',      total: 22, percentage: 22 },
  { category: 'energy',    total: 15, percentage: 15 },
  { category: 'shopping',  total: 8,  percentage: 8  }
]

const INSIGHTS = [
  { icon: '🚗', text: 'Transport is 55% of your footprint. Consider public transit twice weekly.', save: 'Save 140 kg CO₂/yr', color: 'bg-red-500/10' },
  { icon: '🥗', text: 'Skip one meat meal per week for significant food footprint reduction.', save: 'Save 80 kg CO₂/yr', color: 'bg-cyan/10' },
  { icon: '💻', text: 'Work from home one extra day to eliminate commute emissions.', save: 'Save 50 kg CO₂/yr', color: 'bg-purple/10' },
]

export default function Dashboard() {
  const { user } = useAuth()
  const { footprint, breakdown, weekly, loading } = useDashboard()
  const navigate = useNavigate()

  const weeklyData = weekly?.length > 0 ? weekly.map(w => ({ date: w.date?.slice(5), total: w.total })) : DEMO_WEEKLY
  const breakdownData = breakdown?.length > 0 ? breakdown : DEMO_BREAKDOWN

  const fp = footprint?.annualTons ?? 3.2
  const saved = user?.totalCO2Saved ?? 125
  const streak = user?.currentStreak ?? 18
  const challenges = user?.joinedChallenges?.filter(c => c.completed)?.length ?? 12

  return (
    <div>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-7">
        <div className="label-tag">◈ Overview</div>
        <h1 className="font-grotesk text-2xl lg:text-3xl font-bold tracking-tight mb-1">
          Your <span className="glow-text">Sustainability</span> Dashboard
        </h1>
        <p className="text-white/50 text-sm">
          Track your carbon footprint, discover personalized insights, and achieve your environmental goals.
        </p>
      </motion.div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard title="Total CO₂ / Year" value={fp}    unit="T"   icon="🌍" color="green"  delay={0}    trend="0.3T" trendUp={false} />
        <MetricCard title="CO₂ Saved"         value={saved} unit="kg"  icon="♻️" color="cyan"   delay={0.1}  trend="12%"  trendUp={true} />
        <MetricCard title="Current Streak"     value={streak} unit="days" icon="🔥" color="amber" delay={0.2}  trend="+3d"  trendUp={true} />
        <MetricCard title="Challenges Done"    value={challenges} icon="🏆" color="purple" delay={0.3} trend="+2 this wk" trendUp={true} />
      </div>

      {/* Charts + Earth */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5 mb-6">
        {/* Charts column */}
        <div className="xl:col-span-2 flex flex-col gap-5">
          {/* Weekly emissions chart */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="glass-card p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="font-grotesk font-semibold text-base">Emissions Overview</div>
                <div className="text-white/40 text-xs mt-0.5">Daily CO₂ output (kg)</div>
              </div>
              <button onClick={() => navigate('/dashboard/activity')} className="btn-ghost text-xs">View All →</button>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient id="greenGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor="#00ff88" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#00ff88" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip formatter={(v) => [`${v} kg CO₂`, 'Emissions']} />
                <Area type="monotone" dataKey="total" stroke="#00ff88" strokeWidth={2} fill="url(#greenGrad)"
                  dot={{ fill: '#00ff88', strokeWidth: 0, r: 4 }} activeDot={{ r: 6, fill: '#00ff88' }} />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Category breakdown */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card p-5">
            <div className="font-grotesk font-semibold text-base mb-4">Category Breakdown</div>
            <div className="flex gap-4 items-center">
              <div className="flex-1">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie data={breakdownData} cx="50%" cy="50%" innerRadius={50} outerRadius={75}
                      dataKey="percentage" nameKey="category" paddingAngle={3}>
                      {breakdownData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} opacity={0.85} />)}
                    </Pie>
                    <Tooltip formatter={(v, n) => [`${v}%`, n]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-2 min-w-[130px]">
                {breakdownData.map((b, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-white/60 capitalize flex-1">{b.category}</span>
                    <span className="font-bold">{b.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Earth + quick insights */}
        <div className="flex flex-col gap-5">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="glass-card">
            <EarthHologram indicators={[
              { value: `${fp}T`, label: 'Your Footprint' },
              { value: `${user?.goalTarget ?? 2.5}T`, label: 'Your Goal', color: 'text-cyan' },
              { value: `${user?.sustainabilityScore ?? 68}`, label: 'Eco Score', color: 'text-purple-400' },
              { value: `${streak}d`, label: 'Streak', color: 'text-amber' },
            ]} />
            <div className="px-4 pb-4">
              <button className="btn-primary w-full justify-center" onClick={() => navigate('/dashboard/ai')}>
                🤖 Get AI Insights
              </button>
            </div>
          </motion.div>

          {/* AI quick insights */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass-card p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="font-grotesk font-semibold text-sm">🤖 AI Quick Insights</div>
              <button onClick={() => navigate('/dashboard/ai')} className="text-green text-xs hover:underline">All →</button>
            </div>
            <div className="flex flex-col gap-2">
              {INSIGHTS.map((ins, i) => (
                <div key={i} className="flex gap-2.5 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-green/20 transition-colors cursor-pointer">
                  <div className={`w-8 h-8 rounded-lg ${ins.color} flex items-center justify-center flex-shrink-0 text-base`}>{ins.icon}</div>
                  <div>
                    <div className="text-xs text-white/70 leading-relaxed">{ins.text}</div>
                    <div className="text-[11px] text-green font-semibold mt-0.5">{ins.save}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
