import { useState, useEffect, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { useApp } from '../context/AppContext'
import { VENUES } from '../lib/venues'

const SWIPE_THRESHOLD = 80
const FLICK_UP_THRESHOLD = -60

function VenueCard({ venue, onSwipe, isTop, style }) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const rotate = useTransform(x, [-200, 0, 200], [-18, 0, 18])
  const vibeOpacity = useTransform(x, [20, 80], [0, 1])
  const nopeOpacity = useTransform(x, [-80, -20], [1, 0])
  const maybeOpacity = useTransform(y, [-100, -50], [1, 0])

  async function fireSwipe(direction) {
    const targetX = direction === 'yes' ? 500 : direction === 'no' ? -500 : 0
    const targetY = direction === 'maybe' ? -600 : 0
    await animate(x, targetX, { duration: 0.35 })
    await animate(y, targetY, { duration: 0.35 })
    onSwipe(direction)
  }

  function handleDragEnd(_, info) {
    const vx = info.velocity.x
    const vy = info.velocity.y
    const ox = info.offset.x
    const oy = info.offset.y

    if (oy < FLICK_UP_THRESHOLD || vy < -400) {
      fireSwipe('maybe')
    } else if (ox > SWIPE_THRESHOLD || vx > 400) {
      fireSwipe('yes')
    } else if (ox < -SWIPE_THRESHOLD || vx < -400) {
      fireSwipe('no')
    } else {
      animate(x, 0, { type: 'spring', stiffness: 300 })
      animate(y, 0, { type: 'spring', stiffness: 300 })
    }
  }

  return (
    <motion.div
      style={{ x, y, rotate, ...style, position: 'absolute', inset: 0, borderRadius: 20, overflow: 'hidden', cursor: isTop ? 'grab' : 'default', touchAction: 'none' }}
      drag={isTop ? true : false}
      dragElastic={0.08}
      onDragEnd={isTop ? handleDragEnd : undefined}
      whileTap={isTop ? { cursor: 'grabbing' } : {}}
    >
      {/* Card background */}
      <div className="w-full h-full flex flex-col" style={{ background: venue.bg_color }}>

        {/* Price badge */}
        <div className="absolute top-4 right-4 bg-white/30 backdrop-blur-sm rounded-full px-3 py-1 text-white font-bold text-sm">
          {venue.price}
        </div>

        {/* Swipe labels */}
        {isTop && (
          <>
            <motion.div
              style={{ opacity: vibeOpacity }}
              className="absolute top-10 left-6 bg-green-500 text-white font-black text-2xl px-4 py-1.5 rounded-xl border-2 border-white syne"
              css={{ transform: 'rotate(-12deg)' }}
            >
              VIBE ✓
            </motion.div>
            <motion.div
              style={{ opacity: nopeOpacity }}
              className="absolute top-10 right-6 bg-red-500 text-white font-black text-2xl px-4 py-1.5 rounded-xl border-2 border-white syne"
            >
              NOPE ✕
            </motion.div>
            <motion.div
              style={{ opacity: maybeOpacity }}
              className="absolute bottom-28 left-1/2 -translate-x-1/2 bg-amber-400 text-white font-black text-2xl px-4 py-1.5 rounded-xl border-2 border-white syne whitespace-nowrap"
            >
              MAYBE ⚡
            </motion.div>
          </>
        )}

        {/* Main content */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 pt-10">
          <div className="text-8xl mb-4 select-none">{venue.emoji}</div>
          <h2 className="syne text-3xl font-bold text-white text-center mb-1">{venue.name}</h2>
          <p className="text-white/80 text-sm font-medium mb-2">
            {venue.cuisine} · {venue.distance} away
          </p>
        </div>

        {/* Tags */}
        <div className="px-5 pb-6 flex flex-wrap gap-2 justify-center">
          {venue.tags.map((tag) => (
            <span
              key={tag}
              className="px-3 py-1 rounded-full text-xs font-semibold"
              style={{ background: 'rgba(255,255,255,0.25)', color: 'white' }}
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

export default function Swipe() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const { session, member, recordSwipe, isDemoMode } = useApp()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [swipedDirections, setSwipedDirections] = useState([])

  // If landed here without session context (e.g. direct URL), redirect to join
  useEffect(() => {
    if (!member) {
      navigate(`/join/${sessionId}`, { replace: true })
    }
  }, [member, sessionId, navigate])

  const remaining = VENUES.length - currentIndex
  const progress = currentIndex / VENUES.length

  async function handleSwipe(direction) {
    const venue = VENUES[currentIndex]
    await recordSwipe(venue.id, direction)
    setSwipedDirections((prev) => [...prev, direction])
    if (currentIndex + 1 >= VENUES.length) {
      navigate(`/live/${sessionId}`)
    } else {
      setCurrentIndex((i) => i + 1)
    }
  }

  if (!member) return null

  const visibleVenues = VENUES.slice(currentIndex, currentIndex + 3)

  return (
    <div className="app-shell">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-10 pb-4">
        <span className="logo text-3xl">link.</span>
        {session && (
          <span className="text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: '#F0EEFF', color: '#534AB7' }}>
            {session.name}
          </span>
        )}
      </div>

      {/* Card stack */}
      <div className="flex-1 flex flex-col items-center px-5 pt-2">
        <div className="relative w-full" style={{ height: 460 }}>
          {currentIndex >= VENUES.length ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-400 text-lg syne font-bold">All done!</p>
            </div>
          ) : (
            [...visibleVenues].reverse().map((venue, ri) => {
              const forwardIndex = visibleVenues.length - 1 - ri
              const isTop = forwardIndex === 0
              const scale = 1 - forwardIndex * 0.03
              const rotate = forwardIndex === 1 ? 1.5 : forwardIndex === 2 ? -0.5 : 0
              const translateY = forwardIndex * 10

              return (
                <VenueCard
                  key={venue.id}
                  venue={venue}
                  isTop={isTop}
                  onSwipe={isTop ? handleSwipe : undefined}
                  style={{
                    scale,
                    rotate: `${rotate}deg`,
                    y: translateY,
                    zIndex: 10 - forwardIndex,
                  }}
                />
              )
            })
          )}
        </div>

        {/* Action buttons */}
        {currentIndex < VENUES.length && (
          <div className="flex items-center justify-center gap-5 mt-4">
            <button
              onClick={() => handleSwipe('no')}
              className="w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-md border border-gray-100 bg-white active:scale-95 transition-transform"
            >
              ✕
            </button>
            <button
              onClick={() => handleSwipe('maybe')}
              className="w-12 h-12 rounded-full flex items-center justify-center text-xl shadow-md border border-gray-100 bg-white active:scale-95 transition-transform"
            >
              ⚡
            </button>
            <button
              onClick={() => handleSwipe('yes')}
              className="w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-md border border-gray-100 bg-white active:scale-95 transition-transform"
            >
              ♥
            </button>
          </div>
        )}

        {/* Progress bar */}
        <div className="w-full mt-5 px-1">
          <div className="flex justify-between text-xs text-gray-400 mb-1.5">
            <span>{remaining} remaining</span>
            <span>{currentIndex}/{VENUES.length}</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300"
              style={{ width: `${progress * 100}%`, background: '#534AB7' }}
            />
          </div>
        </div>
      </div>

      <div className="pb-8" />
    </div>
  )
}
