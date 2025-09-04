import React, { createContext, useContext, useState, useEffect } from 'react'
import { useAuth } from '../hooks/useAuth.jsx'
import { recordings, summaries, emergencyContacts } from '../services/supabase.js'

const UserContext = createContext()

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

export const UserProvider = ({ children }) => {
  const { user, isPremium, isAuthenticated, userId } = useAuth()
  const [userRecordings, setUserRecordings] = useState([])
  const [userSummaries, setUserSummaries] = useState([])
  const [userEmergencyContacts, setUserEmergencyContacts] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // Load user data when authenticated
  useEffect(() => {
    if (isAuthenticated && userId) {
      loadUserData()
    } else {
      // Clear data when not authenticated
      setUserRecordings([])
      setUserSummaries([])
      setUserEmergencyContacts([])
    }
  }, [isAuthenticated, userId])

  const loadUserData = async () => {
    if (!userId) return

    try {
      setLoading(true)
      setError(null)

      // Load all user data in parallel
      const [recordingsResult, summariesResult, contactsResult] = await Promise.all([
        recordings.getRecordings(userId),
        summaries.getSummaries(userId),
        emergencyContacts.getContacts(userId)
      ])

      if (recordingsResult.error) throw recordingsResult.error
      if (summariesResult.error) throw summariesResult.error
      if (contactsResult.error) throw contactsResult.error

      setUserRecordings(recordingsResult.data || [])
      setUserSummaries(summariesResult.data || [])
      setUserEmergencyContacts(contactsResult.data || [])
    } catch (err) {
      console.error('Error loading user data:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const addRecording = async (recording) => {
    if (!userId) throw new Error('User not authenticated')

    try {
      setError(null)
      const { data, error } = await recordings.addRecording(userId, recording)
      if (error) throw error

      setUserRecordings(prev => [data, ...prev])
      return data
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const deleteRecording = async (recordingId) => {
    try {
      setError(null)
      const { error } = await recordings.deleteRecording(recordingId)
      if (error) throw error

      setUserRecordings(prev => prev.filter(r => r.id !== recordingId))
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const addSummary = async (summary) => {
    if (!userId) throw new Error('User not authenticated')

    try {
      setError(null)
      const { data, error } = await summaries.addSummary(userId, summary)
      if (error) throw error

      setUserSummaries(prev => [data, ...prev])
      return data
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const deleteSummary = async (summaryId) => {
    try {
      setError(null)
      const { error } = await summaries.deleteSummary(summaryId)
      if (error) throw error

      setUserSummaries(prev => prev.filter(s => s.id !== summaryId))
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const addEmergencyContact = async (contact) => {
    if (!userId) throw new Error('User not authenticated')

    try {
      setError(null)
      const { data, error } = await emergencyContacts.addContact(userId, contact)
      if (error) throw error

      setUserEmergencyContacts(prev => [...prev, data])
      return data
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const updateEmergencyContact = async (contactId, updates) => {
    try {
      setError(null)
      const { data, error } = await emergencyContacts.updateContact(contactId, updates)
      if (error) throw error

      setUserEmergencyContacts(prev => 
        prev.map(contact => contact.id === contactId ? data : contact)
      )
      return data
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const deleteEmergencyContact = async (contactId) => {
    try {
      setError(null)
      const { error } = await emergencyContacts.deleteContact(contactId)
      if (error) throw error

      setUserEmergencyContacts(prev => prev.filter(c => c.id !== contactId))
    } catch (err) {
      setError(err.message)
      throw err
    }
  }

  const value = {
    // User data
    user,
    isPremium,
    isAuthenticated,
    userId,
    
    // User content
    recordings: userRecordings,
    summaries: userSummaries,
    emergencyContacts: userEmergencyContacts,
    
    // Loading states
    loading,
    error,
    
    // Actions
    addRecording,
    deleteRecording,
    addSummary,
    deleteSummary,
    addEmergencyContact,
    updateEmergencyContact,
    deleteEmergencyContact,
    
    // Utilities
    refreshData: loadUserData,
    
    // Legacy compatibility (for existing components)
    setUser: () => {}, // No-op for backward compatibility
    setIsPremium: () => {}, // No-op for backward compatibility
    setEmergencyContacts: () => {} // No-op for backward compatibility
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}
