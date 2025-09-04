import React, { useState } from 'react'
import NavigationBar from './components/NavigationBar'
import Dashboard from './components/Dashboard'
import EmergencyRightsCard from './components/EmergencyRightsCard'
import LocationInsights from './components/LocationInsights'
import RecordAlert from './components/RecordAlert'
import InteractionSummary from './components/InteractionSummary'
import PremiumModal from './components/PremiumModal'
import { AuthProvider } from './hooks/useAuth'
import { UserProvider } from './context/UserContext'

function App() {
  const [currentView, setCurrentView] = useState('dashboard')
  const [showPremiumModal, setShowPremiumModal] = useState(false)

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard onNavigate={setCurrentView} onShowPremium={() => setShowPremiumModal(true)} />
      case 'rights':
        return <EmergencyRightsCard onBack={() => setCurrentView('dashboard')} />
      case 'location':
        return <LocationInsights onBack={() => setCurrentView('dashboard')} onShowPremium={() => setShowPremiumModal(true)} />
      case 'record':
        return <RecordAlert onBack={() => setCurrentView('dashboard')} onShowPremium={() => setShowPremiumModal(true)} />
      case 'summary':
        return <InteractionSummary onBack={() => setCurrentView('dashboard')} onShowPremium={() => setShowPremiumModal(true)} />
      default:
        return <Dashboard onNavigate={setCurrentView} onShowPremium={() => setShowPremiumModal(true)} />
    }
  }

  return (
    <AuthProvider>
      <UserProvider>
        <div className="min-h-screen bg-bg">
          <NavigationBar currentView={currentView} onNavigate={setCurrentView} />
          <main className="pb-20">
            {renderCurrentView()}
          </main>
          {showPremiumModal && (
            <PremiumModal onClose={() => setShowPremiumModal(false)} />
          )}
        </div>
      </UserProvider>
    </AuthProvider>
  )
}

export default App
