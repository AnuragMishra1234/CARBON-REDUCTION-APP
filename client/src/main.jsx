import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import { DashboardProvider } from './context/DashboardContext'
import './index.css'

// Custom cursor
const initCursor = () => {
  const dot  = document.createElement('div'); dot.id  = 'cursor-dot';
  const ring = document.createElement('div'); ring.id = 'cursor-ring';
  document.body.appendChild(dot); document.body.appendChild(ring);
  document.addEventListener('mousemove', e => {
    dot.style.left  = e.clientX + 'px'; dot.style.top  = e.clientY + 'px';
    ring.style.left = e.clientX + 'px'; ring.style.top = e.clientY + 'px';
  });
  document.addEventListener('mousedown', () => { dot.style.transform = 'translate(-50%,-50%) scale(1.5)'; });
  document.addEventListener('mouseup',   () => { dot.style.transform = 'translate(-50%,-50%) scale(1)'; });
};
initCursor();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <DashboardProvider>
          <App />
          <Toaster
            position="bottom-right"
            toastOptions={{
              style: {
                background: 'rgba(2,8,16,0.95)',
                border: '1px solid rgba(0,255,136,0.3)',
                color: '#00ff88',
                borderRadius: '12px',
                backdropFilter: 'blur(20px)',
                fontSize: '14px',
                fontFamily: 'Inter, sans-serif'
              },
              duration: 3500
            }}
          />
        </DashboardProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
