import React, { useState } from 'react'
import { ArrowLeft, Shield, AlertCircle, Phone, Languages } from 'lucide-react'
import ActionIcon from './ActionIcon'

const EmergencyRightsCard = ({ onBack }) => {
  const [language, setLanguage] = useState('en')

  const rightsContent = {
    en: {
      title: "Your Constitutional Rights",
      subtitle: "Know these rights during any law enforcement encounter",
      rights: [
        {
          title: "Right to Remain Silent",
          content: "You are not required to answer questions beyond providing identification when legally requested."
        },
        {
          title: "Right to an Attorney",
          content: "You can request a lawyer at any time. All questioning should stop until your attorney is present."
        },
        {
          title: "Right to Refuse Searches",
          content: "You can refuse consent to search your person, vehicle, or property unless they have a warrant."
        },
        {
          title: "Right to Record",
          content: "You have the right to record police interactions in public spaces as long as you don't interfere."
        }
      ],
      dos: [
        "Stay calm and keep your hands visible",
        "Clearly state: 'I am exercising my right to remain silent'",
        "Ask: 'Am I free to leave?' If yes, calmly walk away",
        "Remember details: officer badge numbers, patrol car numbers",
        "Call your emergency contacts when safe to do so"
      ],
      donts: [
        "Don't run, resist, or make sudden movements",
        "Don't argue, even if you believe the stop is unfair",
        "Don't consent to searches",
        "Don't lie or provide false information",
        "Don't reach for anything without permission"
      ],
      phrases: [
        "I am exercising my right to remain silent",
        "I do not consent to any searches",
        "I want to speak to a lawyer",
        "Am I free to leave?",
        "I do not answer questions without my attorney present"
      ]
    },
    es: {
      title: "Sus Derechos Constitucionales",
      subtitle: "Conozca estos derechos durante cualquier encuentro con la policía",
      rights: [
        {
          title: "Derecho a Permanecer en Silencio",
          content: "No está obligado a responder preguntas más allá de proporcionar identificación cuando se solicite legalmente."
        },
        {
          title: "Derecho a un Abogado",
          content: "Puede solicitar un abogado en cualquier momento. Todo interrogatorio debe detenerse hasta que esté presente su abogado."
        },
        {
          title: "Derecho a Rechazar Registros",
          content: "Puede negarse a dar consentimiento para registrar su persona, vehículo o propiedad a menos que tengan una orden judicial."
        },
        {
          title: "Derecho a Grabar",
          content: "Tiene derecho a grabar interacciones policiales en espacios públicos siempre que no interfiera."
        }
      ],
      dos: [
        "Mantenga la calma y mantenga las manos visibles",
        "Declare claramente: 'Estoy ejerciendo mi derecho a permanecer en silencio'",
        "Pregunte: '¿Soy libre de irme?' Si es así, váyase con calma",
        "Recuerde detalles: números de placa del oficial, números de patrulla",
        "Llame a sus contactos de emergencia cuando sea seguro hacerlo"
      ],
      donts: [
        "No corra, resista o haga movimientos bruscos",
        "No discuta, incluso si cree que la parada es injusta",
        "No consienta registros",
        "No mienta ni proporcione información falsa",
        "No alcance nada sin permiso"
      ],
      phrases: [
        "Estoy ejerciendo mi derecho a permanecer en silencio",
        "No consiento ningún registro",
        "Quiero hablar con un abogado",
        "¿Soy libre de irme?",
        "No respondo preguntas sin mi abogado presente"
      ]
    }
  }

  const content = rightsContent[language]

  return (
    <div className="max-w-4xl mx-auto px-5 py-6">
      {/* Header */}
      <div className="flex items-center mb-6">
        <ActionIcon variant="secondary" onClick={onBack} className="mr-4">
          <ArrowLeft size={20} />
        </ActionIcon>
        <div className="flex-1">
          <h1 className="text-2xl font-semibold text-gray-900">{content.title}</h1>
          <p className="text-gray-600">{content.subtitle}</p>
        </div>
        <button
          onClick={() => setLanguage(language === 'en' ? 'es' : 'en')}
          className="flex items-center px-3 py-2 bg-gray-100 rounded-lg-custom text-sm font-medium text-gray-700 hover:bg-gray-200 transition-colors"
        >
          <Languages size={16} className="mr-2" />
          {language === 'en' ? 'ES' : 'EN'}
        </button>
      </div>

      {/* Emergency Alert */}
      <div className="bg-red-50 border border-red-200 rounded-lg-custom p-4 mb-6">
        <div className="flex items-center mb-2">
          <AlertCircle className="text-red-500 mr-2" size={20} />
          <span className="font-semibold text-red-800">Emergency?</span>
        </div>
        <p className="text-red-700 text-sm mb-3">
          If you feel unsafe or need immediate help, call 911 or your local emergency number.
        </p>
        <ActionIcon variant="destructive" className="text-sm">
          <Phone size={16} className="mr-2" />
          Call 911
        </ActionIcon>
      </div>

      {/* Constitutional Rights */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <Shield className="text-primary mr-2" size={24} />
          Your Rights
        </h2>
        <div className="space-y-4">
          {content.rights.map((right, index) => (
            <div key={index} className="bg-surface rounded-lg-custom p-4 shadow-card">
              <h3 className="font-semibold text-gray-900 mb-2">{right.title}</h3>
              <p className="text-gray-700 text-sm">{right.content}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Do's and Don'ts */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Do's */}
        <div>
          <h3 className="text-lg font-semibold text-green-800 mb-4">✓ DO</h3>
          <div className="space-y-3">
            {content.dos.map((item, index) => (
              <div key={index} className="bg-green-50 border border-green-200 rounded-md-custom p-3">
                <p className="text-green-800 text-sm">{item}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Don'ts */}
        <div>
          <h3 className="text-lg font-semibold text-red-800 mb-4">✗ DON'T</h3>
          <div className="space-y-3">
            {content.donts.map((item, index) => (
              <div key={index} className="bg-red-50 border border-red-200 rounded-md-custom p-3">
                <p className="text-red-800 text-sm">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Key Phrases */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Phrases to Remember</h3>
        <div className="space-y-3">
          {content.phrases.map((phrase, index) => (
            <div key={index} className="bg-blue-50 border border-blue-200 rounded-md-custom p-3">
              <p className="text-blue-800 font-medium text-sm">"{phrase}"</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Note */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg-custom">
        <p className="text-xs text-gray-600 text-center">
          This information is for educational purposes only and does not constitute legal advice. 
          Laws may vary by jurisdiction. Consult with a qualified attorney for specific legal guidance.
        </p>
      </div>
    </div>
  )
}

export default EmergencyRightsCard