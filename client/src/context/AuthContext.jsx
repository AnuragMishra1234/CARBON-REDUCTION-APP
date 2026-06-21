import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '../lib/api'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [user, setUser]               = useState(null)
  const [token, setToken]             = useState(() => localStorage.getItem('carbon_token'))
  const [loading, setLoading]         = useState(true)
  const [isAuthenticated, setIsAuth]  = useState(false)

  // Token is handled automatically by api.js interceptor
  // This function is kept for backward compatibility
  const setAxiosToken = (t) => {
    // The interceptor in lib/api.js reads from localStorage directly
  }

  // Validate token on mount
  useEffect(() => {
    const initAuth = async () => {
      const saved = localStorage.getItem('carbon_token')
      if (!saved) { setLoading(false); return }
      setAxiosToken(saved)
      try {
        const { data } = await api.get('/api/auth/profile')
        setUser(data.user)
        setToken(saved)
        setIsAuth(true)
      } catch {
        localStorage.removeItem('carbon_token')
        setAxiosToken(null)
      } finally {
        setLoading(false)
      }
    }
    initAuth()
  }, [])

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/api/auth/login', { email, password })
    localStorage.setItem('carbon_token', data.token)
    setAxiosToken(data.token)
    setToken(data.token)
    setUser(data.user)
    setIsAuth(true)
    toast.success(data.message || 'Welcome back! 🌱')
    return data
  }, [])

  const register = useCallback(async (formData) => {
    const { data } = await api.post('/api/auth/register', formData)
    localStorage.setItem('carbon_token', data.token)
    setAxiosToken(data.token)
    setToken(data.token)
    setUser(data.user)
    setIsAuth(true)
    toast.success(data.message || 'Welcome to Carbon AI! 🌿')
    return data
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('carbon_token')
    setAxiosToken(null)
    setToken(null)
    setUser(null)
    setIsAuth(false)
    toast.success('Logged out. See you soon! 🌍')
  }, [])

  const updateUser = useCallback((updates) => {
    setUser(prev => prev ? { ...prev, ...updates } : updates)
  }, [])

  const refreshUser = useCallback(async () => {
    try {
      const { data } = await api.get('/api/auth/profile')
      setUser(data.user)
    } catch {}
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, loading, isAuthenticated, login, register, logout, updateUser, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
