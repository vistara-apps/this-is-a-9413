/**
 * Stripe Service
 * Handles payment processing and subscription management for JusticeGuard
 */

import { loadStripe } from '@stripe/stripe-js'
import config from '../config/env.js'

// Initialize Stripe
let stripePromise = null
if (config.stripe.publishableKey) {
  stripePromise = loadStripe(config.stripe.publishableKey)
}

// Subscription plans
export const SUBSCRIPTION_PLANS = {
  PREMIUM_MONTHLY: {
    id: 'premium_monthly',
    name: 'Premium Monthly',
    price: 4.99,
    interval: 'month',
    features: [
      'AI-powered location insights',
      'Unlimited recordings',
      'Advanced emergency alerts',
      'AI-generated summaries',
      'Priority support'
    ]
  },
  PREMIUM_YEARLY: {
    id: 'premium_yearly',
    name: 'Premium Yearly',
    price: 49.99,
    interval: 'year',
    features: [
      'AI-powered location insights',
      'Unlimited recordings',
      'Advanced emergency alerts',
      'AI-generated summaries',
      'Priority support',
      '2 months free'
    ]
  }
}

export const stripeService = {
  // Initialize Stripe instance
  getStripe: async () => {
    if (!stripePromise) {
      throw new Error('Stripe not initialized - missing publishable key')
    }
    return await stripePromise
  },

  // Create checkout session for subscription
  createCheckoutSession: async (planId, userId, userEmail) => {
    try {
      const plan = SUBSCRIPTION_PLANS[planId]
      if (!plan) {
        throw new Error('Invalid subscription plan')
      }

      // In a real implementation, this would call your backend API
      // For now, we'll simulate the checkout session creation
      const checkoutSession = {
        id: `cs_${Date.now()}`,
        url: `https://checkout.stripe.com/pay/cs_${Date.now()}`,
        planId,
        userId,
        userEmail,
        amount: plan.price * 100, // Convert to cents
        currency: 'usd',
        mode: 'subscription',
        created: Date.now()
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))

      return {
        success: true,
        data: checkoutSession
      }
    } catch (error) {
      console.error('Stripe checkout session error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Redirect to Stripe Checkout
  redirectToCheckout: async (sessionId) => {
    try {
      const stripe = await stripeService.getStripe()
      
      // In a real implementation, you would redirect to the actual Stripe checkout
      // For demo purposes, we'll simulate a successful subscription
      console.log('Redirecting to Stripe checkout:', sessionId)
      
      // Simulate checkout completion
      setTimeout(() => {
        // This would normally be handled by Stripe webhooks
        window.dispatchEvent(new CustomEvent('stripe-checkout-success', {
          detail: { sessionId }
        }))
      }, 2000)

      return {
        success: true,
        message: 'Redirecting to checkout...'
      }
    } catch (error) {
      console.error('Stripe redirect error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Create customer portal session
  createPortalSession: async (customerId) => {
    try {
      // In a real implementation, this would call your backend API
      const portalSession = {
        id: `pcs_${Date.now()}`,
        url: `https://billing.stripe.com/p/session/${Date.now()}`,
        customerId,
        created: Date.now()
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300))

      return {
        success: true,
        data: portalSession
      }
    } catch (error) {
      console.error('Stripe portal session error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Get subscription status
  getSubscriptionStatus: async (userId) => {
    try {
      // In a real implementation, this would call your backend API
      // For demo purposes, we'll return a mock subscription status
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 200))

      // Mock subscription data
      const mockSubscription = {
        id: `sub_${userId}`,
        status: 'active',
        planId: 'premium_monthly',
        currentPeriodStart: Date.now() - (7 * 24 * 60 * 60 * 1000), // 7 days ago
        currentPeriodEnd: Date.now() + (23 * 24 * 60 * 60 * 1000), // 23 days from now
        cancelAtPeriodEnd: false,
        trialEnd: null
      }

      return {
        success: true,
        data: mockSubscription
      }
    } catch (error) {
      console.error('Subscription status error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Cancel subscription
  cancelSubscription: async (subscriptionId) => {
    try {
      // In a real implementation, this would call your backend API
      console.log('Canceling subscription:', subscriptionId)

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))

      return {
        success: true,
        message: 'Subscription canceled successfully'
      }
    } catch (error) {
      console.error('Subscription cancellation error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Resume subscription
  resumeSubscription: async (subscriptionId) => {
    try {
      // In a real implementation, this would call your backend API
      console.log('Resuming subscription:', subscriptionId)

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))

      return {
        success: true,
        message: 'Subscription resumed successfully'
      }
    } catch (error) {
      console.error('Subscription resume error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Validate payment method
  validatePaymentMethod: async (paymentMethodId) => {
    try {
      const stripe = await stripeService.getStripe()
      
      // In a real implementation, you would validate the payment method
      // For demo purposes, we'll simulate validation
      console.log('Validating payment method:', paymentMethodId)

      return {
        success: true,
        valid: true
      }
    } catch (error) {
      console.error('Payment method validation error:', error)
      return {
        success: false,
        error: error.message
      }
    }
  },

  // Format price for display
  formatPrice: (amount, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount)
  },

  // Calculate trial end date
  calculateTrialEnd: (trialDays = 7) => {
    const trialEnd = new Date()
    trialEnd.setDate(trialEnd.getDate() + trialDays)
    return trialEnd
  },

  // Check if subscription is active
  isSubscriptionActive: (subscription) => {
    if (!subscription) return false
    
    const now = Date.now()
    const { status, currentPeriodEnd, trialEnd } = subscription
    
    // Check if subscription is in active status
    if (status !== 'active' && status !== 'trialing') return false
    
    // Check if trial is still valid
    if (status === 'trialing' && trialEnd && now > trialEnd) return false
    
    // Check if subscription period is still valid
    if (status === 'active' && currentPeriodEnd && now > currentPeriodEnd) return false
    
    return true
  },

  // Get days remaining in subscription
  getDaysRemaining: (subscription) => {
    if (!subscription) return 0
    
    const now = Date.now()
    const endDate = subscription.trialEnd || subscription.currentPeriodEnd
    
    if (!endDate || now > endDate) return 0
    
    const diffTime = endDate - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return Math.max(0, diffDays)
  }
}

// Webhook event handlers (for backend integration)
export const webhookHandlers = {
  // Handle successful payment
  handlePaymentSuccess: (event) => {
    console.log('Payment successful:', event)
    // Update user's premium status
    // Send confirmation email
    // Log the transaction
  },

  // Handle failed payment
  handlePaymentFailed: (event) => {
    console.log('Payment failed:', event)
    // Notify user of failed payment
    // Attempt retry logic
    // Log the failure
  },

  // Handle subscription created
  handleSubscriptionCreated: (event) => {
    console.log('Subscription created:', event)
    // Update user's subscription status
    // Send welcome email
    // Enable premium features
  },

  // Handle subscription updated
  handleSubscriptionUpdated: (event) => {
    console.log('Subscription updated:', event)
    // Update user's subscription status
    // Handle plan changes
    // Update billing information
  },

  // Handle subscription canceled
  handleSubscriptionCanceled: (event) => {
    console.log('Subscription canceled:', event)
    // Update user's subscription status
    // Send cancellation confirmation
    // Schedule feature downgrade
  },

  // Handle invoice payment succeeded
  handleInvoicePaymentSucceeded: (event) => {
    console.log('Invoice payment succeeded:', event)
    // Extend subscription period
    // Send receipt
    // Update payment history
  },

  // Handle invoice payment failed
  handleInvoicePaymentFailed: (event) => {
    console.log('Invoice payment failed:', event)
    // Notify user of failed payment
    // Update subscription status
    // Implement dunning management
  }
}

export default stripeService
