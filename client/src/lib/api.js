import axios from 'axios'

// ─────────────────────────────────────────────────────────────
//  Axios Instance
//  In development, Vite's proxy forwards /api → localhost:5000
//  In production (Vercel), VITE_API_URL points to Render backend
// ─────────────────────────────────────────────────────────────

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  withCredentials: false,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Attach JWT token to every request automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('carbon_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Global response error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const currentPath = window.location.pathname
      if (currentPath !== '/login' && currentPath !== '/register' && currentPath !== '/') {
        localStorage.removeItem('carbon_token')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
