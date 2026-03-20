import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import Avatar from '../components/Avatar'
import { randomColor } from '../lib/demo'

const CATEGORIES = [
  { label: 'Dinner', emoji: '🍽️' },
  { label: 'Drinks', emoji: '🍸' },
  { label: 'Activity', emoji: '🎯' },
  { label: 'Brunch', emoji: '🥞' },
  { label: 'Weekend Trip', emoji: '🏕️' },
  { label: 'Surprise me', emoji: '🎲' },
]

const BUDGETS = ['$', '$$', '$$$', '$$$$']

export default function Setup() {
  const navigate = useNavigate()
  const { createSession, isDemoMode } = useApp()

  const [category, setCategory] = useState('Dinner')
  const [dateTime, setDateTime] = useState('')
  const [budget, setBudget] = useState('$')
  const [yourName, setYourName] = useState('')
  const [inviteName, setInviteName] = useState('')
  const [invitees, setInvitees] = useState([])
  const [sessionName, setSessionName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [inviteUrl, setInviteUrl] = useState(null)
  const [createdSessionId, setCreatedSessionId] = useState(null)
  const [copied, setCopied] = useState(false)

  function addInvitee() {
    const name = inviteName.trim()
    if (!name) return
    setInvitees((prev) => [...prev, { name, color: randomColor() }])
    setInviteName('')
  }

  function removeInvitee(i) {
    setInvitees((prev) => prev.filter((_, idx) => idx !== i))
  }

  async function handleStart() {
    if (!yourName.trim()) { setError('Enter your name first'); return }
    if (invitees.length < 1) { setError('Add at least 1 friend'); return }
    setError('')
    setLoading(true)
    try {
      const name = sessionName.trim() || `${yourName}'s link`
      const sessionId = await createSession({
        name,
        category,
        dateTime,
        budget,
        memberName: yourName.trim(),
      })
      const url = `${window.location.origin}/join/${sessionId}`
      setInviteUrl(url)
      setCreatedSessionId(sessionId)
    } catch (e) {
      setError(e.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  function copyLink() {
    navigator.clipboard.writeText(inviteUrl).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  // After session created — show invite link screen
  if (inviteUrl) {
    return (
      <div className="app-shell flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          <h1 className="logo text-5xl mb-2">link.</h1>
          <p className="text-gray-400 text-sm mb-10">Session created!</p>

          <div className="w-full bg-white rounded-3xl border border-gray-100 shadow-sm p-6 mb-6">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4"
              style={{ background: '#F0EEFF' }}
            >
              🔗
            </div>
            <h2 className="grotesk text-xl font-bold text-gray-800 mb-1">Invite your friends</h2>
            <p className="text-sm text-gray-500 mb-5">
              Share this link so they can join and swipe together
            </p>

            {/* URL display */}
            <div
              className="flex items-center gap-2 p-3 rounded-2xl mb-3"
              style={{ background: '#F8F7FF' }}
            >
              <p className="flex-1 text-xs text-gray-500 truncate text-left">{inviteUrl}</p>
              <button
                onClick={copyLink}
                className="shrink-0 text-xs font-bold px-3 py-1.5 rounded-xl text-white transition-all"
                style={{ background: copied ? '#22C55E' : '#534AB7' }}
              >
                {copied ? 'Copied ✓' : 'Copy'}
              </button>
            </div>

            {/* Share button (native share sheet on mobile) */}
            {typeof navigator.share === 'function' && (
              <button
                onClick={() => navigator.share({ title: "Join my link. session", url: inviteUrl })}
                className="w-full py-2.5 rounded-2xl text-sm font-semibold border-2 transition-colors"
                style={{ borderColor: '#534AB7', color: '#534AB7' }}
              >
                Share via...
              </button>
            )}
          </div>

          <p className="text-xs text-gray-400 mb-6">
            Friends who open this link will be asked for their name, then dropped straight into the swipe screen.
          </p>
        </div>

        <div className="px-5 pb-8 pt-3 border-t border-gray-100">
          <button
            onClick={() => navigate(`/swipe/${createdSessionId}`)}
            className="w-full py-4 rounded-2xl text-white font-bold grotesk"
            style={{ background: '#534AB7' }}
          >
            Start swiping →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <div className="flex-1 overflow-y-auto px-5 pb-8">
        {/* Header */}
        <div className="pt-12 pb-6 text-center">
          <h1 className="logo text-5xl">link.</h1>
          <p className="text-sm text-gray-400 mt-1" style={{ fontFamily: 'DM Sans' }}>
            swipe together, decide together
          </p>
        </div>

        {isDemoMode && (
          <div className="mb-4 px-4 py-3 rounded-2xl text-sm text-amber-800" style={{ background: '#FEF3C7' }}>
            <strong>Demo mode</strong> — Supabase not configured. App works fully offline.
          </div>
        )}

        {/* Session name */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Session name (optional)
          </label>
          <input
            className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-purple-400 transition-colors"
            placeholder="e.g. Friday night out"
            value={sessionName}
            onChange={(e) => setSessionName(e.target.value)}
          />
        </div>

        {/* Category */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            What's the vibe?
          </label>
          <div className="grid grid-cols-3 gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c.label}
                onClick={() => setCategory(c.label)}
                className="rounded-2xl py-3 px-2 text-center border-2 transition-all duration-150"
                style={{
                  borderColor: category === c.label ? '#534AB7' : '#E5E2F5',
                  background: category === c.label ? '#F0EEFF' : 'white',
                }}
              >
                <div className="text-2xl mb-1">{c.emoji}</div>
                <div className="text-xs font-semibold text-gray-700">{c.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Date/time */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            When?
          </label>
          <input
            type="datetime-local"
            className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-purple-400 transition-colors"
            value={dateTime}
            onChange={(e) => setDateTime(e.target.value)}
          />
        </div>

        {/* Budget */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Budget
          </label>
          <div className="flex gap-2">
            {BUDGETS.map((b) => (
              <button
                key={b}
                onClick={() => setBudget(b)}
                className="flex-1 py-2 rounded-2xl border-2 text-sm font-semibold transition-all duration-150"
                style={{
                  borderColor: budget === b ? '#534AB7' : '#E5E2F5',
                  background: budget === b ? '#534AB7' : 'white',
                  color: budget === b ? 'white' : '#374151',
                }}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        {/* Your name */}
        <div className="mb-5">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Your name
          </label>
          <input
            className="w-full border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-purple-400 transition-colors"
            placeholder="Enter your name"
            value={yourName}
            onChange={(e) => setYourName(e.target.value)}
          />
        </div>

        {/* Invite friends */}
        <div className="mb-6">
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Who's coming?
          </label>
          <div className="flex gap-2">
            <input
              className="flex-1 border border-gray-200 rounded-2xl px-4 py-3 text-sm outline-none focus:border-purple-400 transition-colors"
              placeholder="Friend's name"
              value={inviteName}
              onChange={(e) => setInviteName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && addInvitee()}
            />
            <button
              onClick={addInvitee}
              className="px-4 py-2 rounded-2xl font-semibold text-sm text-white transition-opacity"
              style={{ background: '#534AB7' }}
            >
              Add
            </button>
          </div>

          {invitees.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {invitees.map((inv, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 rounded-full pl-1 pr-3 py-1 text-sm font-medium"
                  style={{ background: '#F0EEFF' }}
                >
                  <Avatar name={inv.name} color={inv.color} size={26} />
                  <span className="text-gray-700">{inv.name}</span>
                  <button
                    onClick={() => removeInvitee(i)}
                    className="text-gray-400 hover:text-gray-600 ml-1 text-xs leading-none"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <p className="text-xs text-gray-400 mt-2">
            You'll get a shareable link after you start
          </p>
        </div>

        {error && (
          <p className="text-red-500 text-sm mb-4">{error}</p>
        )}
      </div>

      {/* CTA */}
      <div className="px-5 pb-8 pt-3 border-t border-gray-100">
        <button
          onClick={handleStart}
          disabled={loading}
          className="w-full py-4 rounded-2xl text-white font-bold text-base grotesk transition-opacity disabled:opacity-60"
          style={{ background: '#534AB7' }}
        >
          {loading ? 'Starting...' : 'Start swiping →'}
        </button>
      </div>
    </div>
  )
}
