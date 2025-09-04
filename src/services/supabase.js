/**
 * Supabase Service
 * Handles all database operations and authentication for JusticeGuard
 */

import { createClient } from '@supabase/supabase-js'
import config from '../config/env.js'

// Initialize Supabase client
const supabase = createClient(config.supabase.url, config.supabase.anonKey)

// Database Tables Schema
/*
  Users Table:
  - id (uuid, primary key)
  - email (text, unique)
  - premium_status (boolean, default false)
  - premium_expires_at (timestamp)
  - preferences (jsonb)
  - created_at (timestamp)
  - updated_at (timestamp)

  Emergency_Contacts Table:
  - id (uuid, primary key)
  - user_id (uuid, foreign key)
  - name (text)
  - phone (text)
  - email (text)
  - relationship (text)
  - created_at (timestamp)

  Recordings Table:
  - id (uuid, primary key)
  - user_id (uuid, foreign key)
  - file_path (text)
  - duration (integer, seconds)
  - location (jsonb)
  - created_at (timestamp)

  Interaction_Summaries Table:
  - id (uuid, primary key)
  - user_id (uuid, foreign key)
  - recording_id (uuid, foreign key, nullable)
  - location (text)
  - participants (text[])
  - summary_text (text)
  - key_events (text[])
  - shareable_link (text)
  - created_at (timestamp)
*/

// Authentication Functions
export const auth = {
  // Sign up with email and password
  signUp: async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    return { data, error }
  },

  // Sign in with email and password
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  // Get current user
  getCurrentUser: () => {
    return supabase.auth.getUser()
  },

  // Listen to auth changes
  onAuthStateChange: (callback) => {
    return supabase.auth.onAuthStateChange(callback)
  },

  // Reset password
  resetPassword: async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email)
    return { data, error }
  }
}

// User Functions
export const users = {
  // Get user profile
  getProfile: async (userId) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()
    return { data, error }
  },

  // Update user profile
  updateProfile: async (userId, updates) => {
    const { data, error } = await supabase
      .from('users')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single()
    return { data, error }
  },

  // Update premium status
  updatePremiumStatus: async (userId, isPremium, expiresAt = null) => {
    const { data, error } = await supabase
      .from('users')
      .update({
        premium_status: isPremium,
        premium_expires_at: expiresAt,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()
    return { data, error }
  }
}

// Emergency Contacts Functions
export const emergencyContacts = {
  // Get all contacts for a user
  getContacts: async (userId) => {
    const { data, error } = await supabase
      .from('emergency_contacts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
    return { data, error }
  },

  // Add new contact
  addContact: async (userId, contact) => {
    const { data, error } = await supabase
      .from('emergency_contacts')
      .insert({
        user_id: userId,
        ...contact,
        created_at: new Date().toISOString()
      })
      .select()
      .single()
    return { data, error }
  },

  // Update contact
  updateContact: async (contactId, updates) => {
    const { data, error } = await supabase
      .from('emergency_contacts')
      .update(updates)
      .eq('id', contactId)
      .select()
      .single()
    return { data, error }
  },

  // Delete contact
  deleteContact: async (contactId) => {
    const { error } = await supabase
      .from('emergency_contacts')
      .delete()
      .eq('id', contactId)
    return { error }
  }
}

// Recordings Functions
export const recordings = {
  // Get all recordings for a user
  getRecordings: async (userId) => {
    const { data, error } = await supabase
      .from('recordings')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  // Add new recording
  addRecording: async (userId, recording) => {
    const { data, error } = await supabase
      .from('recordings')
      .insert({
        user_id: userId,
        ...recording,
        created_at: new Date().toISOString()
      })
      .select()
      .single()
    return { data, error }
  },

  // Delete recording
  deleteRecording: async (recordingId) => {
    const { error } = await supabase
      .from('recordings')
      .delete()
      .eq('id', recordingId)
    return { error }
  }
}

// Interaction Summaries Functions
export const summaries = {
  // Get all summaries for a user
  getSummaries: async (userId) => {
    const { data, error } = await supabase
      .from('interaction_summaries')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    return { data, error }
  },

  // Add new summary
  addSummary: async (userId, summary) => {
    const { data, error } = await supabase
      .from('interaction_summaries')
      .insert({
        user_id: userId,
        ...summary,
        created_at: new Date().toISOString()
      })
      .select()
      .single()
    return { data, error }
  },

  // Get summary by shareable link
  getSummaryByLink: async (shareableLink) => {
    const { data, error } = await supabase
      .from('interaction_summaries')
      .select('*')
      .eq('shareable_link', shareableLink)
      .single()
    return { data, error }
  },

  // Delete summary
  deleteSummary: async (summaryId) => {
    const { error } = await supabase
      .from('interaction_summaries')
      .delete()
      .eq('id', summaryId)
    return { error }
  }
}

// Storage Functions
export const storage = {
  // Upload recording file
  uploadRecording: async (file, fileName) => {
    const { data, error } = await supabase.storage
      .from('recordings')
      .upload(fileName, file)
    return { data, error }
  },

  // Get recording URL
  getRecordingUrl: (fileName) => {
    const { data } = supabase.storage
      .from('recordings')
      .getPublicUrl(fileName)
    return data.publicUrl
  },

  // Delete recording file
  deleteRecording: async (fileName) => {
    const { error } = await supabase.storage
      .from('recordings')
      .remove([fileName])
    return { error }
  }
}

// Real-time subscriptions
export const subscriptions = {
  // Subscribe to user's recordings
  subscribeToRecordings: (userId, callback) => {
    return supabase
      .channel('recordings')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'recordings',
        filter: `user_id=eq.${userId}`
      }, callback)
      .subscribe()
  },

  // Subscribe to user's summaries
  subscribeToSummaries: (userId, callback) => {
    return supabase
      .channel('summaries')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'interaction_summaries',
        filter: `user_id=eq.${userId}`
      }, callback)
      .subscribe()
  }
}

export default supabase
