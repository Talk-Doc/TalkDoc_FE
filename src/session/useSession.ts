import { useContext } from 'react'
import { SessionContext, type SessionContextValue } from './context'

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession은 SessionProvider 안에서만 쓸 수 있어요.')
  return ctx
}
