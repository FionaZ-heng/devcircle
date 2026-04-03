/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react'
import api from '../services/api'
import Navbar from '../components/Navbar'
import { useAuthStore } from '../store/authStore'
import { Link } from 'react-router-dom'

interface Match {
  _id: string
  requester: { _id: string, username: string }
  receiver: { _id: string, username: string }
  status: string
  createdAt: string
}

export default function Matches() {
  const { user } = useAuthStore()
  const [matches, setMatches] = useState<Match[]>([])

  const fetchMatches = async () => {
    const res = await api.get('/matches')
    setMatches(res.data as Match[])
  }

  useEffect(() => { fetchMatches() }, [])

  const respond = async (id: string, status: string) => {
    await api.put(`/matches/${id}`, { status })
    fetchMatches()
  }

  const pending = matches.filter(m => m.status === 'pending' && m.receiver._id === user?.id)
  const matched = matches.filter(m => m.status === 'matched')

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">My Matches</h1>

        {pending.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-3 text-orange-500">Pending Requests</h2>
            <div className="space-y-3">
              {pending.map(m => (
                <div key={m._id} className="bg-white rounded-xl p-4 shadow-sm border flex justify-between items-center">
                  <span className="font-medium">@{m.requester.username} wants to match with you</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => respond(m._id, 'matched')}
                      className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-600"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => respond(m._id, 'rejected')}
                      className="bg-red-100 text-red-500 px-3 py-1 rounded-lg text-sm hover:bg-red-200"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {matched.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-3 text-green-500">Matched ✓</h2>
            <div className="space-y-3">
              {matched.map(m => {
                const other = m.requester._id === user?.id ? m.receiver : m.requester
                return (
                  <div key={m._id} className="bg-white rounded-xl p-4 shadow-sm border flex justify-between items-center">
                    <span className="font-medium">@{other.username}</span>
                    <Link to={`/chat/${m._id}`} className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-600">
                    Chat 💬
                    </Link>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {matches.length === 0 && (
          <p className="text-center text-gray-400">No matches yet. Browse cards and send requests!</p>
        )}
      </div>
    </div>
  )
}