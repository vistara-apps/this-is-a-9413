/**
 * Environment Configuration Service
 * Centralized configuration management for JusticeGuard
 */

const config = {
  // OpenAI Configuration
  openai: {
    apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  },

  // Supabase Configuration
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  },

  // Stripe Configuration
  stripe: {
    publishableKey: import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
  },

  // Application Configuration
  app: {
    name: import.meta.env.VITE_APP_NAME || 'JusticeGuard',
    version: import.meta.env.VITE_APP_VERSION || '1.0.0',
    env: import.meta.env.VITE_APP_ENV || 'development',
  },

  // Feature Flags
  features: {
    analytics: import.meta.env.VITE_ENABLE_ANALYTICS === 'true',
    debug: import.meta.env.VITE_ENABLE_DEBUG === 'true',
  },

  // API Configuration
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
    maxRecordingDuration: parseInt(import.meta.env.VITE_MAX_RECORDING_DURATION) || 300,
    maxFileSize: parseInt(import.meta.env.VITE_MAX_FILE_SIZE) || 50000000,
  },

  // Premium Configuration
  premium: {
    monthlyPrice: 4.99,
    trialDays: 7,
    features: [
      'AI-powered location insights',
      'Unlimited recordings',
      'Advanced emergency alerts',
      'AI-generated summaries',
      'Priority support'
    ]
  }
}

// Validation function to check required environment variables
export const validateConfig = () => {
  const errors = []

  if (!config.openai.apiKey && config.app.env === 'production') {
    errors.push('VITE_OPENAI_API_KEY is required in production')
  }

  if (!config.supabase.url) {
    errors.push('VITE_SUPABASE_URL is required')
  }

  if (!config.supabase.anonKey) {
    errors.push('VITE_SUPABASE_ANON_KEY is required')
  }

  if (!config.stripe.publishableKey && config.app.env === 'production') {
    errors.push('VITE_STRIPE_PUBLISHABLE_KEY is required in production')
  }

  if (errors.length > 0) {
    console.error('Configuration validation failed:', errors)
    if (config.app.env === 'production') {
      throw new Error(`Configuration validation failed: ${errors.join(', ')}`)
    }
  }

  return errors.length === 0
}

// Development mode helpers
export const isDevelopment = () => config.app.env === 'development'
export const isProduction = () => config.app.env === 'production'
export const isDebugEnabled = () => config.features.debug

export default config
