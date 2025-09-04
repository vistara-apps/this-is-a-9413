import React, { useState, useEffect } from 'react'
import { ArrowLeft, MapPin, Loader, AlertCircle, Crown } from 'lucide-react'
import ActionIcon from './ActionIcon'
import AlertBanner from './AlertBanner'
import { useUser } from '../context/UserContext'

const LocationInsights = ({ onBack, onShowPremium }) => {
  const { isPremium } = useUser()
  const [location, setLocation] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [insights, setInsights] = useState(null)

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by this browser')
      return
    }

    setLoading(true)
    setError(null)

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        setLocation({ latitude, longitude })
        
        if (isPremium) {
          await generateLocationInsights(latitude, longitude)
        }
        setLoading(false)
      },
      (error) => {
        setError(`Location error: ${error.message}`)
        setLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    )
  }

  const generateLocationInsights = async (lat, lng) => {
    try {
      // Simulate state detection from coordinates
      const state = await getStateFromCoordinates(lat, lng)
      
      // Generate AI insights (simulated for demo)
      const mockInsights = generateMockInsights(state)
      setInsights(mockInsights)
    } catch (error) {
      console.error('Error generating insights:', error)
      setError('Failed to generate location-specific insights')
    }
  }

  const getStateFromCoordinates = async (lat, lng) => {
    // This is a simplified state detection - in a real app, you'd use a proper geocoding service
    const states = {
      'California': { minLat: 32.5, maxLat: 42, minLng: -124.5, maxLng: -114 },
      'Texas': { minLat: 25.8, maxLat: 36.5, minLng: -106.6, maxLng: -93.5 },
      'New York': { minLat: 40.5, maxLat: 45, minLng: -79.8, maxLng: -71.8 },
      'Florida': { minLat: 24.5, maxLat: 31, minLng: -87.6, maxLng: -80 }
    }

    for (const [state, bounds] of Object.entries(states)) {
      if (lat >= bounds.minLat && lat <= bounds.maxLat && lng >= bounds.minLng && lng <= bounds.maxLng) {
        return state
      }
    }
    return 'Unknown State'
  }

  const generateMockInsights = (state) => {
    const insights = {
      'California': {
        stopAndFrisk: 'California requires reasonable suspicion for stops and probable cause for frisks.',
        recording: 'Recording police is explicitly protected under California law (Penal Code 148).',
        identification: 'You are only required to identify yourself if lawfully detained.',
        vehicleSearches: 'Police need a warrant, probable cause, or consent to search vehicles.',
        specialNotes: [
          'California has strong privacy protections',
          'Body cameras are required for many departments',
          'Marijuana possession is legal for adults 21+'
        ]
      },
      'Texas': {
        stopAndFrisk: 'Texas follows Terry stops - reasonable suspicion required for stops.',
        recording: 'Recording police is legal but has some restrictions in private areas.',
        identification: 'Texas has a "failure to identify" law when lawfully arrested.',
        vehicleSearches: 'Similar to federal law - warrant, probable cause, or consent needed.',
        specialNotes: [
          'Open carry is legal with proper license',
          'Castle Doctrine and Stand Your Ground laws apply',
          'Special protections for rural property owners'
        ]
      }
    }

    return insights[state] || {
      stopAndFrisk: 'Standard federal protections apply under the Fourth Amendment.',
      recording: 'Generally legal to record police in public spaces.',
      identification: 'Requirements vary by state - know your local laws.',
      vehicleSearches: 'Federal protections under the Fourth Amendment apply.',
      specialNotes: [
        'Consult local legal resources for state-specific laws',
        'Federal constitutional rights always apply',
        'Local ordinances may provide additional protections'
      ]
    }
  }

  useEffect(() => {
    getCurrentLocation()
  }, [])

  if (!isPremium) {
    return (
      <div className="max-w-4xl mx-auto px-5 py-6">
        <div className="flex items-center mb-6">
          <ActionIcon variant="secondary" onClick={onBack} className="mr-4">
            <ArrowLeft size={20} />
          </ActionIcon>
          <h1 className="text-2xl font-semibold text-gray-900">Location-Based Rights</h1>
        </div>

        <div className="text-center py-12">
          <Crown className="text-yellow-500 mx-auto mb-4" size={48} />
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Premium Feature</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Get AI-powered, location-specific legal insights tailored to your state and local laws.
          </p>
          <ActionIcon variant="primary" onClick={onShowPremium}>
            <Crown size={20} className="mr-2" />
            Upgrade to Premium
          </ActionIcon>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-5 py-6">
      {/* Header */}
      <div className="flex items-center mb-6">
        <ActionIcon variant="secondary" onClick={onBack} className="mr-4">
          <ArrowLeft size={20} />
        </ActionIcon>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-gray-900">Location-Based Rights</h1>
          <p className="text-gray-600">State-specific legal information for your area</p>
        </div>
      </div>

      {/* Location Status */}
      <div className="bg-surface rounded-lg-custom p-4 shadow-card mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <MapPin className="text-accent mr-2" size={20} />
            <span className="font-medium text-gray-900">Current Location</span>
          </div>
          <ActionIcon variant="secondary" onClick={getCurrentLocation} disabled={loading}>
            {loading ? <Loader className="animate-spin" size={16} /> : 'Refresh'}
          </ActionIcon>
        </div>
        
        {location && (
          <div className="mt-3 text-sm text-gray-600">
            <p>Latitude: {location.latitude.toFixed(4)}</p>
            <p>Longitude: {location.longitude.toFixed(4)}</p>
          </div>
        )}
        
        {error && (
          <AlertBanner variant="warning" message={error} className="mt-3" />
        )}
      </div>

      {/* Insights */}
      {loading && (
        <div className="text-center py-8">
          <Loader className="animate-spin text-primary mx-auto mb-4" size={32} />
          <p className="text-gray-600">Generating location-specific insights...</p>
        </div>
      )}

      {insights && (
        <div className="space-y-6">
          <AlertBanner
            variant="info"
            title="Location-Specific Rights Information"
            message="The following information is tailored to your current state's laws and regulations."
          />

          <div className="grid gap-4">
            <div className="bg-surface rounded-lg-custom p-4 shadow-card">
              <h3 className="font-semibold text-gray-900 mb-2">Stop and Frisk Laws</h3>
              <p className="text-gray-700 text-sm">{insights.stopAndFrisk}</p>
            </div>

            <div className="bg-surface rounded-lg-custom p-4 shadow-card">
              <h3 className="font-semibold text-gray-900 mb-2">Recording Police</h3>
              <p className="text-gray-700 text-sm">{insights.recording}</p>
            </div>

            <div className="bg-surface rounded-lg-custom p-4 shadow-card">
              <h3 className="font-semibold text-gray-900 mb-2">Identification Requirements</h3>
              <p className="text-gray-700 text-sm">{insights.identification}</p>
            </div>

            <div className="bg-surface rounded-lg-custom p-4 shadow-card">
              <h3 className="font-semibold text-gray-900 mb-2">Vehicle Searches</h3>
              <p className="text-gray-700 text-sm">{insights.vehicleSearches}</p>
            </div>

            <div className="bg-surface rounded-lg-custom p-4 shadow-card">
              <h3 className="font-semibold text-gray-900 mb-2">Special Considerations</h3>
              <ul className="text-gray-700 text-sm space-y-1">
                {insights.specialNotes.map((note, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-accent mr-2">•</span>
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg-custom p-4">
            <div className="flex items-center mb-2">
              <AlertCircle className="text-yellow-600 mr-2" size={20} />
              <span className="font-semibold text-yellow-800">Legal Disclaimer</span>
            </div>
            <p className="text-yellow-700 text-sm">
              This information is AI-generated and for educational purposes only. Laws change frequently 
              and this should not be considered legal advice. Always consult with a qualified attorney 
              for specific legal guidance.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default LocationInsights