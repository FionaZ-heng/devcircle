import { create } from 'zustand'

interface User {
  id: string
  username: string
  email: string
  avatar?: string
}

interface AuthStore {
  user: User | null
  token: string | null
  login: (user: User, token: string) => void
  logout: () => void
  setUser: (updater: (prev: User) => User) => void
}

const savedUser = localStorage.getItem('user')

export const useAuthStore = create<AuthStore>((set) => ({
  user: savedUser ? JSON.parse(savedUser) : null,
  token: localStorage.getItem('token'),
  login: (user, token) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    set({ user, token })
  },
  logout: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    set({ user: null, token: null })
  },
  setUser: (updater) =>
    set((state) => {
      if (!state.user) return {}
      const updated = updater(state.user)
      localStorage.setItem('user', JSON.stringify(updated))
      return { user: updated }
    }),
}))