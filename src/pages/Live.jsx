import { useEffect, useState, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { supabase, isDemoMode } from '../lib/supabase'
import { VENUES } from '../lib/venues'
import { simulateMemberSwipes, generateId, randomColor } from '../lib/demo'
import Avatar from '../components/Avatar'

function trendingVenues(members, swipes) {
  return VENUES.map((v) => {
    const yesCount = members.filter((m) => swipes[m.id]?.[v.id] === 'yes').length
    const total = members.length
    return { ...v, yesCount, total }
  })
    .filter((v) => v.yesCount > 0)
    .sort((a, b) => b.yesCount - a.yesCount)
    .slice(0, 3)
}

function memberProgress(memberId, swipes) {
  const memberSwipes = swipes[memberId] || {}
  const count = Object.keys(memberSwipes).length
  return { count, total: VENUES.length, done: count >= VENUES.length }
}

export default function Live() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const { session, member, members, swipes, updateMemberSwipes, loadSessionData, setMembers, isDemoMode: demo } = useApp()
  const [alert, setAlert] = useState(null)
  const cleanupRef = useRef(null)

  // Ensure data is loaded
  useEffect(() => {
    if (!member) {
      navigate(`/join/${sessionId}`, { replace: true })
      return
    }
    if (!demo) {
      loadSessionData(sessionId)
    }
  }, [sessionId])

  // Demo mode: simulate other members swiping
  useEffect(() => {
    if (!demo || !member) return

    // Add 2 fake friends if no other members
    const fakeMembers = [
      { id: generateId(), session_id: sessionId, display_name: 'Alex', avatar_color: randomColor() },
      { id: generateId(), session_id: sessionId, display_name: 'Jordan', avatar_color: randomColor() },
    ]
    setMembers((prev) => {
      const existing = prev.map((m) => m.id)
      const toAdd = fakeMembers.filter((fm) => !existing.includes(fm.id))
      return [...prev, ...toAdd]
    })

    const cleanup = simulateMemberSwipes(fakeMembers, (memberId, venueId, direction) => {
      updateMemberSwipes(memberId, venueId, direction)
    })
    cleanupRef.current = cleanup
    return () => cleanup()
  }, [demo, member])

  // Supabase realtime subscription
  useEffect(() => {
    if (demo || !sessionId) return
    const channel = supabase
      .channel(`swipes:${sessionId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'swipes', filter: `session_id=eq.${sessionId}` },
        (payload) => {
          const { member_id, venue_id, direction } = payload.new
          updateMemberSwipes(member_id, venue_id, direction)
        })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'session_members', filter: `session_id=eq.${sessionId}` },
        (payload) => {
          setMembers((prev) => {
            if (prev.find((m) => m.id === payload.new.id)) return prev
            return [...prev, payload.new]
          })
        })
      .subscribe()
    return () => supabase.removeChannel(channel)
  }, [demo, sessionId])

  // Check for match or near-match
  useEffect(() => {
    if (!members.length) return
    for (const v of VENUES) {
      const yesMemberIds = members.filter((m) => swipes[m.id]?.[v.id] === 'yes').map((m) => m.id)
      if (yesMemberIds.length === members.length && members.length > 0) {
        navigate(`/match/${sessionId}?venue=${v.id}`)
        return
      }
      if (yesMemberIds.length === members.length - 1 && members.length > 1) {
        setAlert(`${v.name} is one vote away from a match! 🔥`)
      }
    }
  }, [swipes, members])

  const trending = trendingVenues(members, swipes)
  const shareUrl = `${window.location.origin}/join/${sessionId}`

  function copyLink() {
    navigator.clipboard.writeText(shareUrl).catch(() => {})
  }

  return (
    <div className="app-shell">
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-10 pb-4">
        <span className="logo text-3xl">link.</span>
        <div className="flex items-center gap-2">
          {session && (
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full" style={{ background: '#F0EEFF', color: '#534AB7' }}>
              {session.name}
            </span>
          )}
          <div className="flex items-center gap-1.5 bg-green-50 rounded-full px-3 py-1.5">
            <span className="live-dot w-2 h-2 rounded-full bg-green-500 inline-block" />
            <span className="text-xs font-semibold text-green-700">Live</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-8">
        {/* Near-match alert */}
        {alert && (
          <div className="mb-4 px-4 py-3 rounded-2xl text-sm font-semibold text-green-800 bg-green-50 border border-green-200">
            🔥 {alert}
          </div>
        )}

        {/* Invite link */}
        <div className="mb-5 p-3 rounded-2xl border border-dashed border-purple-200 bg-purple-50 flex items-center justify-between gap-2">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-purple-700 mb-0.5">Invite link</p>
            <p className="text-xs text-purple-500 truncate">{shareUrl}</p>
          </div>
          <button
            onClick={copyLink}
            className="shrink-0 text-xs font-semibold text-white px-3 py-1.5 rounded-xl"
            style={{ background: '#534AB7' }}
          >
            Copy
          </button>
        </div>

        {/* Member grid */}
        <h3 className="syne font-bold text-gray-800 mb-3">Your group</h3>
        <div className="grid grid-cols-2 gap-3 mb-6">
          {members.map((m) => {
            const { count, total, done } = memberProgress(m.id, swipes)
            const isSelf = member && m.id === member.id
            return (
              <div key={m.id} className="rounded-2xl p-3.5 border border-gray-100 bg-white shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <Avatar name={m.display_name} color={m.avatar_color} size={32} />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {m.display_name}{isSelf ? ' (you)' : ''}
                    </p>
                    <p className="text-xs" style={{ color: done ? '#22C55E' : '#534AB7' }}>
                      {done ? 'Done ✓' : count === 0 ? 'Waiting...' : 'Swiping'}
                    </p>
                  </div>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${(count / total) * 100}%`,
                      background: done ? '#22C55E' : '#534AB7',
                    }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">{count}/{total} swiped</p>
              </div>
            )
          })}
        </div>

        {/* Trending venues */}
        {trending.length > 0 && (
          <>
            <h3 className="syne font-bold text-gray-800 mb-3">Trending in your group 🔥</h3>
            <div className="space-y-3 mb-6">
              {trending.map((v) => (
                <div key={v.id} className="flex items-center gap-3 p-3 rounded-2xl border border-gray-100 bg-white">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl shrink-0" style={{ background: v.bg_color + '33' }}>
                    {v.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold text-gray-800">{v.name}</p>
                      <p className="text-xs font-bold" style={{ color: '#534AB7' }}>
                        {v.yesCount}/{v.total}
                      </p>
                    </div>
                    <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${(v.yesCount / Math.max(v.total, 1)) * 100}%`,
                          background: v.bg_color,
                        }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {trending.length === 0 && (
          <div className="text-center py-8 text-gray-300">
            <p className="text-4xl mb-2">⏳</p>
            <p className="text-sm">Waiting for swipes...</p>
          </div>
        )}
      </div>

      {/* Keep swiping button */}
      <div className="px-5 pb-8 pt-3 border-t border-gray-100">
        <button
          onClick={() => navigate(`/swipe/${sessionId}`)}
          className="w-full py-4 rounded-2xl text-white font-bold syne"
          style={{ background: '#534AB7' }}
        >
          Keep swiping →
        </button>
      </div>
    </div>
  )
}
