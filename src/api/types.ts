// TalkDoc_BE 응답 타입입니다. 백엔드가 Jackson SNAKE_CASE 전략으로 직렬화하므로
// 필드명이 그대로 snake_case인 점에 유의하세요 (프론트 컨벤션과 다름).

export type Intent = 'BODY_LOCATION' | 'SYMPTOM' | 'HISTORY_STATE' | 'OTHER'

export interface CreateSessionResponse {
  session_id: string
  doctor_token: string
  patient_token: string
  created_at: string
  patient_join_path: string
}

export interface QuestionResponse {
  question_id: string
  text: string
  intent: Intent
  intents: Intent[]
  candidates: string[]
  supported: boolean
  asked_at: string
}

export interface RecognizedSign {
  label: string
  confidence: number
  accepted: boolean
}

export interface SignResponse {
  question_id: string | null
  intents: Intent[]
  candidates: string[]
  signs: RecognizedSign[]
  all_accepted: boolean
  accepted_labels: string[]
}

export interface PreviewResponse {
  question_id: string
  labels: string[]
  answer: string
}

export interface Conversation {
  answer_id: string
  question_id: string
  question: string
  intents: Intent[]
  signs: string[]
  answer: string
  confirmed_at: string
}

export interface SessionDetailResponse {
  session_id: string
  status: 'ACTIVE' | 'CLOSED'
  created_at: string
  current_question?: QuestionResponse
  conversations: Conversation[]
}

export interface SummaryResponse {
  summary: string
  conversation_count: number
  generated_at: string
}

export interface ApiErrorBody {
  code: string
  message: string
  timestamp: string
}
