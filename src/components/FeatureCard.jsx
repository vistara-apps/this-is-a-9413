import React from 'react'
import { Crown } from 'lucide-react'

const FeatureCard = ({ 
  title, 
  description, 
  icon: Icon, 
  color = 'bg-blue-500', 
  isPremium = false, 
  onClick,
  variant = 'detailed' 
}) => {
  return (
    <div 
      onClick={onClick}
      className={`
        bg-surface rounded-lg-custom p-4 shadow-card cursor-pointer transition-all duration-200 
        hover:shadow-lg hover:scale-105 border border-transparent hover:border-gray-200
        ${variant === 'compact' ? 'p-3' : 'p-4'}
      `}
    >
      <div className="flex items-start justify-between mb-3">
        <div className={`${color} rounded-md-custom p-2 flex-shrink-0`}>
          <Icon className="text-white" size={variant === 'compact' ? 20 : 24} />
        </div>
        {isPremium && (
          <Crown className="text-yellow-500" size={16} />
        )}
      </div>
      
      <h3 className={`font-semibold text-gray-900 mb-2 ${variant === 'compact' ? 'text-sm' : 'text-base'}`}>
        {title}
      </h3>
      
      <p className={`text-gray-600 ${variant === 'compact' ? 'text-xs' : 'text-sm'} leading-relaxed`}>
        {description}
      </p>
      
      {isPremium && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <span className="text-xs text-yellow-600 font-medium">Premium Feature</span>
        </div>
      )}
    </div>
  )
}

export default FeatureCard