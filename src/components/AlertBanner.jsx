import React from 'react'
import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react'

const AlertBanner = ({ 
  variant = 'info', 
  title, 
  message, 
  className = '' 
}) => {
  const variants = {
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: Info,
      iconColor: 'text-blue-500',
      titleColor: 'text-blue-800',
      messageColor: 'text-blue-700'
    },
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: CheckCircle,
      iconColor: 'text-green-500',
      titleColor: 'text-green-800',
      messageColor: 'text-green-700'
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: AlertTriangle,
      iconColor: 'text-yellow-500',
      titleColor: 'text-yellow-800',
      messageColor: 'text-yellow-700'
    }
  }

  const config = variants[variant]
  const Icon = config.icon

  return (
    <div className={`${config.bg} ${config.border} border rounded-lg-custom p-4 ${className}`}>
      <div className="flex items-start">
        <Icon className={`${config.iconColor} mr-3 flex-shrink-0`} size={20} />
        <div className="flex-1">
          {title && (
            <h4 className={`${config.titleColor} font-semibold mb-1`}>{title}</h4>
          )}
          <p className={`${config.messageColor} text-sm`}>{message}</p>
        </div>
      </div>
    </div>
  )
}

export default AlertBanner