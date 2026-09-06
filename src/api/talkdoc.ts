// 백엔드 엔드포인트별 호출 함수. 어떤 토큰(의료진/환자)이 필요한지는 백엔드 @RequireRole을 따릅니다.
import { request, requestBlob } from './client'
import type {
  Conversation,
  CreateSessionResponse,
  PreviewResponse,
  QuestionResponse,
  SessionDetailResponse,
  SignResponse,
  SummaryResponse,
} from './types'

const sessions = '/api/sessions'

function extensionOf(blob: Blob, fallback: string) {
  const type = blob.type.split(';')[0]
  if (type === 'audio/mp4' || type === 'video/mp4') return 'mp4'
  if (type === 'audio/ogg') return 'ogg'
  if (type === 'audio/wav') return 'wav'
  return fallback
}

export const talkdocApi = {
  /** 세션 생성. 인증 불필요. 의료진/환자 토큰을 모두 돌려줍니다. */
  createSession: () => request<CreateSessionResponse>(sessions, { method: 'POST' }),

  /** 세션 상세(현재 질문, 확정된 대화 목록). 의료진 토큰. */
  getSession: (sessionId: string, doctorToken: string) =>
    request<SessionDetailResponse>(`${sessions}/${sessionId}`, { token: doctorToken }),

  /** 세션 종료. Redis 데이터 삭제 + WebSocket 종료. 의료진 토큰. */
  deleteSession: (sessionId: string, doctorToken: string) =>
    request<void>(`${sessions}/${sessionId}`, { method: 'DELETE', token: doctorToken }),

  /** 의료진 질문 등록. audio(STT) 또는 text 중 하나. 의료진 토큰. */
  postQuestion: (
    sessionId: string,
    doctorToken: string,
    input: { audio?: Blob; text?: string },
  ) => {
    const form = new FormData()
    if (input.text && input.text.trim()) {
      form.append('text', input.text.trim())
    } else if (input.audio) {
      form.append('audio', input.audio, `question.${extensionOf(input.audio, 'webm')}`)
    }
    return request<QuestionResponse>(`${sessions}/${sessionId}/question`, {
      method: 'POST',
      token: doctorToken,
      form,
    })
  },

  /** 수어 영상 인식. 저장되지 않으며, 인식된 라벨만 돌려줍니다. 환자 토큰. */
  recognizeSign: (sessionId: string, patientToken: string, video: Blob) => {
    const form = new FormData()
    form.append('video', video, `sign.${extensionOf(video, 'webm')}`)
    return request<SignResponse>(`${sessions}/${sessionId}/sign`, {
      method: 'POST',
      token: patientToken,
      form,
    })
  },

  /** 라벨 → 답변 문장 미리보기. 저장되지 않습니다. 환자 토큰. */
  previewAnswer: (sessionId: string, patientToken: string, labels: string[]) =>
    request<PreviewResponse>(`${sessions}/${sessionId}/answer/preview`, {
      method: 'POST',
      token: patientToken,
      json: { labels },
    }),

  /** 답변 확정. answer를 주면 그 문장을 그대로 저장합니다. 환자 토큰. */
  confirmAnswer: (sessionId: string, patientToken: string, labels: string[], answer?: string) =>
    request<Conversation>(`${sessions}/${sessionId}/answer/confirm`, {
      method: 'POST',
      token: patientToken,
      json: { labels, answer },
    }),

  /** 확정된 답변 문장 수정. 의료진/환자 토큰 모두 가능. */
  updateAnswer: (sessionId: string, token: string, answerId: string, answer: string) =>
    request<Conversation>(`${sessions}/${sessionId}/answer/${answerId}`, {
      method: 'PATCH',
      token,
      json: { answer },
    }),

  /** 확정된 답변을 음성(wav)으로 합성. 의료진 토큰. */
  fetchAnswerAudio: (sessionId: string, doctorToken: string, answerId: string) =>
    requestBlob(`${sessions}/${sessionId}/answer/${answerId}/tts`, { token: doctorToken }),

  /** 진료 요약(진단 아님, 진술 요약). 의료진 토큰. */
  summarize: (sessionId: string, doctorToken: string) =>
    request<SummaryResponse>(`${sessions}/${sessionId}/summary`, {
      method: 'POST',
      token: doctorToken,
    }),
}
