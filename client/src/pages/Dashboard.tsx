import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, ResponsiveContainer, CartesianGrid } from 'recharts'
import api from '../services/api'
import Navbar from '../components/Navbar'
import AvatarUpload from '../components/AvatarUpload'
import { useAuthStore } from '../store/authStore'

interface Stats {
  totalMatches: number
  totalCards: number
  totalMessages: number
  dailyMessages: { _id: string, count: number }[]
  trendingTags: { tag: string, count: number }[]
}

export default function Dashboard() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    if (!user) { navigate('/login'); return }
    api.get('/stats/me').then(res => setStats(res.data as Stats))
  }, [user, navigate])

  if (!stats) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <p className="text-center mt-20 text-gray-400">Loading...</p>
    </div>
  )

  const lineData = stats.dailyMessages.map(d => ({ date: d._id, messages: d.count }))

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">My Dashboard 📊</h1>

        {/* 用户信息 + 头像 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border mb-8 flex items-center gap-6">
          <AvatarUpload
            currentAvatar={user?.avatar}
            username={user?.username}
          />
          <div>
            <p className="text-xl font-semibold">{user?.username}</p>
            <p className="text-gray-400 text-sm">{user?.email}</p>
            <p className="text-gray-400 text-xs mt-1">Click avatar to change photo</p>
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border text-center">
            <p className="text-3xl font-bold text-blue-500">{stats.totalMatches}</p>
            <p className="text-gray-500 text-sm mt-1">Total Matches</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border text-center">
            <p className="text-3xl font-bold text-green-500">{stats.totalCards}</p>
            <p className="text-gray-500 text-sm mt-1">Cards Posted</p>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border text-center">
            <p className="text-3xl font-bold text-purple-500">{stats.totalMessages}</p>
            <p className="text-gray-500 text-sm mt-1">Messages Sent</p>
          </div>
        </div>

        {/* 折线图 - 每日消息 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border mb-6">
          <h2 className="font-semibold text-gray-700 mb-4">Messages This Week</h2>
          {lineData.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No messages this week yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="messages" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* 柱状图 - 热门技能标签 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border">
          <h2 className="font-semibold text-gray-700 mb-4">Trending Skill Tags</h2>
          {stats.trendingTags.length === 0 ? (
            <p className="text-gray-400 text-sm text-center py-8">No tags yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={stats.trendingTags}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="tag" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}