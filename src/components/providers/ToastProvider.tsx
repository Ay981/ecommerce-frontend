'use client'

import React, { createContext, useContext, useCallback, useState, useEffect } from 'react'

type Toast = {
  id: string
  title?: string
  message: string
  variant?: 'success' | 'error' | 'info'
  duration?: number
}

type ToastContextValue = {
  addToast: (t: Omit<Toast, 'id'>) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((t: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).slice(2)
    const toast: Toast = { id, duration: 2200, variant: 'success', ...t }
    setToasts((prev) => [...prev, toast])
    // auto remove
    const timeout = setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== id))
    }, toast.duration)
    // clear on unmount
    return () => clearTimeout(timeout)
  }, [])

  // Accessibility: announce changes
  useEffect(() => {
    if (toasts.length === 0) return
    // no-op for SSR safety
  }, [toasts])

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      {/* Container */}
      <div className="pointer-events-none fixed top-4 right-4 z-[100] flex max-h-[100svh] w-full max-w-sm flex-col gap-3">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={
              'pointer-events-auto rounded-lg border p-4 shadow-lg backdrop-blur-sm transition-all ' +
              (t.variant === 'error'
                ? 'border-red-300 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950/70 dark:text-red-100'
                : t.variant === 'info'
                ? 'border-blue-300 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950/70 dark:text-blue-100'
                : 'border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-100')
            }
          >
            {t.title && <div className="font-semibold mb-1">{t.title}</div>}
            <div className="text-sm leading-relaxed">{t.message}</div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
