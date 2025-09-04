import React, { useState } from 'react'
import { ArrowLeft, FileText, Share, Download, Crown, Plus, Calendar, MapPin } from 'lucide-react'
import ActionIcon from './ActionIcon'
import { useUser } from '../context/UserContext'

const InteractionSummary = ({ onBack, onShowPremium }) => {
  const { isPremium, summaries, recordings, addSummary } = useUser()
  const [generating, setGenerating] = useState(false)
  const [selectedRecording, setSelectedRecording] = useState(null)

  const generateSummary = async (recordingId) => {
    if (!isPremium) {
      onShowPremium()
      return
    }

    setGenerating(true)
    
    // Simulate AI generation delay
    setTimeout(() => {
      const recording = recordings.find(r => r.id === recordingId)
      if (recording) {
        const mockSummary = {
          recordingId: recordingId,
          location: "Downtown Main Street",
          participants: ["Officer Johnson (Badge #4521)", "Self"],
          duration: recording.duration,
          keyEvents: [
            "Initial stop at 2:30 PM",
            "Request for identification",
            "Vehicle search request (declined)",
            "Warning issued for traffic violation",
            "Interaction ended at 2:45 PM"
          ],
          summaryText: `On ${new Date().toLocaleDateString()}, I was stopped by Officer Johnson (Badge #4521) on Downtown Main Street at approximately 2:30 PM. The officer requested identification, which I provided. When asked to consent to a vehicle search, I politely declined. The officer issued a warning for a traffic violation and the interaction concluded at 2:45 PM. Throughout the interaction, I remained calm and exercised my constitutional rights.`,
          shareableLink: `https://justiceguard.app/summary/${Date.now()}`
        }
        
        addSummary(mockSummary)
      }
      setGenerating(false)
    }, 2000)
  }

  if (!isPremium) {
    return (
      <div className="max-w-4xl mx-auto px-5 py-6">
        <div className="flex items-center mb-6">
          <ActionIcon variant="secondary" onClick={onBack} className="mr-4">
            <ArrowLeft size={20} />
          </ActionIcon>
          <h1 className="text-2xl font-semibold text-gray-900">Interaction Summary</h1>
        </div>

        <div className="text-center py-12">
          <Crown className="text-yellow-500 mx-auto mb-4" size={48} />
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Premium Feature</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            AI-generated interaction summaries for easy sharing and documentation require a premium subscription.
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
          <h1 className="text-2xl font-semibold text-gray-900">Interaction Summary</h1>
          <p className="text-gray-600">AI-generated summaries of your interactions</p>
        </div>
      </div>

      {/* Generate New Summary */}
      <div className="bg-surface rounded-lg-custom p-4 shadow-card mb-6">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
          <Plus className="mr-2" size={20} />
          Generate New Summary
        </h3>
        
        {recordings.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">Select a recording to generate a summary:</p>
            {recordings.slice(0, 3).map((recording) => (
              <div key={recording.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md-custom">
                <div>
                  <p className="font-medium text-gray-900">{recording.fileName}</p>
                  <p className="text-sm text-gray-600">
                    Duration: {Math.floor(recording.duration / 60)}:{(recording.duration % 60).toString().padStart(2, '0')} | 
                    {new Date(recording.timestamp).toLocaleDateString()}
                  </p>
                </div>
                <ActionIcon 
                  variant="primary" 
                  size="sm" 
                  onClick={() => generateSummary(recording.id)}
                  disabled={generating}
                >
                  {generating ? 'Generating...' : 'Generate'}
                </ActionIcon>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6">
            <FileText className="text-gray-400 mx-auto mb-2" size={32} />
            <p className="text-gray-600 mb-4">No recordings available</p>
            <ActionIcon variant="secondary" size="sm">
              Go to Record & Alert
            </ActionIcon>
          </div>
        )}
      </div>

      {/* Existing Summaries */}
      <div>
        <h3 className="font-semibold text-gray-900 mb-4">Previous Summaries</h3>
        
        {summaries.length > 0 ? (
          <div className="space-y-4">
            {summaries.map((summary) => (
              <div key={summary.id} className="bg-surface rounded-lg-custom p-4 shadow-card">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <Calendar className="text-gray-400 mr-2" size={16} />
                      <span className="text-sm text-gray-600">
                        {new Date(summary.timestamp).toLocaleDateString()} at {new Date(summary.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    {summary.location && (
                      <div className="flex items-center mb-2">
                        <MapPin className="text-gray-400 mr-2" size={16} />
                        <span className="text-sm text-gray-600">{summary.location}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <ActionIcon variant="secondary" size="sm">
                      <Share size={16} />
                    </ActionIcon>
                    <ActionIcon variant="secondary" size="sm">
                      <Download size={16} />
                    </ActionIcon>
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Participants:</h4>
                  <div className="flex flex-wrap gap-2">
                    {summary.participants?.map((participant, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {participant}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Key Events:</h4>
                  <ul className="text-sm text-gray-700 space-y-1">
                    {summary.keyEvents?.map((event, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-blue-500 mr-2">•</span>
                        {event}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Summary:</h4>
                  <p className="text-sm text-gray-700 leading-relaxed">{summary.summaryText}</p>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      Shareable link: {summary.shareableLink}
                    </span>
                    <ActionIcon variant="primary" size="sm">
                      <Share size={16} className="mr-1" />
                      Share
                    </ActionIcon>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <FileText className="text-gray-400 mx-auto mb-3" size={48} />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Summaries Yet</h3>
            <p className="text-gray-600 mb-4">
              Generate your first interaction summary from a recording above.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default InteractionSummary