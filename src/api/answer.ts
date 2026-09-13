import { apiJson } from './client'
import type { Conversation, PreviewResponse } from './types'

export function previewAnswer(sessionId: string, patientToken: string, labels: string[]) {
  return apiJson<PreviewResponse>(`/api/sessions/${sessionId}/answer/preview`, {
    method: 'POST',
    token: patientToken,
    body: { labels },
  })
}

// answer를 직접 넘기면 백엔드가 LLM으로 다시 조합하지 않고 그 문장을 그대로 확정합니다.
// (텍스트/선택지 답변처럼 이미 확정된 문장이 있는 경우에 씁니다.)
export function confirmAnswer(
  sessionId: string,
  patientToken: string,
  labels: string[],
  answer?: string,
) {
  return apiJson<Conversation>(`/api/sessions/${sessionId}/answer/confirm`, {
    method: 'POST',
    token: patientToken,
    body: { labels, answer },
  })
}

export function updateAnswer(
  sessionId: string,
  token: string,
  answerId: string,
  answer: string,
) {
  return apiJson<Conversation>(`/api/sessions/${sessionId}/answer/${answerId}`, {
    method: 'PATCH',
    token,
    body: { answer },
  })
}
