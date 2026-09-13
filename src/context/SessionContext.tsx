import { createContext, useContext, type ReactNode } from 'react'
import type { CreateSessionResponse } from '../api/types'

export type SessionInfo = CreateSessionResponse

const SessionContext = createContext<SessionInfo | null>(null)

export function SessionProvider({
  value,
  children,
}: {
  value: SessionInfo
  children: ReactNode
}) {
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

// 세션이 만들어진 이후에만 렌더링되는 화면들(질문/촬영 등)에서 씁니다.
export function useSession() {
  const session = useContext(SessionContext)
  if (!session) throw new Error('useSession은 SessionProvider 안에서만 쓸 수 있어요.')
  return session
}
