import { apiJson, apiMultipart } from './client'
import type { QuestionResponse } from './types'

// 의료진의 질문을 등록합니다. audio를 녹음해 올리면 백엔드가 STT+의도 분석까지 해줍니다.
export function postQuestionAudio(sessionId: string, doctorToken: string, audio: Blob) {
  const formData = new FormData()
  formData.append('audio', audio, 'question.webm')
  return apiMultipart<QuestionResponse>(`/api/sessions/${sessionId}/question`, {
    token: doctorToken,
    formData,
  })
}

// 음성 대신 텍스트로 질문을 등록합니다. text 필드가 있으면 백엔드가 STT를 건너뛰고
// 바로 의도 분석으로 넘어갑니다(마이크를 쓸 수 없거나 조용한 환경에서 유용).
export function postQuestionText(sessionId: string, doctorToken: string, text: string) {
  const formData = new FormData()
  formData.append('text', text)
  return apiMultipart<QuestionResponse>(`/api/sessions/${sessionId}/question`, {
    token: doctorToken,
    formData,
  })
}

// 대기 중인 질문의 문장을 고칩니다. question_id는 유지되고 version만 1 올라가며,
// 의도/후보/답변방식이 새 문장 기준으로 다시 분석됩니다. version이 안 맞으면 409(VERSION_CONFLICT).
export function updateQuestion(
  sessionId: string,
  doctorToken: string,
  questionId: string,
  text: string,
  version: number,
) {
  return apiJson<QuestionResponse>(`/api/sessions/${sessionId}/questions/${questionId}`, {
    method: 'PATCH',
    token: doctorToken,
    body: { text, version },
  })
}
