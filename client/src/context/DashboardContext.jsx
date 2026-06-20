import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import axios from 'axios'
import { useAuth } from './AuthContext'

const DashboardContext = createContext(null)

const DEFAULT_STATE = {
  footprint: null, breakdown: [], weekly: [], monthly: [],
  activities: [], dailyLog: null,
  challenges: [], myChallenges: [], challengesLoaded: false,
  recommendations: [],
  leaderboard: [], myRank: 999,
  communityStats: { memberCount: 0, activityCount: 0, totalCO2SavedTons: 0 },
  feed: [],
  goals: [],
  dailyTip: null,
  loading: false
}

export const DashboardProvider = ({ children }) => {
  const { isAuthenticated } = useAuth()
  const [state, setState] = useState(DEFAULT_STATE)

  const update = (partial) => setState(prev => ({ ...prev, ...partial }))

  const fetchFootprint = useCallback(async () => {
    try {
      const [fp, bd, wk] = await Promise.all([
        axios.get('/api/footprint/calculate'),
        axios.get('/api/footprint/breakdown'),
        axios.get('/api/footprint/weekly')
      ])
      update({ footprint: fp.data, breakdown: bd.data.breakdown, weekly: wk.data.weekly })
    } catch {}
  }, [])

  const fetchActivities = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/activity/history?limit=30')
      const daily    = await axios.get('/api/activity/daily')
      update({ activities: data.activities, dailyLog: daily.data })
    } catch {}
  }, [])

  const fetchChallenges = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/challenges')
      update({ challenges: data.challenges, challengesLoaded: true })
    } catch {
      update({ challengesLoaded: true }) // still mark loaded so we know API was tried
    }
  }, [])

  const fetchLeaderboard = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/community/leaderboard')
      update({ leaderboard: data.leaderboard, myRank: data.myRank })
    } catch {}
  }, [])

  const fetchCommunity = useCallback(async () => {
    try {
      const [stats, feed] = await Promise.all([
        axios.get('/api/community/stats'),
        axios.get('/api/community/feed')
      ])
      update({ communityStats: stats.data, feed: feed.data.feed })
    } catch {}
  }, [])

  const fetchGoals = useCallback(async () => {
    try {
      const { data } = await axios.get('/api/goals')
      update({ goals: data.goals })
    } catch {}
  }, [])

  const logActivity = useCallback(async (activityData) => {
    const { data } = await axios.post('/api/activity/log', activityData)
    // Refresh footprint and activities after logging
    await Promise.all([fetchFootprint(), fetchActivities()])
    return data
  }, [fetchFootprint, fetchActivities])

  const refreshAll = useCallback(async () => {
    if (!isAuthenticated) return
    update({ loading: true })
    await Promise.all([fetchFootprint(), fetchActivities(), fetchChallenges(), fetchGoals()])
    update({ loading: false })
  }, [isAuthenticated, fetchFootprint, fetchActivities, fetchChallenges, fetchGoals])

  useEffect(() => {
    if (isAuthenticated) refreshAll()
  }, [isAuthenticated])

  return (
    <DashboardContext.Provider value={{
      ...state,
      fetchFootprint, fetchActivities, fetchChallenges,
      fetchLeaderboard, fetchCommunity, fetchGoals,
      logActivity, refreshAll, update
    }}>
      {children}
    </DashboardContext.Provider>
  )
}

export const useDashboard = () => {
  const ctx = useContext(DashboardContext)
  if (!ctx) throw new Error('useDashboard must be used within DashboardProvider')
  return ctx
}
