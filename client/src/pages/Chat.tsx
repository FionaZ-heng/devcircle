/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState, useRef } from 'react'
import { useParams } from 'react-router-dom'
import { io, Socket } from 'socket.io-client'
import api from '../services/api'
import Navbar from '../components/Navbar'
import { useAuthStore } from '../store/authStore'

interface Message {
  _id: string
  content: string
  sender: { _id: string, username: string }
  createdAt: string
}

let socket: Socket

export default function Chat() {
  const { matchId } = useParams()
  const { user, token } = useAuthStore()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // 连接 socket
    socket = io('https://devcircle-production.up.railway.app', { auth: { token } })
    socket.emit('join_room', matchId)

    // 接收新消息
    socket.on('receive_message', (msg: Message) => {
      setMessages(prev => [...prev, msg])
    })

    // 加载历史消息
    api.get(`/messages/${matchId}`).then((res: any) => setMessages(res.data))

    return () => { socket.disconnect() }
  }, [matchId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = () => {
    if (!input.trim()) return
    socket.emit('send_message', { matchId, content: input })
    setInput('')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-2xl w-full mx-auto px-4 py-6 flex flex-col">
        <h1 className="text-xl font-bold mb-4">Chat</h1>
        <div className="flex-1 bg-white rounded-2xl shadow-sm border p-4 overflow-y-auto mb-4" style={{ maxHeight: '60vh' }}>
          {messages.length === 0 && (
            <p className="text-center text-gray-400 mt-10">No messages yet. Say hi! 👋</p>
          )}
          {messages.map(msg => {
            const isMine = msg.sender._id === user?.id || msg.sender.username === user?.username
            return (
              <div key={msg._id} className={`flex mb-3 ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs px-4 py-2 rounded-2xl text-sm ${
                  isMine ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800'
                }`}>
                  {!isMine && <p className="text-xs font-semibold mb-1 text-gray-500">@{msg.sender.username}</p>}
                  <p>{msg.content}</p>
                </div>
              </div>
            )
          })}
          <div ref={bottomRef} />
        </div>
        <div className="flex gap-2">
          <input
            className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="Type a message..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && sendMessage()}
          />
          <button
            onClick={sendMessage}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 font-semibold"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}