/* eslint-disable @typescript-eslint/no-explicit-any */
import { useAuthStore } from '../store/authStore'
import api from '../services/api'
import { useState } from 'react'

interface Props {
  card: {
    _id: string
    offering: string
    wanting: string
    description: string
    tags: string[]
    userId: { _id: string, username: string }
  }
}

export default function SkillCard({ card }: Props) {
  const { user } = useAuthStore()
  const [requested, setRequested] = useState(false)
  const [msg, setMsg] = useState('')

  const handleMatch = async () => {
    try {
      await api.post('/matches', { receiverId: card.userId._id })
      setRequested(true)
      setMsg('Match requested!')
    } catch (err: any) {
      setMsg(err.response?.data?.message || 'Error')
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border p-5 hover:shadow-md transition">
      <div className="flex justify-between items-start mb-3">
        <span className="text-xs text-gray-400">@{card.userId?.username}</span>
      </div>
      <div className="mb-3">
        <span className="text-xs font-semibold text-green-600 uppercase">Offering</span>
        <p className="font-semibold text-gray-800">{card.offering}</p>
      </div>
      <div className="mb-3">
        <span className="text-xs font-semibold text-blue-600 uppercase">Wanting</span>
        <p className="font-semibold text-gray-800">{card.wanting}</p>
      </div>
      {card.description && <p className="text-gray-500 text-sm mb-3">{card.description}</p>}
      <div className="flex flex-wrap gap-2 mb-4">
        {card.tags.map((tag, i) => (
          <span key={i} className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">{tag}</span>
        ))}
      </div>
      {user && user.id !== card.userId?._id && (
        <div>
          <button
            onClick={handleMatch}
            disabled={requested}
            className={`w-full py-2 rounded-lg text-sm font-semibold transition ${
              requested
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {requested ? '✓ Requested' : 'Request Match'}
          </button>
          {msg && <p className="text-xs text-center mt-1 text-green-500">{msg}</p>}
        </div>
      )}
    </div>
  )
}