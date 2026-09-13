import { apiMultipart } from './client'
import type { SignResponse } from './types'

// 환자의 수어 영상 1개를 올려 단어 1개를 인식합니다. 여러 단어를 모으려면 단어마다 한 번씩 호출하세요.
// intent를 생략하면 세션에 대기 중인 질문의 의도를 그대로 사용합니다.
// duration(선택)은 실제 녹화 길이(초)이며 0 초과 20 이하여야 합니다.
export function postSign(
  sessionId: string,
  patientToken: string,
  video: Blob,
  duration?: number,
) {
  const formData = new FormData()
  formData.append('video', video, 'sign.webm')
  if (duration !== undefined) {
    formData.append('duration', String(duration))
  }
  return apiMultipart<SignResponse>(`/api/sessions/${sessionId}/sign`, {
    token: patientToken,
    formData,
  })
}
