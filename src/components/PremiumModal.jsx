import React from 'react'
import { X, Crown, Check, Star } from 'lucide-react'
import ActionIcon from './ActionIcon'
import { useUser } from '../context/UserContext'

const PremiumModal = ({ onClose }) => {
  const { setIsPremium } = useUser()

  const handleUpgrade = () => {
    // Simulate successful upgrade
    setIsPremium(true)
    onClose()
  }

  const features = [
    "AI-powered location-specific legal insights",
    "Unlimited recording and storage",
    "Automatic emergency contact alerts",
    "AI-generated interaction summaries", 
    "Advanced sharing and documentation tools",
    "Priority customer support"
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-surface rounded-lg-custom max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Crown className="text-yellow-500 mr-2" size={24} />
              <h2 className="text-xl font-semibold text-gray-900">Upgrade to Premium</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Pricing */}
          <div className="text-center mb-6">
            <div className="bg-gradient-to-r from-primary to-purple-600 rounded-lg-custom p-4 text-white mb-4">
              <div className="flex items-center justify-center mb-2">
                <Star className="mr-1" size={20} />
                <span className="font-semibold">7-Day Free Trial</span>
              </div>
              <div className="text-3xl font-bold">$4.99</div>
              <div className="text-sm opacity-90">per month after trial</div>
            </div>
            <p className="text-sm text-gray-600">Cancel anytime. No commitment.</p>
          </div>

          {/* Features */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-4">Premium Features:</h3>
            <div className="space-y-3">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start">
                  <Check className="text-green-500 mr-3 flex-shrink-0 mt-0.5" size={16} />
                  <span className="text-sm text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <ActionIcon
              variant="primary"
              onClick={handleUpgrade}
              className="w-full justify-center"
            >
              <Crown size={20} className="mr-2" />
              Start Free Trial
            </ActionIcon>
            <ActionIcon
              variant="secondary"
              onClick={onClose}
              className="w-full justify-center"
            >
              Maybe Later
            </ActionIcon>
          </div>

          {/* Terms */}
          <p className="text-xs text-gray-500 text-center mt-4">
            By starting your trial, you agree to our Terms of Service and Privacy Policy. 
            You will be charged $4.99/month after your 7-day free trial ends.
          </p>
        </div>
      </div>
    </div>
  )
}

export default PremiumModal