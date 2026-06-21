import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import api from '../lib/api'

const STEPS = [
  {
    key: 'transport', q: '🚗 How do you usually travel?',
    opts: [{ icon: '🚗', label: 'Private Car' }, { icon: '🚌', label: 'Bus' }, { icon: '🚇', label: 'Metro/Train' }, { icon: '🚲', label: 'Bike/Walk' }, { icon: '💻', label: 'Work From Home' }]
  },
  {
    key: 'diet', q: '🥩 How often do you eat meat?',
    opts: [{ icon: '🌱', label: 'Vegan' }, { icon: '🥗', label: 'Vegetarian' }, { icon: '🍗', label: 'Fish / Chicken' }, { icon: '🥩', label: 'Daily Meat' }]
  },
  {
    key: 'energy', q: '⚡ Monthly electricity usage?',
    opts: [{ icon: '💡', label: 'Low', sub: '< 200 kWh' }, { icon: '🔌', label: 'Medium', sub: '200–500 kWh' }, { icon: '⚡', label: 'High', sub: '500–900 kWh' }, { icon: '🏭', label: 'Very High', sub: '> 900 kWh' }]
  },
  {
    key: 'remote', q: '🏠 Do you work remotely?',
    opts: [{ icon: '🏠', label: 'Fully Remote' }, { icon: '🔀', label: 'Hybrid (3 days)' }, { icon: '🏢', label: 'Fully In-Office' }]
  },
  {
    key: 'flights', q: '✈️ How often do you fly per year?',
    opts: [{ icon: '🚫', label: 'Never' }, { icon: '✈️', label: '1–2 Short Flights' }, { icon: '🌍', label: '3–5 Flights' }, { icon: '🌐', label: '6+ Long Haul' }]
  }
]

const GOAL_OPTS = [
  { label: '🌱 Reduce 10%', pct: 0.1, desc: '-0.32T' },
  { label: '🌿 Reduce 20%', pct: 0.2, desc: '-0.64T' },
  { label: '🌳 Reduce 30%', pct: 0.3, desc: '-0.96T' },
  { label: '🎯 Custom Goal', pct: 0.15, desc: 'Set target' },
]

export default function FootprintQuiz() {
  const { updateUser } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0) // 0-4 = quiz, 5 = result
  const [answers, setAnswers] = useState({})
  const [goalPct, setGoalPct] = useState(0.1)
  const [estimated, setEstimated] = useState(3.2)
  const [loading, setLoading] = useState(false)

  const selectAnswer = (key, val) => setAnswers(prev => ({ ...prev, [key]: val }))

  const handleNext = () => {
    const cur = STEPS[step]
    if (!answers[cur.key]) { toast.error('Please select an option'); return }
    if (step < STEPS.length - 1) setStep(s => s + 1)
    else calculateResult()
  }

  const calculateResult = async () => {
    try {
      const { data } = await api.post('/api/auth/onboarding', { quizAnswers: answers, goalTarget: 3.2 * (1 - 0.1) })
      setEstimated(data.estimatedFootprint)
      updateUser({ onboardingCompleted: true, currentFootprint: data.estimatedFootprint })
    } catch {
      setEstimated(3.2)
    }
    setStep(5)
  }

  const generatePlan = async () => {
    setLoading(true)
    try {
      await api.post('/api/auth/onboarding', { quizAnswers: answers, goalTarget: Math.round(estimated * (1 - goalPct) * 100) / 100 })
      toast.success('Your sustainability plan is ready! 🌿')
      navigate('/dashboard/ai')
    } catch {
      navigate('/dashboard/ai')
    } finally { setLoading(false) }
  }

  const prog = step >= 5 ? 100 : Math.round((step / STEPS.length) * 100)
  const cur = step < STEPS.length ? STEPS[step] : null

  return (
    <div>
      <div className="label-tag">◈ Carbon Calculator</div>
      <h1 className="font-grotesk text-2xl font-bold mb-1">Calculate Your <span className="glow-text">Carbon Footprint</span></h1>
      <p className="text-white/50 text-sm mb-7">Answer 5 quick questions to get your personalized sustainability profile.</p>

      <div className="max-w-2xl mx-auto">
        <div className="glass-card p-7">
          {/* Progress */}
          <div className="flex items-center gap-3 mb-7">
            <div className="flex-1 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
              <motion.div className="h-full bg-gradient-to-r from-green to-cyan rounded-full" animate={{ width: `${prog}%` }} transition={{ duration: 0.5 }} />
            </div>
            <div className="text-xs text-white/40 whitespace-nowrap">
              {step < 5 ? `Step ${step + 1} of 5` : 'Complete ✨'}
            </div>
          </div>

          {/* Steps */}
          {step < 5 && cur && (
            <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="font-grotesk font-semibold text-lg mb-5">{cur.q}</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                {cur.opts.map(opt => (
                  <button key={opt.label}
                    onClick={() => selectAnswer(cur.key, opt.label)}
                    className={`p-4 rounded-xl border text-center transition-all cursor-pointer flex flex-col gap-1.5 items-center
                      ${answers[cur.key] === opt.label
                        ? 'border-green bg-green/10 text-green'
                        : 'border-white/[0.08] bg-white/[0.03] text-white/70 hover:border-green/30 hover:text-green'}`}
                  >
                    <span className="text-2xl">{opt.icon}</span>
                    <span className="text-sm font-semibold">{opt.label}</span>
                    {opt.sub && <span className="text-[11px] text-white/40">{opt.sub}</span>}
                  </button>
                ))}
              </div>
              <div className="flex gap-3 justify-end">
                {step > 0 && <button className="btn-ghost" onClick={() => setStep(s => s - 1)}>← Back</button>}
                <button className="btn-primary" onClick={handleNext}>
                  {step === STEPS.length - 1 ? 'Calculate ✨' : 'Next →'}
                </button>
              </div>
            </motion.div>
          )}

          {/* Result */}
          {step === 5 && (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
              <div className="label-tag">◈ Your Result</div>
              <div className="text-white/50 text-sm mb-2">Estimated Annual Footprint</div>
              <div className="font-grotesk font-black text-6xl glow-text mb-1">{estimated}</div>
              <div className="text-white/50 text-sm mb-7">Tons CO₂ per year</div>

              <div className="text-left mb-5">
                <div className="font-grotesk font-semibold mb-3">Choose Your Reduction Goal</div>
                <div className="grid grid-cols-2 gap-3">
                  {GOAL_OPTS.map(g => (
                    <button key={g.label}
                      onClick={() => setGoalPct(g.pct)}
                      className={`p-4 rounded-xl border text-center transition-all
                        ${goalPct === g.pct ? 'border-green bg-green/10 text-green' : 'border-white/[0.08] bg-white/[0.03] text-white/70 hover:border-green/30'}`}
                    >
                      <div className="font-semibold text-sm">{g.label}</div>
                      <div className="text-[11px] text-white/40 mt-0.5">{g.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <button className="btn-primary w-full justify-center py-3 text-base" onClick={generatePlan} disabled={loading}>
                {loading ? '⏳ Generating...' : '✨ Generate My Sustainability Plan'}
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
