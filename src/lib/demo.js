import { VENUES } from './venues'

// Generates fake member swipes for demo mode
export function generateDemoSession(sessionId, members) {
  const swipes = {}
  members.forEach((m) => {
    swipes[m.id] = {}
    VENUES.forEach((v) => {
      // randomly assign a direction with weighted yes
      const rand = Math.random()
      swipes[m.id][v.id] = rand < 0.5 ? 'yes' : rand < 0.75 ? 'no' : 'maybe'
    })
  })
  return swipes
}

// Simulate other members swiping over time
export function simulateMemberSwipes(members, onUpdate) {
  const timers = []
  members.forEach((m, mi) => {
    VENUES.forEach((v, vi) => {
      const delay = (mi * 800 + vi * 300 + Math.random() * 500) | 0
      const t = setTimeout(() => {
        const rand = Math.random()
        const dir = rand < 0.5 ? 'yes' : rand < 0.75 ? 'no' : 'maybe'
        onUpdate(m.id, v.id, dir)
      }, delay)
      timers.push(t)
    })
  })
  return () => timers.forEach(clearTimeout)
}

const COLORS = ['#534AB7', '#EC4899', '#22C55E', '#F59E0B', '#3B82F6', '#EF4444', '#14B8A6', '#8B5CF6']

export function randomColor() {
  return COLORS[Math.floor(Math.random() * COLORS.length)]
}

export function generateId() {
  return Math.random().toString(36).slice(2, 10)
}
