/**
 * Geolocation Service
 * Handles location-based features for JusticeGuard
 */

// US States mapping for reverse geocoding
const US_STATES = {
  'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
  'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
  'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
  'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
  'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri',
  'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey',
  'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio',
  'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
  'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont',
  'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming',
  'DC': 'District of Columbia'
}

export const geolocationService = {
  // Get current position with enhanced error handling
  getCurrentPosition: (options = {}) => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'))
        return
      }

      const defaultOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
        ...options
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          })
        },
        (error) => {
          let errorMessage = 'Location access denied'
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user'
              break
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable'
              break
            case error.TIMEOUT:
              errorMessage = 'Location request timed out'
              break
            default:
              errorMessage = 'An unknown error occurred while retrieving location'
              break
          }
          
          reject(new Error(errorMessage))
        },
        defaultOptions
      )
    })
  },

  // Watch position for continuous tracking
  watchPosition: (callback, errorCallback, options = {}) => {
    if (!navigator.geolocation) {
      errorCallback(new Error('Geolocation is not supported by this browser'))
      return null
    }

    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000,
      ...options
    }

    return navigator.geolocation.watchPosition(
      (position) => {
        callback({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp
        })
      },
      (error) => {
        let errorMessage = 'Location tracking error'
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location access denied by user'
            break
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable'
            break
          case error.TIMEOUT:
            errorMessage = 'Location request timed out'
            break
          default:
            errorMessage = 'An unknown error occurred while tracking location'
            break
        }
        
        errorCallback(new Error(errorMessage))
      },
      defaultOptions
    )
  },

  // Stop watching position
  clearWatch: (watchId) => {
    if (navigator.geolocation && watchId) {
      navigator.geolocation.clearWatch(watchId)
    }
  },

  // Reverse geocoding using a free service
  reverseGeocode: async (latitude, longitude) => {
    try {
      // Using OpenStreetMap Nominatim (free reverse geocoding service)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'JusticeGuard/1.0'
          }
        }
      )

      if (!response.ok) {
        throw new Error('Reverse geocoding failed')
      }

      const data = await response.json()
      
      if (!data || !data.address) {
        throw new Error('No address found for coordinates')
      }

      const address = data.address
      const state = address.state || address.region
      const city = address.city || address.town || address.village || address.hamlet
      const county = address.county
      const country = address.country

      // Validate that we're in the US
      if (country !== 'United States' && country !== 'United States of America') {
        throw new Error('Location appears to be outside the United States')
      }

      return {
        success: true,
        data: {
          state,
          city,
          county,
          country,
          fullAddress: data.display_name,
          coordinates: { latitude, longitude }
        }
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error)
      
      // Fallback: try to determine state from coordinates using rough boundaries
      const estimatedState = estimateStateFromCoordinates(latitude, longitude)
      
      return {
        success: false,
        error: error.message,
        fallback: estimatedState ? {
          state: estimatedState,
          city: 'Unknown',
          county: 'Unknown',
          country: 'United States',
          coordinates: { latitude, longitude }
        } : null
      }
    }
  },

  // Get location with address information
  getCurrentLocationWithAddress: async (options = {}) => {
    try {
      const position = await geolocationService.getCurrentPosition(options)
      const geocoding = await geolocationService.reverseGeocode(
        position.latitude,
        position.longitude
      )

      return {
        success: true,
        data: {
          ...position,
          address: geocoding.success ? geocoding.data : geocoding.fallback
        }
      }
    } catch (error) {
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Check if location permissions are granted
  checkPermissions: async () => {
    if (!navigator.permissions) {
      return { state: 'unknown' }
    }

    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' })
      return { state: permission.state }
    } catch (error) {
      return { state: 'unknown', error: error.message }
    }
  },

  // Format coordinates for display
  formatCoordinates: (latitude, longitude, precision = 6) => {
    const lat = parseFloat(latitude).toFixed(precision)
    const lng = parseFloat(longitude).toFixed(precision)
    const latDir = latitude >= 0 ? 'N' : 'S'
    const lngDir = longitude >= 0 ? 'E' : 'W'
    
    return `${Math.abs(lat)}°${latDir}, ${Math.abs(lng)}°${lngDir}`
  },

  // Calculate distance between two points (in miles)
  calculateDistance: (lat1, lon1, lat2, lon2) => {
    const R = 3959 // Earth's radius in miles
    const dLat = toRadians(lat2 - lat1)
    const dLon = toRadians(lon2 - lon1)
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2)
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }
}

// Helper function to convert degrees to radians
const toRadians = (degrees) => {
  return degrees * (Math.PI / 180)
}

// Rough state estimation based on coordinates (fallback method)
const estimateStateFromCoordinates = (lat, lng) => {
  // Very rough state boundaries - this is a simplified fallback
  // In production, you'd want a more accurate method
  
  if (lat >= 32.5 && lat <= 42 && lng >= -124.5 && lng <= -114) {
    return 'California'
  } else if (lat >= 25.8 && lat <= 36.5 && lng >= -106.6 && lng <= -93.5) {
    return 'Texas'
  } else if (lat >= 40.5 && lat <= 45.0 && lng >= -79.8 && lng <= -71.8) {
    return 'New York'
  } else if (lat >= 24.5 && lat <= 31.0 && lng >= -87.6 && lng <= -80.0) {
    return 'Florida'
  }
  
  // Add more state boundaries as needed
  return null
}

// Emergency contact notification
export const emergencyNotification = {
  // Send location to emergency contacts
  sendLocationAlert: async (contacts, location, message = 'Emergency alert from JusticeGuard') => {
    const alerts = []
    
    for (const contact of contacts) {
      try {
        // In a real implementation, this would send SMS/email
        // For now, we'll simulate the alert
        const alert = {
          contactId: contact.id,
          contactName: contact.name,
          contactPhone: contact.phone,
          location: location,
          message: message,
          timestamp: new Date().toISOString(),
          status: 'sent'
        }
        
        // Simulate sending delay
        await new Promise(resolve => setTimeout(resolve, 100))
        
        alerts.push(alert)
        console.log(`Alert sent to ${contact.name}: ${message}`)
      } catch (error) {
        alerts.push({
          contactId: contact.id,
          contactName: contact.name,
          error: error.message,
          status: 'failed'
        })
      }
    }
    
    return alerts
  },

  // Format location for emergency message
  formatLocationMessage: (location) => {
    const { address, coordinates } = location
    let message = 'JusticeGuard Emergency Alert\n\n'
    
    if (address) {
      message += `Location: ${address.city}, ${address.state}\n`
      if (address.fullAddress) {
        message += `Address: ${address.fullAddress}\n`
      }
    }
    
    if (coordinates) {
      message += `Coordinates: ${geolocationService.formatCoordinates(coordinates.latitude, coordinates.longitude)}\n`
    }
    
    message += `Time: ${new Date().toLocaleString()}\n`
    message += '\nThis is an automated alert from the JusticeGuard app.'
    
    return message
  }
}

export default geolocationService
