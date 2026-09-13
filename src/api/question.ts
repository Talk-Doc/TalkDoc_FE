import { apiMultipart } from './client'
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
