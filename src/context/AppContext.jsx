import { createContext, useContext, useState, useCallback } from 'react'
import { supabase, isDemoMode } from '../lib/supabase'
import { generateId, randomColor } from '../lib/demo'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [session, setSession] = useState(null)   // { id, name, category, dateTime, budget }
  const [member, setMember] = useState(null)     // { id, display_name, avatar_color, session_id }
  const [members, setMembers] = useState([])     // all members in session
  const [swipes, setSwipes] = useState({})       // { memberId: { venueId: direction } }
  const [loading, setLoading] = useState(false)

  const createSession = useCallback(async ({ name, category, dateTime, budget, memberName }) => {
    setLoading(true)
    try {
      const sessionId = generateId()
      const memberId = generateId()
      const color = randomColor()

      const newSession = { id: sessionId, name, category, date_time: dateTime, budget }
      const newMember = { id: memberId, session_id: sessionId, display_name: memberName, avatar_color: color }

      if (!isDemoMode) {
        const { error: sErr } = await supabase.from('sessions').insert(newSession)
        if (sErr) throw sErr
        const { error: mErr } = await supabase.from('session_members').insert(newMember)
        if (mErr) throw mErr
      }

      setSession(newSession)
      setMember(newMember)
      setMembers([newMember])
      setSwipes({})
      return sessionId
    } finally {
      setLoading(false)
    }
  }, [])

  const joinSession = useCallback(async (sessionId, memberName) => {
    setLoading(true)
    try {
      const memberId = generateId()
      const color = randomColor()
      const newMember = { id: memberId, session_id: sessionId, display_name: memberName, avatar_color: color }

      if (!isDemoMode) {
        // fetch session
        const { data: sess, error: sErr } = await supabase
          .from('sessions')
          .select('*')
          .eq('id', sessionId)
          .single()
        if (sErr) throw sErr
        setSession(sess)

        const { error: mErr } = await supabase.from('session_members').insert(newMember)
        if (mErr) throw mErr

        // fetch all members
        const { data: allMembers } = await supabase
          .from('session_members')
          .select('*')
          .eq('session_id', sessionId)
        setMembers(allMembers || [newMember])
      } else {
        // demo mode: fake session
        setSession({ id: sessionId, name: 'link session', category: 'Dinner', budget: '$' })
        setMembers([newMember])
      }

      setMember(newMember)
      setSwipes({})
      return memberId
    } finally {
      setLoading(false)
    }
  }, [])

  const recordSwipe = useCallback(async (venueId, direction) => {
    if (!member) return
    const swipeRecord = {
      id: generateId(),
      session_id: session.id,
      member_id: member.id,
      venue_id: venueId,
      direction,
    }

    if (!isDemoMode) {
      await supabase.from('swipes').insert(swipeRecord)
    }

    setSwipes((prev) => ({
      ...prev,
      [member.id]: { ...(prev[member.id] || {}), [venueId]: direction },
    }))
  }, [member, session])

  const updateMemberSwipes = useCallback((memberId, venueId, direction) => {
    setSwipes((prev) => ({
      ...prev,
      [memberId]: { ...(prev[memberId] || {}), [venueId]: direction },
    }))
  }, [])

  const loadSessionData = useCallback(async (sessionId) => {
    if (isDemoMode) return
    setLoading(true)
    try {
      const { data: sess } = await supabase.from('sessions').select('*').eq('id', sessionId).single()
      const { data: allMembers } = await supabase.from('session_members').select('*').eq('session_id', sessionId)
      const { data: allSwipes } = await supabase.from('swipes').select('*').eq('session_id', sessionId)

      if (sess) setSession(sess)
      if (allMembers) setMembers(allMembers)

      if (allSwipes) {
        const swipeMap = {}
        allSwipes.forEach(({ member_id, venue_id, direction }) => {
          if (!swipeMap[member_id]) swipeMap[member_id] = {}
          swipeMap[member_id][venue_id] = direction
        })
        setSwipes(swipeMap)
      }
    } finally {
      setLoading(false)
    }
  }, [])

  return (
    <AppContext.Provider value={{
      session, member, members, swipes,
      loading, isDemoMode,
      createSession, joinSession, recordSwipe,
      updateMemberSwipes, loadSessionData,
      setMembers, setSwipes,
    }}>
      {children}
    </AppContext.Provider>
  )
}

export const useApp = () => useContext(AppContext)
