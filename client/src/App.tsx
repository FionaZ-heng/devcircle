import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import CreateCard from './pages/CreateCard'
import Matches from './pages/Matches'
import Chat from './pages/Chat'
import Dashboard from './pages/Dashboard'
import NotificationToast from './components/NotificationToast'
import { useAuthStore } from './store/authStore'
import { useSocketStore } from './store/socketStore'

function AppInner() {
  const { token } = useAuthStore()
  const { connect, disconnect } = useSocketStore()

  useEffect(() => {
    if (token) {
      connect(token)
    } else {
      disconnect()
    }
  }, [token, connect, disconnect])

  return (
    <>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/create" element={<CreateCard />} />
        <Route path="/matches" element={<Matches />} />
        <Route path="/chat/:matchId" element={<Chat />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
      <NotificationToast />
    </>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  )
}

export default App