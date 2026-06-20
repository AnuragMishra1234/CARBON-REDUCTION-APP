import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import axios from 'axios'

const Toggle = ({ checked, onChange, label, desc }) => (
  <div className="flex items-center justify-between py-3 border-b border-white/[0.05] last:border-0">
    <div>
      <div className="text-sm font-medium">{label}</div>
      {desc && <div className="text-[11px] text-white/40 mt-0.5">{desc}</div>}
    </div>
    <button onClick={() => onChange(!checked)}
      className={`w-12 h-6 rounded-full transition-all duration-300 relative flex-shrink-0 ${checked ? 'bg-green' : 'bg-white/10'}`}>
      <div className={`w-5 h-5 rounded-full bg-white shadow absolute top-0.5 transition-all duration-300 ${checked ? 'left-6' : 'left-0.5'}`} />
    </button>
  </div>
)

export default function Settings() {
  const { user, updateUser } = useAuth()
  const [form, setForm] = useState({
    name: user?.name || '', location: user?.location || '',
    goalTarget: user?.goalTarget || 2.5, avatar: user?.avatar || '🌱'
  })
  const [toggles, setToggles] = useState({
    emailNotifs: true, weeklyReport: true, achievementAlerts: true, communityUpdates: false
  })
  const [saving, setSaving] = useState(false)

  const toggleVal = (key) => setToggles(t => ({ ...t, [key]: !t[key] }))

  const save = async () => {
    setSaving(true)
    try {
      const { data } = await axios.put('/api/auth/profile', form)
      updateUser(data.user)
      toast.success('Profile updated! ✓')
    } catch { toast.error('Failed to save settings') }
    finally { setSaving(false) }
  }

  const avatarOpts = ['🌱', '🌿', '🍃', '🌾', '🌳', '🌲', '🌍', '♻️', '⚡', '🌻', '🐦', '🦋']

  return (
    <div>
      <div className="label-tag">◈ Settings</div>
      <h1 className="font-grotesk text-2xl font-bold mb-7">App <span className="glow-text">Settings</span></h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 max-w-3xl">
        {/* Profile settings */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-5">
          <div className="font-grotesk font-semibold mb-4">👤 Profile</div>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-white/50 mb-1.5 block">Display Name</label>
              <input className="form-input" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} />
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1.5 block">Location</label>
              <input className="form-input" placeholder="City, Country" value={form.location} onChange={e => setForm(f => ({...f, location: e.target.value}))} />
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1.5 block">Annual CO₂ Goal (Tons)</label>
              <input type="number" step="0.1" min="0.5" max="10" className="form-input"
                value={form.goalTarget} onChange={e => setForm(f => ({...f, goalTarget: parseFloat(e.target.value)}))} />
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1.5 block">Avatar</label>
              <div className="grid grid-cols-6 gap-2">
                {avatarOpts.map(a => (
                  <button key={a} onClick={() => setForm(f => ({...f, avatar: a}))}
                    className={`p-2 rounded-lg text-xl text-center transition-all ${form.avatar === a ? 'bg-green/20 border border-green/40' : 'bg-white/[0.03] border border-white/[0.07] hover:border-green/20'}`}>
                    {a}
                  </button>
                ))}
              </div>
            </div>
            <button className="btn-primary w-full justify-center" onClick={save} disabled={saving}>
              {saving ? '⏳ Saving...' : '✓ Save Changes'}
            </button>
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5">
          <div className="font-grotesk font-semibold mb-4">🔔 Notifications</div>
          <Toggle checked={toggles.emailNotifs}      onChange={() => toggleVal('emailNotifs')}      label="Email Notifications" desc="Daily activity reminders" />
          <Toggle checked={toggles.weeklyReport}     onChange={() => toggleVal('weeklyReport')}     label="Weekly Report" desc="Your weekly sustainability summary" />
          <Toggle checked={toggles.achievementAlerts}onChange={() => toggleVal('achievementAlerts')}label="Achievement Alerts" desc="Badge and milestone notifications" />
          <Toggle checked={toggles.communityUpdates} onChange={() => toggleVal('communityUpdates')} label="Community Updates" desc="Group and challenge news" />
        </motion.div>

        {/* Privacy */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-5">
          <div className="font-grotesk font-semibold mb-4">🔒 Privacy</div>
          <Toggle checked={true}  onChange={() => {}} label="Public Profile"      desc="Allow others to see your profile" />
          <Toggle checked={false} onChange={() => {}} label="Anonymous in Feed"   desc="Hide your name from community feed" />
          <Toggle checked={true}  onChange={() => {}} label="Leaderboard Visible" desc="Show your rank publicly" />
        </motion.div>

        {/* Data */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card p-5">
          <div className="font-grotesk font-semibold mb-4">📁 Data & Account</div>
          <div className="space-y-2">
            <button className="w-full text-left p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-white/70 hover:border-green/20 hover:text-white transition-all">
              📤 Export My Data (JSON)
            </button>
            <button className="w-full text-left p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-white/70 hover:border-green/20 hover:text-white transition-all">
              🗓️ Export Activity History (CSV)
            </button>
            <button className="w-full text-left p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400 hover:border-red-400/40 transition-all">
              🗑️ Delete My Account
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
