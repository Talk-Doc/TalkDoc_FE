import { apiJson } from './client'
import type { CreateSessionResponse, SessionDetailResponse, SummaryResponse } from './types'

export function createSession() {
  return apiJson<CreateSessionResponse>('/api/sessions', { method: 'POST' })
}

export function getSessionDetail(sessionId: string, doctorToken: string) {
  return apiJson<SessionDetailResponse>(`/api/sessions/${sessionId}`, { token: doctorToken })
}

export function deleteSession(sessionId: string, doctorToken: string) {
  return apiJson<void>(`/api/sessions/${sessionId}`, { method: 'DELETE', token: doctorToken })
}

export function generateSummary(sessionId: string, doctorToken: string) {
  return apiJson<SummaryResponse>(`/api/sessions/${sessionId}/summary`, {
    method: 'POST',
    token: doctorToken,
  })
}
