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

function TagInput({
  label,
  tags,
  onChange,
}: {
  label: string
  tags: string[]
  onChange: (tags: string[]) => void
}) {
  const [input, setInput] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const add = () => {
    const val = input.trim()
    if (val && !tags.includes(val)) onChange([...tags, val])
    setInput('')
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
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); add() } }}
        />
      </div>
    </div>
  )
}

export default function Profile() {
  const { id } = useParams<{ id: string }>()
  const { user: me, setUser } = useAuthStore()
  const navigate = useNavigate()

  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [editing, setEditing] = useState(false)
  const [bio, setBio] = useState('')
  const [skillsOffered, setSkillsOffered] = useState<string[]>([])
  const [skillsWanted, setSkillsWanted] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const isOwn = me?.id === id

  useEffect(() => {
    if (!id) return
    api.get(`/users/${id}`)
      .then(res => {
        const data = res.data as ProfileData
        setProfile(data)
        setBio(data.bio)
        setSkillsOffered(data.skillsOffered)
        setSkillsWanted(data.skillsWanted)
      })
      .catch(() => navigate('/'))
  }, [id, navigate])

  const handleSave = async () => {
    setSaving(true)
    setError('')
    try {
      const res = await api.put('/users/me', { bio, skillsOffered, skillsWanted })
      const updated = res.data as ProfileData
      setProfile(prev => prev ? { ...prev, bio: updated.bio, skillsOffered: updated.skillsOffered, skillsWanted: updated.skillsWanted } : prev)
      // Sync authStore so Navbar avatar etc stay fresh
      setUser(prev => ({ ...prev, ...updated, id: prev.id }))
      setEditing(false)
    } catch {
      setError('Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (!profile) return
    setBio(profile.bio)
    setSkillsOffered(profile.skillsOffered)
    setSkillsWanted(profile.skillsWanted)
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
            <TagInput label="Skills I Offer" tags={skillsOffered} onChange={setSkillsOffered} />
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
            <TagInput label="Skills I Want to Learn" tags={skillsWanted} onChange={setSkillsWanted} />
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
      </div>
    </div>
  )
}
