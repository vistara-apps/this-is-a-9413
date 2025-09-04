import React from 'react'
import { Shield, MapPin, Video, FileText, Star, AlertTriangle } from 'lucide-react'
import FeatureCard from './FeatureCard'
import ActionIcon from './ActionIcon'
import AlertBanner from './AlertBanner'

const Dashboard = ({ onNavigate, onShowPremium }) => {
  const features = [
    {
      id: 'rights',
      title: 'Emergency Rights Card',
      description: 'Quick access to your fundamental legal rights during law enforcement encounters',
      icon: Shield,
      color: 'bg-blue-500',
      isPremium: false
    },
    {
      id: 'location',
      title: 'Location-Based Rights',
      description: 'Get state-specific legal insights tailored to your current location',
      icon: MapPin,
      color: 'bg-accent',
      isPremium: true
    },
    {
      id: 'record',
      title: 'One-Tap Record & Alert',
      description: 'Instantly record interactions and alert your emergency contacts',
      icon: Video,
      color: 'bg-red-500',
      isPremium: true
    },
    {
      id: 'summary',
      title: 'Interaction Summary',
      description: 'AI-generated summaries of your interactions for easy sharing',
      icon: FileText,
      color: 'bg-purple-500',
      isPremium: true
    }
  ]

  return (
    <div className="max-w-4xl mx-auto px-5 py-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center mb-4">
          <Shield className="text-primary mr-3" size={32} />
          <h1 className="text-4xl font-bold text-gray-900">JusticeGuard</h1>
        </div>
        <p className="text-base leading-7 text-gray-600 max-w-2xl mx-auto">
          Your rights, instantly accessible and actionable. Stay protected during law enforcement encounters.
        </p>
      </div>

      {/* Alert Banner */}
      <AlertBanner
        variant="warning"
        title="Know Your Rights"
        message="In any interaction with law enforcement, you have the right to remain silent and the right to an attorney."
      />

      {/* Emergency Action */}
      <div className="mb-8">
        <div className="bg-red-50 border border-red-200 rounded-lg-custom p-6 text-center">
          <AlertTriangle className="text-red-500 mx-auto mb-3" size={32} />
          <h3 className="text-xl font-semibold text-red-800 mb-2">Emergency Situation?</h3>
          <p className="text-red-600 mb-4">Quick access to your rights and recording tools</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <ActionIcon
              variant="destructive"
              onClick={() => onNavigate('rights')}
              className="flex-1 sm:flex-none"
            >
              <Shield size={20} className="mr-2" />
              View Rights Now
            </ActionIcon>
            <ActionIcon
              variant="secondary"
              onClick={() => onNavigate('record')}
              className="flex-1 sm:flex-none"
            >
              <Video size={20} className="mr-2" />
              Start Recording
            </ActionIcon>
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {features.map((feature) => (
          <FeatureCard
            key={feature.id}
            title={feature.title}
            description={feature.description}
            icon={feature.icon}
            color={feature.color}
            isPremium={feature.isPremium}
            onClick={() => feature.isPremium ? onShowPremium() : onNavigate(feature.id)}
          />
        ))}
      </div>

      {/* Premium CTA */}
      <div className="bg-gradient-to-r from-primary to-purple-600 rounded-lg-custom p-6 text-white text-center">
        <Star className="mx-auto mb-3" size={32} />
        <h3 className="text-xl font-semibold mb-2">Upgrade to Premium</h3>
        <p className="mb-4 opacity-90">
          Get AI-powered insights, unlimited recordings, and advanced alerts for just $4.99/month
        </p>
        <ActionIcon
          variant="secondary"
          onClick={onShowPremium}
          className="bg-white text-primary hover:bg-gray-100"
        >
          Start Free Trial
        </ActionIcon>
      </div>
    </div>
  )
}

export default Dashboard