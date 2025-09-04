import React, { useState, useRef, useEffect } from 'react'
import { ArrowLeft, Video, Square, Phone, Users, Crown, AlertCircle } from 'lucide-react'
import ActionIcon from './ActionIcon'
import AlertBanner from './AlertBanner'
import { useUser } from '../context/UserContext'

const RecordAlert = ({ onBack, onShowPremium }) => {
  const { isPremium, emergencyContacts, addRecording } = useUser()
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [mediaRecorder, setMediaRecorder] = useState(null)
  const [recordedChunks, setRecordedChunks] = useState([])
  const [error, setError] = useState(null)
  const [alertSent, setAlertSent] = useState(false)
  const intervalRef = useRef(null)

  const startRecording = async () => {
    if (!isPremium) {
      onShowPremium()
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      })
      
      const recorder = new MediaRecorder(stream)
      setMediaRecorder(recorder)
      setRecordedChunks([])
      setError(null)

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks(prev => [...prev, event.data])
        }
      }

      recorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop())
      }

      recorder.start()
      setIsRecording(true)
      setRecordingTime(0)
      
      // Start timer
      intervalRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)

      // Send alert to emergency contacts
      sendEmergencyAlert()

    } catch (err) {
      setError('Failed to access camera/microphone: ' + err.message)
    }
  }

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop()
      setIsRecording(false)
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }

      // Save recording
      setTimeout(() => {
        if (recordedChunks.length > 0) {
          const blob = new Blob(recordedChunks, { type: 'video/webm' })
          const recording = {
            fileName: `recording_${new Date().toISOString()}.webm`,
            size: blob.size,
            duration: recordingTime,
            blob: blob
          }
          addRecording(recording)
        }
      }, 100)
    }
  }

  const sendEmergencyAlert = () => {
    if (emergencyContacts.length === 0) return

    // Get current location
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords
        const message = `EMERGENCY ALERT: I am in a situation that requires documentation. My location: ${latitude}, ${longitude}. Time: ${new Date().toLocaleString()}`
        
        // Simulate sending alerts (in a real app, this would send SMS/emails)
        console.log('Emergency alert sent:', message)
        setAlertSent(true)
      },
      (error) => {
        console.error('Location error:', error)
        const message = `EMERGENCY ALERT: I am in a situation that requires documentation. Location unavailable. Time: ${new Date().toLocaleString()}`
        console.log('Emergency alert sent:', message)
        setAlertSent(true)
      }
    )
  }

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  if (!isPremium) {
    return (
      <div className="max-w-4xl mx-auto px-5 py-6">
        <div className="flex items-center mb-6">
          <ActionIcon variant="secondary" onClick={onBack} className="mr-4">
            <ArrowLeft size={20} />
          </ActionIcon>
          <h1 className="text-2xl font-semibold text-gray-900">Record & Alert</h1>
        </div>

        <div className="text-center py-12">
          <Crown className="text-yellow-500 mx-auto mb-4" size={48} />
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Premium Feature</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            One-tap recording with automatic emergency contact alerts requires a premium subscription.
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
          <h1 className="text-2xl font-semibold text-gray-900">Record & Alert</h1>
          <p className="text-gray-600">Document interactions and alert emergency contacts</p>
        </div>
      </div>

      {/* Emergency Alert Status */}
      {alertSent && (
        <AlertBanner
          variant="success"
          title="Emergency Alert Sent"
          message={`Alert sent to ${emergencyContacts.length} emergency contact${emergencyContacts.length > 1 ? 's' : ''}`}
          className="mb-6"
        />
      )}

      {error && (
        <AlertBanner
          variant="warning"
          message={error}
          className="mb-6"
        />
      )}

      {/* Recording Interface */}
      <div className="bg-surface rounded-lg-custom p-6 shadow-card mb-6">
        <div className="text-center">
          {isRecording ? (
            <div className="space-y-4">
              <div className="recording-pulse">
                <div className="w-16 h-16 bg-red-500 rounded-full mx-auto flex items-center justify-center">
                  <Video className="text-white" size={32} />
                </div>
              </div>
              
              <div>
                <p className="text-xl font-semibold text-red-600 mb-2">RECORDING</p>
                <p className="text-2xl font-bold text-gray-900">{formatTime(recordingTime)}</p>
              </div>

              <ActionIcon variant="destructive" onClick={stopRecording} size="lg">
                <Square size={24} className="mr-2" />
                Stop Recording
              </ActionIcon>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-16 h-16 bg-red-500 rounded-full mx-auto flex items-center justify-center">
                <Video className="text-white" size={32} />
              </div>
              
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to Record</h3>
                <p className="text-gray-600 text-sm">
                  Tap to start recording and automatically alert your emergency contacts
                </p>
              </div>

              <ActionIcon variant="destructive" onClick={startRecording} size="lg">
                <Video size={24} className="mr-2" />
                Start Recording
              </ActionIcon>
            </div>
          )}
        </div>
      </div>

      {/* Emergency Contacts */}
      <div className="bg-surface rounded-lg-custom p-4 shadow-card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900 flex items-center">
            <Users className="mr-2" size={20} />
            Emergency Contacts
          </h3>
          <ActionIcon variant="secondary" size="sm">
            Manage
          </ActionIcon>
        </div>
        
        {emergencyContacts.length > 0 ? (
          <div className="space-y-2">
            {emergencyContacts.slice(0, 3).map((contact, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded-md-custom">
                <span className="text-sm font-medium text-gray-900">{contact.name}</span>
                <span className="text-sm text-gray-600">{contact.phone}</span>
              </div>
            ))}
            {emergencyContacts.length > 3 && (
              <p className="text-xs text-gray-500 text-center">
                +{emergencyContacts.length - 3} more contacts
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <AlertCircle className="text-yellow-500 mx-auto mb-2" size={24} />
            <p className="text-sm text-gray-600 mb-2">No emergency contacts added</p>
            <ActionIcon variant="secondary" size="sm">
              Add Contacts
            </ActionIcon>
          </div>
        )}
      </div>

      {/* Safety Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg-custom p-4">
        <h3 className="font-semibold text-blue-800 mb-3">Recording Safety Tips</h3>
        <ul className="text-blue-700 text-sm space-y-2">
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">•</span>
            Keep the phone visible and don't hide that you're recording
          </li>
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">•</span>
            Stay calm and don't interfere with police duties
          </li>
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">•</span>
            Record from a safe distance when possible
          </li>
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">•</span>
            State your name, date, time, and location at the beginning
          </li>
        </ul>
      </div>
    </div>
  )
}

export default RecordAlert