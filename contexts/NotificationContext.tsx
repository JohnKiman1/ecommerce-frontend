'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'
import type { Notification } from '@/types'

interface NotificationContextType {
  notifications: Notification[]
  addNotification: (message: string, type?: 'success' | 'error' | 'info' | 'warning', duration?: number) => void
  removeNotification: (id: string) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = (
    message: string,
    type: 'success' | 'error' | 'info' | 'warning' = 'info',
    duration: number = 3000
  ) => {
    const id = Math.random().toString(36).substr(2, 9)
    const notification: Notification = {
      id,
      type,
      message,
      duration,
    }

    setNotifications((prev) => [...prev, notification])

    if (duration) {
      setTimeout(() => {
        removeNotification(id)
      }, duration)
    }
  }

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id))
  }

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotification() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider')
  }
  return context
}
