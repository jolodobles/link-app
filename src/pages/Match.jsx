import { useEffect, useRef } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { VENUES } from '../lib/venues'
import Avatar from '../components/Avatar'
import confetti from 'canvas-confetti'

export default function Match() {
  const { sessionId } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { members, session } = useApp()
  const fired = useRef(false)

  const venueId = searchParams.get('venue')
  const venue = VENUES.find((v) => v.id === venueId) || VENUES[0]

  useEffect(() => {
    if (fired.current) return
    fired.current = true

    // Burst confetti
    const end = Date.now() + 2000
    const colors = ['#534AB7', '#EC4899', '#22C55E', '#F59E0B', '#3B82F6']

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      })
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      })
      if (Date.now() < end) requestAnimationFrame(frame)
    }
    frame()

    // Big burst
    confetti({
      particleCount: 120,
      spread: 80,
      origin: { y: 0.5 },
      colors,
    })
  }, [])

  function addToCalendar() {
    const text = encodeURIComponent(`Dinner at ${venue.name}`)
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}`
    window.open(url, '_blank')
  }

  function getDirections() {
    const q = encodeURIComponent(`${venue.name} Melbourne CBD`)
    window.open(`https://maps.google.com/?q=${q}`, '_blank')
  }

  return (
    <div className="app-shell">
      <div className="flex-1 overflow-y-auto px-5 pb-8">
        {/* Header */}
        <div className="pt-10 text-center mb-6">
          <span className="logo text-3xl block mb-4">link.</span>
          <h1 className="grotesk text-4xl font-black text-gray-900 leading-tight">
            It's a<br />
            <span style={{ color: '#534AB7' }}>match!</span>
          </h1>
          <p className="text-gray-400 text-sm mt-2">Everyone vibed on the same place 🎉</p>
        </div>

        {/* Venue card */}
        <div
          className="rounded-3xl overflow-hidden mb-6 shadow-lg"
          style={{ background: venue.bg_color }}
        >
          <div className="flex flex-col items-center py-10 px-6">
            <div className="text-8xl mb-4">{venue.emoji}</div>
            <h2 className="syne text-3xl font-black text-white mb-1">{venue.name}</h2>
            <p className="text-white/80 text-sm mb-4">
              {venue.cuisine} · {venue.distance} · {venue.price}
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {venue.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full text-xs font-semibold text-white"
                  style={{ background: 'rgba(255,255,255,0.25)' }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Members who matched */}
        {members.length > 0 && (
          <div className="flex flex-col items-center mb-6">
            <div className="flex -space-x-2 mb-2">
              {members.map((m) => (
                <div key={m.id} className="ring-2 ring-white rounded-full">
                  <Avatar name={m.display_name} color={m.avatar_color} size={40} />
                </div>
              ))}
            </div>
            <p className="text-sm font-semibold text-gray-600">Everyone vibed ✓</p>
          </div>
        )}

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          {[
            { icon: '📅', label: 'Add to calendar', action: addToCalendar },
            { icon: '🗺️', label: 'Get directions', action: getDirections },
            { icon: '🍽️', label: 'Book a table', action: () => {} },
            { icon: '💬', label: 'Share with group', action: () => navigator.share?.({ title: `We're going to ${venue.name}!`, url: window.location.href }) },
          ].map((btn) => (
            <button
              key={btn.label}
              onClick={btn.action}
              className="flex flex-col items-center justify-center gap-1.5 p-4 rounded-2xl border border-gray-100 bg-white shadow-sm active:scale-95 transition-transform"
            >
              <span className="text-2xl">{btn.icon}</span>
              <span className="text-xs font-semibold text-gray-700 text-center">{btn.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="px-5 pb-8 pt-3 border-t border-gray-100">
        <button
          onClick={() => navigate('/')}
          className="w-full py-4 rounded-2xl text-white font-bold grotesk"
          style={{ background: '#534AB7' }}
        >
          Start a new link →
        </button>
      </div>
    </div>
  )
}
