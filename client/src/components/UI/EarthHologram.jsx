import { motion } from 'framer-motion'

export default function EarthHologram({ indicators = [] }) {
  const defaultIndicators = [
    { value: '2.8°C', label: 'Temp Rise' },
    { value: '415ppm', label: 'CO₂ Level', color: 'text-cyan' },
    { value: '73%', label: 'Your Target', color: 'text-purple-400' },
    { value: '18d', label: 'Streak', color: 'text-amber' },
  ]
  const inds = indicators.length > 0 ? indicators : defaultIndicators

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center py-6 px-4"
    >
      <div className="label-tag mb-3">◈ Live Planet Status</div>

      {/* Earth sphere */}
      <div className="relative mb-6 animate-float" style={{ animationDuration: '5s' }}>
        {/* Outer rings */}
        <div className="absolute inset-[-14px] rounded-full border border-green/20 animate-ring-pulse" />
        <div className="absolute inset-[-28px] rounded-full border border-cyan/10 animate-ring-pulse" style={{ animationDelay: '-2s' }} />
        <div className="absolute inset-[-44px] rounded-full border border-dashed border-green/06 ring-orbit" />

        {/* Orbit dot */}
        <div className="absolute inset-[-44px] ring-orbit">
          <div className="absolute top-0 left-1/2 w-2 h-2 bg-green rounded-full shadow-glow-green -translate-x-1/2 -translate-y-1/2" />
        </div>

        {/* Sphere */}
        <div
          className="w-36 h-36 rounded-full relative overflow-hidden"
          style={{
            background: 'radial-gradient(ellipse at 35% 35%, rgba(0,255,136,0.9), rgba(0,180,80,0.7) 25%, rgba(0,100,200,0.8) 50%, rgba(0,50,150,0.9) 75%, rgb(5,20,60))',
            boxShadow: '0 0 40px rgba(0,255,136,0.5), 0 0 80px rgba(0,200,100,0.15), inset 0 0 50px rgba(0,100,255,0.2)'
          }}
        >
          {/* Atmosphere shimmer */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/10 to-transparent" />
          {/* Continent shapes */}
          <div className="absolute top-8 left-6 w-8 h-6 bg-green/60 rounded-full blur-[2px]" />
          <div className="absolute top-16 right-4 w-6 h-8 bg-green/50 rounded-full blur-[2px]" />
          <div className="absolute bottom-8 left-10 w-10 h-5 bg-green/40 rounded-full blur-[2px]" />
        </div>
      </div>

      {/* Indicators */}
      <div className="grid grid-cols-2 gap-2 w-full max-w-[240px]">
        {inds.map((ind, i) => (
          <div key={i} className="glass-card p-2.5 text-center border-white/[0.07]">
            <div className={`font-grotesk font-bold text-sm ${ind.color || 'text-green'}`}>{ind.value}</div>
            <div className="text-[10px] text-white/40 mt-0.5">{ind.label}</div>
          </div>
        ))}
      </div>
    </motion.div>
  )
}
