/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useState } from 'react'
import api from '../services/api'
import { useAuthStore } from '../store/authStore'

interface Props {
  currentAvatar?: string
  username?: string
}

export default function AvatarUpload({ currentAvatar, username }: Props) {
  const [preview, setPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const setUser = useAuthStore((s) => s.setUser)

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPreview(URL.createObjectURL(file))
  }

  const handleUpload = async () => {
    const file = fileRef.current?.files?.[0]
    if (!file) return
    setLoading(true)
    setError('')
    try {
      const form = new FormData()
      form.append('avatar', file)
      const res = await api.post('/upload/avatar', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setUser((prev: any) => ({ ...prev, avatar: res.data.avatar }))
      setPreview(null)
    } catch {
      setError('Upload failed, please try again')
    } finally {
      setLoading(false)
    }
  }

  const avatarSrc = preview || currentAvatar

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="w-24 h-24 rounded-full bg-gray-200 overflow-hidden cursor-pointer border-2 border-dashed border-gray-400 hover:border-blue-500 transition"
        onClick={() => fileRef.current?.click()}
      >
        {avatarSrc ? (
          <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-3xl">
            {username?.[0]?.toUpperCase() ?? '?'}
          </div>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />

      {preview && (
        <button
          onClick={handleUpload}
          disabled={loading}
          className="px-4 py-1.5 bg-blue-600 text-white rounded-full text-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Uploading...' : 'Save avatar'}
        </button>
      )}

      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  )
}