/**
 * Subscription Manager Component
 * Handles subscription management and billing for JusticeGuard
 */

import React, { useState, useEffect } from 'react'
import { Crown, CreditCard, Calendar, AlertCircle, Check, X } from 'lucide-react'
import ActionIcon from './ActionIcon'
import AlertBanner from './AlertBanner'
import { useAuth } from '../hooks/useAuth.jsx'
import { stripeService, SUBSCRIPTION_PLANS } from '../services/stripe'

const SubscriptionManager = ({ onClose }) => {
  const { user, isPremium, updatePremiumStatus } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [subscription, setSubscription] = useState(null)
  const [selectedPlan, setSelectedPlan] = useState('PREMIUM_MONTHLY')

  useEffect(() => {
    if (user) {
      loadSubscriptionData()
    }
  }, [user])

  const loadSubscriptionData = async () => {
    try {
      setLoading(true)
      const result = await stripeService.getSubscriptionStatus(user.id)
      
      if (result.success) {
        setSubscription(result.data)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubscribe = async () => {
    try {
      setLoading(true)
      setError(null)

      // Create checkout session
      const sessionResult = await stripeService.createCheckoutSession(
        selectedPlan.toLowerCase(),
        user.id,
        user.email
      )

      if (!sessionResult.success) {
        throw new Error(sessionResult.error)
      }

      // Redirect to checkout
      const redirectResult = await stripeService.redirectToCheckout(sessionResult.data.id)
      
      if (!redirectResult.success) {
        throw new Error(redirectResult.error)
      }

      // Listen for checkout success
      const handleCheckoutSuccess = async (event) => {
        try {
          // Update premium status
          const expiresAt = new Date()
          expiresAt.setMonth(expiresAt.getMonth() + 1) // 1 month from now
          
          await updatePremiumStatus(true, expiresAt.toISOString())
          
          // Reload subscription data
          await loadSubscriptionData()
          
          // Show success message
          setError(null)
          
          // Close modal after success
          setTimeout(() => {
            onClose()
          }, 2000)
        } catch (err) {
          setError('Failed to update subscription status')
        }
        
        window.removeEventListener('stripe-checkout-success', handleCheckoutSuccess)
      }

      window.addEventListener('stripe-checkout-success', handleCheckoutSuccess)

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (!subscription) return

    try {
      setLoading(true)
      setError(null)

      const result = await stripeService.cancelSubscription(subscription.id)
      
      if (!result.success) {
        throw new Error(result.error)
      }

      // Update local state
      setSubscription(prev => ({
        ...prev,
        cancelAtPeriodEnd: true
      }))

      // Update premium status to expire at period end
      await updatePremiumStatus(true, new Date(subscription.currentPeriodEnd).toISOString())

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleResumeSubscription = async () => {
    if (!subscription) return

    try {
      setLoading(true)
      setError(null)

      const result = await stripeService.resumeSubscription(subscription.id)
      
      if (!result.success) {
        throw new Error(result.error)
      }

      // Update local state
      setSubscription(prev => ({
        ...prev,
        cancelAtPeriodEnd: false
      }))

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleManageBilling = async () => {
    try {
      setLoading(true)
      const result = await stripeService.createPortalSession(user.id)
      
      if (result.success) {
        window.open(result.data.url, '_blank')
      } else {
        throw new Error(result.error)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const daysRemaining = subscription ? stripeService.getDaysRemaining(subscription) : 0

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-surface rounded-lg-custom max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <Crown className="text-primary mr-3" size={24} />
              <h2 className="text-2xl font-semibold text-gray-900">
                {isPremium ? 'Manage Subscription' : 'Upgrade to Premium'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* Error Alert */}
          {error && (
            <AlertBanner
              variant="warning"
              title="Error"
              message={error}
              className="mb-6"
            />
          )}

          {/* Current Subscription Status */}
          {isPremium && subscription && (
            <div className="bg-green-50 border border-green-200 rounded-lg-custom p-4 mb-6">
              <div className="flex items-center mb-2">
                <Check className="text-green-600 mr-2" size={20} />
                <h3 className="font-semibold text-green-800">Premium Active</h3>
              </div>
              <div className="text-green-700 space-y-1">
                <p>Plan: {SUBSCRIPTION_PLANS[subscription.planId?.toUpperCase()]?.name || 'Premium'}</p>
                <p>Status: {subscription.status}</p>
                {subscription.currentPeriodEnd && (
                  <p>
                    {subscription.cancelAtPeriodEnd ? 'Expires' : 'Renews'} on{' '}
                    {formatDate(subscription.currentPeriodEnd)}
                  </p>
                )}
                {daysRemaining > 0 && (
                  <p className="font-medium">
                    {daysRemaining} day{daysRemaining !== 1 ? 's' : ''} remaining
                  </p>
                )}
              </div>
              
              {/* Subscription Actions */}
              <div className="flex flex-wrap gap-3 mt-4">
                <ActionIcon
                  variant="secondary"
                  onClick={handleManageBilling}
                  disabled={loading}
                  className="text-sm"
                >
                  <CreditCard size={16} className="mr-2" />
                  Manage Billing
                </ActionIcon>
                
                {subscription.cancelAtPeriodEnd ? (
                  <ActionIcon
                    variant="primary"
                    onClick={handleResumeSubscription}
                    disabled={loading}
                    className="text-sm"
                  >
                    Resume Subscription
                  </ActionIcon>
                ) : (
                  <ActionIcon
                    variant="destructive"
                    onClick={handleCancelSubscription}
                    disabled={loading}
                    className="text-sm"
                  >
                    Cancel Subscription
                  </ActionIcon>
                )}
              </div>
            </div>
          )}

          {/* Plan Selection */}
          {!isPremium && (
            <>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Choose Your Plan</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(SUBSCRIPTION_PLANS).map(([key, plan]) => (
                    <div
                      key={key}
                      className={`border rounded-lg-custom p-4 cursor-pointer transition-all ${
                        selectedPlan === key
                          ? 'border-primary bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedPlan(key)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold text-gray-900">{plan.name}</h4>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">
                            {stripeService.formatPrice(plan.price)}
                          </div>
                          <div className="text-sm text-gray-500">/{plan.interval}</div>
                        </div>
                      </div>
                      
                      {key === 'PREMIUM_YEARLY' && (
                        <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded mb-2 inline-block">
                          Save 17%
                        </div>
                      )}
                      
                      <ul className="space-y-1">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center text-sm text-gray-600">
                            <Check size={14} className="text-green-500 mr-2 flex-shrink-0" />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* Subscribe Button */}
              <div className="text-center">
                <ActionIcon
                  variant="primary"
                  onClick={handleSubscribe}
                  disabled={loading}
                  className="w-full sm:w-auto px-8 py-3"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      <Crown size={20} className="mr-2" />
                      Start 7-Day Free Trial
                    </>
                  )}
                </ActionIcon>
                
                <p className="text-sm text-gray-500 mt-3">
                  Cancel anytime. No commitment required.
                </p>
              </div>
            </>
          )}

          {/* Premium Features */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Premium Features</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  icon: '🤖',
                  title: 'AI-Powered Insights',
                  description: 'Get location-specific legal guidance powered by AI'
                },
                {
                  icon: '📹',
                  title: 'Unlimited Recordings',
                  description: 'Record and store unlimited interactions'
                },
                {
                  icon: '🚨',
                  title: 'Advanced Alerts',
                  description: 'Instant emergency contact notifications'
                },
                {
                  icon: '📄',
                  title: 'AI Summaries',
                  description: 'Professional interaction summaries for documentation'
                },
                {
                  icon: '🎯',
                  title: 'Priority Support',
                  description: 'Get help when you need it most'
                },
                {
                  icon: '🔒',
                  title: 'Enhanced Security',
                  description: 'Advanced encryption and privacy protection'
                }
              ].map((feature, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className="text-2xl">{feature.icon}</div>
                  <div>
                    <h4 className="font-medium text-gray-900">{feature.title}</h4>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg-custom">
            <div className="flex items-start">
              <AlertCircle className="text-gray-400 mr-3 mt-0.5 flex-shrink-0" size={16} />
              <div className="text-sm text-gray-600">
                <p className="font-medium mb-1">Secure Payment Processing</p>
                <p>
                  All payments are processed securely through Stripe. We never store your payment information.
                  Your subscription can be canceled at any time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SubscriptionManager
