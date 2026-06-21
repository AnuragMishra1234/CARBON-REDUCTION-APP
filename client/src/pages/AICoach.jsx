import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDashboard } from '../context/DashboardContext'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import api from '../lib/api'

const QUICK_PROMPTS = [
  '💡 What is my biggest emission source?',
  '📋 Generate my weekly action plan',
  '🚗 Tips to reduce transport emissions',
  '🥗 How can I improve my diet footprint?',
  '⚡ Ways to cut energy usage at home',
]

const AI_PLACEHOLDER = [
  { role: 'assistant', content: '👋 Hello! I\'m **Carbon AI**, your personal sustainability coach. I\'ve analyzed your activity data and I\'m ready to help you reduce your carbon footprint with personalized, science-backed recommendations.\n\nAsk me anything — from your emission breakdown to a custom weekly eco plan!' }
]

const INSIGHTS = [
  { icon: '🚗', label: 'Transport', saving: '140 kg CO₂/yr' },
  { icon: '🥗', label: 'Food', saving: '80 kg CO₂/yr' },
  { icon: '⚡', label: 'Energy', saving: '35 kg CO₂/yr' },
  { icon: '🏠', label: 'Lifestyle', saving: '50 kg CO₂/yr' },
]

export default function AICoach() {
  const { user } = useAuth()
  const { footprint } = useDashboard()
  const [messages, setMessages] = useState(AI_PLACEHOLDER)
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [plan, setPlan] = useState(null)
  const [recs, setRecs] = useState([])
  const chatRef = useRef(null)

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight
  }, [messages])

  const sendMessage = async (text = input) => {
    if (!text.trim()) return
    const userMsg = { role: 'user', content: text }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setLoading(true)
    try {
      const history = messages.filter(m => m.role !== 'system').slice(-6)
      const { data } = await api.post('/api/ai/chat', { message: text, history })
      console.log('[Carbon AI]', data.groq ? '✅ GROQ live' : '⚡ Smart fallback', data.model || '')
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply, isGroq: !!data.groq }])
    } catch (err) {
      console.error('[Carbon AI] error:', err)
      setMessages(prev => [...prev, { role: 'assistant', content: '🔌 Cannot reach the backend. Is the server running on port 5000?' }])
    } finally { setLoading(false) }
  }

  const generatePlan = async () => {
    setLoading(true)
    try {
      const { data } = await api.post('/api/ai/generate-plan')
      setPlan(data.plan)
      toast.success('7-day action plan ready! 🌿')
    } catch {
      toast.error('Could not generate plan. Check GROQ API key.')
    } finally { setLoading(false) }
  }

  const loadRecs = async () => {
    try {
      const { data } = await api.post('/api/ai/recommendations')
      setRecs(data.recommendations)
      toast.success('Recommendations updated! 🎯')
    } catch {}
  }

  const formatContent = (text) => text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br/>')

  return (
    <div>
      <div className="label-tag">◈ AI Coach</div>
      <h1 className="font-grotesk text-2xl font-bold mb-1">Your <span className="glow-text">AI Carbon Coach</span></h1>
      <p className="text-white/50 text-sm mb-7">Personalized sustainability guidance powered by GROQ AI.</p>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Chat */}
        <div className="lg:col-span-2 flex flex-col glass-card p-0 overflow-hidden" style={{ minHeight: '500px' }}>
          {/* Chat header */}
          <div className="p-4 border-b border-white/[0.07] flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green to-cyan flex items-center justify-center text-black font-bold shadow-glow-green text-lg">🤖</div>
            <div>
              <div className="font-semibold text-sm">Carbon AI</div>
              <div className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 bg-green rounded-full animate-pulse-glow" /><span className="text-[11px] text-green">Online · llama-3.3-70b-versatile</span></div>
            </div>
          </div>

          {/* Messages */}
          <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-3" style={{ maxHeight: '380px' }}>
            <AnimatePresence>
              {messages.map((m, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {m.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green to-cyan flex items-center justify-center flex-shrink-0 text-black text-sm font-bold mt-1">AI</div>
                  )}
                  <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed
                    ${m.role === 'user'
                      ? 'bg-green/15 border border-green/25 text-white rounded-br-sm'
                      : 'bg-white/[0.04] border border-white/[0.08] text-white/80 rounded-bl-sm'}`}
                    dangerouslySetInnerHTML={{ __html: formatContent(m.content) }} />
                </motion.div>
              ))}
            </AnimatePresence>
            {loading && (
              <div className="flex gap-3"><div className="w-7 h-7 rounded-full bg-gradient-to-br from-green to-cyan flex items-center justify-center text-black text-sm font-bold">AI</div>
                <div className="bg-white/[0.04] border border-white/[0.08] px-4 py-3 rounded-2xl rounded-bl-sm flex gap-1.5 items-center">
                  {[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 bg-green/60 rounded-full animate-pulse-glow" style={{ animationDelay: `${i*0.2}s` }} />)}
                </div>
              </div>
            )}
          </div>

          {/* Quick prompts */}
          <div className="px-4 py-2 border-t border-white/[0.05] flex gap-2 overflow-x-auto scrollbar-none">
            {QUICK_PROMPTS.map((p, i) => (
              <button key={i} onClick={() => sendMessage(p)}
                className="flex-shrink-0 text-[11px] px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.08] text-white/50 hover:border-green/30 hover:text-green transition-all">
                {p}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="p-3 flex gap-2.5 border-t border-white/[0.07]">
            <input value={input} onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
              placeholder="Ask Carbon AI anything..."
              className="flex-1 bg-white/[0.04] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-green/40 placeholder:text-white/30 transition-colors" />
            <button className="btn-primary px-4" onClick={() => sendMessage()} disabled={loading}>
              {loading ? '⏳' : '→'}
            </button>
          </div>
        </div>

        {/* Right panel */}
        <div className="flex flex-col gap-4">
          {/* Insight cards */}
          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold text-sm">💡 Top Opportunities</div>
              <button onClick={loadRecs} className="text-[11px] text-green hover:underline">Refresh ↺</button>
            </div>
            {(recs.length > 0 ? recs.slice(0, 4) : INSIGHTS).map((item, i) => (
              <div key={i} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] mb-2 hover:border-green/20 transition-colors">
                <span className="text-xl">{item.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold capitalize">{item.category || item.label}</div>
                  <div className="text-[11px] text-white/40 truncate">{item.description || ''}</div>
                </div>
                <div className="text-[11px] text-green font-bold whitespace-nowrap">{item.potentialSavings ? `${item.potentialSavings} kg` : item.saving}</div>
              </div>
            ))}
          </div>

          {/* Weekly plan */}
          <div className="glass-card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="font-semibold text-sm">📋 Action Plan</div>
              <button onClick={generatePlan} className="text-[11px] text-green hover:underline" disabled={loading}>
                {loading ? '...' : 'Generate →'}
              </button>
            </div>
            {plan ? (
              <div>
                <div className="text-[11px] text-green font-semibold mb-2 px-1">🎯 {plan.weeklyGoal}</div>
                {(plan.days || []).map((d, i) => (
                  <div key={i} className="flex gap-2 mb-1.5 items-start">
                    <div className="text-[10px] text-white/30 font-mono mt-0.5 w-7 flex-shrink-0">{d.day?.slice(0,3)}</div>
                    <div className="text-[11px] text-white/70 flex-1">{d.task}</div>
                    <div className="text-[10px] text-green whitespace-nowrap">{d.saving}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4">
                <div className="text-3xl mb-2">📋</div>
                <div className="text-xs text-white/40">Click "Generate" for a personalized 7-day eco plan</div>
              </div>
            )}
          </div>

          {/* Carbon forecast */}
          <div className="glass-card p-4">
            <div className="font-semibold text-sm mb-3">🔮 Carbon Forecast</div>
            {[['30 days', '0.28T', 'On track'], ['90 days', '0.84T', 'Near target'], ['1 year', '3.2T', 'At goal']].map(([p, v, s]) => (
              <div key={p} className="flex items-center justify-between py-2 border-b border-white/[0.05] last:border-0">
                <div className="text-xs text-white/40">{p}</div>
                <div className="text-sm font-bold text-green">{v}</div>
                <div className="text-[11px] text-white/50">{s}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
