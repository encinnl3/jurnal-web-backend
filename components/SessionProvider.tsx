'use client'

import { createContext, useContext, useEffect, useState } from 'react'

type Session = { profileId: string; name: string } | null

const SessionContext = createContext<{
  session: Session
  setSession: (s: Session) => void
  logout: () => void
}>({
  session: null,
  setSession: () => {},
  logout: () => {},
})

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSessionState] = useState<Session>(null)

  useEffect(() => {
    const stored = localStorage.getItem('jurnal-session')
    if (stored) {
      try {
        setSessionState(JSON.parse(stored))
      } catch {}
    }
  }, [])

  const setSession = (s: Session) => {
    setSessionState(s)
    if (s) {
      localStorage.setItem('jurnal-session', JSON.stringify(s))
    } else {
      localStorage.removeItem('jurnal-session')
    }
  }

  const logout = () => setSession(null)

  return (
    <SessionContext.Provider value={{ session, setSession, logout }}>
      {children}
    </SessionContext.Provider>
  )
}

export const useSession = () => useContext(SessionContext)
