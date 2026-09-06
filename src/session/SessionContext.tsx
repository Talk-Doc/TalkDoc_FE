import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { talkdocApi } from '../api/talkdoc'
import { ApiError } from '../api/client'
import type { SummaryResponse } from '../api/types'
import { SessionContext, type SessionInfo } from './context'

const STORAGE_KEY = 'talkdoc.session'

function loadStored(): SessionInfo | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as SessionInfo) : null
  } catch {
    return null
  }
}

function store(session: SessionInfo | null) {
  try {
    if (session) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    else sessionStorage.removeItem(STORAGE_KEY)
  } catch {
    // sessionStorage를 못 쓰는 환경이면 메모리에만 보관합니다.
  }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<SessionInfo | null>(loadStored)
  const [starting, setStarting] = useState(false)

  const startSession = useCallback(async () => {
    setStarting(true)
    try {
      const created = await talkdocApi.createSession()
      const info: SessionInfo = {
        sessionId: created.session_id,
        doctorToken: created.doctor_token,
        patientToken: created.patient_token,
        createdAt: created.created_at,
      }
      store(info)
      setSession(info)
      return info
    } finally {
      setStarting(false)
    }
  }, [])

  const clearSession = useCallback(() => {
    store(null)
    setSession(null)
  }, [])

  const endSession = useCallback(async () => {
    if (!session) return null
    let summary: SummaryResponse | null = null
    try {
      summary = await talkdocApi.summarize(session.sessionId, session.doctorToken)
    } catch {
      summary = null
    }
    try {
      await talkdocApi.deleteSession(session.sessionId, session.doctorToken)
    } catch (e) {
      // 이미 닫힌 세션이면 그냥 넘어갑니다.
      if (!(e instanceof ApiError && (e.status === 404 || e.status === 409))) throw e
    } finally {
      clearSession()
    }
    return summary
  }, [session, clearSession])

  const value = useMemo(
    () => ({ session, starting, startSession, endSession, clearSession }),
    [session, starting, startSession, endSession, clearSession],
  )

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}
