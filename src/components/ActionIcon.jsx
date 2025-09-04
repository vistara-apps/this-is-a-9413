import React from 'react'

const ActionIcon = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  onClick, 
  disabled = false,
  className = '' 
}) => {
  const baseClasses = "inline-flex items-center justify-center font-medium rounded-lg-custom transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
  
  const variants = {
    primary: "bg-primary text-white hover:bg-blue-600 focus:ring-primary",
    secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500",
    destructive: "bg-red-500 text-white hover:bg-red-600 focus:ring-red-500"
  }
  
  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  }
  
  const disabledClasses = disabled 
    ? "opacity-50 cursor-not-allowed" 
    : "cursor-pointer"

  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${disabledClasses} ${className}`}
    >
      {children}
    </button>
  )
}

export default ActionIcon