import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'

export default function Join() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const { joinSession } = useApp()
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleJoin() {
    const trimmed = name.trim()
    if (!trimmed) { setError('Enter your name'); return }
    setError('')
    setLoading(true)
    try {
      await joinSession(sessionId, trimmed)
      navigate(`/swipe/${sessionId}`)
    } catch (e) {
      setError(e.message || 'Could not join session')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="app-shell flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm text-center">
        <h1 className="logo text-5xl mb-2">link.</h1>
        <p className="text-gray-400 text-sm mb-10">You've been invited to a session</p>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <h2 className="syne text-xl font-bold text-gray-800 mb-1">Join the session</h2>
          <p className="text-sm text-gray-500 mb-5">What should we call you?</p>

          <input
            className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-purple-400 transition-colors mb-3"
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
            autoFocus
          />

          {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

          <button
            onClick={handleJoin}
            disabled={loading}
            className="w-full py-3 rounded-2xl text-white font-bold syne transition-opacity disabled:opacity-60"
            style={{ background: '#534AB7' }}
          >
            {loading ? 'Joining...' : 'Join & swipe →'}
          </button>
        </div>
      </div>
    </div>
  )
}
