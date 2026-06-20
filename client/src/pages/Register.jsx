import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'

export default function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '', location: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) { toast.error('Please fill required fields'); return }
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return }
    if (form.password.length < 8) { toast.error('Password must be at least 8 characters'); return }
    setLoading(true)
    try {
      await register({ name: form.name, email: form.email, password: form.password, location: form.location })
      navigate('/dashboard/footprint')
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Registration failed')
    } finally { setLoading(false) }
  }

  const fields = [
    { key: 'name',     type: 'text',     label: 'Full Name *',       ph: 'Alex Chen' },
    { key: 'email',    type: 'email',    label: 'Email Address *',    ph: 'alex@example.com' },
    { key: 'password', type: 'password', label: 'Password * (min 8)', ph: '••••••••' },
    { key: 'confirm',  type: 'password', label: 'Confirm Password *', ph: '••••••••' },
    { key: 'location', type: 'text',     label: 'Location (optional)',ph: 'City, Country' },
  ]

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center p-4 relative overflow-hidden">
      {Array.from({ length: 20 }).map((_, i) => (
        <div key={i} className="particle" style={{
          width: `${Math.random()*2+0.5}px`, height: `${Math.random()*2+0.5}px`,
          left:`${Math.random()*100}%`, top:`${Math.random()*100}%`,
          background: ['rgba(0,255,136,0.5)','rgba(0,212,255,0.4)','rgba(124,58,237,0.4)'][i%3],
          '--dx':`${(Math.random()-.5)*150}px`,'--dy':`${(Math.random()-.5)*150}px`,
          animationDuration:`${Math.random()*12+8}s`,animationDelay:`${Math.random()*-12}s`
        }} />
      ))}
      {[20,50,80].map((l,i)=><div key={i} className="god-ray" style={{left:`${l}%`,'--gr':`${(i-1)*12}deg`,animationDelay:`${i*2}s`}}/>)}

      <div className="w-full max-w-md relative z-10">
        <motion.div initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }} className="text-center mb-8">
          <Link to="/" className="inline-block">
            <div className="font-grotesk font-black text-3xl glow-text">◈ CARBON AI</div>
            <div className="text-white/40 text-sm mt-1">Join the Green Revolution</div>
          </Link>
        </motion.div>

        <motion.div initial={{ opacity:0, y:30, scale:0.97 }} animate={{ opacity:1, y:0, scale:1 }} transition={{ duration:0.5 }}
          className="glass-card p-7 border-white/[0.09]">
          <h1 className="font-grotesk font-bold text-xl mb-1">Create your account 🌱</h1>
          <p className="text-white/45 text-sm mb-6">Join 25K+ members making a real climate difference.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map(({ key, type, label, ph }, i) => (
              <motion.div key={key} initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.07 }}>
                <label className="text-xs text-white/50 mb-1.5 block">{label}</label>
                <input type={type} className="form-input" placeholder={ph}
                  value={form[key]} onChange={e => setForm(f => ({...f, [key]: e.target.value}))} />
              </motion.div>
            ))}
            <button type="submit" className="btn-primary w-full justify-center py-3.5 text-base font-bold mt-2" disabled={loading}>
              {loading ? '⏳ Creating account...' : '🌿 Join Carbon AI'}
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-white/40">
            Already have an account?{' '}
            <Link to="/login" className="text-green hover:underline font-semibold">Sign in →</Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
