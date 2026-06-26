'use client'

import { useNotification } from '@/contexts/NotificationContext'
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from 'lucide-react'

export function NotificationToast() {
  const { notifications, removeNotification } = useNotification()

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5" />
      case 'error':
        return <AlertCircle className="h-5 w-5" />
      case 'warning':
        return <AlertTriangle className="h-5 w-5" />
      case 'info':
      default:
        return <Info className="h-5 w-5" />
    }
  }

  const getColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 text-green-900 border-green-200'
      case 'error':
        return 'bg-red-50 text-red-900 border-red-200'
      case 'warning':
        return 'bg-yellow-50 text-yellow-900 border-yellow-200'
      case 'info':
      default:
        return 'bg-primary/10 text-blue-900 border-blue-200'
    }
  }

  const getIconColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-green-600'
      case 'error':
        return 'text-red-600'
      case 'warning':
        return 'text-yellow-600'
      case 'info':
      default:
        return 'text-primary'
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 pointer-events-none">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`pointer-events-auto flex items-center gap-3 p-4 rounded-lg border ${getColor(notification.type)} animate-in slide-in-from-top-2 fade-in`}
        >
          <div className={getIconColor(notification.type)}>{getIcon(notification.type)}</div>
          <p className="text-sm font-medium flex-1">{notification.message}</p>
          <button
            onClick={() => removeNotification(notification.id)}
            className="ml-2 text-current opacity-70 hover:opacity-100 transition-opacity"
            aria-label="Close notification"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
