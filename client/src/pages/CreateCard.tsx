/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import Navbar from '../components/Navbar'

export default function CreateCard() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ offering: '', wanting: '', description: '', tags: '' })
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      await api.post('/cards', {
        ...form,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean)
      })
      navigate('/')
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create card')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-lg mx-auto px-4 py-10">
        <div className="bg-white p-8 rounded-2xl shadow-md">
          <h1 className="text-2xl font-bold mb-6">Post a Skill Card</h1>
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-600">I can teach...</label>
              <input
                className="w-full border rounded-lg px-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="e.g. React, Python, Guitar"
                value={form.offering}
                onChange={(e) => setForm({ ...form, offering: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">I want to learn...</label>
              <input
                className="w-full border rounded-lg px-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="e.g. Docker, Spanish, Piano"
                value={form.wanting}
                onChange={(e) => setForm({ ...form, wanting: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">Description (optional)</label>
              <textarea
                className="w-full border rounded-lg px-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                rows={3}
                placeholder="Tell people a bit more about yourself..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-600">Tags (comma separated)</label>
              <input
                className="w-full border rounded-lg px-4 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-400"
                placeholder="e.g. frontend, beginner, web"
                value={form.tags}
                onChange={(e) => setForm({ ...form, tags: e.target.value })}
              />
            </div>
            <button className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 font-semibold">
              Post Card
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}