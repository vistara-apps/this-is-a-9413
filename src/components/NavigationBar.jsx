import React from 'react'
import { Shield, Home, FileText, MapPin, Video, User } from 'lucide-react'

const NavigationBar = ({ currentView, onNavigate }) => {
  const navItems = [
    { id: 'dashboard', icon: Home, label: 'Home' },
    { id: 'rights', icon: Shield, label: 'Rights' },
    { id: 'location', icon: MapPin, label: 'Location' },
    { id: 'record', icon: Video, label: 'Record' },
    { id: 'summary', icon: FileText, label: 'Summary' }
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-surface border-t border-gray-200 z-50">
      <div className="flex justify-around items-center py-2">
        {navItems.map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => onNavigate(id)}
            className={`flex flex-col items-center py-2 px-3 rounded-lg transition-colors duration-200 ${
              currentView === id
                ? 'text-primary bg-blue-50'
                : 'text-gray-600 hover:text-primary hover:bg-gray-50'
            }`}
          >
            <Icon size={20} />
            <span className="text-xs mt-1 font-medium">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}

export default NavigationBar