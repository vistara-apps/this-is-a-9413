/**
 * Authentication Hook
 * Manages user authentication state and operations
 */

import { useState, useEffect, createContext, useContext } from 'react'
import { auth, users } from '../services/supabase.js'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Initialize auth state
  useEffect(() => {
    // Get initial session
    const initializeAuth = async () => {
      try {
        const { data: { user }, error } = await auth.getCurrentUser()
        if (error) throw error
        
        if (user) {
          setUser(user)
          await loadUserProfile(user.id)
        }
      } catch (err) {
        console.error('Auth initialization error:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth changes
    const { data: { subscription } } = auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user)
        await loadUserProfile(session.user.id)
      } else {
        setUser(null)
        setProfile(null)
      }
      setLoading(false)
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  // Load user profile from database
  const loadUserProfile = async (userId) => {
    try {
      const { data, error } = await users.getProfile(userId)
      if (error && error.code !== 'PGRST116') { // Ignore "not found" errors
        throw error
      }
      
      // If no profile exists, create one
      if (!data) {
        const { data: newProfile, error: createError } = await users.updateProfile(userId, {
          premium_status: false,
          preferences: {}
        })
        if (createError) throw createError
        setProfile(newProfile)
      } else {
        setProfile(data)
      }
    } catch (err) {
      console.error('Profile loading error:', err)
      setError(err.message)
    }
  }

  // Sign up
  const signUp = async (email, password) => {
    try {
      setLoading(true)
      setError(null)
      const { data, error } = await auth.signUp(email, password)
      if (error) throw error
      return { data, error: null }
    } catch (err) {
      setError(err.message)
      return { data: null, error: err }
    } finally {
      setLoading(false)
    }
  }

  // Sign in
  const signIn = async (email, password) => {
    try {
      setLoading(true)
      setError(null)
      const { data, error } = await auth.signIn(email, password)
      if (error) throw error
      return { data, error: null }
    } catch (err) {
      setError(err.message)
      return { data: null, error: err }
    } finally {
      setLoading(false)
    }
  }

  // Sign out
  const signOut = async () => {
    try {
      setLoading(true)
      setError(null)
      const { error } = await auth.signOut()
      if (error) throw error
      setUser(null)
      setProfile(null)
      return { error: null }
    } catch (err) {
      setError(err.message)
      return { error: err }
    } finally {
      setLoading(false)
    }
  }

  // Reset password
  const resetPassword = async (email) => {
    try {
      setError(null)
      const { data, error } = await auth.resetPassword(email)
      if (error) throw error
      return { data, error: null }
    } catch (err) {
      setError(err.message)
      return { data: null, error: err }
    }
  }

  // Update profile
  const updateProfile = async (updates) => {
    try {
      if (!user) throw new Error('No user logged in')
      
      setError(null)
      const { data, error } = await users.updateProfile(user.id, updates)
      if (error) throw error
      
      setProfile(data)
      return { data, error: null }
    } catch (err) {
      setError(err.message)
      return { data: null, error: err }
    }
  }

  // Update premium status
  const updatePremiumStatus = async (isPremium, expiresAt = null) => {
    try {
      if (!user) throw new Error('No user logged in')
      
      setError(null)
      const { data, error } = await users.updatePremiumStatus(user.id, isPremium, expiresAt)
      if (error) throw error
      
      setProfile(data)
      return { data, error: null }
    } catch (err) {
      setError(err.message)
      return { data: null, error: err }
    }
  }

  // Check if user is premium
  const isPremium = () => {
    if (!profile) return false
    
    const { premium_status, premium_expires_at } = profile
    if (!premium_status) return false
    
    // If no expiration date, assume permanent premium
    if (!premium_expires_at) return true
    
    // Check if premium hasn't expired
    return new Date(premium_expires_at) > new Date()
  }

  // Get days until premium expires
  const getPremiumDaysRemaining = () => {
    if (!profile?.premium_expires_at) return null
    
    const expirationDate = new Date(profile.premium_expires_at)
    const now = new Date()
    const diffTime = expirationDate - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return diffDays > 0 ? diffDays : 0
  }

  const value = {
    // State
    user,
    profile,
    loading,
    error,
    
    // Auth methods
    signUp,
    signIn,
    signOut,
    resetPassword,
    
    // Profile methods
    updateProfile,
    updatePremiumStatus,
    
    // Premium helpers
    isPremium: isPremium(),
    getPremiumDaysRemaining,
    
    // Computed values
    isAuthenticated: !!user,
    userEmail: user?.email,
    userId: user?.id
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
