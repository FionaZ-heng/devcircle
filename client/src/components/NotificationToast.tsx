import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useSocketStore } from '../store/socketStore'
import type { MatchNotification } from '../store/socketStore'

function ToastItem({ notification }: { notification: MatchNotification }) {
  const navigate = useNavigate()
  const { removeToast, removeNotification } = useSocketStore()

  useEffect(() => {
    const timer = setTimeout(() => removeToast(notification.id), 4000)
    return () => clearTimeout(timer)
  }, [notification.id, removeToast])

  const dismiss = () => removeToast(notification.id)

  const goToMatches = () => {
    removeToast(notification.id)
    removeNotification(notification.id)
    navigate('/matches')
  }

  return (
    <div className="flex items-start gap-3 bg-white border border-blue-100 rounded-xl shadow-lg px-4 py-3 w-72">
      <div className="shrink-0 bg-blue-100 rounded-full p-2 mt-0.5">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
        </svg>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-800">New Match Request</p>
        <p className="text-xs text-gray-500 mt-0.5">{notification.message}</p>
        <button onClick={goToMatches} className="text-xs text-blue-500 hover:text-blue-700 font-medium mt-1">
          View →
        </button>
      </div>
      <button onClick={dismiss} className="text-gray-300 hover:text-gray-500 shrink-0 mt-0.5">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}

export default function NotificationToast() {
  const { toasts } = useSocketStore()

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.slice(0, 3).map(n => (
        <ToastItem key={n.id} notification={n} />
      ))}
    </div>
  )
}
