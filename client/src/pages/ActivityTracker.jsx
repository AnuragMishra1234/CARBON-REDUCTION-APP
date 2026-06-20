import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDashboard } from '../context/DashboardContext'
import toast from 'react-hot-toast'

const CATEGORIES = [
  { key: 'transport', icon: '🚗', label: 'Transport', types: [
    { k: 'car', l: 'Car', unit: 'km' }, { k: 'bus', l: 'Bus', unit: 'km' },
    { k: 'metro', l: 'Metro/Subway', unit: 'km' }, { k: 'train', l: 'Train', unit: 'km' },
    { k: 'bike', l: 'Bicycle', unit: 'km' }, { k: 'walk', l: 'Walking', unit: 'km' },
    { k: 'motorbike', l: 'Motorbike', unit: 'km' }
  ]},
  { key: 'food', icon: '🥗', label: 'Food', types: [
    { k: 'beef', l: 'Beef', unit: 'kg' }, { k: 'chicken', l: 'Chicken', unit: 'kg' },
    { k: 'pork', l: 'Pork', unit: 'kg' }, { k: 'fish', l: 'Fish', unit: 'kg' },
    { k: 'dairy', l: 'Dairy', unit: 'kg' }, { k: 'vegetarian', l: 'Vegetarian Meal', unit: 'meal' },
    { k: 'vegan', l: 'Vegan Meal', unit: 'meal' }
  ]},
  { key: 'energy', icon: '⚡', label: 'Energy', types: [
    { k: 'electricity', l: 'Grid Electricity', unit: 'kWh' },
    { k: 'electricity_solar', l: 'Solar Energy', unit: 'kWh' },
    { k: 'natural_gas', l: 'Natural Gas', unit: 'm³' },
    { k: 'lpg', l: 'LPG / Cooking Gas', unit: 'kg' }
  ]},
  { key: 'flight', icon: '✈️', label: 'Flight', types: [
    { k: 'domestic', l: 'Domestic Flight', unit: 'km' },
    { k: 'short_haul', l: 'Short-haul', unit: 'km' },
    { k: 'long_haul', l: 'Long-haul', unit: 'km' }
  ]},
  { key: 'shopping', icon: '🛍️', label: 'Shopping', types: [
    { k: 'clothing', l: 'Clothing Item', unit: 'item' },
    { k: 'electronics', l: 'Electronics', unit: 'item' },
    { k: 'smartphone', l: 'Smartphone', unit: 'item' }
  ]},
]

const CATEGORY_ICONS = { transport:'🚗', food:'🥗', energy:'⚡', flight:'✈️', shopping:'🛍️', waste:'♻️' }

