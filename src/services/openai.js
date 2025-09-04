/**
 * OpenAI Service
 * Handles AI-powered features for JusticeGuard
 */

import OpenAI from 'openai'
import config from '../config/env.js'

// Initialize OpenAI client
const openai = config.openai.apiKey ? new OpenAI({
  apiKey: config.openai.apiKey,
  dangerouslyAllowBrowser: true // Note: In production, API calls should go through your backend
}) : null

// Legal rights prompts
const LEGAL_RIGHTS_PROMPT = `You are a legal rights assistant for JusticeGuard, an app that helps people understand their rights during law enforcement encounters. Provide accurate, helpful information about legal rights in the United States.

Key principles to follow:
1. Always emphasize constitutional rights (4th, 5th, 6th amendments)
2. Provide practical, actionable advice
3. Be clear about what people can and cannot do
4. Emphasize remaining calm and respectful
5. Include both English and Spanish key phrases when relevant
6. Focus on de-escalation and safety

Never provide legal advice that could be construed as encouraging illegal activity or confrontation with law enforcement.`

const SUMMARY_PROMPT = `You are an AI assistant that creates professional, objective summaries of law enforcement interactions for JusticeGuard users. 

Create a clear, factual summary that:
1. Uses neutral, professional language
2. Focuses on key events and timeline
3. Notes important legal aspects (rights exercised, requests made, etc.)
4. Maintains objectivity without bias
5. Could be useful for legal documentation

Format the response as a structured summary with clear sections.`

// State-specific legal information
const STATE_LEGAL_INFO = {
  'California': {
    stopAndIdentify: false,
    vehicleSearchConsent: 'required',
    recordingLegal: true,
    specialNotes: 'California is not a stop-and-identify state. You are not required to provide ID unless lawfully arrested.'
  },
  'Texas': {
    stopAndIdentify: true,
    vehicleSearchConsent: 'required',
    recordingLegal: true,
    specialNotes: 'Texas is a stop-and-identify state. You must provide your name if lawfully detained.'
  },
  'New York': {
    stopAndIdentify: false,
    vehicleSearchConsent: 'required',
    recordingLegal: true,
    specialNotes: 'New York allows recording of police in public. Stop-and-frisk requires reasonable suspicion.'
  },
  'Florida': {
    stopAndIdentify: false,
    vehicleSearchConsent: 'required',
    recordingLegal: true,
    specialNotes: 'Florida allows recording police. No duty to identify unless arrested.'
  }
  // Add more states as needed
}

// OpenAI Service Functions
export const openaiService = {
  // Generate location-specific legal insights
  generateLocationInsights: async (state, city = null) => {
    if (!openai) {
      // Fallback to static information if no API key
      return generateStaticLocationInsights(state)
    }

    try {
      const locationContext = city ? `${city}, ${state}` : state
      const stateInfo = STATE_LEGAL_INFO[state] || {}
      
      const prompt = `${LEGAL_RIGHTS_PROMPT}

Location: ${locationContext}

Provide specific legal rights information for this location, including:
1. Stop and identify laws
2. Vehicle search consent requirements
3. Recording rights
4. Key phrases in English and Spanish
5. Important local considerations

State-specific context: ${JSON.stringify(stateInfo)}

Format as a structured response with clear sections.`

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: LEGAL_RIGHTS_PROMPT },
          { role: 'user', content: prompt }
        ],
        max_tokens: 1000,
        temperature: 0.3
      })

      return {
        success: true,
        data: {
          location: locationContext,
          insights: response.choices[0].message.content,
          stateInfo,
          generated: true
        }
      }
    } catch (error) {
      console.error('OpenAI API error:', error)
      
      // Fallback to static information
      return generateStaticLocationInsights(state)
    }
  },

  // Generate interaction summary
  generateInteractionSummary: async (interactionData) => {
    if (!openai) {
      // Fallback to static summary if no API key
      return generateStaticSummary(interactionData)
    }

    try {
      const {
        duration,
        location,
        timestamp,
        participants = [],
        keyEvents = [],
        additionalNotes = ''
      } = interactionData

      const prompt = `${SUMMARY_PROMPT}

Interaction Details:
- Date/Time: ${new Date(timestamp).toLocaleString()}
- Location: ${location}
- Duration: ${Math.floor(duration / 60)} minutes ${duration % 60} seconds
- Participants: ${participants.join(', ')}
- Key Events: ${keyEvents.join('; ')}
- Additional Notes: ${additionalNotes}

Create a professional summary of this law enforcement interaction.`

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: SUMMARY_PROMPT },
          { role: 'user', content: prompt }
        ],
        max_tokens: 800,
        temperature: 0.2
      })

      return {
        success: true,
        data: {
          summaryText: response.choices[0].message.content,
          location,
          participants,
          duration,
          keyEvents,
          timestamp,
          shareableLink: `https://justiceguard.app/summary/${Date.now()}`,
          generated: true
        }
      }
    } catch (error) {
      console.error('OpenAI API error:', error)
      
      // Fallback to static summary
      return generateStaticSummary(interactionData)
    }
  },

  // Generate emergency phrases
  generateEmergencyPhrases: async (language = 'en') => {
    if (!openai) {
      return generateStaticPhrases(language)
    }

    try {
      const prompt = `Generate essential phrases for law enforcement encounters in ${language === 'es' ? 'Spanish' : 'English'}:

1. "I am exercising my right to remain silent"
2. "I do not consent to any searches"
3. "I would like to speak to a lawyer"
4. "Am I free to go?"
5. "I am recording this interaction for my safety"

Provide clear, respectful phrases that assert rights while maintaining a calm tone.`

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: LEGAL_RIGHTS_PROMPT },
          { role: 'user', content: prompt }
        ],
        max_tokens: 400,
        temperature: 0.1
      })

      return {
        success: true,
        data: {
          language,
          phrases: response.choices[0].message.content,
          generated: true
        }
      }
    } catch (error) {
      console.error('OpenAI API error:', error)
      return generateStaticPhrases(language)
    }
  }
}

