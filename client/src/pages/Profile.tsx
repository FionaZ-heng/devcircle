import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../services/api'
import Navbar from '../components/Navbar'
import { useAuthStore } from '../store/authStore'

interface ProfileData {
  _id: string
  username: string
  avatar: string
  bio: string
  skillsOffered: string[]
  skillsWanted: string[]
  matchCount: number
}

interface Review {
  _id: string
  reviewer: { _id: string; username: string; avatar: string }
  rating: number
  comment: string
  createdAt: string
}

function Stars({ value, size = 'sm' }: { value: number; size?: 'sm' | 'lg' }) {
  const cls = size === 'lg' ? 'text-2xl' : 'text-base'
  return (
    <span className={cls}>
      {[1, 2, 3, 4, 5].map(n => (
        <span key={n} style={{ color: n <= Math.round(value) ? '#f59e0b' : '#d1d5db' }}>★</span>
      ))}
    </span>
  )
}

// inputValue/onInputChange are controlled by the parent so handleSave can
// include any text the user typed but didn't press Enter on yet.
function TagInput({
  label,
  tags,
  inputValue,
  onInputChange,
  onChange,
}: {
  label: string
  tags: string[]
  inputValue: string
  onInputChange: (v: string) => void
  onChange: (tags: string[]) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)

  const add = () => {
    const val = inputValue.trim()
    if (val && !tags.includes(val)) onChange([...tags, val])
    onInputChange('')
  }

  const remove = (tag: string) => onChange(tags.filter(t => t !== tag))

  return (
    <div>
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</p>
      <div
        className="flex flex-wrap gap-2 p-2 border rounded-lg bg-white cursor-text min-h-[42px]"
        onClick={() => inputRef.current?.focus()}
      >
        {tags.map(tag => (
          <span key={tag} className="flex items-center gap-1 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full">
            {tag}
            <button type="button" onClick={() => remove(tag)} className="hover:text-red-500 leading-none">×</button>
          </span>
        ))}
        <input
          ref={inputRef}
          className="flex-1 min-w-[100px] text-sm outline-none bg-transparent"
          placeholder="Type and press Enter…"
          value={inputValue}
          onChange={e => onInputChange(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
          onBlur={add}
        />
      </div>
    </div>
  )
}

// Include any text pending in the TagInput that user hasn't pressed Enter on yet
function withPending(tags: string[], pending: string): string[] {
  const val = pending.trim()
  if (val && !tags.includes(val)) return [...tags, val]
  return tags
}

export default function Profile() {
  const { id } = useParams<{ id: string }>()
  const { user: me } = useAuthStore()
  const navigate = useNavigate()

  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [editing, setEditing] = useState(false)
  const [bio, setBio] = useState('')
  const [skillsOffered, setSkillsOffered] = useState<string[]>([])
  const [skillsWanted, setSkillsWanted] = useState<string[]>([])
  // Controlled input state — owned by parent so handleSave can flush pending text
  const [offeredInput, setOfferedInput] = useState('')
  const [wantedInput, setWantedInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const isOwn = me?.id === id

  useEffect(() => {
    if (!id) return
    api.get(`/users/${id}`)
      .then(res => {
        const data = res.data as ProfileData
        setProfile(data)
        setBio(data.bio || '')
        setSkillsOffered(data.skillsOffered || [])
        setSkillsWanted(data.skillsWanted || [])
      })
      .catch(() => navigate('/'))

    api.get(`/reviews/${id}`)
      .then(res => setReviews(res.data as Review[]))
      .catch(() => {})
  }, [id, navigate])

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : null

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      // Flush any text pending in TagInput that user typed without pressing Enter
      const finalOffered = withPending(skillsOffered, offeredInput)
      const finalWanted = withPending(skillsWanted, wantedInput)

      await api.put('/users/me', { bio, skillsOffered: finalOffered, skillsWanted: finalWanted })

      // Re-fetch from server so display and edit state are always in sync with DB
      const profileRes = await api.get(`/users/${id}`)
      const fresh = profileRes.data as ProfileData
      setProfile(fresh)
      setBio(fresh.bio || '')
      setSkillsOffered(fresh.skillsOffered || [])
      setSkillsWanted(fresh.skillsWanted || [])
      setOfferedInput('')
      setWantedInput('')
      setEditing(false)
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      setError(msg || 'Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (!profile) return
    setBio(profile.bio || '')
    setSkillsOffered(profile.skillsOffered || [])
    setSkillsWanted(profile.skillsWanted || [])
    setOfferedInput('')
    setWantedInput('')
    setEditing(false)
    setError('')
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <p className="text-center mt-20 text-gray-400">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-xl mx-auto px-4 py-10">

        {/* Avatar + name */}
        <div className="flex flex-col items-center mb-8">
          {profile.avatar ? (
            <img src={profile.avatar} alt={profile.username} className="w-24 h-24 rounded-full object-cover shadow-md border-4 border-white" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center text-4xl font-bold text-blue-500 shadow-md border-4 border-white">
              {profile.username[0].toUpperCase()}
            </div>
          )}
          <h1 className="text-2xl font-bold mt-4 text-gray-800">@{profile.username}</h1>
          <p className="text-sm text-gray-400 mt-1">{profile.matchCount} successful match{profile.matchCount !== 1 ? 'es' : ''}</p>
          {avgRating !== null && (
            <div className="flex items-center gap-2 mt-2">
              <Stars value={avgRating} size="lg" />
              <span className="text-sm text-gray-500">{avgRating.toFixed(1)} ({reviews.length} review{reviews.length !== 1 ? 's' : ''})</span>
            </div>
          )}
        </div>

        {/* Profile card */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-6">

          {/* Bio */}
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Bio</p>
            {editing ? (
              <textarea
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                rows={3}
                maxLength={300}
                placeholder="Tell people about yourself…"
                value={bio}
                onChange={e => setBio(e.target.value)}
              />
            ) : (
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {profile.bio || <span className="text-gray-400 italic">No bio yet.</span>}
              </p>
            )}
          </div>

          {/* Skills Offered */}
          {editing ? (
            <TagInput
              label="Skills I Offer"
              tags={skillsOffered}
              inputValue={offeredInput}
              onInputChange={setOfferedInput}
              onChange={setSkillsOffered}
            />
          ) : (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Skills I Offer</p>
              <div className="flex flex-wrap gap-2">
                {profile.skillsOffered.length > 0
                  ? profile.skillsOffered.map(s => (
                    <span key={s} className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full">{s}</span>
                  ))
                  : <span className="text-gray-400 text-sm italic">None listed</span>
                }
              </div>
            </div>
          )}

          {/* Skills Wanted */}
          {editing ? (
            <TagInput
              label="Skills I Want to Learn"
              tags={skillsWanted}
              inputValue={wantedInput}
              onInputChange={setWantedInput}
              onChange={setSkillsWanted}
            />
          ) : (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Skills I Want to Learn</p>
              <div className="flex flex-wrap gap-2">
                {profile.skillsWanted.length > 0
                  ? profile.skillsWanted.map(s => (
                    <span key={s} className="bg-purple-100 text-purple-700 text-xs px-3 py-1 rounded-full">{s}</span>
                  ))
                  : <span className="text-gray-400 text-sm italic">None listed</span>
                }
              </div>
            </div>
          )}

          {/* Actions */}
          {isOwn && (
            <div className="pt-2">
              {error && <p className="text-sm text-red-500 mb-3">{error}</p>}
              {editing ? (
                <div className="flex gap-3">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 bg-blue-500 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-600 disabled:opacity-50"
                  >
                    {saving ? 'Saving…' : 'Save Changes'}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex-1 bg-gray-100 text-gray-600 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200"
                >
                  Edit Profile
                </button>
              )}
            </div>
          )}
        </div>

        {/* Reviews */}
        <div className="mt-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">
            Reviews {reviews.length > 0 && <span className="text-gray-400 font-normal text-sm">({reviews.length})</span>}
          </h2>
          {reviews.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-6 bg-white rounded-2xl border shadow-sm">No reviews yet.</p>
          ) : (
            <div className="space-y-3">
              {reviews.map(r => (
                <div key={r._id} className="bg-white rounded-2xl border shadow-sm p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {r.reviewer.avatar ? (
                        <img src={r.reviewer.avatar} alt={r.reviewer.username} className="w-7 h-7 rounded-full object-cover" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-500">
                          {r.reviewer.username[0].toUpperCase()}
                        </div>
                      )}
                      <span className="text-sm font-medium text-gray-700">@{r.reviewer.username}</span>
                    </div>
                    <Stars value={r.rating} />
                  </div>
                  {r.comment && <p className="text-sm text-gray-600">{r.comment}</p>}
                  <p className="text-xs text-gray-300 mt-2">{new Date(r.createdAt).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
