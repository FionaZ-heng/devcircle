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

interface RateTarget {
  matchId: string
  revieweeId: string
  revieweeName: string
}

function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          className="text-3xl leading-none transition-colors"
          style={{ color: n <= (hovered || value) ? '#f59e0b' : '#d1d5db' }}
        >
          ★
        </button>
      ))}
    </div>
  )
}

function RateModal({
  target,
  onClose,
  onSubmitted,
}: {
  target: RateTarget
  onClose: () => void
  onSubmitted: (matchId: string) => void
}) {
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (rating === 0) { setError('Please select a rating.'); return }
    setSubmitting(true)
    setError('')
    try {
      await api.post('/reviews', { revieweeId: target.revieweeId, matchId: target.matchId, rating, comment })
      onSubmitted(target.matchId)
      onClose()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg || 'Failed to submit. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4">
        <h2 className="text-lg font-bold text-gray-800 mb-1">Rate @{target.revieweeName}</h2>
        <p className="text-sm text-gray-400 mb-5">How was your collaboration?</p>

        <div className="mb-4">
          <StarPicker value={rating} onChange={setRating} />
          {rating > 0 && (
            <p className="text-xs text-gray-400 mt-1">
              {['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent!'][rating]}
            </p>
          )}
        </div>

        <textarea
          className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none mb-4"
          rows={3}
          maxLength={500}
          placeholder="Leave a comment (optional)…"
          value={comment}
          onChange={e => setComment(e.target.value)}
        />

        {error && <p className="text-sm text-red-500 mb-3">{error}</p>}

        <div className="flex gap-3">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex-1 bg-blue-500 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-600 disabled:opacity-50"
          >
            {submitting ? 'Submitting…' : 'Submit Rating'}
          </button>
          <button
            onClick={onClose}
            className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Matches() {
  const { user } = useAuthStore()
  const [matches, setMatches] = useState<Match[]>([])
  const [reviewedMatchIds, setReviewedMatchIds] = useState<Set<string>>(new Set())
  const [rateTarget, setRateTarget] = useState<RateTarget | null>(null)

  const fetchMatches = async () => {
    const res = await api.get('/matches')
    setMatches(res.data as Match[])
  }

  useEffect(() => {
    fetchMatches()
    api.get('/reviews/given').then(res => {
      const ids = (res.data as { matchId: string }[]).map(r => r.matchId)
      setReviewedMatchIds(new Set(ids))
    })
  }, [])

  const respond = async (id: string, status: string) => {
    await api.put(`/matches/${id}`, { status })
    fetchMatches()
  }

  const openRate = (match: Match) => {
    if (!user) return
    const other = match.requester._id === user.id ? match.receiver : match.requester
    setRateTarget({ matchId: match._id, revieweeId: other._id, revieweeName: other.username })
  }

  const onReviewSubmitted = (matchId: string) => {
    setReviewedMatchIds(prev => new Set([...prev, matchId]))
  }

  const pending = matches.filter(m => m.status === 'pending' && m.receiver._id === user?.id)
  const matched = matches.filter(m => m.status === 'matched')

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      {rateTarget && (
        <RateModal
          target={rateTarget}
          onClose={() => setRateTarget(null)}
          onSubmitted={onReviewSubmitted}
        />
      )}
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
                const alreadyReviewed = reviewedMatchIds.has(m._id)
                return (
                  <div key={m._id} className="bg-white rounded-xl p-4 shadow-sm border flex justify-between items-center">
                    <span className="font-medium">@{other.username}</span>
                    <div className="flex gap-2">
                      {alreadyReviewed ? (
                        <span className="text-xs text-gray-400 px-3 py-1">Rated ★</span>
                      ) : (
                        <button
                          onClick={() => openRate(m)}
                          className="bg-amber-100 text-amber-600 px-3 py-1 rounded-lg text-sm hover:bg-amber-200 font-medium"
                        >
                          Rate
                        </button>
                      )}
                      <Link to={`/chat/${m._id}`} className="bg-green-500 text-white px-3 py-1 rounded-lg text-sm hover:bg-green-600">
                        Chat 💬
                      </Link>
                    </div>
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
