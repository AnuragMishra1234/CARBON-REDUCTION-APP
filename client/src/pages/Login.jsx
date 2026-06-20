import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const [showPass, setShowPass] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) { toast.error('Please fill all fields'); return }
    setLoading(true)
    try {
      await login(form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Login failed. Check your credentials.')
    } finally { setLoading(false) }
  }

  const demoLogin = () => { setForm({ email: 'demo@carbon.ai', password: 'Demo1234!' }) }

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background particles */}
      {Array.from({ length: 25 }).map((_, i) => (
        <div key={i} className="particle" style={{
          width: `${Math.random() * 2 + 0.5}px`, height: `${Math.random() * 2 + 0.5}px`,
          left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
          background: ['rgba(0,255,136,0.5)','rgba(0,212,255,0.4)','rgba(124,58,237,0.4)'][i%3],
          '--dx': `${(Math.random()-0.5)*150}px`, '--dy': `${(Math.random()-0.5)*150}px`,
          animationDuration: `${Math.random()*12+8}s`, animationDelay: `${Math.random()*-12}s`
        }} />
      ))}

      {/* God rays */}
      {[15,40,65,85].map((l, i) => (
        <div key={i} className="god-ray" style={{ left:`${l}%`, '--gr':`${(i-1.5)*10}deg`, animationDelay:`${i*2.5}s` }} />
      ))}

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <Link to="/" className="inline-block">
            <div className="font-grotesk font-black text-3xl glow-text">◈ CARBON AI</div>
            <div className="text-white/40 text-sm mt-1">Sustainability Platform</div>
          </Link>
        </motion.div>

        {/* Card */}
        <motion.div initial={{ opacity: 0, y: 30, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.5, ease: 'easeOut' }}
          className="glass-card p-8 border-white/[0.09]">

          <h1 className="font-grotesk font-bold text-xl mb-1">Welcome back 👋</h1>
          <p className="text-white/45 text-sm mb-7">Sign in to continue your sustainability journey.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-white/50 mb-1.5 block">Email Address</label>
              <input type="email" className="form-input" placeholder="you@example.com"
                value={form.email} onChange={e => setForm(f => ({...f, email: e.target.value}))} autoComplete="email" />
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1.5 block">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} className="form-input pr-11" placeholder="••••••••"
                  value={form.password} onChange={e => setForm(f => ({...f, password: e.target.value}))} autoComplete="current-password" />
                <button type="button" onClick={() => setShowPass(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/70 transition-colors text-sm">
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-primary w-full justify-center py-3.5 text-base font-bold" disabled={loading}>
              {loading ? '⏳ Signing in...' : '→ Sign In'}
            </button>
          </form>

          {/* Demo login */}
          <div className="mt-4 p-3 rounded-xl bg-green/[0.06] border border-green/15 cursor-pointer" onClick={demoLogin}>
            <div className="text-[11px] text-white/40 mb-1">🌱 Try demo account</div>
            <div className="text-xs font-mono text-white/60">demo@carbon.ai  /  Demo1234!</div>
          </div>

          <div className="mt-5 text-center text-sm text-white/40">
            No account yet?{' '}
            <Link to="/register" className="text-green hover:underline font-semibold">Create one →</Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
