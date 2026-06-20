import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import ThreeBackground from '../components/Three/ThreeBackground'

const FEATURES = [
  { icon: '🤖', title: 'AI Carbon Coach',       desc: 'GROQ-powered personalized sustainability advice and weekly action plans.' },
  { icon: '📊', title: 'Real-Time Tracking',    desc: 'Log activities across transport, food, energy, and shopping instantly.' },
  { icon: '🏆', title: 'Eco Challenges',        desc: 'Join community missions and earn achievement badges and points.' },
  { icon: '🌍', title: 'Emissions Calculator',  desc: 'Science-based emission factors from GHG Protocol and IPCC AR6.' },
  { icon: '🥇', title: 'Global Leaderboard',   desc: 'Compete with 25K+ members worldwide and track your impact rank.' },
  { icon: '🎯', title: 'Smart Goal Tracker',   desc: 'Set reduction targets with streak tracking and milestone rewards.' },
]

const STATS = [
  { val: '25K+', label: 'Active Members' },
  { val: '128T', label: 'CO₂ Saved' },
  { val: '500K+', label: 'Activities Logged' },
  { val: '95%',  label: 'Satisfaction Rate' },
]

export default function LandingPage() {
  const navigate = useNavigate()
  const canvasRef = useRef(null)

  // Starfield canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize()
    window.addEventListener('resize', resize)

    const stars = Array.from({ length: 200 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      r: Math.random() * 1.2 + 0.2, a: Math.random(), da: (Math.random() - 0.5) * 0.005
    }))

    let raf
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      stars.forEach(s => {
        s.a = Math.max(0.05, Math.min(0.9, s.a + s.da))
        if (s.a <= 0.05 || s.a >= 0.9) s.da *= -1
        ctx.beginPath(); ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255,255,255,${s.a})`; ctx.fill()
      })
      raf = requestAnimationFrame(draw)
    }
    draw()
    return () => { window.removeEventListener('resize', resize); cancelAnimationFrame(raf) }
  }, [])

  return (
    <div className="min-h-screen bg-dark text-white font-inter relative overflow-x-hidden">
      <ThreeBackground />
      {[10,30,55,75,90].map((l, i) => (
        <div key={i} className="god-ray" style={{ left:`${l}%`, '--gr':`${(i-2)*8}deg`, animationDelay:`${i*2}s` }} />
      ))}

      {/* ── NAV ─────────────────────────────── */}
      <nav className="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-6 py-4 bg-dark/80 backdrop-blur-[24px] border-b border-white/[0.05]">
        <div className="font-grotesk font-black text-xl glow-text">◈ CARBON AI</div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/login')}    className="btn-ghost text-sm">Sign In</button>
          <button onClick={() => navigate('/register')} className="btn-primary text-sm px-5">Get Started →</button>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────── */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-6 pt-20">
        {/* Earth hologram */}
        <motion.div initial={{ opacity:0, scale:0.5 }} animate={{ opacity:1, scale:1 }} transition={{ duration:1.2, ease:'easeOut' }}
          className="mb-8 relative animate-float">
          <div className="absolute inset-[-20px] rounded-full border border-green/20 animate-ring-pulse" />
          <div className="absolute inset-[-40px] rounded-full border border-cyan/10 animate-ring-pulse" style={{ animationDelay:'-2s' }} />
          <div className="absolute inset-[-64px] rounded-full border-dashed border border-green/06 ring-orbit" />
          <div
            className="w-52 h-52 rounded-full"
            style={{
              background: 'radial-gradient(ellipse at 35% 35%, rgba(0,255,136,0.9), rgba(0,180,80,0.7) 25%, rgba(0,100,200,0.8) 50%, rgba(0,50,150,0.9) 75%, rgb(5,20,60))',
              boxShadow: '0 0 60px rgba(0,255,136,0.6), 0 0 120px rgba(0,200,100,0.2)'
            }}
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/10 to-transparent" />
            <div className="absolute top-10 left-8 w-10 h-8 bg-green/60 rounded-full blur-[3px]" />
            <div className="absolute top-20 right-6 w-8 h-10 bg-green/50 rounded-full blur-[3px]" />
            <div className="absolute bottom-10 left-12 w-12 h-6 bg-green/40 rounded-full blur-[3px]" />
          </div>
        </motion.div>

        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.5 }} className="label-tag">
          ✦ Every breath counts. Every choice matters. Every action heals.
        </motion.div>

        <motion.h1 initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.6, duration:0.8 }}
          className="font-grotesk font-black text-4xl sm:text-5xl lg:text-6xl leading-[1.05] mb-5 max-w-3xl">
          Understand Your <span className="glow-text">Carbon Footprint.</span><br />Reduce It With AI.
        </motion.h1>

        <motion.p initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.8 }}
          className="text-white/55 text-base lg:text-lg max-w-xl mb-8 leading-relaxed">
          Track your lifestyle impact, get personalized AI insights, join eco challenges, and make measurable real-world change.
        </motion.p>

        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:1.0 }} className="flex gap-3 flex-wrap justify-center">
          <button className="btn-primary text-base px-8 py-3.5 font-bold" onClick={() => navigate('/register')}>
            🌱 Start Free Today
          </button>
          <button className="btn-secondary text-base px-8 py-3.5" onClick={() => navigate('/login')}>
            🚀 Open Dashboard →
          </button>
        </motion.div>

        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:1.4 }}
          className="flex flex-wrap items-center justify-center gap-4 mt-10 text-sm text-white/30">
          {['✓ Free to use', '✓ No card required', '✓ AI-powered insights'].map(t => (
            <span key={t} className="hover:text-green transition-colors">{t}</span>
          ))}
        </motion.div>
      </section>

      {/* ── STATS ───────────────────────────── */}
      <section className="relative z-10 py-16 px-6">
        <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((s, i) => (
            <motion.div key={i} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*0.1 }}
              className="glass-card p-6 text-center border-white/[0.07] hover:border-green/20">
              <div className="font-grotesk font-black text-3xl text-green mb-1">{s.val}</div>
              <div className="text-white/45 text-sm">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ────────────────────────── */}
      <section className="relative z-10 py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="label-tag">◈ Core Features</div>
            <h2 className="font-grotesk font-bold text-3xl lg:text-4xl">Everything You Need to <span className="glow-text">Go Green</span></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div key={i} initial={{ opacity:0, y:20 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }} transition={{ delay:i*0.08 }}
                className="glass-card p-6 border-white/[0.07] hover:border-green/20">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="font-grotesk font-semibold text-base mb-2">{f.title}</h3>
                <p className="text-white/45 text-sm leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────── */}
      <section className="relative z-10 py-20 px-6">
        <motion.div initial={{ opacity:0, y:30 }} whileInView={{ opacity:1, y:0 }} viewport={{ once:true }}
          className="max-w-2xl mx-auto glass-card p-12 text-center border-green/20 shadow-glow-green">
          <div className="text-5xl mb-4 animate-float">🌍</div>
          <h2 className="font-grotesk font-bold text-3xl mb-3">Ready to Make a <span className="glow-text">Real Difference?</span></h2>
          <p className="text-white/50 mb-8">Join 25,000+ members who have saved 128 tons of CO₂ together.</p>
          <div className="flex gap-3 justify-center">
            <button className="btn-primary text-base px-8 py-3.5 font-bold" onClick={() => navigate('/register')}>🚀 Get Started Free</button>
            <button className="btn-secondary text-base px-8 py-3.5" onClick={() => navigate('/login')}>Sign In →</button>
          </div>
        </motion.div>
      </section>

      {/* ── FOOTER ──────────────────────────── */}
      <footer className="relative z-10 border-t border-white/[0.05] py-8 px-6 text-center">
        <div className="font-grotesk font-bold text-lg glow-text mb-2">◈ CARBON AI</div>
        <div className="text-white/20 text-sm italic mb-1">"The Earth does not belong to us — we belong to the Earth."</div>
        <div className="text-white/15 text-xs tracking-widest">Powered by Intelligence. Driven by Purpose. Built for the Planet.</div>
      </footer>
    </div>
  )
}
