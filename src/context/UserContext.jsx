import React, { createContext, useContext, useState, useEffect } from 'react'

const UserContext = createContext()

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isPremium, setIsPremium] = useState(false)
  const [recordings, setRecordings] = useState([])
  const [summaries, setSummaries] = useState([])
  const [emergencyContacts, setEmergencyContacts] = useState([])

  // Load user data from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('justiceGuard_user')
    const savedPremium = localStorage.getItem('justiceGuard_premium')
    const savedRecordings = localStorage.getItem('justiceGuard_recordings')
    const savedSummaries = localStorage.getItem('justiceGuard_summaries')
    const savedContacts = localStorage.getItem('justiceGuard_contacts')

    if (savedUser) setUser(JSON.parse(savedUser))
    if (savedPremium) setIsPremium(JSON.parse(savedPremium))
    if (savedRecordings) setRecordings(JSON.parse(savedRecordings))
    if (savedSummaries) setSummaries(JSON.parse(savedSummaries))
    if (savedContacts) setEmergencyContacts(JSON.parse(savedContacts))
  }, [])

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (user) localStorage.setItem('justiceGuard_user', JSON.stringify(user))
  }, [user])

  useEffect(() => {
    localStorage.setItem('justiceGuard_premium', JSON.stringify(isPremium))
  }, [isPremium])

  useEffect(() => {
    localStorage.setItem('justiceGuard_recordings', JSON.stringify(recordings))
  }, [recordings])

  useEffect(() => {
    localStorage.setItem('justiceGuard_summaries', JSON.stringify(summaries))
  }, [summaries])

  useEffect(() => {
    localStorage.setItem('justiceGuard_contacts', JSON.stringify(emergencyContacts))
  }, [emergencyContacts])

  const addRecording = (recording) => {
    const newRecording = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...recording
    }
    setRecordings(prev => [newRecording, ...prev])
    return newRecording
  }

  const addSummary = (summary) => {
    const newSummary = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...summary
    }
    setSummaries(prev => [newSummary, ...prev])
    return newSummary
  }

  const addEmergencyContact = (contact) => {
    const newContact = {
      id: Date.now().toString(),
      ...contact
    }
    setEmergencyContacts(prev => [...prev, newContact])
    return newContact
  }

  const value = {
    user,
    setUser,
    isPremium,
    setIsPremium,
    recordings,
    summaries,
    emergencyContacts,
    addRecording,
    addSummary,
    addEmergencyContact,
    setEmergencyContacts
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}