// Fallback functions for when OpenAI is not available
const generateStaticLocationInsights = (state) => {
  const stateInfo = STATE_LEGAL_INFO[state] || {
    stopAndIdentify: false,
    vehicleSearchConsent: 'required',
    recordingLegal: true,
    specialNotes: 'General constitutional rights apply.'
  }

  const insights = `
**Your Rights in ${state}:**

**Stop and Identify:** ${stateInfo.stopAndIdentify ? 'Required when lawfully detained' : 'Not required unless arrested'}

**Vehicle Searches:** Police need your consent or a warrant (with exceptions for safety/evidence)

**Recording Rights:** You have the right to record police in public spaces

**Key Phrases:**
- "I am exercising my right to remain silent"
- "I do not consent to any searches"
- "Am I free to go?"

**En Español:**
- "Estoy ejerciendo mi derecho a permanecer en silencio"
- "No consiento a ningún registro"
- "¿Soy libre de irme?"

**Important:** ${stateInfo.specialNotes}

Remember: Stay calm, be respectful, and clearly state your rights.`

  return {
    success: true,
    data: {
      location: state,
      insights,
      stateInfo,
      generated: false
    }
  }
}

const generateStaticSummary = (interactionData) => {
  const {
    duration,
    location,
    timestamp,
    participants = ['Self', 'Law Enforcement Officer'],
    keyEvents = ['Initial contact', 'Rights exercised', 'Interaction concluded']
  } = interactionData

  const summaryText = `
**Interaction Summary**

**Date/Time:** ${new Date(timestamp).toLocaleString()}
**Location:** ${location}
**Duration:** ${Math.floor(duration / 60)} minutes ${duration % 60} seconds
**Participants:** ${participants.join(', ')}

**Key Events:**
${keyEvents.map(event => `• ${event}`).join('\n')}

**Summary:** On ${new Date(timestamp).toLocaleDateString()}, I had an interaction with law enforcement at ${location}. The interaction lasted approximately ${Math.floor(duration / 60)} minutes. I exercised my constitutional rights and maintained a respectful demeanor throughout the encounter.

**Rights Exercised:** Right to remain silent, right to refuse consent to searches, right to record the interaction.

This summary was generated for documentation purposes and may be used for legal consultation if needed.`

  return {
    success: true,
    data: {
      summaryText,
      location,
      participants,
      duration,
      keyEvents,
      timestamp,
      shareableLink: `https://justiceguard.app/summary/${Date.now()}`,
      generated: false
    }
  }
}

const generateStaticPhrases = (language) => {
  const phrases = language === 'es' ? {
    language: 'Spanish',
    phrases: `
**Frases Esenciales:**

1. "Estoy ejerciendo mi derecho a permanecer en silencio"
2. "No consiento a ningún registro"
3. "Me gustaría hablar con un abogado"
4. "¿Soy libre de irme?"
5. "Estoy grabando esta interacción para mi seguridad"

**Recuerde:** Manténgase calmado y sea respetuoso mientras ejerce sus derechos.`
  } : {
    language: 'English',
    phrases: `
**Essential Phrases:**

1. "I am exercising my right to remain silent"
2. "I do not consent to any searches"
3. "I would like to speak to a lawyer"
4. "Am I free to go?"
5. "I am recording this interaction for my safety"

**Remember:** Stay calm and respectful while asserting your rights.`
  }

  return {
    success: true,
    data: {
      ...phrases,
      generated: false
    }
  }
}

export default openaiService
