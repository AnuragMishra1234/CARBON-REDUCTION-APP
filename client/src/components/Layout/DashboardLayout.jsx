import { Outlet } from 'react-router-dom'
import { useState, useEffect } from 'react'
import Sidebar from './Sidebar'
import Topbar  from './Topbar'
import ThreeBackground from '../Three/ThreeBackground'
import { useTilt } from '../../hooks/useTilt'

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  useTilt('.glass-card')

  // Ambient particles
  useEffect(() => {
    const field = document.getElementById('db-particle-field')
    if (!field || field.childElementCount > 0) return
    const cols = ['rgba(0,255,136,', 'rgba(0,212,255,', 'rgba(124,58,237,', 'rgba(245,158,11,']
    for (let i = 0; i < 30; i++) {
      const p = document.createElement('div')
      const s = Math.random() * 2 + 0.5
      const c = cols[Math.floor(Math.random() * cols.length)]
      const op = Math.random() * 0.3 + 0.05
      p.className = 'particle'
      const dx = (Math.random() - 0.5) * 200
      const dy = (Math.random() - 0.5) * 200
      p.style.cssText = `width:${s}px;height:${s}px;left:${Math.random()*100}%;top:${Math.random()*100}%;background:${c}${op});--dx:${dx}px;--dy:${dy}px;animation-duration:${Math.random()*14+8}s;animation-delay:${Math.random()*-14}s`
      field.appendChild(p)
    }
  }, [])

  return (
    <div className="flex min-h-screen bg-dark relative">
      {/* Three.js 3D Background */}
      <ThreeBackground />

      {/* Ambient particles overlay */}
      <div id="db-particle-field" className="fixed inset-0 overflow-hidden pointer-events-none z-[1]" />

      {/* God rays */}
      {[5,25,50,75,90].map((l, i) => (
        <div key={i} className="god-ray" style={{ left:`${l}%`, '--gr': `${(i-2)*8}deg`, animationDelay:`${i*2}s` }} />
      ))}

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-[150] lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-[240px]">
        <Topbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 pt-16 relative z-10">
          <div className="p-5 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
