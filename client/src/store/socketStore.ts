import { create } from 'zustand'
import { io, Socket } from 'socket.io-client'

export interface MatchNotification {
  id: string
  matchId: string
  requesterName: string
  message: string
  timestamp: Date
}

interface SocketStore {
  socket: Socket | null
  notifications: MatchNotification[]  // persistent bell notifications
  toasts: MatchNotification[]          // ephemeral toast pop-ups
  connect: (token: string) => void
  disconnect: () => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
  removeToast: (id: string) => void
}

const SOCKET_URL = 'https://devcircle-production.up.railway.app'

export const useSocketStore = create<SocketStore>((set, get) => ({
  socket: null,
  notifications: [],
  toasts: [],

  connect: (token: string) => {
    const existing = get().socket
    if (existing?.connected) return

    const socket = io(SOCKET_URL, { auth: { token } })

    socket.on('match_request', (data: { matchId: string; requesterName: string; message: string }) => {
      const notification: MatchNotification = {
        id: `${Date.now()}-${Math.random()}`,
        matchId: data.matchId,
        requesterName: data.requesterName,
        message: data.message,
        timestamp: new Date(),
      }
      set(state => ({
        notifications: [notification, ...state.notifications],
        toasts: [notification, ...state.toasts],
      }))
    })

    set({ socket })
  },

  disconnect: () => {
    get().socket?.disconnect()
    set({ socket: null, notifications: [], toasts: [] })
  },

  removeNotification: (id: string) => {
    set(state => ({ notifications: state.notifications.filter(n => n.id !== id) }))
  },

  clearNotifications: () => set({ notifications: [] }),

  removeToast: (id: string) => {
    set(state => ({ toasts: state.toasts.filter(n => n.id !== id) }))
  },
}))
