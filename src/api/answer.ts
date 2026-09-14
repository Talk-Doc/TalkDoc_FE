import { apiBlob, apiJson } from './client'
import type { Conversation, PreviewResponse } from './types'

// question_id/question_version을 같이 보내면, 그 사이 의사가 질문을 수정했는지 백엔드가 검사해줍니다
// (버전이 안 맞으면 404/409). 응답의 answer_id/version은 confirmDraft에 그대로 넘기면 이 초안을
// (그 사이 질문이 또 바뀌지 않은 한) 확정할 수 있습니다 — 수어처럼 라벨이 있는 답변에만 쓸 수 있어요.
export function previewAnswer(
  sessionId: string,
  patientToken: string,
  labels: string[],
  questionId?: string,
  questionVersion?: number,
) {
  return apiJson<PreviewResponse>(`/api/sessions/${sessionId}/answer/preview`, {
    method: 'POST',
    token: patientToken,
    body: { labels, question_id: questionId, question_version: questionVersion },
  })
}

// answer를 직접 넘기면 백엔드가 LLM으로 다시 조합하지 않고 그 문장을 그대로 확정합니다.
// (텍스트/선택지 답변처럼 이미 확정된 문장이 있는 경우에 씁니다.)
// 주의: 이 방식은 확정 시점에 "이 답변이 어느 질문을 향한 것인지" 백엔드가 검증하지 않습니다
// (ConfirmRequest에 question_id/version이 없음) — 그 사이 의사가 질문을 바꿨어도 그대로 확정돼요.
// 라벨이 있는 답변(수어)은 그 위험이 없는 confirmDraft를 대신 쓰세요.
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

// previewAnswer가 만든 초안(answer_id/version)을 확정합니다. 초안을 만든 뒤 의사가 질문을 수정했으면
// 백엔드가 409 DRAFT_INVALIDATED로 거부해줘서, 엉뚱한 질문에 답이 붙는 걸 막아줍니다.
export function confirmDraft(sessionId: string, patientToken: string, answerId: string, version: number) {
  return apiJson<Conversation>(`/api/sessions/${sessionId}/answer/confirm`, {
    method: 'POST',
    token: patientToken,
    body: { answer_id: answerId, version },
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

// 확정된 답변을 실제 음성 파일로 합성해 받아옵니다. doctor_token 필요.
export function getAnswerTts(sessionId: string, doctorToken: string, answerId: string) {
  return apiBlob(`/api/sessions/${sessionId}/answer/${answerId}/tts`, { token: doctorToken })
}
