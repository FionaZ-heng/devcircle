/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useState } from 'react'
import api from '../services/api'
import Navbar from '../components/Navbar'
import SkillCard from '../components/SkillCard'

interface Card {
  _id: string
  offering: string
  wanting: string
  description: string
  tags: string[]
  userId: { _id: string, username: string }
}

export default function Home() {
  const [cards, setCards] = useState<Card[]>([])
  const [search, setSearch] = useState('')

  const fetchCards = async (q = '') => {
    const res = await api.get(`/cards${q ? `?search=${q}` : ''}`)
    setCards(res.data as Card[])
  }

  useEffect(() => { fetchCards() }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-2">Find Your Skill Match</h1>
        <p className="text-center text-gray-500 mb-8">Teach what you know, learn what you want</p>
        <div className="flex gap-2 mb-8">
          <input
            className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Search skills (e.g. React, Docker...)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchCards(search)}
          />
          <button
            onClick={() => fetchCards(search)}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            Search
          </button>
        </div>
        {cards.length === 0 ? (
          <p className="text-center text-gray-400">No cards yet. Be the first to post one!</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.map((card) => <SkillCard key={card._id} card={card} />)}
          </div>
        )}
      </div>
    </div>
  )
}