export default function ActivityTracker() {
  const { activities, dailyLog, logActivity } = useDashboard()
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ category: '', type: '', quantity: '', notes: '' })
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState(null)

  const selectedCat = CATEGORIES.find(c => c.key === form.category)

  const handleLog = async () => {
    if (!form.category || !form.type || !form.quantity) { toast.error('Please fill all fields'); return }
    setSubmitting(true)
    try {
      const res = await logActivity({ category: form.category, activityType: form.type, quantity: parseFloat(form.quantity), notes: form.notes })
      setResult(res)
      toast.success(`✅ Logged! ${res.emissionValue?.toFixed(2)} kg CO₂e`)
      setForm({ category: '', type: '', quantity: '', notes: '' })
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Failed to log activity')
    } finally { setSubmitting(false) }
  }

  const totalToday = dailyLog?.totalToday ?? 0
  const recentActivities = activities?.slice(0, 15) || []

  return (
    <div>
      <div className="label-tag">◈ Activity Tracker</div>
      <h1 className="font-grotesk text-2xl font-bold mb-1">Track Your <span className="glow-text">Daily Activities</span></h1>
      <p className="text-white/50 text-sm mb-7">Log every action to get real-time carbon footprint updates.</p>

      {/* Category quick-select */}
      <div className="flex gap-3 mb-6 overflow-x-auto pb-2 scrollbar-none">
        {CATEGORIES.map(cat => (
          <button key={cat.key}
            onClick={() => { setForm(f => ({ ...f, category: cat.key, type: '' })); setShowModal(true) }}
            className="flex-shrink-0 flex flex-col items-center gap-2 p-4 rounded-2xl glass-card border-white/[0.07] hover:border-green/30 hover:text-green cursor-pointer transition-all min-w-[80px]">
            <span className="text-2xl">{cat.icon}</span>
            <span className="text-[11px] text-white/60">{cat.label}</span>
          </button>
        ))}
        <button onClick={() => setShowModal(true)}
          className="flex-shrink-0 flex flex-col items-center gap-2 p-4 rounded-2xl glass-card border-dashed border-green/20 hover:border-green/40 cursor-pointer transition-all min-w-[80px] text-green">
          <span className="text-2xl">+</span>
          <span className="text-[11px]">Log Activity</span>
        </button>
      </div>

      {/* Today summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {['transport', 'food', 'energy', 'total'].map((key, i) => {
          const catData = dailyLog?.dailyBreakdown?.find(b => b._id === key)
          const val = key === 'total' ? totalToday : (catData?.total ?? 0)
          return (
            <motion.div key={key} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              className="glass-card p-4 border-white/[0.07]">
              <div className="text-lg mb-1">{key === 'total' ? '🌍' : CATEGORY_ICONS[key]}</div>
              <div className="font-grotesk font-bold text-xl text-green">{val.toFixed(1)}<span className="text-xs font-normal text-white/40 ml-1">kg</span></div>
              <div className="text-[11px] text-white/40 capitalize">{key === 'total' ? 'Total Today' : key}</div>
            </motion.div>
          )
        })}
      </div>

      {/* Activity timeline */}
      <div className="glass-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="font-grotesk font-semibold">Recent Activities</div>
          <div className="text-[11px] text-white/30">{recentActivities.length} logged</div>
        </div>
        <AnimatePresence>
          {recentActivities.length === 0 ? (
            <div className="text-center py-10">
              <div className="text-4xl mb-3">📊</div>
              <div className="text-white/40 text-sm">No activities logged yet. Click a category above to start!</div>
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentActivities.map((a, i) => (
                <motion.div key={a._id || i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:border-green/15 transition-colors">
                  <div className="w-9 h-9 rounded-xl bg-white/[0.05] flex items-center justify-center text-lg flex-shrink-0">
                    {CATEGORY_ICONS[a.category] || '🌿'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold capitalize">{a.activityType?.replace('_', ' ')}</div>
                    <div className="text-[11px] text-white/40 capitalize">{a.category} · {a.quantity} {a.unit}</div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-sm font-bold text-green">{a.emissionValue?.toFixed(2)} <span className="text-[10px] font-normal text-white/40">kg</span></div>
                    <div className="text-[10px] text-white/30">{a.date ? new Date(a.date).toLocaleDateString() : 'Today'}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Log Activity Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => { setShowModal(false); setResult(null) }} />
            <motion.div className="relative glass-card p-6 w-full max-w-md z-10"
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95 }}>

              {result ? (
                <div className="text-center">
                  <div className="text-4xl mb-3">✅</div>
                  <div className="font-grotesk font-bold text-lg text-green mb-1">Activity Logged!</div>
                  <div className="font-grotesk font-black text-4xl glow-text mb-1">{result.emissionValue?.toFixed(2)}<span className="text-xl font-normal text-white/50 ml-2">kg CO₂e</span></div>
                  {result.newAchievements?.length > 0 && (
                    <div className="bg-amber/10 border border-amber/25 rounded-xl p-3 mb-4 mt-3">
                      <div className="text-amber font-bold text-sm">🏆 Achievement Unlocked!</div>
                      {result.newAchievements.map(a => <div key={a.badgeName} className="text-xs text-white/70 mt-0.5">{a.icon} {a.badgeName}</div>)}
                    </div>
                  )}
                  <div className="flex gap-3 mt-4">
                    <button className="btn-ghost flex-1" onClick={() => { setResult(null); setForm({ category: '', type: '', quantity: '', notes: '' }) }}>Log More</button>
                    <button className="btn-primary flex-1" onClick={() => { setShowModal(false); setResult(null) }}>Done ✓</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-between mb-5">
                    <div className="font-grotesk font-semibold text-base">Log New Activity</div>
                    <button className="text-white/40 hover:text-white text-xl" onClick={() => setShowModal(false)}>✕</button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs text-white/50 mb-1.5 block">Category</label>
                      <select className="form-select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value, type: '' }))}>
                        <option value="">Select category...</option>
                        {CATEGORIES.map(c => <option key={c.key} value={c.key}>{c.icon} {c.label}</option>)}
                      </select>
                    </div>
                    {selectedCat && (
                      <div>
                        <label className="text-xs text-white/50 mb-1.5 block">Activity Type</label>
                        <select className="form-select" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                          <option value="">Select type...</option>
                          {selectedCat.types.map(t => <option key={t.k} value={t.k}>{t.l}</option>)}
                        </select>
                      </div>
                    )}
                    {form.type && (
                      <div>
                        <label className="text-xs text-white/50 mb-1.5 block">
                          Quantity ({selectedCat?.types.find(t => t.k === form.type)?.unit || 'units'})
                        </label>
                        <input type="number" className="form-input" placeholder="e.g. 20" min="0.1" step="0.1"
                          value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: e.target.value }))} />
                      </div>
                    )}
                    <div>
                      <label className="text-xs text-white/50 mb-1.5 block">Notes (optional)</label>
                      <input type="text" className="form-input" placeholder="Any additional context..."
                        value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
                    </div>
                    <button className="btn-primary w-full justify-center py-3" onClick={handleLog} disabled={submitting}>
                      {submitting ? '⏳ Calculating...' : '🌱 Log Activity'}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
