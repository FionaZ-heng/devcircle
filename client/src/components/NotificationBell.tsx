import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSocketStore } from '../store/socketStore'

export default function NotificationBell() {
  const { notifications, removeNotification } = useSocketStore()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleClick = (notif: { id: string }) => {
    removeNotification(notif.id)
    setOpen(false)
    navigate('/matches')
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(prev => !prev)}
        className="relative p-1 text-gray-600 hover:text-blue-500 transition-colors"
        aria-label="Notifications"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {notifications.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-bold">
            {notifications.length > 9 ? '9+' : notifications.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-9 w-72 bg-white rounded-xl shadow-lg border z-50 overflow-hidden">
          <div className="px-4 py-2 border-b flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-700">Notifications</span>
            {notifications.length > 0 && (
              <button
                onClick={() => notifications.forEach(n => removeNotification(n.id))}
                className="text-xs text-gray-400 hover:text-red-400"
              >
                Clear all
              </button>
            )}
          </div>
          {notifications.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-6">No new notifications</p>
          ) : (
            <ul>
              {notifications.map(n => (
                <li key={n.id}>
                  <button
                    onClick={() => handleClick(n)}
                    className="w-full text-left px-4 py-3 hover:bg-blue-50 transition-colors border-b last:border-b-0"
                  >
                    <p className="text-sm text-gray-800 font-medium">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {n.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
