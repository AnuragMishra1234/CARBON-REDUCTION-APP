import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

export default function MetricCard({ title, value, unit, trend, trendUp, icon, color = 'green', delay = 0, suffix = '' }) {
  const [display, setDisplay] = useState(0)

  // Count-up animation
  useEffect(() => {
    const num = parseFloat(String(value).replace(/[^0-9.]/g, '')) || 0
    if (num === 0) { setDisplay(0); return }
    const dur = 1200, steps = 60, step = num / steps
    let cur = 0
    const interval = setInterval(() => {
      cur = Math.min(cur + step, num)
      setDisplay(cur)
      if (cur >= num) clearInterval(interval)
    }, dur / steps)
    return () => clearInterval(interval)
  }, [value])

  const colorMap = {
    green:  { border: 'border-green/20',  icon: 'bg-green/10',  text: 'text-green',  glow: 'shadow-glow-green' },
    cyan:   { border: 'border-cyan/20',   icon: 'bg-cyan/10',   text: 'text-cyan',   glow: 'shadow-[0_0_20px_rgba(0,212,255,0.3)]' },
    amber:  { border: 'border-amber/20',  icon: 'bg-amber/10',  text: 'text-amber',  glow: 'shadow-glow-amber' },
    purple: { border: 'border-purple/20', icon: 'bg-purple/10', text: 'text-purple-400', glow: 'shadow-[0_0_20px_rgba(124,58,237,0.3)]' },
  }
  const c = colorMap[color] || colorMap.green

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      className={`glass-card p-5 lg:p-6 relative overflow-hidden animate-float border ${c.border}`}
      style={{ animationDelay: `${delay}s` }}
    >
      {/* Top accent line */}
      <div className={`absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-${color === 'green' ? 'green' : color}/40 to-transparent`} />

      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-xl ${c.icon} flex items-center justify-center text-xl border ${c.border}`}>
          {icon}
        </div>
        {trend && (
          <span className={trendUp ? 'metric-badge-up' : 'metric-badge-dn'}>
            {trendUp ? '↑' : '↓'} {trend}
          </span>
        )}
      </div>

      <div className={`font-grotesk font-extrabold text-2xl lg:text-3xl leading-none mb-1 ${c.text}`}>
        {typeof value === 'string' && value.includes('.')
          ? display.toFixed(1)
          : Math.round(display)
        }{suffix && ' '}{suffix}
        {unit && <span className="text-base font-normal text-white/40 ml-1">{unit}</span>}
      </div>
      <div className="text-white/50 text-xs font-medium">{title}</div>

      {/* Background glow */}
      <div className={`absolute bottom-0 right-0 w-20 h-20 rounded-full blur-2xl opacity-10 bg-gradient-to-br from-${color === 'green' ? 'green' : color} to-transparent`} />
    </motion.div>
  )
}
