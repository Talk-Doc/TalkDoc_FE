import { createContext } from 'react'
import type { SummaryResponse } from '../api/types'

// 이 서비스는 "휴대폰 한 대"에서 의료진과 환자가 번갈아 쓰는 구조라서,
// 세션 생성 때 받은 의료진 토큰과 환자 토큰을 둘 다 브라우저에 들고 있다가
// 요청 종류에 따라 맞는 토큰을 골라 씁니다.
export interface SessionInfo {
  sessionId: string
  doctorToken: string
  patientToken: string
  createdAt: string
}

export interface SessionContextValue {
  session: SessionInfo | null
  starting: boolean
  /** POST /api/sessions 로 새 세션을 만들고 토큰을 보관합니다. */
  startSession: () => Promise<SessionInfo>
  /** 요약을 뽑은 뒤 세션을 삭제하고 토큰을 지웁니다. 요약 실패는 무시합니다. */
  endSession: () => Promise<SummaryResponse | null>
  /** 서버 호출 없이 로컬 상태만 비웁니다 (서버가 먼저 닫은 경우 등). */
  clearSession: () => void
}

export const SessionContext = createContext<SessionContextValue | null>(null)
