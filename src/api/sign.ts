import { apiMultipart } from './client'
import type { SignResponse } from './types'

// 환자의 수어 영상을 올려 인식 결과를 받습니다. intent를 생략하면 세션에 대기 중인
// 질문의 의도를 서버가 그대로 사용합니다.
export function postSign(sessionId: string, patientToken: string, video: Blob) {
  const formData = new FormData()
  formData.append('video', video, 'sign.webm')
  return apiMultipart<SignResponse>(`/api/sessions/${sessionId}/sign`, {
    token: patientToken,
    formData,
  })
}
